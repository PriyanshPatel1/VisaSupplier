"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useContentCatalog } from "@/hooks/use-content-catalog";
import { useSiteContent } from "@/hooks/use-site-content";

export default function Hero() {
  const router = useRouter();
  const { countries } = useContentCatalog();
  const { content } = useSiteContent();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const hero = content?.hero;
  const suggestions = query.length > 1
    ? countries.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const match = countries.find((c) => c.name.toLowerCase() === query.toLowerCase());
    if (match) router.push(`/country/${match.code}`);
    else router.push(`/countries?q=${encodeURIComponent(query)}`);
  };

  const popularCountries = countries.filter((c) => hero?.popularCodes.includes(c.code));

  return (
    <section className="relative hero-mesh overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-[400px] h-[400px] rounded-full bg-violet-100/30 blur-3xl" />
        <div className="absolute -bottom-16 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-50/60 blur-2xl" />
        <div className="animate-float absolute top-20 right-[12%] w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 opacity-20 blur-sm" style={{ animationDelay: "0s" }} />
        <div className="animate-float absolute top-48 left-[8%] w-8 h-8 rounded-full bg-gradient-to-br from-indigo-300 to-blue-400 opacity-25 blur-sm" style={{ animationDelay: "1.4s" }} />
        <div className="animate-float absolute bottom-24 right-[20%] w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 opacity-20 blur-sm" style={{ animationDelay: "2.8s" }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-5 sm:px-8 pt-20 pb-20 sm:pt-28 sm:pb-28">
        {hero ? (
          <div className="flex justify-center mb-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 shadow-sm shadow-indigo-50 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {hero.trustedLabel}
              {hero.trustedNote ? <span className="text-indigo-300">•</span> : null}
              {hero.trustedNote ? <span className="text-gray-400 font-normal">{hero.trustedNote}</span> : null}
            </div>
          </div>
        ) : null}

        <div className="text-center animate-fade-up stagger-1">
          <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold text-gray-900 leading-[1.12] tracking-tight mb-5">
            {hero?.titlePrefix ?? ""}
            {" "}
            <span className="relative inline-block">
              <span className="gradient-text">{hero?.titleHighlight ?? ""}</span>
              <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none">
                <path d="M0 5 Q50 0 100 3 Q150 6 200 2" stroke="url(#heroUnderline)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <defs>
                  <linearGradient id="heroUnderline" x1="0" y1="0" x2="200" y2="0">
                    <stop offset="0%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#a78bfa"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed mb-10">
            {hero?.description ?? ""}
          </p>
        </div>

        <div className="max-w-2xl mx-auto relative animate-fade-up stagger-2">
          <form onSubmit={handleSearch}>
            <div className={`flex items-center bg-white rounded-2xl transition-all overflow-visible shadow-xl ${
              focused
                ? "ring-2 ring-indigo-500 ring-offset-0 shadow-indigo-100"
                : "shadow-gray-200/80 hover:shadow-gray-300/60"
            }`}>
              <div className="pl-5 text-indigo-400 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 160)}
                placeholder={hero?.searchPlaceholder ?? ""}
                className="flex-1 px-4 py-4 sm:py-4.5 text-gray-900 placeholder-gray-400 text-sm sm:text-base outline-none bg-transparent min-w-0"
              />
              <button
                type="submit"
                className="m-2 px-6 py-3 shimmer-btn text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 hover:shadow-indigo-300 flex-shrink-0 transition-shadow"
              >
                {hero?.searchButtonLabel ?? "Search"}
              </button>
            </div>
          </form>

          {focused && suggestions.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-200/60 animate-fade-in">
              {suggestions.map((c) => (
                <button
                  key={c.code}
                  onMouseDown={() => { router.push(`/country/${c.code}`); setQuery(""); }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-indigo-50 text-left transition-colors group"
                >
                  <span className="text-2xl">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.continent}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {hero ? (
          <div className="mt-6 flex flex-wrap justify-center items-center gap-2 animate-fade-up stagger-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{hero.popularLabel}</span>
            {popularCountries.map((c) => (
              <Link
                key={c.code}
                href={`/country/${c.code}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 text-sm font-medium rounded-full shadow-sm transition-all"
              >
                <span className="text-base leading-none">{c.flag}</span>
                {c.name}
              </Link>
            ))}
          </div>
        ) : null}

        {hero?.stats?.length ? (
          <div className="mt-14 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto animate-fade-up stagger-4">
            {hero.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
