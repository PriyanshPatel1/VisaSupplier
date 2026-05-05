"use client";

import { useState } from "react";
import { useSiteContent } from "@/hooks/use-site-content";

export default function FAQ() {
  const { content } = useSiteContent();
  const faq = content?.faq;
  const [open, setOpen] = useState<number | null>(0);

  if (!faq || faq.items.length === 0) return null;

  return (
    <section className="relative py-24 sm:py-32 bg-white border-t border-gray-100 overflow-hidden">
      {/* Decorative background blob */}
      <div className="pointer-events-none absolute -top-32 right-0 w-[600px] h-[600px] rounded-full bg-indigo-50/70 blur-3xl opacity-60" />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-16 lg:gap-24 items-start">
          {/* LEFT — sticky label */}
          <div className="lg:sticky lg:top-28 animate-fade-up">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-5">
              <span className="w-5 h-px bg-indigo-400" />
              {faq.eyebrow}
            </span>

            <h2 className="text-4xl sm:text-[2.75rem] font-extrabold text-gray-950 leading-[1.1] tracking-tight mb-5">
              {faq.title}
            </h2>

            <p className="text-gray-400 text-[0.9375rem] leading-relaxed max-w-xs mb-8">
              {faq.description}
            </p>

            <a
              href="/user/support"
              className="group inline-flex items-center gap-3 text-sm font-semibold text-gray-900 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 px-5 py-3 rounded-xl transition-all duration-200"
            >
              {faq.ctaLabel}
              <svg
                className="w-4 h-4 text-indigo-500 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>

          {/* RIGHT — accordion */}
          <div className="space-y-2 animate-fade-up stagger-1">
            {faq.items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={item.question}
                  className={`rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? "border-indigo-200/80 bg-indigo-50/40 shadow-sm"
                      : "border-gray-100 bg-gray-50/60 hover:bg-white hover:border-gray-200 hover:shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full text-left flex items-center justify-between px-6 py-5 gap-4"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`text-[0.9375rem] font-semibold leading-snug transition-colors duration-150 ${
                        isOpen ? "text-indigo-700" : "text-gray-800"
                      }`}
                    >
                      {item.question}
                    </span>

                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isOpen
                          ? "bg-indigo-600 text-white rotate-45"
                          : "bg-white border border-gray-200 text-gray-400"
                      }`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 pb-6 pt-1 text-[0.9rem] text-gray-500 leading-relaxed border-t border-indigo-100/60">
                      <div className="pt-4">{item.answer}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
