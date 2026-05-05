"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api-client";
import { getFlag } from "@/lib/flags";

interface Visa {
  id: string;
  name: string;
  countryCode: string;
  category: string;
  fee: number;
  processingTime: string;
  validity: string;
  stayDuration: string;
  description?: string;
  formSchemaId?: string;
  source?: "static" | "custom";
}

interface VisaForm {
  name: string;
  countryCode: string;
  category: string;
  fee: string;
  processingTime: string;
  validity: string;
  stayDuration: string;
  description: string;
  formSchemaId: string;
}

interface CountryOption { id: string; name: string; code: string; flag?: string; }
interface FormOption { visaId: string; formLabel: string; sections: unknown[]; hasOverride?: boolean; }

const EMPTY_FORM: VisaForm = {
  name: "", countryCode: "", category: "", fee: "", processingTime: "",
  validity: "", stayDuration: "", description: "", formSchemaId: "",
};

const TYPE_OPTIONS = ["tourist", "student", "work", "business", "medical", "transit", "family"];

const CAT_COLOR: Record<string, { badge: string; accent: string; border: string }> = {
  tourist:  { badge: "bg-emerald-100 text-emerald-700", accent: "from-emerald-500 to-teal-600",   border: "border-emerald-200" },
  student:  { badge: "bg-sky-100 text-sky-700",         accent: "from-sky-500 to-blue-600",        border: "border-sky-200" },
  work:     { badge: "bg-amber-100 text-amber-700",     accent: "from-amber-500 to-orange-600",    border: "border-amber-200" },
  business: { badge: "bg-violet-100 text-violet-700",   accent: "from-violet-500 to-purple-600",   border: "border-violet-200" },
  medical:  { badge: "bg-rose-100 text-rose-700",       accent: "from-rose-500 to-pink-600",       border: "border-rose-200" },
  transit:  { badge: "bg-slate-100 text-slate-700",     accent: "from-slate-500 to-gray-600",      border: "border-slate-200" },
  family:   { badge: "bg-pink-100 text-pink-700",       accent: "from-pink-500 to-rose-600",       border: "border-pink-200" },
};

function inputClass(extra = "") {
  return [
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white",
    "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all",
    extra,
  ].join(" ");
}

function formatCurrency(value: string | number) {
  const numeric = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(numeric || 0);
}

function suggestedFormId(form: VisaForm) {
  if (!form.countryCode || !form.category) return "";
  return `${form.countryCode.toLowerCase()}-${form.category.toLowerCase().trim()}`;
}

function getAssignedForm(visaId: string, formSchemaId: string, forms: FormOption[]) {
  return forms.find((f) => f.visaId === formSchemaId) ?? forms.find((f) => f.visaId === visaId) ?? null;
}

function LivePreview({ form, selectedCountry }: { form: VisaForm; selectedCountry?: CountryOption }) {
  const cat = form.category.toLowerCase();
  const colors = CAT_COLOR[cat] ?? { badge: "bg-gray-100 text-gray-600", accent: "from-indigo-500 to-violet-600", border: "border-gray-200" };
  const flag = form.countryCode ? getFlag(form.countryCode) : null;
  const hasAnyData = form.name || form.countryCode || form.category || form.fee;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-gray-900">Live Preview</p>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Updates as you type</span>
      </div>

      {/* Catalog card */}
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Catalog card</p>
        <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${hasAnyData ? `${colors.border} shadow-sm` : "border-dashed border-gray-200"}`}>
          <div className={`h-1 bg-gradient-to-r ${colors.accent}`} />
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.accent} flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
                {flag ?? <span className="text-white/60 text-xl font-bold">?</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-black text-gray-950 truncate text-base leading-tight">
                      {form.name || <span className="text-gray-300">Visa name</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">
                      {selectedCountry?.name ?? form.countryCode ?? "Country"}
                    </p>
                  </div>
                  {cat && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${colors.badge}`}>
                      {cat}
                    </span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Fee</p>
                    <div className="text-sm font-black text-gray-900 mt-0.5">
                      {form.fee ? formatCurrency(form.fee) : <span className="text-gray-300">—</span>}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Processing</p>
                    <div className="text-xs font-bold text-gray-900 mt-0.5 truncate">
                      {form.processingTime || <span className="text-gray-300">—</span>}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Validity</p>
                    <div className="text-xs font-bold text-gray-900 mt-0.5 truncate">
                      {form.validity || <span className="text-gray-300">—</span>}
                    </div>
                  </div>
                </div>
                {form.stayDuration && (
                  <p className="mt-2 text-xs text-gray-500"><span className="font-semibold">Stay:</span> {form.stayDuration}</p>
                )}
                {form.description && (
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2">{form.description}</p>
                )}
                <div className="mt-3">
                  <div className={`w-full py-2 rounded-xl bg-gradient-to-r ${colors.accent} text-white text-xs font-bold text-center shadow-sm opacity-80`}>
                    Apply Now
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin list row */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Admin list row</p>
        <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${colors.accent} flex items-center justify-center text-lg flex-shrink-0`}>
            {flag ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{form.name || "—"}</p>
            <p className="text-xs text-gray-400 truncate">{(selectedCountry?.name ?? form.countryCode) || "No country"}</p>
          </div>
          {cat && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${colors.badge}`}>{cat}</span>
          )}
          <p className="text-sm font-black text-gray-900 flex-shrink-0">
            {form.fee ? formatCurrency(form.fee) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminVisaEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [form, setForm] = useState<VisaForm>(EMPTY_FORM);
  const [visa, setVisa] = useState<Visa | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [forms, setForms] = useState<FormOption[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      setNotFound(false);
      try {
        const [visaResponse, countryResponse, formsResponse] = await Promise.all([
          adminApi.getVisa(id),
          adminApi.getCountries(),
          adminApi.getForms(),
        ]);
        if (cancelled) return;
        const data = visaResponse as Visa;
        const countryData = countryResponse as { countries?: CountryOption[] };
        const formData = formsResponse as { forms?: FormOption[] };
        setVisa(data);
        setCountries(Array.isArray(countryData.countries) ? countryData.countries : []);
        setForms(Array.isArray(formData.forms) ? formData.forms : []);
        setForm({
          name: data.name ?? "",
          countryCode: data.countryCode ?? "",
          category: data.category ?? "",
          fee: String(data.fee ?? ""),
          processingTime: data.processingTime ?? "",
          validity: data.validity ?? "",
          stayDuration: data.stayDuration ?? "",
          description: data.description ?? "",
          formSchemaId: data.formSchemaId ?? "",
        });
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  const update = (k: keyof VisaForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const selectedCountry = countries.find((c) => c.code === form.countryCode);
  const suggested = suggestedFormId(form);
  const suggestedForm = forms.find((item) => item.visaId === suggested);
  const assignedForm = useMemo(() => getAssignedForm(id, form.formSchemaId, forms), [id, form.formSchemaId, forms]);
  const effectiveForm = forms.find((item) => item.visaId === form.formSchemaId) ?? suggestedForm ?? assignedForm;
  const isCustom = visa?.source === "custom";

  const handleSave = async () => {
    setError(null);
    const countryCode = form.countryCode.trim().toUpperCase();
    const category = form.category.trim().toLowerCase();
    if (!form.name.trim()) { setError("Visa name is required."); return; }
    if (!countryCode) { setError("Country is required."); return; }
    if (!category) { setError("Visa type is required."); return; }

    setSaving(true);
    try {
      const updated = (await adminApi.updateVisa(id, {
        ...form,
        name: form.name.trim(),
        countryCode,
        category,
        fee: Number(form.fee) || 0,
        formSchemaId: form.formSchemaId || suggestedForm?.visaId || undefined,
      })) as Visa;
      setVisa(updated);
      setForm((prev) => ({
        ...prev,
        countryCode: updated.countryCode,
        category: updated.category,
        fee: String(updated.fee ?? ""),
        formSchemaId: updated.formSchemaId ?? prev.formSchemaId,
      }));
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push("/admin/visas");
      }, 800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save visa");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteVisa(id);
      router.push("/admin/visas");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete visa");
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (notFound && !loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
        <p className="font-bold text-gray-800">Visa type not found</p>
        <Link href="/admin/visas" className="mt-2 inline-flex text-sm font-semibold text-indigo-600 hover:underline">
          Back to visa types
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/visas" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {form.countryCode && <span className="text-2xl">{getFlag(form.countryCode)}</span>}
            <h1 className="text-2xl font-black text-gray-900 truncate">{form.name || "Edit Visa Type"}</h1>
            {visa?.source && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-gray-500">
                {visa.source}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-0.5 font-mono">{id}</p>
        </div>
        {/* Top-right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/visa/${id}`}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Preview
          </Link>
          {isCustom && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-100"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Identity */}
        <div>
          <p className="font-bold text-gray-900 mb-4">Identity</p>
          <p className="text-xs text-gray-500 mb-4">Country and visa type decide the catalog identity and matching form key.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Country <span className="text-red-400">*</span>
              </label>
              <select value={form.countryCode} onChange={(e) => update("countryCode", e.target.value)} className={inputClass()}>
                <option value="">Select country</option>
                {countries.map((c) => <option key={c.id} value={c.code}>{c.name} ({c.code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Visa Type <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                list="visa-type-opts"
                value={form.category}
                onChange={(e) => update("category", e.target.value.toLowerCase().trim())}
                placeholder="tourist, student, work..."
                className={inputClass("capitalize")}
              />
              <datalist id="visa-type-opts">
                {TYPE_OPTIONS.map((o) => <option key={o} value={o} />)}
              </datalist>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Display Name <span className="text-red-400">*</span>
              </label>
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. B-1/B-2 Tourist Visa" className={inputClass()} />
            </div>
          </div>
        </div>

        {/* Commercial Details */}
        <div className="pt-5 border-t border-gray-100">
          <p className="font-bold text-gray-900 mb-4">Commercial Details</p>
          <p className="text-xs text-gray-500 mb-4">These values are visible to admins and customers before application.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Fee (USD)</label>
              <input type="number" min="0" value={form.fee} onChange={(e) => update("fee", e.target.value)} placeholder="150" className={inputClass()} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Processing Time</label>
              <input type="text" value={form.processingTime} onChange={(e) => update("processingTime", e.target.value)} placeholder="2-4 weeks" className={inputClass()} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Validity</label>
              <input type="text" value={form.validity} onChange={(e) => update("validity", e.target.value)} placeholder="1 year" className={inputClass()} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Stay Duration</label>
              <input type="text" value={form.stayDuration} onChange={(e) => update("stayDuration", e.target.value)} placeholder="30 days" className={inputClass()} />
            </div>
          </div>
        </div>

        {/* Form Assignment */}
        <div className="pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-gray-900">Form Assignment</p>
            {suggestedForm && (
              <button type="button" onClick={() => update("formSchemaId", suggestedForm.visaId)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                Use suggested form
              </button>
            )}
          </div>
          <select value={form.formSchemaId} onChange={(e) => update("formSchemaId", e.target.value)} className={inputClass()}>
            <option value="">Auto-select matching form if available</option>
            {forms.map((o) => <option key={o.visaId} value={o.visaId}>{o.formLabel} ({o.visaId})</option>)}
          </select>
          <p className="mt-1.5 text-xs text-gray-400">
            Suggested key: <span className="font-mono">{suggested || "select country and type"}</span>
          </p>
          {effectiveForm && (
            <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">{effectiveForm.formLabel}</p>
              <p className="mt-0.5 font-mono text-xs text-gray-400">{effectiveForm.visaId}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs text-gray-500">{(effectiveForm.sections as unknown[]).length} sections</span>
                <Link href={`/admin/forms/${effectiveForm.visaId}`} className="text-xs font-bold text-indigo-600 hover:underline">
                  Open form builder →
                </Link>
              </div>
            </div>
          )}
          {!effectiveForm && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-semibold text-amber-700">No published form found</p>
              <Link href="/admin/forms/new" className="mt-1 inline-flex text-xs font-bold text-indigo-600 hover:underline">Create form</Link>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="pt-5 border-t border-gray-100">
          <p className="font-bold text-gray-900 mb-4">Description</p>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            placeholder="Short user-facing summary of eligibility, purpose, or special notes..."
            className={inputClass("resize-none")}
          />
        </div>

        {/* Quick Actions */}
        <div className="pt-5 border-t border-gray-100">
          <p className="font-bold text-gray-900 mb-3">Quick Actions</p>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/apply/${id}`}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Test apply flow
            </Link>
            <Link
              href={`/country/${form.countryCode}`}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
            >
              View country page
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Saving…
              </>
            ) : saved ? "✅ Saved!" : "💾 Save Changes"}
          </button>
          <Link href="/admin/visas" className="px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">
            Cancel
          </Link>
        </div>
      </div>

        {/* Sticky Live Preview */}
        <div className="xl:sticky xl:top-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <LivePreview form={form} selectedCountry={selectedCountry} />
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-950/45 backdrop-blur-sm" onClick={() => setDeleteOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-950">Delete visa type?</h2>
                <p className="mt-1 text-sm text-gray-500">
                  This permanently removes <span className="font-semibold text-gray-800">{form.name}</span> from the catalog.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete visa"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
