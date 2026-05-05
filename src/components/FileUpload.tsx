"use client";

import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import type { FormField } from "@/types";

interface FileUploadProps {
  fields: FormField[];
  initialValues?: Record<string, string>;
  onSubmit: (data: Record<string, string>) => void;
  onBack: () => void;
}

type FileStatus = "idle" | "uploading" | "done" | "error";

interface FileState {
  name: string;
  size: string;
  status: FileStatus;
  url?: string;
  error?: string;
}

type FileMap = Record<string, FileState>;
type ErrorMap = Record<string, string>;

async function uploadFile(file: File, folder: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  // Import csrfHeaders for CSRF protection — upload is a mutation
  const { csrfHeaders } = await import("@/lib/csrf");

  const response = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    headers: { ...csrfHeaders() },
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "Upload failed");
  }

  const payload = await response.json();
  return payload.data.url as string;
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export default function FileUpload({ fields, initialValues = {}, onSubmit, onBack }: FileUploadProps) {
  const [files, setFiles] = useState<FileMap>(() => {
    const map: FileMap = {};
    Object.entries(initialValues).forEach(([key, value]) => {
      if (!value) return;
      map[key] = { name: value, size: "", status: "done", url: value };
    });
    return map;
  });

  const [errors, setErrors] = useState<ErrorMap>({});
  const refs = useRef<Record<string, HTMLInputElement | null>>({});

  const onFileChange = async (fieldName: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const size = formatSize(file.size);
    setFiles((prev) => ({ ...prev, [fieldName]: { name: file.name, size, status: "uploading" } }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });

    try {
      const url = await uploadFile(file, "visahub/applications");
      setFiles((prev) => ({ ...prev, [fieldName]: { name: file.name, size, status: "done", url } }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setFiles((prev) => ({ ...prev, [fieldName]: { name: file.name, size, status: "error", error: message } }));
      setErrors((prev) => ({ ...prev, [fieldName]: message }));
    }
  };

  const removeFile = (fieldName: string) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
    const input = refs.current[fieldName];
    if (input) input.value = "";
  };

  const submit = () => {
    const nextErrors: ErrorMap = {};
    fields
      .filter((field) => field.required)
      .forEach((field) => {
        if (!files[field.name] || files[field.name].status !== "done") {
          nextErrors[field.name] = `${field.label} is required`;
        }
      });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: Record<string, string> = {};
    Object.entries(files).forEach(([key, value]) => {
      if (value.status === "done") payload[key] = value.url ?? value.name;
    });

    onSubmit(payload);
  };

  return (
    <div>
      <div className="mb-6 space-y-3">
        {fields.map((field) => {
          const file = files[field.name];
          const hasError = Boolean(errors[field.name]);
          const isDone = file?.status === "done";
          const isUploading = file?.status === "uploading";
          const isError = file?.status === "error";

          return (
            <div key={field.name}>
              <div
                className={`rounded-xl border p-4 ${
                  isDone
                    ? "border-emerald-400/35 bg-emerald-500/10"
                    : hasError
                      ? "border-rose-400/45 bg-rose-500/10"
                      : "border-indigo-300/22 bg-[#0b1432]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                      {field.label}
                      {field.required ? <span className="ml-1 text-rose-300">*</span> : null}
                    </p>
                    {isDone ? (
                      <p className="mt-1 text-xs text-emerald-200">{file.name} {file.size ? `· ${file.size}` : ""}</p>
                    ) : isUploading ? (
                      <p className="mt-1 text-xs text-indigo-100/65">Uploading...</p>
                    ) : isError ? (
                      <p className="mt-1 text-xs text-rose-200">{file.error ?? "Upload failed"}</p>
                    ) : (
                      <p className="mt-1 text-xs text-indigo-100/58">PDF, JPG, PNG up to 10MB</p>
                    )}
                  </div>

                  {isDone ? (
                    <button type="button" onClick={() => removeFile(field.name)} className="user-outline-btn px-3 py-1.5 text-xs">
                      Remove
                    </button>
                  ) : (
                    <>
                      <input
                        ref={(node) => {
                          refs.current[field.name] = node;
                        }}
                        id={`file-${field.name}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(event) => onFileChange(field.name, event)}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <label htmlFor={`file-${field.name}`} className="user-cta cursor-pointer px-3 py-1.5 text-xs">
                        {isError ? "Retry" : "Browse"}
                      </label>
                    </>
                  )}
                </div>

                {isUploading ? (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-indigo-200/15">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-indigo-400" />
                  </div>
                ) : null}
              </div>

              {hasError && !isError ? <p className="mt-1 text-xs text-rose-300">{errors[field.name]}</p> : null}
            </div>
          );
        })}
      </div>

      <div className="mb-5 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3 text-xs text-emerald-200">
        Files are securely stored in cloud storage. Ensure each scan is clear and legible.
      </div>

      <div className="flex items-center justify-between border-t border-indigo-300/15 pt-4">
        <button type="button" onClick={onBack} className="user-outline-btn px-4 py-2 text-sm font-semibold">
          Back
        </button>
        <button type="button" onClick={submit} className="user-cta px-4 py-2 text-sm font-semibold">
          Continue
        </button>
      </div>
    </div>
  );
}
