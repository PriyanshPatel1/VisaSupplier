"use client";

import { useState } from "react";
import {
  Input,
  Select,
  Textarea,
  RadioGroup,
  FieldGroup,
  FullField,
  SectionHeading,
  InfoNote,
  FieldError,
} from "@/components/form/ui/FormControls";
import { csrfHeaders } from "@/lib/csrf";
import type { WizardSection } from "./wizard-types";

const DOC_HINTS: Record<string, string[]> = {
  passport: ["Valid passport (min 6 months)", "Passport photo page scan", "Previous visas (if any)"],
  photo: ["White background", "35x45 mm format", "Taken within last 6 months"],
  bank: ["Last 3-6 months statements", "Stamped by bank", "Shows sufficient funds"],
  insurance: ["Covers full trip dates", "Min EUR30,000 medical cover", "Includes repatriation"],
  invitation: ["Host full name and address", "Relationship stated", "Signed by host"],
  itinerary: ["Confirmed hotel bookings", "Return flight ticket", "Day-by-day plan"],
};

type UploadedDocumentValue = {
  url: string;
  publicId?: string;
  name?: string;
  size?: number;
  mimeType?: string;
};

interface Props {
  section: WizardSection;
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (id: string, val: string) => void;
}

function getHintsForLabel(label: string): string[] {
  const normalizedLabel = label.toLowerCase();
  for (const [key, hints] of Object.entries(DOC_HINTS)) {
    if (normalizedLabel.includes(key)) return hints;
  }
  return [];
}

function parseUploadedDocumentValue(value?: string): UploadedDocumentValue | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as UploadedDocumentValue;
    if (parsed && typeof parsed.url === "string" && parsed.url.trim()) {
      return {
        url: parsed.url.trim(),
        publicId: parsed.publicId,
        name: parsed.name,
        size: parsed.size,
        mimeType: parsed.mimeType,
      };
    }
  } catch {
    if (/^https?:\/\//i.test(value)) {
      return { url: value.trim() };
    }
  }

  return null;
}

function formatFileSize(size?: number) {
  if (!size || size <= 0) return null;
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.ceil(size / 1024))} KB`;
}

export function WizardSectionForm({ section, values, errors, onChange }: Props) {
  const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const hasFileFields = section.fields.some((field) => field.type === "file");

  const handleFileUpload = async (fieldId: string, file: File) => {
    setUploadingFieldId(fieldId);
    setUploadErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "visahub/documents");

      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        headers: csrfHeaders(),
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok || !payload?.data?.url) {
        throw new Error(payload?.error ?? "Upload failed. Please try again.");
      }

      onChange(
        fieldId,
        JSON.stringify({
          url: payload.data.url,
          publicId: payload.data.publicId,
          name: payload.data.name ?? file.name,
          size: payload.data.bytes ?? file.size,
          mimeType: payload.data.type ?? file.type,
        } satisfies UploadedDocumentValue),
      );
    } catch (error) {
      setUploadErrors((prev) => ({
        ...prev,
        [fieldId]: error instanceof Error ? error.message : "Upload failed. Please try again.",
      }));
    } finally {
      setUploadingFieldId((prev) => (prev === fieldId ? null : prev));
    }
  };

  return (
    <div className="space-y-5">
      {section.infoNote ? <InfoNote>{section.infoNote}</InfoNote> : null}
      {section.heading ? <SectionHeading>{section.heading}</SectionHeading> : null}

      {hasFileFields ? (
        <div className="rounded-2xl border border-indigo-500/20 bg-[linear-gradient(135deg,rgba(79,70,229,0.12),rgba(15,23,42,0.82))] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-200">
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <path d="M10 2.5l6 3.2v4.8c0 3.5-2.5 6.6-6 7.6-3.5-1-6-4.1-6-7.6V5.7l6-3.2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M7.5 10l1.8 1.8L13 8.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-200/90">
                Document Guidance
              </p>
              <div className="mt-3 space-y-3">
                {section.fields
                  .filter((field) => field.type === "file")
                  .map((field) => {
                    const hints = getHintsForLabel(field.label);
                    return (
                      <div key={field.id}>
                        <p className="text-sm font-semibold text-white">{field.label}</p>
                        {hints.length > 0 ? (
                          <div className="mt-1 space-y-1">
                            {hints.map((hint) => (
                              <p key={hint} className="flex items-center gap-2 text-xs text-indigo-100/70">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-300/70" />
                                <span>{hint}</span>
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-indigo-100/70">
                            Upload a clear PDF or image file for this requirement.
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <FieldGroup>
        {section.fields.map((field) => {
          if (field.showIf && values[field.showIf.field] !== field.showIf.value) return null;

          const Wrapper = field.colSpan === "full" ? FullField : "div";
          const uploadedValue = parseUploadedDocumentValue(values[field.id]);
          const isUploading = uploadingFieldId === field.id;
          const uploadError = uploadErrors[field.id];

          if (field.type === "file") {
            return (
              <Wrapper key={field.id}>
                <div>
                  <label
                    htmlFor={field.id}
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-300"
                  >
                    {field.label}
                    {field.required ? <span className="ml-1 text-red-400">*</span> : null}
                  </label>
                  <div
                    onClick={() => document.getElementById(field.id)?.click()}
                    className={`rounded-2xl border-2 border-dashed p-4 transition-all ${
                      uploadedValue
                        ? "border-emerald-400/30 bg-emerald-500/8"
                        : isUploading
                          ? "border-indigo-400/40 bg-indigo-500/10"
                          : uploadError || errors[field.id]
                            ? "border-red-400/35 bg-red-500/5"
                            : "border-white/12 bg-white/[0.03] hover:border-indigo-400/45 hover:bg-indigo-500/6"
                    }`}
                  >
                    <input
                      id={field.id}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      disabled={isUploading}
                      aria-label={field.label}
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        event.currentTarget.value = "";
                        if (file) {
                          await handleFileUpload(field.id, file);
                        }
                      }}
                    />

                    {uploadedValue ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                              <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">
                              {uploadedValue.name ?? field.label}
                            </p>
                            <p className="mt-1 text-xs text-emerald-200/80">
                              Stored securely in Cloudinary
                              {formatFileSize(uploadedValue.size) ? ` · ${formatFileSize(uploadedValue.size)}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              document.getElementById(field.id)?.click();
                            }}
                            className="rounded-full border border-white/14 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-indigo-400/45 hover:text-indigo-200"
                          >
                            Replace file
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onChange(field.id, "");
                              setUploadErrors((prev) => {
                                const next = { ...prev };
                                delete next[field.id];
                                return next;
                              });
                            }}
                            className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:border-red-400/40 hover:text-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : isUploading ? (
                      <div className="py-3 text-center">
                        <div className="mx-auto mb-3 h-9 w-9 rounded-full border-2 border-indigo-300/30 border-t-indigo-200 animate-spin" />
                        <p className="text-sm font-semibold text-indigo-100">Uploading {field.label}...</p>
                        <p className="mt-1 text-xs text-indigo-100/65">
                          We are saving it to your secure document vault.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-gray-400">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-white">
                          Upload {field.label}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          PDF, JPG, PNG or WebP up to 10 MB
                        </p>
                      </div>
                    )}
                  </div>
                  <FieldError message={uploadError ?? errors[field.id]} />
                </div>
              </Wrapper>
            );
          }

          if (field.type === "checkbox") {
            return (
              <Wrapper key={field.id}>
                <div>
                  <label className="group flex cursor-pointer items-start gap-3">
                    <input
                      id={field.id}
                      type="checkbox"
                      checked={values[field.id] === "true"}
                      onChange={(event) => onChange(field.id, event.target.checked ? "true" : "false")}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-indigo-500"
                      aria-required={field.required}
                    />
                    <span className="text-sm leading-relaxed text-gray-300 transition-colors group-hover:text-white">
                      {field.label}
                      {field.required ? <span className="ml-1 text-red-400">*</span> : null}
                    </span>
                  </label>
                  <FieldError message={errors[field.id]} />
                </div>
              </Wrapper>
            );
          }

          if (field.type === "select") {
            return (
              <Wrapper key={field.id}>
                <Select
                  id={field.id}
                  label={field.label}
                  required={field.required}
                  options={field.options ?? []}
                  value={values[field.id] ?? ""}
                  onChange={(value) => onChange(field.id, value)}
                  error={errors[field.id]}
                />
              </Wrapper>
            );
          }

          if (field.type === "radio") {
            return (
              <Wrapper key={field.id}>
                <RadioGroup
                  id={field.id}
                  label={field.label}
                  required={field.required}
                  options={(field.options ?? ["Yes", "No"]).map((option) => ({ value: option, label: option }))}
                  value={values[field.id] ?? ""}
                  onChange={(value) => onChange(field.id, value)}
                  error={errors[field.id]}
                />
              </Wrapper>
            );
          }

          if (field.type === "textarea") {
            return (
              <Wrapper key={field.id}>
                <Textarea
                  id={field.id}
                  label={field.label}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={values[field.id] ?? ""}
                  onChange={(value) => onChange(field.id, value)}
                  error={errors[field.id]}
                />
              </Wrapper>
            );
          }

          return (
            <Wrapper key={field.id}>
              <Input
                id={field.id}
                label={field.label}
                type={field.type}
                required={field.required}
                placeholder={field.placeholder}
                value={values[field.id] ?? ""}
                onChange={(value) => onChange(field.id, value)}
                error={errors[field.id]}
              />
            </Wrapper>
          );
        })}
      </FieldGroup>
    </div>
  );
}
