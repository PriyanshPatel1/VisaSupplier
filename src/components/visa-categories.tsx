"use client";

import Link from "next/link";
import { useSiteContent } from "@/hooks/use-site-content";

const ICON_MAP: Record<string, string> = {
  Tour: "T",
  Work: "W",
  Study: "S",
  Biz: "B",
};

export default function VisaCategories() {
  const { content } = useSiteContent();
  const section = content?.visaCategories;

  if (!section || section.items.length === 0) return null;

  return (
    <section
      id="visa-types"
      className="relative bg-gray-50/70 py-16 sm:py-20 border-y border-gray-100"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-10 animate-fade-up">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-2">
            {section.eyebrow}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {section.title}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {section.items.map((cat, i) => (
            <Link
              key={cat.label}
              href={`/countries?category=${cat.query}`}
              className={`group relative flex flex-col items-center text-center p-6 rounded-2xl border card-hover transition-all animate-fade-up stagger-${i + 1} ${cat.bg}`}
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}
              >
                {ICON_MAP[cat.icon] ?? cat.icon}
              </div>
              <p className={`font-bold text-sm ${cat.text}`}>{cat.label}</p>
              <p className="text-xs text-gray-400 mt-1 leading-snug">
                {cat.desc}
              </p>
              <div className="absolute bottom-4 right-4 w-5 h-5 rounded-full bg-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  className="w-3 h-3 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
