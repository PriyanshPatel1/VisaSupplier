"use client";

import { useSiteContent } from "@/hooks/use-site-content";

const ICON_MAP: Record<string, string> = {
  Fast: "F",
  Track: "T",
  Safe: "S",
  Team: "P",
  Clear: "C",
  World: "W",
};

export default function Features() {
  const { content } = useSiteContent();
  const features = content?.features;

  if (!features || features.items.length === 0) return null;

  return (
    <section className="bg-gray-50/60 py-20 sm:py-28 border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14 animate-fade-up">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-2">
            {features.eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            {features.title}
          </h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
            {features.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.items.map((f, i) => (
            <div
              key={f.title}
              className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 card-hover animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 5) * 100}ms` }}
            >
              <div
                className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform duration-200`}
              >
                {ICON_MAP[f.icon] ?? f.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5 text-base">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
