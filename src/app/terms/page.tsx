import Link from "next/link";
import Footer from "@/components/layout/footer";

export default function TermsPage() {
  const sections = [
    {
      num: "01",
      title: "Acceptance of Terms",
      body: "By accessing or using VisaHub, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.",
    },
    {
      num: "02",
      title: "Description of Service",
      body: "VisaHub is a visa application management platform that connects applicants with licensed visa processing suppliers. We facilitate the application process but do not guarantee visa approval — final decisions rest solely with the relevant government authorities.",
    },
    {
      num: "03",
      title: "User Responsibilities",
      body: "You are responsible for providing accurate and truthful information in your visa applications. Submitting false information may result in permanent ineligibility and is a violation of these Terms.",
    },
    {
      num: "04",
      title: "Payments & Refunds",
      body: "Government visa fees are non-refundable under any circumstances. Service fees charged by VisaHub and its supplier partners are subject to each supplier's individual refund policy, which will be disclosed before payment.",
    },
    {
      num: "05",
      title: "Privacy",
      body: "We collect and process personal information as described in our Privacy Policy. By using VisaHub, you consent to this processing. Your data is never sold to third parties.",
    },
    {
      num: "06",
      title: "Limitation of Liability",
      body: "VisaHub is not liable for visa rejections, delays caused by government processing, or losses arising from inaccurate information provided by applicants. Our maximum liability is limited to fees paid to VisaHub directly.",
    },
  ];

  return (
    <div className="marketing-shell min-h-screen text-slate-900">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-500">
            <span className="h-px w-4 bg-indigo-400" />
            Legal
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Last updated: January 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <div className="space-y-0 divide-y divide-slate-100">
          {sections.map((s) => (
            <div
              key={s.num}
              className="group grid grid-cols-[2.5rem_1fr] gap-6 py-8 sm:gap-10"
            >
              {/* Number */}
              <span className="mt-0.5 text-[11px] font-black tabular-nums text-indigo-300/70 group-hover:text-indigo-400 transition-colors">
                {s.num}
              </span>
              {/* Body */}
              <div>
                <h2 className="mb-2.5 text-base font-bold text-slate-900">
                  {s.title}
                </h2>
                <p className="text-[0.9375rem] leading-relaxed text-slate-500">
                  {s.body}
                </p>
              </div>
            </div>
          ))}

          {/* Contact — inline, no array */}
          <div className="group grid grid-cols-[2.5rem_1fr] gap-6 py-8 sm:gap-10">
            <span className="mt-0.5 text-[11px] font-black tabular-nums text-indigo-300/70 group-hover:text-indigo-400 transition-colors">
              07
            </span>
            <div>
              <h2 className="mb-2.5 text-base font-bold text-slate-900">
                Contact
              </h2>
              <p className="text-[0.9375rem] leading-relaxed text-slate-500">
                Questions about these Terms? Reach us at{" "}
                <a
                  href="mailto:legal@visahub.com"
                  className="font-semibold text-indigo-600 underline-offset-2 hover:underline"
                >
                  legal@visahub.com
                </a>{" "}
                or visit our{" "}
                <Link
                  href="/user/support"
                  className="font-semibold text-indigo-600 underline-offset-2 hover:underline"
                >
                  Support page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Bottom nav strip */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
          <p className="text-xs text-slate-400">
            These terms apply to all VisaHub users. Subject to change with
            notice.
          </p>
          <Link
            href="/privacy"
            className="text-xs font-bold text-indigo-600 hover:underline underline-offset-2"
          >
            Privacy Policy →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
