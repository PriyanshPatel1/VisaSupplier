"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { applicationsApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/currency";
import type { ApplicationTrackingEvent, StoredApplication } from "@/lib/store";
import { getFlag } from "@/lib/flags";
import { useToast } from "@/components/dashboard/toast";

/* ─── helpers ─────────────────────────────────────────────────── */

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Convert raw DB keys → human-readable labels */
function formatFieldLabel(key: string): string {
  const map: Record<string, string> = {
    surname: "Surname",
    givenname: "Given Name",
    givennames: "Given Names",
    firstname: "First Name",
    lastname: "Last Name",
    sex: "Sex",
    gender: "Gender",
    maritalstatus: "Marital Status",
    dob: "Date of Birth",
    dateofbirth: "Date of Birth",
    cityofbirth: "City of Birth",
    placeofbirth: "Place of Birth",
    countryofbirth: "Country of Birth",
    nationality: "Nationality",
    passportnumber: "Passport Number",
    passportexpiry: "Passport Expiry",
    email: "Email",
    phone: "Phone",
    address: "Address",
    occupation: "Occupation",
    employer: "Employer",
  };
  const normalised = key.toLowerCase().replace(/[_\s-]/g, "");
  if (map[normalised]) return map[normalised];
  // Fallback: split on camelCase / underscores, title-case each word
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/* ─── tone helpers ─────────────────────────────────────────────── */

type Tone = "info" | "active" | "success" | "warning";

function badgeClasses(tone?: Tone) {
  switch (tone) {
    case "success":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "warning":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "active":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    default:
      return "bg-sky-50 text-sky-700 ring-sky-200";
  }
}

function timelineDotClasses(tone?: Tone) {
  switch (tone) {
    case "success":
      return "bg-emerald-500 ring-emerald-100";
    case "warning":
      return "bg-amber-500 ring-amber-100";
    case "active":
      return "bg-blue-500 ring-blue-100";
    default:
      return "bg-slate-400 ring-slate-100";
  }
}

/* ─── fallback ─────────────────────────────────────────────────── */

function fallbackTimeline(app: StoredApplication): ApplicationTrackingEvent[] {
  return [
    {
      id: `${app.id}-fallback`,
      title: "Application Submitted",
      detail: "Your application was submitted successfully.",
      at: app.submittedAt,
      tone: "info",
      actor: "system",
    },
  ];
}

/* ─── sub-components ───────────────────────────────────────────── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-slate-400">
      {children}
    </h2>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── page ─────────────────────────────────────────────────────── */

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [app, setApp] = useState<StoredApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let mounted = true;
    applicationsApi
      .get(id)
      .then((item) => {
        if (!mounted) return;
        setApp((item as StoredApplication) ?? null);
      })
      .catch(() => {
        if (!mounted) return;
        router.push("/user/applications");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id, router]);

  const timeline = useMemo(() => {
    if (!app) return [];
    return (app.timeline ?? fallbackTimeline(app))
      .slice()
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }, [app]);

  const handleCancel = async () => {
    if (!app?.canCancel) return;
    setCancelling(true);
    try {
      await applicationsApi.cancel(app.id);
      showToast("Application cancelled successfully.", "success");
      router.push("/user/applications");
    } catch (error: unknown) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to cancel application.",
        "error",
      );
    } finally {
      setCancelling(false);
    }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
      </div>
    );
  }

  /* ── not found ── */
  if (!app) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-500">Application not found.</p>
        <Link
          href="/user/applications"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Back to applications
        </Link>
      </div>
    );
  }

  const progress = app.tracking?.progress ?? 25;
  const statusLabel = app.tracking?.label ?? app.status;
  const personalEntries = (
    Object.entries(app.personal ?? {}).filter(([, v]) => Boolean(v)) as Array<
      [string, string]
    >
  ).slice(0, 8);

  // Collect custom section entries from `other` (admin-built forms).
  const customSectionEntries: Array<{ title: string; entries: Array<[string, string]> }> =
    app.other
      ? Object.entries(app.other)
          .filter(([key]) => key !== "_raw")
          .map(([title, data]) => ({
            title,
            entries: typeof data === "object" && data !== null
              ? (Object.entries(data as Record<string, unknown>)
                  .filter(([, v]) => Boolean(v))
                  .map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]) as Array<[string, string]>)
              : [],
          }))
          .filter((s) => s.entries.length > 0)
      : [];

  const refNumber = app.referenceNumber ?? app.id.slice(-8).toUpperCase();
  const eta = app.estimatedDecision ? formatDate(app.estimatedDecision) : null;

  return (
    <div className="space-y-5">
      {/* ── breadcrumb + cancel ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/user/applications"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M12 5l-5 5 5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to applications
        </Link>

        {app.canCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
          >
            {cancelling ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-red-300 border-t-red-600" />
                Cancelling…
              </>
            ) : (
              "Cancel Application"
            )}
          </button>
        )}
      </div>

      {/* ── hero card ── */}
      <Card className="overflow-hidden">
        {/* top accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            {/* left – visa identity */}
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-3xl leading-none">
                {getFlag(app.countryCode)}
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {app.visaName}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  {app.countryName}
                </p>
                <span
                  className={`mt-2.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${badgeClasses(app.tracking?.tone)}`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* right – amounts & refs */}
            <div className="text-right">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                {formatCurrency(app.totalPaid)}
              </p>
              <p className="mt-1 text-xs text-slate-400">Total paid</p>
              <p className="mt-2 text-xs text-slate-500">
                Ref&nbsp;
                <span className="font-mono font-semibold text-slate-700">
                  #{refNumber}
                </span>
              </p>
              {eta && (
                <p className="mt-1 text-xs text-slate-500">
                  Est. decision&nbsp;
                  <span className="font-semibold text-slate-700">{eta}</span>
                </p>
              )}
            </div>
          </div>

          {/* progress bar */}
          <div className="mt-6">
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
              <span>Overall progress</span>
              <span className="font-semibold text-slate-700">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── action required banner ── */}
      {app.tracking?.actionRequired && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <p>
            <span className="font-semibold">Action required —</span> The
            supplier has requested updates or additional documents.
          </p>
        </div>
      )}

      {/* ── main grid ── */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* ── left column – timeline + submitted info ── */}
        <div className="space-y-5 lg:col-span-8">
          <Card className="p-6">
            <SectionHeading>Tracking Timeline</SectionHeading>

            <ol className="relative space-y-0">
              {timeline.map((event, index) => {
                const isLast = index === timeline.length - 1;
                return (
                  <li key={event.id} className="flex gap-4">
                    {/* dot + connector */}
                    <div className="flex flex-col items-center">
                      <span
                        className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-4 text-white text-xs font-bold ${timelineDotClasses(event.tone)}`}
                      >
                        {index + 1}
                      </span>
                      {!isLast && (
                        <div
                          className="mt-1 w-px flex-1 bg-slate-100"
                          style={{ minHeight: "2rem" }}
                        />
                      )}
                    </div>

                    {/* content */}
                    <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                      <p className="text-sm font-semibold text-slate-800">
                        {event.title}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {event.detail}
                      </p>
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        {formatDateTime(event.at)}
                        <span className="mx-1.5 text-slate-300">·</span>
                        <span className="font-medium uppercase tracking-wide">
                          {event.actor === "supplier" ? "Supplier" : "System"}
                        </span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* submitted info */}
            {(personalEntries.length > 0 || customSectionEntries.length > 0) && (
              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Submitted Information
                </h3>
                {/* Standard personal fields */}
                {personalEntries.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 mb-4">
                    {personalEntries.map(([key, value]) => (
                      <div key={key}>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          {formatFieldLabel(key)}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-slate-700">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {/* Custom admin-form sections */}
                {customSectionEntries.map(({ title, entries }) => (
                  <div key={title} className="mt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                      {title}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {entries.map(([key, value]) => (
                        <div key={key}>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                            {formatFieldLabel(key)}
                          </p>
                          <p className="mt-0.5 text-sm font-medium text-slate-700">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── right column – sidebar ── */}
        <aside className="space-y-4 lg:col-span-4">
          {/* supplier */}
          <Card className="p-5">
            <SectionHeading>Supplier</SectionHeading>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                {app.supplierName?.charAt(0) ?? "S"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {app.supplierName}
                </p>
                <p className="text-xs text-slate-400">
                  Ref: {app.referenceNumber ?? "Pending"}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Last update:{" "}
              <span className="font-medium text-slate-600">
                {formatDate(app.tracking?.lastEventAt ?? app.updatedAt)}
              </span>
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href="/user/support"
                className="flex items-center justify-center gap-1.5 rounded-lg  px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400 bg-indigo-500"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M3.505 2.365A41.369 41.369 0 019 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 00-.577-.069 43.141 43.141 0 00-4.706 0C9.229 4.696 7.5 6.727 7.5 8.998v2.24c0 1.413.67 2.735 1.76 3.562l-2.97 2.971A.75.75 0 015 17v-2.136c-.806-.57-1.376-1.434-1.495-2.43A41.65 41.65 0 013 9V5.88a3.126 3.126 0 01.505-1.515z" />
                  <path d="M14 6c-.762 0-1.52.02-2.271.062C10.157 6.148 9 7.472 9 8.998v2.24c0 1.519 1.147 2.839 2.71 2.935.214.013.428.024.642.034.2.009.385.09.518.224l2.35 2.35a.75.75 0 001.28-.531v-2.07c1.453-.195 2.5-1.32 2.5-2.644V8.998c0-1.526-1.157-2.85-2.729-2.936A41.645 41.645 0 0014 6z" />
                </svg>
                Message
              </Link>
              <a
                href="tel:+1-800-555-0100"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z"
                    clipRule="evenodd"
                  />
                </svg>
                Call
              </a>
            </div>
          </Card>

          {/* payment */}
          <Card className="p-5">
            <SectionHeading>Payment</SectionHeading>
            <dl className="space-y-2.5">
              {[
                { label: "Visa Fee", value: formatCurrency(app.totalPaid) },
                { label: "Submitted", value: formatDate(app.submittedAt) },
                { label: "Last Updated", value: formatDate(app.updatedAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="text-xs font-semibold text-slate-800">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* quick links */}
          <Card className="p-5">
            <SectionHeading>Quick Links</SectionHeading>
            <nav className="space-y-1">
              {[
                {
                  href: "/user/documents",
                  label: "Documents",
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  ),
                },
                {
                  href: "/user/notifications",
                  label: "Notifications",
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                  ),
                },
                {
                  href: "/user/billing",
                  label: "Billing",
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                    />
                  ),
                },
              ].map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4 flex-shrink-0 text-slate-400 group-hover:text-slate-600"
                    aria-hidden="true"
                  >
                    {icon}
                  </svg>
                  {label}
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="ml-auto h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              ))}
            </nav>
          </Card>
        </aside>
      </div>
    </div>
  );
}
