"use client";

import { useState, useEffect, use, startTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormBuilderPreview } from "@/components/admin/forms/FormBuilderPreview";
import { adminApi } from "@/lib/api-client";
import { validateFormBuilderConfig } from "@/lib/form-builder-validation";
import type { WizardConfig, WizardSection, WizardField } from "@/components/form/GenericWizard";

// ── Constants ────────────────────────────────────────────────────────────────
const FIELD_TYPES = ["text", "email", "tel", "number", "date", "select", "textarea", "radio", "checkbox", "file"] as const;
type FieldType = typeof FIELD_TYPES[number];

const ICONS = ["👤", "🛂", "✈️", "🏠", "💰", "📎", "🎓", "💼", "🏢", "📋", "🌍", "🇺🇸", "🤝", "🔒", "📱", "📞", "👨‍👩‍👧", "🏖️", "🍁", "💶"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9); }
function cloneConfig(config: WizardConfig): WizardConfig {
  return JSON.parse(JSON.stringify(config)) as WizardConfig;
}

// ── Field Editor ─────────────────────────────────────────────────────────────
function FieldEditor({
  field,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  field: WizardField;
  onChange: (f: WizardField) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);

  const update = (patch: Partial<WizardField>) => onChange({ ...field, ...patch });

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Field header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Reorder */}
        <div className="flex flex-col gap-0.5">
          <button onClick={onMoveUp} disabled={isFirst}
            className="text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors leading-none text-xs">▲</button>
          <button onClick={onMoveDown} disabled={isLast}
            className="text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors leading-none text-xs">▼</button>
        </div>

        {/* Type badge */}
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono font-bold flex-shrink-0">
          {field.type}
        </span>

        {/* Label */}
        <p className="text-sm font-semibold text-gray-800 flex-1 truncate">{field.label || <span className="text-gray-400 italic">Untitled field</span>}</p>

        {field.required && (
          <span className="text-xs text-red-500 font-bold flex-shrink-0">Required</span>
        )}

        {/* Actions */}
        <button onClick={() => setOpen((o) => !o)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors text-xs font-semibold">
          {open ? "▲ Close" : "✏️ Edit"}
        </button>
        <button onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Expanded editor */}
      {open && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Field ID <span className="text-red-400">*</span></label>
            <input value={field.id} onChange={(e) => update({ id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="fieldId" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Label <span className="text-red-400">*</span></label>
            <input value={field.label} onChange={(e) => update({ label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="Field Label" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type <span className="text-red-400">*</span></label>
            <select value={field.type} onChange={(e) => update({ type: e.target.value as FieldType })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white">
              {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Placeholder</label>
            <input value={field.placeholder ?? ""} onChange={(e) => update({ placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="Hint text..." />
          </div>

          {(field.type === "select" || field.type === "radio") && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Options (one per line)</label>
              <textarea
                value={(field.options ?? []).join("\n")}
                onChange={(e) => update({ options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                placeholder={"Option 1\nOption 2\nOption 3"} />
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Show If (conditional)</label>
            <div className="flex gap-2">
              <input
                value={field.showIf?.field ?? ""}
                onChange={(e) => update({ showIf: e.target.value ? { field: e.target.value, value: field.showIf?.value ?? "" } : undefined })}
                placeholder="Field ID to watch"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
              <input
                value={field.showIf?.value ?? ""}
                onChange={(e) => update({ showIf: field.showIf?.field ? { field: field.showIf.field, value: e.target.value } : undefined })}
                placeholder="equals value"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Leave blank to always show. E.g. watch field &ldquo;hasVisa&rdquo;, show when value is &ldquo;Yes&rdquo;.</p>
          </div>

          <div className="sm:col-span-2 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!field.required} onChange={(e) => update({ required: e.target.checked })}
                className="w-4 h-4 accent-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Required field</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={field.colSpan === "full"} onChange={(e) => update({ colSpan: e.target.checked ? "full" : undefined })}
                className="w-4 h-4 accent-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Full width (span 2 cols)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section Editor ────────────────────────────────────────────────────────────
function SectionEditor({
  section,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  section: WizardSection;
  onChange: (s: WizardSection) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const updateField = (idx: number, f: WizardField) => {
    const fields = [...section.fields];
    fields[idx] = f;
    onChange({ ...section, fields });
  };

  const deleteField = (idx: number) => {
    onChange({ ...section, fields: section.fields.filter((_, i) => i !== idx) });
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    const fields = [...section.fields];
    const to = idx + dir;
    if (to < 0 || to >= fields.length) return;
    [fields[idx], fields[to]] = [fields[to], fields[idx]];
    onChange({ ...section, fields });
  };

  const addField = () => {
    const newField: WizardField = { id: `field_${uid()}`, label: "New Field", type: "text", required: false };
    onChange({ ...section, fields: [...section.fields, newField] });
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-200">
        {/* Reorder */}
        <div className="flex flex-col gap-0.5">
          <button onClick={onMoveUp} disabled={isFirst} className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none">▲</button>
          <button onClick={onMoveDown} disabled={isLast} className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none">▼</button>
        </div>

        {/* Icon picker */}
        <select value={section.icon} onChange={(e) => onChange({ ...section, icon: e.target.value })}
          className="text-xl bg-transparent border-none outline-none cursor-pointer w-10">
          {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
        </select>

        {/* Title */}
        <input value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          className="flex-1 bg-transparent font-bold text-gray-900 text-base border-none outline-none focus:bg-white focus:px-2 focus:rounded-lg transition-all"
          placeholder="Section title" />

        <span className="text-xs text-gray-400 flex-shrink-0">{section.fields.length} field{section.fields.length !== 1 ? "s" : ""}</span>

        <button onClick={() => setCollapsed((c) => !c)}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors text-xs font-semibold">
          {collapsed ? "▼ Expand" : "▲ Collapse"}
        </button>
        <button onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className="p-5">
          {/* Section meta fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-4 bg-gray-50 rounded-xl">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Section ID</label>
              <input value={section.id} onChange={(e) => onChange({ ...section, id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
                placeholder="sectionId" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (sub-heading)</label>
              <input value={section.description} onChange={(e) => onChange({ ...section, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
                placeholder="Short description shown under step title" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Info Note (optional blue banner)</label>
              <input value={section.infoNote ?? ""} onChange={(e) => onChange({ ...section, infoNote: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
                placeholder="Helpful tip shown at the top of this step..." />
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3 mb-4">
            {section.fields.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400">
                No fields yet. Click &quot;Add Field&quot; to get started.
              </div>
            )}
            {section.fields.map((field, idx) => (
              <FieldEditor
                key={field.id + idx}
                field={field}
                onChange={(f) => updateField(idx, f)}
                onDelete={() => deleteField(idx)}
                onMoveUp={() => moveField(idx, -1)}
                onMoveDown={() => moveField(idx, 1)}
                isFirst={idx === 0}
                isLast={idx === section.fields.length - 1}
              />
            ))}
          </div>

          <button onClick={addField}
            className="w-full py-2.5 border-2 border-dashed border-indigo-300 text-indigo-500 hover:bg-indigo-50 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Field
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminFormEditorPage({ params }: { params: Promise<{ visaId: string }> }) {
  const { visaId } = use(params);
  const router = useRouter();

  const isNew = visaId === "new";
  const [config, setConfig] = useState<WizardConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validationMessages = Array.from(
    new Set(
      Object.entries(errors)
        .filter(([key, value]) => key !== "submit" && Boolean(value))
        .map(([, value]) => value),
    ),
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (isNew) {
        startTransition(() => {
          setConfig({ visaId: "", formLabel: "", sections: [] });
          setIsCustom(false);
        });
        return;
      }

      try {
        const response = (await adminApi.getForm(visaId)) as {
          config?: WizardConfig;
          hasOverride?: boolean;
        };

        if (!response.config || cancelled) {
          if (!cancelled) router.push("/admin/forms");
          return;
        }

        startTransition(() => {
          setConfig(cloneConfig(response.config as WizardConfig));
          setIsCustom(Boolean(response.hasOverride));
        });
      } catch {
        if (!cancelled) {
          router.push("/admin/forms");
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [visaId, isNew, router]);

  const updateSection = (idx: number, s: WizardSection) => {
    if (!config) return;
    const sections = [...config.sections];
    sections[idx] = s;
    setConfig({ ...config, sections });
  };

  const deleteSection = (idx: number) => {
    if (!config) return;
    setConfig({ ...config, sections: config.sections.filter((_, i) => i !== idx) });
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    if (!config) return;
    const sections = [...config.sections];
    const to = idx + dir;
    if (to < 0 || to >= sections.length) return;
    [sections[idx], sections[to]] = [sections[to], sections[idx]];
    setConfig({ ...config, sections });
  };

  const addSection = () => {
    if (!config) return;
    const newSection: WizardSection = {
      id: `section_${uid()}`,
      title: "New Section",
      description: "Section description",
      icon: "📋",
      fields: [],
    };
    setConfig({ ...config, sections: [...config.sections, newSection] });
  };

  const handleSave = async () => {
    if (!config) return;
    const validation = validateFormBuilderConfig(config);
    if (!validation.valid) {
      const nextErrors: Record<string, string> = {};
      Object.entries(validation.errors).forEach(([key, value]) => {
        if (value) nextErrors[key] = value;
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      if (isNew) {
        await adminApi.saveForm(config as unknown as Record<string, unknown>);
      } else {
        await adminApi.updateForm(visaId, config as unknown as Record<string, unknown>);
      }
      setIsCustom(true);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push(isNew ? `/admin/forms/${config.visaId}` : "/admin/forms");
      }, 800);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to save form. Please retry.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset to default? All your changes to this form will be lost.")) return;
    await adminApi.resetForm(visaId);
    try {
      const response = (await adminApi.getForm(visaId)) as {
        config?: WizardConfig;
        hasOverride?: boolean;
      };
      if (response.config) {
        setConfig(cloneConfig(response.config));
        setIsCustom(Boolean(response.hasOverride));
      }
    } catch {
      setIsCustom(false);
    }
  };

  if (!config) return (
    <div className="flex items-center justify-center py-32">
      <svg className="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/forms" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "Create New Form" : `Edit: ${config.formLabel}`}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5 font-mono">{isNew ? "new" : visaId}</p>
        </div>
        <div className="flex items-center gap-2">
          {isCustom && !isNew && (
            <button onClick={handleReset}
              className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl text-sm font-semibold transition-colors">
              ↺ Reset to Default
            </button>
          )}
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 flex items-center gap-2">
            {saving ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</>
            ) : saved ? "✅ Saved!" : "💾 Save Form"}
          </button>
        </div>
      </div>

      {validationMessages.length > 0 && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-700">
            Fix {validationMessages.length} issue{validationMessages.length !== 1 ? "s" : ""} before saving
          </p>
          <ul className="mt-2 space-y-1 text-xs text-red-600">
            {validationMessages.slice(0, 6).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      {errors.submit && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errors.submit}
        </div>
      )}

      {isCustom && (
        <div className="mb-6 px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-700 flex items-center gap-2">
          <span>✏️</span> This form has been customised by admin. Users applying for this visa will see your version.
        </div>
      )}

      {/* Form meta */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Form Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              Visa ID <span className="text-red-400">*</span>
              <span className="text-gray-400 ml-1 font-normal normal-case">(must match visaTypes.ts exactly, e.g. us-tourist)</span>
            </label>
            <input value={config.visaId}
              onChange={(e) => setConfig({ ...config, visaId: e.target.value })}
              disabled={!isNew}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="us-tourist" />
            {errors.visaId && (
              <p className="mt-1 text-xs text-red-500">{errors.visaId}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              Form Label <span className="text-red-400">*</span>
              <span className="text-gray-400 ml-1 font-normal normal-case">(shown in sidebar badge, e.g. &quot;B-1/B-2 Application&quot;)</span>
            </label>
            <input value={config.formLabel}
              onChange={(e) => setConfig({ ...config, formLabel: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="B-1/B-2 Application" />
            {errors.formLabel && (
              <p className="mt-1 text-xs text-red-500">{errors.formLabel}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 text-lg">
          Form Sections
          <span className="ml-2 text-sm font-normal text-gray-400">({config.sections.length} steps)</span>
        </h2>
        {errors.sections ? (
          <p className="text-xs font-medium text-red-500">{errors.sections}</p>
        ) : (
          <p className="text-xs text-gray-400">Supplier picker + Review are added automatically at the end.</p>
        )}
      </div>

      <div className="space-y-4 mb-6">
        {config.sections.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-4xl mb-3">🧩</p>
            <p className="text-gray-500 font-semibold">No sections yet</p>
            <p className="text-sm text-gray-400 mt-1">Click &quot;Add Section&quot; to create your first form step.</p>
          </div>
        )}

        {config.sections.map((section, idx) => (
          <SectionEditor
            key={section.id + idx}
            section={section}
            onChange={(s) => updateSection(idx, s)}
            onDelete={() => deleteSection(idx)}
            onMoveUp={() => moveSection(idx, -1)}
            onMoveDown={() => moveSection(idx, 1)}
            isFirst={idx === 0}
            isLast={idx === config.sections.length - 1}
          />
        ))}
      </div>

      <button onClick={addSection}
        className="w-full py-4 border-2 border-dashed border-indigo-300 text-indigo-500 hover:bg-indigo-50 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 mb-8">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Section
      </button>

      {config.sections.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Live Preview</h2>
          <FormBuilderPreview config={config} />
        </div>
      )}

      {/* Preview JSON */}
      <details className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
        <summary className="px-5 py-3 cursor-pointer text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
          🔍 Preview Form Config JSON
        </summary>
        <pre className="p-5 text-xs text-gray-600 overflow-auto max-h-96 bg-gray-950 text-green-400">
          {JSON.stringify(config, null, 2)}
        </pre>
      </details>
    </div>
  );
}
