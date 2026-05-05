"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi } from "@/lib/api-client";

interface CountryData {
  id: string;
  name: string;
  code: string;
  flag: string;
  description: string;
  continent: string;
  source: "static" | "custom";
}

interface EditForm {
  name: string;
  flag: string;
  description: string;
  continent: string;
}

const CONTINENTS = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania", "Antarctica"];

const CONTINENT_COLORS: Record<string, { accent: string; badge: string }> = {
  "Africa":        { accent: "from-amber-500 to-orange-600",  badge: "bg-amber-100 text-amber-700" },
  "Asia":          { accent: "from-red-500 to-rose-600",      badge: "bg-red-100 text-red-700" },
  "Europe":        { accent: "from-blue-500 to-indigo-600",   badge: "bg-blue-100 text-blue-700" },
  "North America": { accent: "from-green-500 to-emerald-600", badge: "bg-green-100 text-green-700" },
  "South America": { accent: "from-yellow-500 to-amber-600",  badge: "bg-yellow-100 text-yellow-700" },
  "Oceania":       { accent: "from-cyan-500 to-teal-600",     badge: "bg-cyan-100 text-cyan-700" },
  "Antarctica":    { accent: "from-slate-500 to-gray-600",    badge: "bg-slate-100 text-slate-700" },
};

function inputClass(extra = "") {
  return [
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white",
    "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all",
    extra,
  ].join(" ");
}

function LivePreview({ form, code }: { form: EditForm; code: string }) {
  const colors = CONTINENT_COLORS[form.continent] ?? { accent: "from-indigo-500 to-violet-600", badge: "bg-indigo-100 text-indigo-700" };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-gray-900">Live Preview</p>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Updates as you type</span>
      </div>

      {/* Country catalog card */}
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Country catalog card</p>
        <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200">
          <div className={`h-1.5 bg-gradient-to-r ${colors.accent}`} />
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.accent} flex items-center justify-center text-3xl flex-shrink-0 shadow-sm`}>
                {form.flag || <span className="text-white/40 text-2xl">🌍</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-black text-gray-950 text-lg leading-tight truncate">
                      {form.name || <span className="text-gray-300">Country name</span>}
                    </div>
                    {form.continent && (
                      <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${colors.badge}`}>
                        {form.continent}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-sm font-black px-2.5 py-1.5 rounded-xl flex-shrink-0 bg-gray-100 text-gray-700">
                    {code}
                  </span>
                </div>
                {form.description && (
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2">{form.description}</p>
                )}
                <div className="mt-3">
                  <div className={`w-full py-2 rounded-xl bg-gradient-to-r ${colors.accent} text-white text-xs font-bold text-center shadow-sm opacity-80`}>
                    View Visa Types
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
          <span className="text-2xl w-9 text-center flex-shrink-0">{form.flag || "🌍"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{form.name || "—"}</p>
            <p className="text-xs text-gray-400 truncate">{form.continent || "No continent"}</p>
          </div>
          <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg flex-shrink-0">
            {code}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminCountryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [country, setCountry] = useState<CountryData | null>(null);
  const [form, setForm] = useState<EditForm>({ name: "", flag: "", description: "", continent: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getCountry(id)
      .then((d) => {
        const c = d as CountryData;
        setCountry(c);
        setForm({ name: c.name, flag: c.flag, description: c.description ?? "", continent: c.continent ?? "" });
      })
      .catch(() => setError("Failed to load country"))
      .finally(() => setLoading(false));
  }, [id]);

  const update = (k: keyof EditForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await adminApi.updateCountry(id, { ...form } as Record<string, unknown>);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push("/admin/countries");
      }, 800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-none animate-pulse space-y-4 p-6">
        <div className="h-8 w-48 rounded-xl bg-gray-200" />
        <div className="h-64 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (!country) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-semibold">Country not found.</p>
        <Link href="/admin/countries" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">← Back to countries</Link>
      </div>
    );
  }

  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/countries" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {form.flag && <span className="text-2xl">{form.flag}</span>}
            <h1 className="text-2xl font-black text-gray-900 truncate">{form.name || "Edit Country"}</h1>
            <span className="font-mono text-sm font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">{country.code}</span>
            {country.source === "static" && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-gray-500">built-in</span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Update destination metadata used by visa catalog pages</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {country.source === "static" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Built-in country — the ISO code cannot be changed.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          {/* Details */}
          <div>
            <p className="font-bold text-gray-900 mb-4">Country Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Flag Emoji
                </label>
                <input
                  type="text"
                  value={form.flag}
                  onChange={(e) => update("flag", e.target.value)}
                  className={inputClass("text-2xl text-center")}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  ISO Code
                </label>
                <input
                  type="text"
                  value={country.code}
                  disabled
                  className={inputClass("cursor-not-allowed bg-gray-100 text-gray-400 font-mono")}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Country Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. India"
                  className={inputClass()}
                />
              </div>
            </div>
          </div>

          {/* Geography */}
          <div className="pt-5 border-t border-gray-100">
            <p className="font-bold text-gray-900 mb-4">Geography</p>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Continent</label>
                <select value={form.continent} onChange={(e) => update("continent", e.target.value)} className={inputClass()}>
                  <option value="">Select continent...</option>
                  {CONTINENTS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                  placeholder="Short country description..."
                  className={inputClass("resize-none")}
                />
              </div>
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
            <Link href="/admin/countries" className="px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </Link>
          </div>
        </div>

        {/* Sticky Live Preview */}
        <div className="xl:sticky xl:top-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <LivePreview form={form} code={country.code} />
          </div>
        </div>
      </div>
    </div>
  );
}
