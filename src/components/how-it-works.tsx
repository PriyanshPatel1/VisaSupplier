import Link from "next/link";

const STEPS = [
  {
    step: "01",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    title: "Choose destination",
    desc: "Browse 150+ countries and select the visa type that fits your travel purpose.",
    cta: "Browse countries",
    href: "/countries",
    color: "text-indigo-600",
    iconBg: "bg-indigo-100",
  },
  {
    step: "02",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    title: "Fill the form",
    desc: "Our smart wizard guides you step by step. Upload documents securely in minutes.",
    cta: null,
    href: null,
    color: "text-violet-600",
    iconBg: "bg-violet-100",
  },
  {
    step: "03",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    title: "Experts review it",
    desc: "Our specialists review your file and submit it on your behalf. Zero stress.",
    cta: null,
    href: null,
    color: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    step: "04",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Visa approved",
    desc: "Get notified the moment your visa is approved and ready to download.",
    cta: "Start applying",
    href: "/countries",
    color: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-white py-20 sm:py-28 relative overflow-hidden"
    >
      <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14 animate-fade-up">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-2">
            Simple process
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            From search to approval
          </h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-md mx-auto">
            Four straightforward steps. No paperwork headaches.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-4">
          {STEPS.map((s, i) => (
            <div
              key={s.step}
              className="relative animate-fade-up"
              // ✅ inline style — dynamic delays never purged
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* ✅ Arrow: anchored to right edge, centered in gap-4 (16px) */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden lg:flex absolute top-9 -right-3 translate-x-full items-center z-10"
                  aria-hidden="true"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-gray-300"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 h-full group">
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl ${s.iconBg} ${s.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
                  >
                    {s.icon}
                  </div>
                  <span
                    className="text-3xl font-black text-gray-100 select-none"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {s.step}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 mb-2 text-base">
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {s.desc}
                </p>

                {s.cta && s.href && (
                  <Link
                    href={s.href}
                    className={`inline-flex items-center gap-1 mt-4 text-sm font-semibold ${s.color} hover:underline transition-colors`}
                  >
                    {s.cta}
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
