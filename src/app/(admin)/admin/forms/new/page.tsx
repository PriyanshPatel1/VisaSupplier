"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormBuilderPreview } from "@/components/admin/forms/FormBuilderPreview";
import { adminApi } from "@/lib/api-client";
import { validateFormBuilderConfig } from "@/lib/form-builder-validation";
import type { WizardConfig, WizardSection, WizardField } from "@/components/form/GenericWizard";

// ── Field type options ────────────────────────────────────────────────────────

const FIELD_TYPES = [
  { value: "text",     label: "Text" },
  { value: "email",    label: "Email" },
  { value: "tel",      label: "Phone" },
  { value: "number",   label: "Number" },
  { value: "date",     label: "Date" },
  { value: "select",   label: "Dropdown" },
  { value: "radio",    label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "textarea", label: "Textarea" },
  { value: "file",     label: "File Upload" },
] as const;

const SECTION_ICONS = ["📋","👤","🛂","✈️","💼","🎓","🏠","💰","📄","🔒","📞","🌍"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Sortable Field Row ────────────────────────────────────────────────────────

function SortableField({
  field,
  sectionIdx,
  fieldIdx,
  onUpdate,
  onRemove,
}: {
  field: WizardField;
  sectionIdx: number;
  fieldIdx: number;
  onUpdate: (si: number, fi: number, patch: Partial<WizardField>) => void;
  onRemove: (si: number, fi: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${sectionIdx}-${fieldIdx}-${field.id}`,
  });

  const [showOptions, setShowOptions] = useState(false);
  const needsOptions = field.type === "select" || field.type === "radio";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={[
        "bg-gray-50 border border-gray-200 rounded-xl p-3 group",
        isDragging ? "opacity-50 shadow-xl z-50" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-2 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm6-12a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Field label */}
          <input
            className="col-span-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Field label"
            value={field.label}
            onChange={(e) => onUpdate(sectionIdx, fieldIdx, { label: e.target.value })}
          />
          {/* Field ID */}
          <input
            className="col-span-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono text-xs"
            placeholder="field_id (no spaces)"
            value={field.id}
            onChange={(e) =>
              onUpdate(sectionIdx, fieldIdx, {
                id: e.target.value.replace(/\s+/g, "_").toLowerCase(),
              })
            }
          />
          {/* Field type */}
          <select
            className="col-span-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={field.type}
            onChange={(e) =>
              onUpdate(sectionIdx, fieldIdx, { type: e.target.value as WizardField["type"] })
            }
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 mt-1.5 flex-shrink-0">
          {/* Required toggle */}
          <button
            onClick={() => onUpdate(sectionIdx, fieldIdx, { required: !field.required })}
            title="Toggle required"
            className={[
              "text-xs px-2 py-1 rounded-lg font-semibold border transition-colors",
              field.required
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-gray-100 text-gray-400 border-gray-200",
            ].join(" ")}
          >
            *
          </button>
          {/* Full width toggle */}
          <button
            onClick={() =>
              onUpdate(sectionIdx, fieldIdx, {
                colSpan: field.colSpan === "full" ? undefined : "full",
              })
            }
            title="Toggle full width"
            className={[
              "text-xs px-2 py-1 rounded-lg font-semibold border transition-colors",
              field.colSpan === "full"
                ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                : "bg-gray-100 text-gray-400 border-gray-200",
            ].join(" ")}
          >
            ⬌
          </button>
          {/* Remove */}
          <button
            onClick={() => onRemove(sectionIdx, fieldIdx)}
            className="text-gray-300 hover:text-red-400 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Placeholder row */}
      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-200 text-gray-500 placeholder-gray-300"
          placeholder="Placeholder text (optional)"
          value={field.placeholder ?? ""}
          onChange={(e) => onUpdate(sectionIdx, fieldIdx, { placeholder: e.target.value })}
        />
        {needsOptions && (
          <button
            onClick={() => setShowOptions((v) => !v)}
            className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg font-semibold"
          >
            {showOptions ? "Hide" : "Options"} ({field.options?.length ?? 0})
          </button>
        )}
      </div>

      {/* Options editor */}
      {needsOptions && showOptions && (
        <div className="mt-2 space-y-1">
          {(field.options ?? []).map((opt, oi) => (
            <div key={oi} className="flex gap-1">
              <input
                className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                value={opt}
                onChange={(e) => {
                  const newOpts = [...(field.options ?? [])];
                  newOpts[oi] = e.target.value;
                  onUpdate(sectionIdx, fieldIdx, { options: newOpts });
                }}
              />
              <button
                onClick={() => {
                  const newOpts = (field.options ?? []).filter((_, i) => i !== oi);
                  onUpdate(sectionIdx, fieldIdx, { options: newOpts });
                }}
                className="text-red-400 hover:text-red-600 px-1"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              onUpdate(sectionIdx, fieldIdx, {
                options: [...(field.options ?? []), "Option " + ((field.options?.length ?? 0) + 1)],
              })
            }
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            + Add option
          </button>
        </div>
      )}
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({
  section,
  sectionIdx,
  total,
  onUpdateSection,
  onRemoveSection,
  onMoveSection,
  onUpdateField,
  onRemoveField,
  onAddField,
}: {
  section: WizardSection;
  sectionIdx: number;
  total: number;
  onUpdateSection: (si: number, patch: Partial<WizardSection>) => void;
  onRemoveSection: (si: number) => void;
  onMoveSection: (si: number, dir: "up" | "down") => void;
  onUpdateField: (si: number, fi: number, patch: Partial<WizardField>) => void;
  onRemoveField: (si: number, fi: number) => void;
  onAddField: (si: number) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = section.fields.map((_, fi) => `${sectionIdx}-${fi}-${section.fields[fi].id}`);
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx !== -1 && newIdx !== -1) {
      const newFields = arrayMove(section.fields, oldIdx, newIdx);
      onUpdateSection(sectionIdx, { fields: newFields });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-gray-100">
        <select
          className="text-xl bg-transparent border-0 focus:outline-none cursor-pointer"
          value={section.icon}
          onChange={(e) => onUpdateSection(sectionIdx, { icon: e.target.value })}
        >
          {SECTION_ICONS.map((ic) => (
            <option key={ic} value={ic}>{ic}</option>
          ))}
        </select>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            className="text-sm font-bold bg-white border border-indigo-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Section title"
            value={section.title}
            onChange={(e) => onUpdateSection(sectionIdx, { title: e.target.value })}
          />
          <input
            className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-200 text-gray-500"
            placeholder="Short description"
            value={section.description}
            onChange={(e) => onUpdateSection(sectionIdx, { description: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onMoveSection(sectionIdx, "up")}
            disabled={sectionIdx === 0}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30 transition-colors"
          >▲</button>
          <button
            onClick={() => onMoveSection(sectionIdx, "down")}
            disabled={sectionIdx === total - 1}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30 transition-colors"
          >▼</button>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 transition-colors text-xs font-bold"
          >
            {collapsed ? "▾" : "▴"}
          </button>
          <button
            onClick={() => onRemoveSection(sectionIdx)}
            className="p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Fields */}
      {!collapsed && (
        <div className="p-4 space-y-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={section.fields.map((_, fi) => `${sectionIdx}-${fi}-${section.fields[fi].id}`)}
              strategy={verticalListSortingStrategy}
            >
              {section.fields.map((field, fi) => (
                <SortableField
                  key={`${sectionIdx}-${fi}-${field.id}`}
                  field={field}
                  sectionIdx={sectionIdx}
                  fieldIdx={fi}
                  onUpdate={onUpdateField}
                  onRemove={onRemoveField}
                />
              ))}
            </SortableContext>
          </DndContext>

          {section.fields.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">
              No fields yet — add one below
            </p>
          )}

          <button
            onClick={() => onAddField(sectionIdx)}
            className="w-full mt-1 py-2.5 border-2 border-dashed border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Field
          </button>
        </div>
      )}

      {collapsed && (
        <div className="px-5 py-2 text-xs text-gray-400">
          {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

// ── Live Preview ──────────────────────────────────────────────────────────────

function LivePreview({ config }: { config: WizardConfig }) {
  if (!config.sections.length) return null;
  const section = config.sections[0];

  return (
    <div className="bg-[#0b0c14] rounded-2xl p-5 text-white">
      <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-1">
        Preview — Step 1
      </p>
      <h3 className="text-base font-bold text-white mb-4">{section.title || "Untitled Section"}</h3>
      <div className="grid grid-cols-2 gap-3">
        {section.fields.slice(0, 6).map((f) => (
          <div key={f.id} className={f.colSpan === "full" ? "col-span-2" : ""}>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-1">
              {f.label || "Untitled field"}
              {f.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-gray-400 resize-none"
                rows={2}
                placeholder={f.placeholder ?? ""}
                readOnly
              />
            ) : f.type === "select" ? (
              <select className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-gray-400" disabled>
                <option>Select…</option>
                {(f.options ?? []).map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : f.type === "file" ? (
              <div className="border-2 border-dashed border-white/20 rounded-xl p-3 text-center text-xs text-gray-500">
                Click to upload
              </div>
            ) : (
              <input
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-gray-400"
                type={f.type}
                placeholder={f.placeholder ?? ""}
                readOnly
              />
            )}
          </div>
        ))}
      </div>
      {section.fields.length > 6 && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          + {section.fields.length - 6} more fields…
        </p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

void LivePreview;

export default function NewFormPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing visas so admin picks the correct visaId from a dropdown
  const [visaOptions, setVisaOptions] = useState<Array<{ id: string; name: string; countryCode: string }>>([]);
  const [visasLoading, setVisasLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/visas", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { data?: { visas?: Array<{ id: string; name: string; countryCode: string }> } }) => {
        if (!cancelled) {
          setVisaOptions(data?.data?.visas ?? []);
        }
      })
      .catch(() => { if (!cancelled) setVisaOptions([]); })
      .finally(() => { if (!cancelled) setVisasLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const [config, setConfig] = useState<WizardConfig>({
    visaId: "",
    formLabel: "",
    sections: [],
  });
  const validationMessages = Array.from(
    new Set(
      Object.entries(errors)
        .filter(([key, value]) => key !== "submit" && Boolean(value))
        .map(([, value]) => value),
    ),
  );

  const updateSection = useCallback(
    (si: number, patch: Partial<WizardSection>) => {
      setConfig((prev) => {
        const sections = [...prev.sections];
        sections[si] = { ...sections[si], ...patch };
        return { ...prev, sections };
      });
    },
    []
  );

  const removeSection = useCallback((si: number) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== si),
    }));
  }, []);

  const moveSection = useCallback((si: number, dir: "up" | "down") => {
    setConfig((prev) => {
      const sections = [...prev.sections];
      const newIdx = dir === "up" ? si - 1 : si + 1;
      [sections[si], sections[newIdx]] = [sections[newIdx], sections[si]];
      return { ...prev, sections };
    });
  }, []);

  const addSection = () => {
    const id = uid();
    setConfig((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id,
          title: "New Section",
          description: "Enter section description",
          icon: SECTION_ICONS[prev.sections.length % SECTION_ICONS.length],
          fields: [],
        },
      ],
    }));
  };

  const updateField = useCallback(
    (si: number, fi: number, patch: Partial<WizardField>) => {
      setConfig((prev) => {
        const sections = [...prev.sections];
        const fields = [...sections[si].fields];
        fields[fi] = { ...fields[fi], ...patch };
        sections[si] = { ...sections[si], fields };
        return { ...prev, sections };
      });
    },
    []
  );

  const removeField = useCallback((si: number, fi: number) => {
    setConfig((prev) => {
      const sections = [...prev.sections];
      sections[si] = {
        ...sections[si],
        fields: sections[si].fields.filter((_, i) => i !== fi),
      };
      return { ...prev, sections };
    });
  }, []);

  const addField = useCallback((si: number) => {
    const id = uid();
    setConfig((prev) => {
      const sections = [...prev.sections];
      sections[si] = {
        ...sections[si],
        fields: [
          ...sections[si].fields,
          {
            id,
            label: "New Field",
            type: "text",
            required: false,
          },
        ],
      };
      return { ...prev, sections };
    });
  }, []);

  const validate = () => {
    const result = validateFormBuilderConfig(config);
    const nextErrors: Record<string, string> = {};

    Object.entries(result.errors).forEach(([key, value]) => {
      if (value) nextErrors[key] = value;
    });

    setErrors(nextErrors);
    return result.valid;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await adminApi.saveForm(config as unknown as Record<string, unknown>);
      setSaving(false);
      router.push("/admin/forms");
    } catch {
      setSaving(false);
      setErrors((prev) => ({ ...prev, submit: "Failed to save form. Please retry." }));
    }
  };

  const totalFields = config.sections.reduce((a, s) => a + s.fields.length, 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Visa Form</h1>
          <p className="text-gray-500 text-sm mt-1">
            {config.sections.length} section{config.sections.length !== 1 ? "s" : ""} ·{" "}
            {totalFields} field{totalFields !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/forms")}
            className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Form
              </>
            )}
          </button>
        </div>
      </div>

      {errors.submit ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.submit}
        </div>
      ) : null}

      {validationMessages.length > 0 ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-700">
            Fix {validationMessages.length} issue{validationMessages.length !== 1 ? "s" : ""} before saving
          </p>
          <ul className="mt-2 space-y-1 text-xs text-red-600">
            {validationMessages.slice(0, 6).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Builder */}
        <div className="xl:col-span-2 space-y-5">
          {/* Visa meta */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xs">1</span>
              Form Identity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Visa <span className="text-red-400">*</span>
                </label>
                {/* Dropdown ensures visaId always matches an actual visa in the catalog */}
                <select
                  className={[
                    "w-full text-sm border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 transition-all bg-white",
                    errors.visaId
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-200 focus:ring-indigo-200",
                  ].join(" ")}
                  value={config.visaId}
                  onChange={(e) => {
                    const selected = visaOptions.find((v) => v.id === e.target.value);
                    setConfig((prev) => ({
                      ...prev,
                      visaId: e.target.value,
                      // Auto-fill formLabel if empty
                      formLabel: prev.formLabel || (selected?.name ?? ""),
                    }));
                  }}
                  disabled={visasLoading}
                >
                  <option value="">{visasLoading ? "Loading visas…" : "— Select a visa —"}</option>
                  {visaOptions.map((v) => (
                    <option key={v.id} value={v.id}>
                      [{v.countryCode}] {v.name} ({v.id})
                    </option>
                  ))}
                </select>
                {errors.visaId && (
                  <p className="text-xs text-red-500 mt-1">{errors.visaId}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  The form is linked to this visa — the ID must match exactly.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Form Label <span className="text-red-400">*</span>
                </label>
                <input
                  className={[
                    "w-full text-sm border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 transition-all",
                    errors.formLabel
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-200 focus:ring-indigo-200",
                  ].join(" ")}
                  placeholder="e.g. B-1/B-2 Tourist Application"
                  value={config.formLabel}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, formLabel: e.target.value }))
                  }
                />
                {errors.formLabel && (
                  <p className="text-xs text-red-500 mt-1">{errors.formLabel}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xs">2</span>
                Form Sections
              </h2>
              {errors.sections && (
                <p className="text-xs text-red-500">{errors.sections}</p>
              )}
            </div>

            <div className="space-y-3">
              {config.sections.map((section, si) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  sectionIdx={si}
                  total={config.sections.length}
                  onUpdateSection={updateSection}
                  onRemoveSection={removeSection}
                  onMoveSection={moveSection}
                  onUpdateField={updateField}
                  onRemoveField={removeField}
                  onAddField={addField}
                />
              ))}
            </div>

            <button
              onClick={addSection}
              className="w-full mt-3 py-3.5 border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Section
            </button>
          </div>
        </div>

        {/* Sidebar: preview + summary */}
        <div className="space-y-4 xl:sticky xl:top-24 self-start">
          {/* Summary card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Form Summary</h3>
            <div className="space-y-2.5 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Visa ID</span>
                <span className="font-mono font-bold text-gray-800">{config.visaId || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Label</span>
                <span className="font-semibold text-gray-700 text-right max-w-28 truncate">{config.formLabel || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Sections</span>
                <span className="font-bold text-indigo-600">{config.sections.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Fields</span>
                <span className="font-bold text-indigo-600">{totalFields}</span>
              </div>
              <div className="flex justify-between">
                <span>Required Fields</span>
                <span className="font-bold text-red-500">
                  {config.sections.reduce(
                    (a, s) => a + s.fields.filter((f) => f.required).length,
                    0
                  )}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              {config.sections.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{s.icon}</span>
                  <span className="flex-1 truncate">{s.title || "Untitled"}</span>
                  <span className="font-semibold text-gray-700">{s.fields.length} fields</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live preview */}
          {config.sections.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Live Preview
              </h3>
              <FormBuilderPreview config={config} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
