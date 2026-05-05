"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useContentCatalog } from "@/hooks/use-content-catalog";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import Footer from "@/components/layout/footer";

type Tab = "overview" | "requirements" | "guide" | "fees";

const TAB_META: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "requirements", label: "Requirements" },
  { id: "guide", label: "Step-by-step" },
  { id: "fees", label: "Fees & Time" },
];

const CATEGORY_STYLE: Record<string, { badge: string; card: string }> = {
  tourist: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", card: "from-emerald-500 to-teal-500" },
  student: { badge: "bg-sky-50 text-sky-700 border-sky-200", card: "from-sky-500 to-indigo-500" },
  work: { badge: "bg-amber-50 text-amber-700 border-amber-200", card: "from-amber-500 to-orange-500" },
  business: { badge: "bg-violet-50 text-violet-700 border-violet-200", card: "from-violet-500 to-purple-500" },
};

const DEFAULT_GUIDE = [
  "Prepare your passport and personal details",
  "Complete the application form carefully",
  "Upload required documents",
  "Submit and track your application status",
  "Attend interview if requested by embassy",
];

const GUIDE_BY_CATEGORY: Record<string, string[]> = {
  tourist: [
    "Confirm your travel dates and itinerary",
    "Complete the visitor application form",
    "Prepare financial and accommodation proof",
    "Submit documents and biometrics",
    "Track processing and receive your visa",
  ],
  student: [
    "Get your institution admission documents",
    "Pay required student fees (if applicable)",
    "Fill out the student visa form",
    "Prepare academic and financial records",
    "Attend visa interview and wait for decision",
  ],
  work: [
    "Confirm employer sponsorship details",
    "Complete the work visa application",
    "Upload employment and qualification records",
    "Attend biometrics/interview if needed",
    "Receive visa and plan relocation",
  ],
  business: [
    "Collect business invitation/support letters",
    "Complete the business visa form",
    "Provide travel and company documents",
    "Submit application and attend interview if required",
    "Receive approval and schedule travel",
  ],
};

function sentenceCase(value: string) {
  if (!value) return "Visa";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function VisaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { visas, countries, loading } = useContentCatalog();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const visa = visas.find((item) => item.id === id);
  if (!visa && !loading) notFound();
  if (!visa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
      </div>
    );
  }

  const country = countries.find((item) => item.code === visa.countryCode);
  const docs = Array.isArray(visa.documentsRequired) ? visa.documentsRequired : [];
  const style = CATEGORY_STYLE[visa.category] ?? {
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    card: "from-gray-500 to-slate-500",
  };
  const guideSteps = GUIDE_BY_CATEGORY[visa.category] ?? DEFAULT_GUIDE;
  const visaFee = formatCurrency(visa.fee, DEFAULT_CURRENCY, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className="marketing-shell min-h-screen text-gray-900">
      <section className="relative bg-gradient-to-b from-indigo-50/60 to-white border-b border-gray-100 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="relative mx-auto max-w-[88rem] px-5 sm:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-7 flex-wrap">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/countries" className="hover:text-indigo-600 transition-colors">Countries</Link>
            <span>/</span>
            <Link href={`/country/${visa.countryCode}`} className="hover:text-indigo-600 transition-colors">
              {country?.flag} {country?.name ?? visa.countryCode}
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-semibold">{visa.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            <div className="flex-1 min-w-0">
              <div className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full mb-5 border ${style.badge}`}>
                {sentenceCase(visa.category)} Visa
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3 leading-tight">
                {visa.name}
              </h1>
              <p className="text-gray-500 mb-5 flex items-center gap-2">
                <span className="text-xl">{country?.flag ?? "🌍"}</span>
                {country?.name ?? visa.countryCode}
              </p>

              {visa.description ? (
                <p className="text-gray-600 text-base leading-relaxed max-w-xl mb-8">{visa.description}</p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Processing", value: visa.processingTime },
                  { label: "Validity", value: visa.validity },
                  { label: "Max stay", value: visa.stayDuration },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{item.label}</p>
                      <p className="text-xs font-bold text-gray-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg shadow-gray-100 sticky top-24">
                <div className={`h-1.5 rounded-full bg-gradient-to-r ${style.card} mb-5`} />
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-gray-900">{visaFee}</span>
                  <span className="text-sm text-gray-400 mb-1">USD</span>
                </div>
                <p className="text-xs text-gray-400 mb-5">Government + service fee</p>

                <Link
                  href={`/apply/${visa.id}`}
                  className="block w-full text-center py-3.5 shimmer-btn text-white font-bold rounded-xl text-sm mb-3 shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-shadow"
                >
                  Apply Now
                </Link>
                <Link
                  href={`/country/${visa.countryCode}`}
                  className="block w-full text-center py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  All {country?.name ?? visa.countryCode} visas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[5.25rem] z-30 bg-white border-b border-gray-200 shadow-sm shadow-gray-50">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <div className="flex gap-0 overflow-x-auto no-scrollbar">
            {TAB_META.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="max-w-4xl">
              {activeTab === "overview" ? (
                <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <h2 className="text-2xl font-bold text-gray-900">About this visa</h2>
                  <p className="text-gray-600 leading-relaxed text-base">
                    {visa.description || "This visa allows temporary travel based on your purpose and eligibility."}
                  </p>
                </div>
              ) : null}

              {activeTab === "requirements" ? (
                <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <h2 className="text-2xl font-bold text-gray-900">Required documents</h2>
                  {docs.length === 0 ? (
                    <p className="text-sm text-gray-500">Document checklist will be shown by your supplier after you start the application.</p>
                  ) : (
                    <div className="space-y-3">
                      {docs.map((doc, index) => (
                        <div key={`${doc}-${index}`} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">{index + 1}</span>
                          <span className="text-gray-700 text-sm">{doc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {activeTab === "guide" ? (
                <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <h2 className="text-2xl font-bold text-gray-900">Step-by-step guide</h2>
                  <div className="space-y-3">
                    {guideSteps.map((step, index) => (
                      <div key={`${step}-${index}`} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">{index + 1}</span>
                        <span className="text-gray-700 text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeTab === "fees" ? (
                <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <h2 className="text-2xl font-bold text-gray-900">Fees & timeline</h2>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex justify-between"><span>Visa fee</span><strong className="text-gray-900">{visaFee}</strong></p>
                      <p className="flex justify-between"><span>Processing time</span><strong className="text-gray-900">{visa.processingTime}</strong></p>
                      <p className="flex justify-between"><span>Validity</span><strong className="text-gray-900">{visa.validity}</strong></p>
                      <p className="flex justify-between"><span>Maximum stay</span><strong className="text-gray-900">{visa.stayDuration}</strong></p>
                    </div>
                    <Link
                      href={`/apply/${visa.id}`}
                      className="mt-5 inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      Start application
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="space-y-4 xl:sticky xl:top-[9.75rem]">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Visa snapshot</p>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Category", value: sentenceCase(visa.category) },
                    { label: "Fee", value: visaFee },
                    { label: "Processing", value: visa.processingTime },
                    { label: "Validity", value: visa.validity },
                    { label: "Max stay", value: visa.stayDuration },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Ready to continue</p>
                <h3 className="mt-3 text-2xl font-bold text-slate-950">Start with the right documents in hand.</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Review the requirements first, then move straight into the application flow when you are ready.
                </p>
                <Link
                  href={`/apply/${visa.id}`}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Begin application
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
