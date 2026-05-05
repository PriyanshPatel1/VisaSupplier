"use client";

import { useSiteContent } from "@/hooks/use-site-content";

const ICON_MAP: Record<string, string> = {
  Docs: "D",
  Globe: "G",
  Check: "C",
  Bolt: "F",
};

export default function Stats() {
  const { content } = useSiteContent();
  const items = content?.stats.items ?? [];

  if (items.length === 0) return null;

  return (
    <section className="bg-indigo-600 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {items.map((s, i) => (
          <div
            key={s.label}
            className={`text-center animate-fade-up stagger-${Math.min(i + 1, 4)}`}
          >
            <div className="text-3xl mb-2">{ICON_MAP[s.icon] ?? s.icon}</div>
            <p
              className="text-3xl sm:text-4xl font-black text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {s.value}
            </p>
            <p className="text-sm font-semibold text-indigo-200 mt-1">
              {s.label}
            </p>
            <p className="text-xs text-indigo-300/70 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
