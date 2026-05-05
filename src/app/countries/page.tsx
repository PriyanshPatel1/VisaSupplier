"use client";

import { ChangeEvent, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { useContentCatalog } from "@/hooks/use-content-catalog";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import Footer from "@/components/layout/footer";
import type { Country, VisaType } from "@/types";

function getCountryVisas(visas: VisaType[], countryCode: string) {
  return visas.filter((v) => v.countryCode === countryCode);
}

function buildCountryMetrics(country: Country, visas: VisaType[]) {
  const countryVisas = getCountryVisas(visas, country.code);
  const fees = countryVisas.map((v) => v.fee).sort((a, b) => a - b);
  const categories = Array.from(new Set(countryVisas.map((v) => v.category)));
  return { visaCount: countryVisas.length, categories, startingFee: fees[0] };
}

function CountrySkeleton() {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white animate-pulse p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="h-14 w-14 rounded-2xl bg-slate-100" />
        <div className="h-6 w-10 rounded-full bg-slate-100" />
      </div>
      <div className="h-3 w-20 rounded bg-slate-100" />
      <div className="h-6 w-32 rounded bg-slate-100" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-16 rounded-xl bg-slate-100" />
        <div className="h-16 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function CountryCard({
  country,
  metrics,
}: {
  country: Country;
  metrics: ReturnType<typeof buildCountryMetrics>;
}) {
  const startingFee =
    typeof metrics.startingFee === "number" && metrics.startingFee > 0
      ? formatCurrency(metrics.startingFee, DEFAULT_CURRENCY, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : null;

  return (
    <Link
      href={`/country/${country.code}`}
      className="group relative flex flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-4xl">
            {country.flag}
          </div>
          <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            {country.code}
          </span>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500 mb-1">
          {country.continent || "Global"}
        </p>
        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
          {country.name}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          {metrics.visaCount > 0
            ? `${metrics.visaCount} visa route${metrics.visaCount !== 1 ? "s" : ""} available`
            : "Visa routes coming soon"}
        </p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Routes
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {metrics.visaCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              From
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {startingFee ?? "—"}
            </p>
          </div>
        </div>
        {metrics.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {metrics.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold capitalize text-indigo-700"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
        <span className="text-sm text-slate-500">View destination</span>
        <span className="text-sm font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
          Explore →
        </span>
      </div>
    </Link>
  );
}

export default function CountriesPage() {
  const { countries, visas, continents, loading, error } = useContentCatalog();
  const [search, setSearch] = useState("");
  const [continentFilter, setContinentFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const deferredSearch = useDeferredValue(search);

  const continentOptions = useMemo(() => ["All", ...continents], [continents]);
  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(visas.map((v) => v.category)));
    return ["All", ...cats];
  }, [visas]);

  const countryMetrics = useMemo(
    () => new Map(countries.map((c) => [c.code, buildCountryMetrics(c, visas)])),
    [countries, visas],
  );

  const filtered = useMemo(() => {
    const q = deferredSearch.toLowerCase();
    return countries.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q))
        return false;
      if (continentFilter !== "All" && c.continent !== continentFilter) return false;
      if (categoryFilter !== "All") {
        const cats = countryMetrics.get(c.code)?.categories ?? [];
        if (!cats.includes(categoryFilter)) return false;
      }
      return true;
    });
  }, [deferredSearch, continentFilter, categoryFilter, countries, countryMetrics]);

  const resetFilters = () => {
    setSearch("");
    setContinentFilter("All");
    setCategoryFilter("All");
  };

  const hasFilters = search || continentFilter !== "All" || categoryFilter !== "All";

  return (
    <div className="marketing-shell min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-950 to-slate-900 py-16 sm:py-20">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-indigo-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-6">
            Global Destinations
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
            Find Your Next Destination
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            Browse {loading ? "..." : countries.length} countries and compare visa routes, fees,
            and processing times.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-400">
            <span>
              <strong className="text-white text-2xl font-bold mr-1">{countries.length}</strong>
              Countries
            </span>
            <span>
              <strong className="text-white text-2xl font-bold mr-1">{visas.length}</strong>
              Visa Routes
            </span>
            <span>
              <strong className="text-white text-2xl font-bold mr-1">{continents.length}</strong>
              Regions
            </span>
          </div>
        </div>
      </section>

      {/* Sticky Filters */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8 py-3 flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center">
          <div className="relative w-full sm:w-64 shrink-0">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Search country or code…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {continentOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setContinentFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  continentFilter === c
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {categoryOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                  categoryFilter === c
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors shrink-0"
            >
              Clear ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-[88rem] px-5 sm:px-8 py-10">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-red-700 mb-1">Failed to load catalog</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <CountrySkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-20 text-center">
            <p className="text-4xl mb-4">🌍</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No destinations found</h2>
            <p className="text-sm text-slate-500 mb-6">
              Try widening your search or removing filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">
              Showing <strong className="text-slate-900">{filtered.length}</strong> of{" "}
              <strong className="text-slate-900">{countries.length}</strong> destinations
            </p>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((country) => (
                <CountryCard
                  key={country.id}
                  country={country}
                  metrics={
                    countryMetrics.get(country.code) ?? buildCountryMetrics(country, visas)
                  }
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
