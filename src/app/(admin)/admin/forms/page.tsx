"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api-client";
import type { WizardConfig } from "@/components/form/GenericWizard";

type FormConfigWithMeta = WizardConfig & { hasOverride?: boolean };

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  GB: "🇬🇧",
  CA: "🇨🇦",
  AE: "🇦🇪",
  DE: "🇩🇪",
  JP: "🇯🇵",
  AU: "🇦🇺",
};

const CATEGORY_COLORS: Record<string, string> = {
  tourist: "bg-emerald-100 text-emerald-700",
  student: "bg-blue-100 text-blue-700",
  work: "bg-orange-100 text-orange-700",
  business: "bg-purple-100 text-purple-700",
};

function getCountryCode(visaId: string): string {
  return visaId.split("-")[0]?.toUpperCase() ?? "";
}

function getCategory(visaId: string): string {
  const parts = visaId.split("-");
  return parts.slice(1).join("-") || "general";
}

export default function AdminFormsPage() {
  const [configs, setConfigs] = useState<FormConfigWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [resetting, setResetting] = useState<string | null>(null);

  const loadForms = useCallback(async () => {
    setLoading(true);
    try {
      const response = (await adminApi.getForms()) as { forms?: FormConfigWithMeta[] };
      setConfigs(Array.isArray(response.forms) ? response.forms : []);
    } catch {
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return configs.filter(
      (config) =>
        config.visaId.toLowerCase().includes(q) ||
        config.formLabel.toLowerCase().includes(q),
    );
  }, [configs, search]);

  const totalSections = useMemo(
    () => configs.reduce((sum, config) => sum + config.sections.length, 0),
    [configs],
  );
  const totalFields = useMemo(
    () =>
      configs.reduce(
        (sum, config) =>
          sum + config.sections.reduce((sectionTotal, section) => sectionTotal + section.fields.length, 0),
        0,
      ),
    [configs],
  );
  const customised = useMemo(
    () => configs.filter((config) => Boolean(config.hasOverride)).length,
    [configs],
  );

  const handleReset = async (visaId: string) => {
    if (!confirm(`Reset "${visaId}" back to default? All custom changes will be lost.`)) return;
    setResetting(visaId);
    try {
      await adminApi.resetForm(visaId);
      await loadForms();
    } finally {
      setResetting(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
          <p className="text-gray-500 mt-1">Manage form sections and fields for every visa type</p>
        </div>
        <Link
          href="/admin/forms/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Form
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Visa Forms", value: configs.length, icon: "📋", color: "border-l-indigo-500" },
          { label: "Total Sections", value: totalSections, icon: "🧩", color: "border-l-blue-500" },
          { label: "Total Fields", value: totalFields, icon: "📝", color: "border-l-emerald-500" },
          { label: "Customised by Admin", value: customised, icon: "✏️", color: "border-l-amber-500" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-xl p-5 border border-gray-100 border-l-4 ${stat.color} shadow-sm`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by visa ID or form label..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-44 rounded-2xl border border-gray-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((config) => {
            const countryCode = getCountryCode(config.visaId);
            const category = getCategory(config.visaId);
            const fieldCount = config.sections.reduce((sum, section) => sum + section.fields.length, 0);
            const isCustom = Boolean(config.hasOverride);

            return (
              <div
                key={config.visaId}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  isCustom ? "border-indigo-300 ring-1 ring-indigo-200" : "border-gray-200"
                }`}
              >
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{COUNTRY_FLAGS[countryCode] ?? "🌍"}</span>
                    <div className="flex items-center gap-2">
                      {isCustom ? (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">Custom</span>
                      ) : null}
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${CATEGORY_COLORS[category] ?? "bg-gray-100 text-gray-600"}`}>
                        {category}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base leading-tight">{config.formLabel}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{config.visaId}</p>
                </div>

                <div className="px-5 py-3 bg-gray-50 flex items-center gap-4 text-xs text-gray-500">
                  <span><strong className="text-gray-700">{config.sections.length}</strong> sections</span>
                  <span><strong className="text-gray-700">{fieldCount}</strong> fields</span>
                </div>

                <div className="p-4 flex items-center gap-2">
                  <Link
                    href={`/admin/forms/${config.visaId}`}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold text-center transition-colors"
                  >
                    Edit Form
                  </Link>
                  {isCustom ? (
                    <button
                      onClick={() => handleReset(config.visaId)}
                      disabled={resetting === config.visaId}
                      className="py-2 px-3 border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {resetting === config.visaId ? "..." : "Reset"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500 font-medium">No forms found for &quot;{search}&quot;</p>
        </div>
      ) : null}
    </div>
  );
}
