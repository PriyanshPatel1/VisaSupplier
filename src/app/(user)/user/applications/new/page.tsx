"use client";

import { ChangeEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContentCatalog } from "@/hooks/use-content-catalog";
import { formatCurrency } from "@/lib/currency";

const CATEGORY_STYLE: Record<string, string> = {
  tourist: "text-emerald-300 bg-emerald-500/14 border-emerald-400/25",
  student: "text-sky-300 bg-sky-500/14 border-sky-400/25",
  work: "text-amber-300 bg-amber-500/14 border-amber-400/25",
  business: "text-violet-300 bg-violet-500/14 border-violet-400/25",
};

export default function NewApplicationPage() {
  const router = useRouter();
  const { countries, visas } = useContentCatalog();

  const [countryCode, setCountryCode] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [visaQuery, setVisaQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const selectedCountry = countries.find((country) => country.code === countryCode);

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(q) || country.code.toLowerCase().includes(q),
    );
  }, [countries, countryQuery]);

  const visaOptions = useMemo(() => {
    if (!countryCode) return [];
    return visas.filter((visa) => {
      const byCountry = visa.countryCode === countryCode;
      const byCategory = categoryFilter === "all" || visa.category === categoryFilter;
      const bySearch =
        visaQuery.trim().length === 0 ||
        visa.name.toLowerCase().includes(visaQuery.toLowerCase()) ||
        visa.category.toLowerCase().includes(visaQuery.toLowerCase());
      return byCountry && byCategory && bySearch;
    });
  }, [categoryFilter, countryCode, visaQuery, visas]);

  const categories = useMemo(() => {
    if (!countryCode) return ["all"] as const;
    const set = new Set(
      visas.filter((visa) => visa.countryCode === countryCode).map((visa) => visa.category),
    );
    return ["all", ...Array.from(set)] as const;
  }, [countryCode, visas]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="user-outline-btn px-2 py-1 text-xs">
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
            Start New Application
          </h1>
          <p className="text-sm text-indigo-100/60">Choose destination and visa type to begin.</p>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="user-panel rounded-2xl p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">1. Select Destination</h2>
            <div className="relative mb-3">
              <input
                type="text"
                value={countryQuery}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setCountryQuery(event.target.value)}
                placeholder="Search country"
                className="user-input pl-9"
              />
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-100/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5-5m2-4a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
              {filteredCountries.map((country) => {
                const active = countryCode === country.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      setCountryCode(country.code);
                      setCategoryFilter("all");
                      setVisaQuery("");
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                      active
                        ? "border border-indigo-300/55 bg-indigo-500/20 text-white"
                        : "border border-transparent bg-[#0b1432] text-indigo-100/75 hover:border-indigo-300/35"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </span>
                    {active ? <span className="text-xs">Selected</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="user-panel rounded-2xl p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-white">
                2. Choose Visa Type
                {selectedCountry ? ` · ${selectedCountry.flag} ${selectedCountry.name}` : ""}
              </h2>
              <span className="text-xs text-indigo-100/60">{visaOptions.length} options</span>
            </div>

            {countryCode ? (
              <div className="mb-3 space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={visaQuery}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setVisaQuery(event.target.value)}
                    placeholder="Search visa type"
                    className="user-input pl-9"
                  />
                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-100/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-5-5m2-4a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setCategoryFilter(category as typeof categoryFilter)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                        categoryFilter === category
                          ? "border-indigo-300/65 bg-indigo-500/24 text-white"
                          : "border-indigo-300/24 text-indigo-100/72"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {!countryCode ? (
              <div className="rounded-xl border border-indigo-300/18 bg-[#0b1430] p-10 text-center">
                <p className="text-base font-semibold text-white">Select a destination first</p>
                <p className="mt-1 text-sm text-indigo-100/58">Visa options will appear here.</p>
              </div>
            ) : visaOptions.length === 0 ? (
              <div className="rounded-xl border border-indigo-300/18 bg-[#0b1430] p-10 text-center">
                <p className="text-base font-semibold text-white">No visas found</p>
                <p className="mt-1 text-sm text-indigo-100/58">Try changing category or search query.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {visaOptions.map((visa) => (
                  <article key={visa.id} className="rounded-xl border border-indigo-300/20 bg-[#0b1431] p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${CATEGORY_STYLE[visa.category] ?? "text-indigo-200 bg-indigo-500/14 border-indigo-400/25"}`}>
                        {visa.category}
                      </span>
                      <p className="text-sm font-bold text-white">{formatCurrency(visa.fee)}</p>
                    </div>

                    <h3 className="text-sm font-semibold text-white">{visa.name}</h3>
                    <p className="mt-1 text-xs text-indigo-100/58">
                      {visa.processingTime} · {visa.validity} · Stay {visa.stayDuration}
                    </p>

                    <div className="mt-3 flex gap-2">
                      <Link href={`/visa/${visa.id}`} className="user-outline-btn flex-1 px-2 py-1.5 text-center text-xs font-semibold">
                        Details
                      </Link>
                      <Link href={`/apply/${visa.id}`} className="user-cta flex-1 px-2 py-1.5 text-center text-xs font-semibold">
                        Apply
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
