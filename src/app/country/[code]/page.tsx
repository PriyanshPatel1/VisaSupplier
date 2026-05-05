"use client";

import { ChangeEvent, use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useContentCatalog } from "@/hooks/use-content-catalog";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import Footer from "@/components/layout/footer";

// ── Convert ISO country code → flag emoji (fixes "US" text rendering) ─────────
function codeToFlag(code: string): string {
  if (!code || code.length !== 2) return "🌐";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

// ── Category config ───────────────────────────────────────────────────────────
const CAT_STYLES: Record<
  string,
  {
    label: string;
    icon: string;
    pillBg: string;
    pillText: string;
    activeBg: string;
    activeText: string;
    hoverBg: string;
    cardAccent: string; // left-border color class
  }
> = {
  tourist: {
    label: "Tourist",
    icon: "✈",
    pillBg: "bg-emerald-50",
    pillText: "text-emerald-700",
    activeBg: "bg-emerald-600",
    activeText: "text-white",
    hoverBg: "hover:bg-emerald-50",
    cardAccent: "border-l-emerald-400",
  },
  student: {
    label: "Student",
    icon: "🎓",
    pillBg: "bg-sky-50",
    pillText: "text-sky-700",
    activeBg: "bg-sky-600",
    activeText: "text-white",
    hoverBg: "hover:bg-sky-50",
    cardAccent: "border-l-sky-400",
  },
  work: {
    label: "Work",
    icon: "💼",
    pillBg: "bg-amber-50",
    pillText: "text-amber-700",
    activeBg: "bg-amber-500",
    activeText: "text-white",
    hoverBg: "hover:bg-amber-50",
    cardAccent: "border-l-amber-400",
  },
  business: {
    label: "Business",
    icon: "🏢",
    pillBg: "bg-violet-50",
    pillText: "text-violet-700",
    activeBg: "bg-violet-600",
    activeText: "text-white",
    hoverBg: "hover:bg-violet-50",
    cardAccent: "border-l-violet-400",
  },
};

const DEFAULT_CAT_STYLE = {
  label: "Visa",
  icon: "📄",
  pillBg: "bg-gray-100",
  pillText: "text-gray-700",
  activeBg: "bg-gray-700",
  activeText: "text-white",
  hoverBg: "hover:bg-gray-100",
  cardAccent: "border-l-gray-300",
};

function getCategoryStyle(category: string) {
  return (
    CAT_STYLES[category] ?? { ...DEFAULT_CAT_STYLE, label: category || "Visa" }
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border-l-4 border-l-gray-100 border border-gray-100 rounded-2xl overflow-hidden flex flex-col animate-pulse">
      <div className="p-5 flex-1 space-y-4">
        <div className="flex items-start justify-between">
          <div className="h-6 w-20 bg-gray-100 rounded-full" />
          <div className="h-7 w-16 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-4 w-3/4 bg-gray-100 rounded" />
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-2.5 space-y-1.5">
              <div className="h-2.5 w-12 bg-gray-100 rounded" />
              <div className="h-3 w-10 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pb-5 grid grid-cols-2 gap-2">
        <div className="h-10 bg-gray-50 rounded-lg" />
        <div className="h-10 bg-indigo-100 rounded-lg" />
      </div>
    </div>
  );
}

// ── Page skeleton ─────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: "#f7f6f3" }}>
      <div className="border-b border-stone-200 bg-white/80">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8 py-3">
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8 py-8 sm:py-12">
        <div className="flex gap-8 xl:gap-12 items-start">
          <aside className="hidden xl:block w-72 shrink-0 animate-pulse">
            <div className="rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-sm">
              <div className="h-40 bg-gradient-to-br from-indigo-100 to-sky-100" />
              <div className="p-6 space-y-3">
                <div className="h-6 w-40 bg-gray-100 rounded" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-14 bg-gray-50 rounded-xl mt-4" />
              </div>
            </div>
          </aside>
          <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CountryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { countries, visas, loading } = useContentCatalog();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  const country = countries.find((item) => item.code === code.toUpperCase());
  if (!country && !loading) notFound();
  if (!country) return <PageSkeleton />;

  // Use stored flag if it looks like an emoji, else generate from code
  const flagEmoji =
    country.flag && country.flag.length > 2
      ? country.flag
      : codeToFlag(country.code);

  const countryVisas = visas.filter(
    (v) => v.countryCode === code.toUpperCase(),
  );
  const categories = [
    "all",
    ...Array.from(new Set(countryVisas.map((v) => v.category))),
  ];
  const filtered = countryVisas.filter((visa) => {
    const matchSearch = visa.name.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      categoryFilter === "all" || visa.category === categoryFilter;
    return matchSearch && matchCat;
  });
  const minFee =
    countryVisas.length > 0 ? Math.min(...countryVisas.map((v) => v.fee)) : 0;
  const startingFee =
    minFee > 0
      ? formatCurrency(minFee, DEFAULT_CURRENCY, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : null;

  return (
    <div
      className="marketing-shell min-h-screen"
      style={{ background: "#f7f6f3", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8 py-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm"
            style={{ color: "#78716c" }}
          >
            <Link href="/" className="hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <span aria-hidden="true" className="text-stone-300">
              /
            </span>
            <Link
              href="/countries"
              className="hover:text-indigo-600 transition-colors"
            >
              Countries
            </Link>
            <span aria-hidden="true" className="text-stone-300">
              /
            </span>
            <span className="font-semibold text-stone-800" aria-current="page">
              {country.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Split layout ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8 py-8 sm:py-12">
        <div className="flex gap-8 xl:gap-10 items-start">
          {/* ══ LEFT: Sticky sidebar ════════════════════════════════════════ */}
          <aside
            className="hidden xl:flex xl:flex-col w-72 shrink-0 sticky top-[5.5rem] self-start gap-4"
            aria-label="Country info and filters"
          >
            {/* ── Identity card with gradient hero ── */}
            <div className="rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-sm">
              {/* Hero strip */}
              <div
                className="relative flex items-center justify-center h-36 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #e0e7ff 0%, #bae6fd 50%, #d1fae5 100%)",
                }}
              >
                {/* Soft bokeh blobs */}
                <div className="absolute top-2 left-4 w-20 h-20 rounded-full bg-indigo-200/50 blur-2xl" />
                <div className="absolute bottom-0 right-6 w-24 h-24 rounded-full bg-sky-200/50 blur-2xl" />
                <span
                  className="relative text-7xl leading-none select-none drop-shadow-sm"
                  aria-hidden="true"
                  style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}
                >
                  {flagEmoji}
                </span>
              </div>

              {/* Identity body */}
              <div className="px-6 pt-5 pb-6">
                <h1
                  className="text-2xl font-bold tracking-tight text-stone-900 mb-0.5"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {country.name}
                </h1>
                {country.continent && (
                  <p className="text-xs font-medium text-stone-400 mb-3 uppercase tracking-wider">
                    {country.continent}
                  </p>
                )}
                {country.description && (
                  <p className="text-sm text-stone-500 leading-relaxed mb-5">
                    {country.description}
                  </p>
                )}

                {/* Stat row */}
                <div className="flex items-center gap-3 text-sm text-stone-600 bg-stone-50 rounded-xl px-4 py-3">
                  <span className="text-base" aria-hidden="true">
                    📋
                  </span>
                  <span>
                    <strong className="text-stone-900 font-bold">
                      {countryVisas.length}
                    </strong>{" "}
                    visa type{countryVisas.length !== 1 ? "s" : ""}
                  </span>
                  {startingFee && (
                    <>
                      <span className="text-stone-300">·</span>
                      <span>
                        from{" "}
                        <strong className="text-stone-900 font-bold">
                          {startingFee}
                        </strong>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-stone-100 mx-4" />

              {/* ── Filter section (merged into same card) ── */}
              <div className="px-5 py-4">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 px-1">
                  Filter by type
                </p>
                <div
                  role="group"
                  aria-label="Filter by category"
                  className="flex flex-col gap-1"
                >
                  {categories.map((cat) => {
                    const style = cat !== "all" ? getCategoryStyle(cat) : null;
                    const isActive = categoryFilter === cat;
                    const count =
                      cat === "all"
                        ? countryVisas.length
                        : countryVisas.filter((v) => v.category === cat).length;

                    return (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        aria-pressed={isActive}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium
                          transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
                          ${
                            isActive
                              ? style
                                ? `${style.activeBg} ${style.activeText} shadow-sm`
                                : "bg-indigo-600 text-white shadow-sm"
                              : style
                                ? `${style.hoverBg} text-stone-700`
                                : "hover:bg-stone-50 text-stone-600"
                          }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {style && (
                            <span aria-hidden="true" className="text-base">
                              {style.icon}
                            </span>
                          )}
                          <span className="capitalize">
                            {cat === "all"
                              ? "All visas"
                              : (style?.label ?? cat)}
                          </span>
                        </span>
                        <span
                          className={`text-xs font-bold tabular-nums rounded-full px-1.5 py-0.5
                            ${isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"}`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Back link */}
            <Link
              href="/countries"
              className="flex items-center gap-2 text-sm text-stone-400 hover:text-indigo-600 transition-colors px-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              All countries
            </Link>
          </aside>

          {/* ══ RIGHT: Scrollable content ════════════════════════════════════ */}
          <div className="flex-1 min-w-0">
            {/* Mobile: flag + name */}
            <div className="flex items-center gap-4 mb-5 xl:hidden">
              <span
                className="text-5xl leading-none select-none"
                aria-hidden="true"
              >
                {flagEmoji}
              </span>
              <div>
                <h1
                  className="text-2xl font-bold text-stone-900"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {country.name}
                </h1>
                {country.continent && (
                  <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">
                    {country.continent}
                  </p>
                )}
              </div>
            </div>

            {/* Mobile: horizontal category scroll */}
            <div
              className="xl:hidden flex gap-2 overflow-x-auto pb-2 mb-5 -mx-5 px-5"
              role="group"
              aria-label="Filter by category"
              style={{ scrollbarWidth: "none" }}
            >
              {categories.map((cat) => {
                const style = cat !== "all" ? getCategoryStyle(cat) : null;
                const isActive = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    aria-pressed={isActive}
                    className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
                      ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300"
                      }`}
                  >
                    {style ? `${style.icon} ${style.label}` : "All visas"}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "#a8a29e" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
                placeholder="Search visa types…"
                aria-label="Search visa types"
                className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                           shadow-sm transition-all"
                style={{ color: "#292524" }}
              />
            </div>

            {/* Result count */}
            {filtered.length > 0 && (
              <p className="text-sm text-stone-500 mb-5">
                <span className="font-semibold text-stone-800">
                  {filtered.length}
                </span>{" "}
                visa type{filtered.length !== 1 ? "s" : ""}
                {categoryFilter !== "all" && (
                  <>
                    {" "}
                    in{" "}
                    <span className="font-semibold text-stone-700 capitalize">
                      {getCategoryStyle(categoryFilter).label}
                    </span>
                  </>
                )}
              </p>
            )}

            {/* ── Empty states ─────────────────────────────────────────── */}
            {filtered.length === 0 ? (
              countryVisas.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm">
                  <div
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 text-3xl"
                    aria-hidden="true"
                  >
                    🗺️
                  </div>
                  <p className="font-bold text-stone-800 mb-1">
                    No visas listed yet
                  </p>
                  <p className="text-sm text-stone-400 mb-5 max-w-xs mx-auto">
                    We haven&apos;t added visa types for {country.name} yet.
                  </p>
                  <Link
                    href="/countries"
                    className="inline-flex px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    Browse other countries
                  </Link>
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm">
                  <div
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 text-3xl"
                    aria-hidden="true"
                  >
                    🔍
                  </div>
                  <p className="font-bold text-stone-800 mb-1">
                    No visa types found
                  </p>
                  <p className="text-sm text-stone-400 mb-5 max-w-xs mx-auto">
                    Try a different search or remove the filter.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => {
                        setSearch("");
                        setCategoryFilter("all");
                      }}
                      className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      Clear filters
                    </button>
                    <Link
                      href="/countries"
                      className="px-4 py-2.5 border border-stone-200 text-stone-600 text-sm font-medium rounded-xl hover:bg-stone-50 transition-colors"
                    >
                      Browse other countries
                    </Link>
                  </div>
                </div>
              )
            ) : (
              /* ── Card grid ──────────────────────────────────────────── */
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {filtered.map((visa) => {
                  const catStyle = getCategoryStyle(visa.category);
                  const visaFee = formatCurrency(visa.fee, DEFAULT_CURRENCY, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  });

                  return (
                    <div
                      key={visa.id}
                      className={`group bg-white border border-stone-200 border-l-4 ${catStyle.cardAccent}
                        hover:border-stone-300 rounded-2xl overflow-hidden flex flex-col
                        shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
                    >
                      <div className="p-5 flex-1">
                        {/* Header row */}
                        <div className="flex items-start justify-between mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${catStyle.pillBg} ${catStyle.pillText}`}
                          >
                            <span aria-hidden="true">{catStyle.icon}</span>
                            {catStyle.label}
                          </span>
                          <div className="text-right">
                            <p className="text-xl font-black text-stone-900 leading-tight">
                              {visaFee}
                            </p>
                            <p className="text-[11px] text-stone-400">
                              total fee
                            </p>
                          </div>
                        </div>

                        {/* Visa name */}
                        <h3
                          className="font-semibold text-stone-900 text-base mb-4 leading-snug"
                          style={{ fontFamily: "'Instrument Serif', serif" }}
                        >
                          {visa.name}
                        </h3>

                        {/* Stats grid */}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Processing", value: visa.processingTime },
                            { label: "Validity", value: visa.validity },
                            { label: "Stay", value: visa.stayDuration },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="bg-stone-50 rounded-xl p-2.5"
                            >
                              <p className="text-xs text-stone-400 mb-0.5">
                                {item.label}
                              </p>
                              <p className="text-xs font-semibold text-stone-800 leading-tight">
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                        <Link
                          href={`/visa/${visa.id}`}
                          className="text-center py-2.5 rounded-lg text-stone-500 text-sm font-medium
                                     hover:text-indigo-600 hover:bg-indigo-50 transition-colors
                                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                        >
                          Details
                        </Link>
                        <Link
                          href={`/apply/${visa.id}`}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg
                                     bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold
                                     shadow-sm transition-colors
                                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
                        >
                          Apply
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
