"use client";

import { useSiteContent } from "@/hooks/use-site-content";

export default function Testimonials() {
  const { content } = useSiteContent();
  const testimonials = content?.testimonials;

  if (!testimonials || testimonials.items.length === 0) return null;

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14 animate-fade-up">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-2">{testimonials.eyebrow}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            {testimonials.title}
          </h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-md mx-auto">
            {testimonials.description}
          </p>
        </div>

        <div className="flex justify-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-100 px-5 py-3 rounded-2xl">
            <div className="flex gap-0.5">
              {Array(5).fill(0).map((_, i) => (
                <svg key={i} className="w-4.5 h-4.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="text-sm font-bold text-amber-800">{testimonials.summaryRating}</span>
            <span className="text-sm text-amber-600">{testimonials.summaryLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {testimonials.items.map((t, i) => (
            <div
              key={t.name}
              className={`relative bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 card-hover animate-fade-up stagger-${i + 1}`}
            >
              <div className="absolute top-6 right-6 text-gray-100">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>

              <div className="flex gap-0.5 mb-4">
                {Array(t.rating).fill(0).map((_, index) => (
                  <svg key={index} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${t.avatarColor} rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
                  <p className="text-xs text-indigo-500 font-medium mt-0.5">{t.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
