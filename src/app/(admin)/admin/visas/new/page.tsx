"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi } from "@/lib/api-client";
import { getFlag } from "@/lib/flags";

interface CountryOption { id: string; code: string; name: string; }
interface FormOption { visaId: string; formLabel: string; sections: { title: string }[]; }

interface NewVisaForm {
  countryCode: string;
  category: string;
  name: string;
  fee: string;
  processingTime: string;
  validity: string;
  stayDuration: string;
  description: string;
  formSchemaId: string;
}

const EMPTY: NewVisaForm = {
  countryCode: "", category: "", name: "", fee: "", processingTime: "",
  validity: "", stayDuration: "", description: "", formSchemaId: "",
};

const TYPE_OPTIONS = ["tourist", "student", "work", "business", "medical", "transit", "family"];

const CAT_COLOR: Record<string, { badge: string; accent: string }> = {
  tourist:  { badge: "bg-emerald-100 text-emerald-700", accent: "from-emerald-500 to-teal-600" },
  student:  { badge: "bg-sky-100 text-sky-700",         accent: "from-sky-500 to-blue-600" },
  work:     { badge: "bg-amber-100 text-amber-700",     accent: "from-amber-500 to-orange-600" },
  business: { badge: "bg-violet-100 text-violet-700",   accent: "from-violet-500 to-purple-600" },
  medical:  { badge: "bg-rose-100 text-rose-700",       accent: "from-rose-500 to-pink-600" },
  transit:  { badge: "bg-slate-100 text-slate-700",     accent: "from-slate-500 to-gray-600" },
  family:   { badge: "bg-pink-100 text-pink-700",       accent: "from-pink-500 to-rose-600" },
};

function inputClass(extra = "") {
  return [
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white",
    "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all",
    extra,
  ].join(" ");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

function LivePreview({ form, selectedCountry }: { form: NewVisaForm; selectedCountry?: CountryOption }) {
  const cat = form.category.toLowerCase();
  const colors = CAT_COLOR[cat] ?? { badge: "bg-gray-100 text-gray-600", accent: "from-indigo-500 to-violet-600" };
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
        <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${hasAnyData ? "border-gray-200 shadow-sm" : "border-dashed border-gray-200"}`}>
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
                    <div className="text-sm text-gray-500 mt-0.5 truncate">
                      {selectedCountry?.name ?? form.countryCode ?? <span className="text-gray-300">Country</span>}
                    </div>
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
                      {form.fee ? formatCurrency(Number(form.fee)) : <span className="text-gray-300">—</span>}
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
            {form.fee ? formatCurrency(Number(form.fee)) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminVisaNewPage() {
  const router = useRouter();
  const [form, setForm] = useState<NewVisaForm>(EMPTY);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [forms, setForms] = useState<FormOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getCountries().then((d) => {
      const data = d as { countries: CountryOption[] };
      setCountries(data.countries ?? []);
    }).catch(() => {});
    adminApi.getForms().then((d) => {
      const data = d as { forms: FormOption[] };
      setForms(data.forms ?? []);
    }).catch(() => {});
  }, []);

  const update = (k: keyof NewVisaForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const suggested = form.countryCode && form.category
    ? `${form.countryCode.toLowerCase()}-${form.category.toLowerCase().trim()}`
    : "";

  const suggestedForm = suggested ? forms.find((f) => f.visaId === suggested) : null;
  const selectedCountry = countries.find((c) => c.code === form.countryCode);
  const selectedForm = forms.find((f) => f.visaId === form.formSchemaId);

  const handleSubmit = async () => {
    setError(null);
    if (!form.countryCode || !form.category.trim() || !form.name.trim()) {
      setError("Country, visa type, and display name are required.");
      return;
    }
    setSaving(true);
    try {
      await adminApi.createVisa({
        countryCode: form.countryCode,
        category: form.category.toLowerCase().trim(),
        name: form.name.trim(),
        fee: Number(form.fee) || 0,
        processingTime: form.processingTime,
        validity: form.validity,
        stayDuration: form.stayDuration,
        description: form.description,
        formSchemaId: form.formSchemaId || undefined,
      });
      router.push("/admin/visas");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create visa type");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/visas" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Create Visa Type</h1>
          <p className="text-gray-500 text-sm mt-0.5">Add a new visa product to the catalog</p>
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
                list="visa-cat-opts"
                value={form.category}
                onChange={(e) => update("category", e.target.value.toLowerCase().trim())}
                placeholder="tourist, student, work..."
                className={inputClass("capitalize")}
              />
              <datalist id="visa-cat-opts">
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
          {selectedForm && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Form assigned: <span className="font-semibold text-indigo-600">{selectedForm.formLabel}</span>
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

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Creating…
              </>
            ) : (
              "✅ Create Visa Type"
            )}
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
    </div>
  );
}
