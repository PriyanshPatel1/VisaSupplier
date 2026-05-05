"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { applicationsApi, notificationsApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/currency";
import type { StoredApplication, StoredNotification } from "@/lib/store";
import { getFlag } from "@/lib/flags";
import { useAuth } from "@/providers/auth-provider";
import { timeAgo } from "@/lib/ui";

type AppStatus =
  | "submitted"
  | "processing"
  | "approved"
  | "rejected"
  | "cancelled"
  | "draft";

const STATUS_CONFIG: Record<
  AppStatus,
  {
    label: string;
    tone: string;
    badge: string;
    rail: string;
  }
> = {
  draft: {
    label: "Draft",
    tone: "text-slate-500",
    badge: "bg-slate-100 text-slate-700",
    rail: "bg-slate-300",
  },
  submitted: {
    label: "Submitted",
    tone: "text-sky-600",
    badge: "bg-sky-50 text-sky-700",
    rail: "bg-sky-500",
  },
  processing: {
    label: "Processing",
    tone: "text-amber-600",
    badge: "bg-amber-50 text-amber-700",
    rail: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    tone: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700",
    rail: "bg-emerald-500",
  },
  rejected: {
    label: "Needs Docs",
    tone: "text-rose-600",
    badge: "bg-rose-50 text-rose-700",
    rail: "bg-rose-500",
  },
  cancelled: {
    label: "Cancelled",
    tone: "text-slate-500",
    badge: "bg-slate-100 text-slate-700",
    rail: "bg-slate-400",
  },
};

const JOURNEY_STEPS = ["Applied", "Submitted", "Processing", "Decision"];

// timeAgo imported from @/lib/ui

function shellCard() {
  return "rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]";
}

function JourneyStepRail({ status }: { status: AppStatus }) {
  const step =
    status === "draft"
      ? 0
      : status === "submitted"
        ? 1
        : status === "processing" || status === "rejected"
          ? 2
          : 3;
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="flex items-center">
      {JOURNEY_STEPS.map((label, index) => {
        const active = index <= step;
        const current = index === step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold ${
                  active
                    ? "border-transparent text-white"
                    : "border-slate-300 text-slate-400 bg-white"
                }`}
                style={active && !current ? { background: "#22c55e" } : active && current ? {} : {}}
                aria-label={active ? (current ? `Current: ${label}` : `Completed: ${label}`) : `Pending: ${label}`}
              >
                {active ? (
                  current ? (
                    <span className={cfg.badge}>{index + 1}</span>
                  ) : (
                    // Checkmark shape for completed — not color alone
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`hidden text-[10px] font-semibold sm:block ${active ? cfg.tone : "text-slate-400"}`}
              >
                {label}
              </span>
            </div>
            {index < JOURNEY_STEPS.length - 1 ? (
              <div
                className={`mb-4 h-[2px] w-8 sm:w-12 ${index < step ? cfg.rail : "bg-slate-200"}`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ActiveApplicationCard({ app }: { app: StoredApplication }) {
  const status = (app.status as AppStatus) ?? "submitted";
  const cfg = STATUS_CONFIG[status];

  return (
    <Link
      href={`/user/applications/${app.id}`}
      className="block rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.1)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
            {getFlag(app.countryCode)}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Active application
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-950">
              {app.visaName}
            </h3>
            <p className="text-sm text-slate-500">{app.countryName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Total paid
          </p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {formatCurrency(app.totalPaid)}
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cfg.badge}`}
          >
            {cfg.label}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <JourneyStepRail status={status} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Reference
          </p>
          <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
            #{app.referenceNumber ?? app.id.slice(-8).toUpperCase()}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Last update
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {timeAgo(app.updatedAt)}
          </p>
        </div>
      </div>

      {status === "rejected" ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Action required: upload replacement documents to continue processing.
        </div>
      ) : null}
    </Link>
  );
}

function OtherRow({ app }: { app: StoredApplication }) {
  const status = (app.status as AppStatus) ?? "submitted";
  const cfg = STATUS_CONFIG[status];

  return (
    <Link
      href={`/user/applications/${app.id}`}
      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
        {getFlag(app.countryCode)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-950">
          {app.visaName}
        </p>
        <p className="text-xs text-slate-500">{app.countryName}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${cfg.badge}`}
      >
        {cfg.label}
      </span>
    </Link>
  );
}

function ActivityItem({ note }: { note: StoredNotification }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${!note.read ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-slate-50"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">{note.title}</p>
          <p className="mt-1 text-xs text-slate-500">{note.message}</p>
        </div>
        <span className="shrink-0 text-[11px] font-medium text-slate-400">
          {timeAgo(note.createdAt)}
        </span>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState<StoredApplication[]>([]);
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      applicationsApi.list({
        page: 1,
        pageSize: 20,
        sortBy: "updatedAt",
        sortDir: "desc",
      }),
      notificationsApi.list(),
    ])
      .then(([appData, notificationData]) => {
        if (!mounted) return;
        setApps((appData.items as StoredApplication[]) ?? []);
        setNotifications((notificationData as StoredNotification[]) ?? []);
      })
      .catch(() => {
        if (mounted) setFetchError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const sortedApps = useMemo(
    () =>
      [...apps].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [apps],
  );
  const activeApp =
    sortedApps.find(
      (app) => app.status === "processing" || app.status === "submitted",
    ) ?? sortedApps[0];
  const otherApps = sortedApps
    .filter((app) => app.id !== activeApp?.id)
    .slice(0, 4);

  const metrics = useMemo(
    () => ({
      total: apps.length,
      active: apps.filter(
        (app) => app.status === "submitted" || app.status === "processing",
      ).length,
      approved: apps.filter((app) => app.status === "approved").length,
    }),
    [apps],
  );

  const first = user?.name?.split(" ")[0] ?? "Traveller";
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <div className="space-y-6">
      {fetchError && (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Could not load your data. Check your connection and{" "}
          <button type="button" onClick={() => { setFetchError(false); setLoading(true); }} className="font-semibold underline">
            try again
          </button>.
        </div>
      )}
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f7faff_52%,#edf4ff_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.35fr_0.95fr] lg:px-8">
          <div>
            <p className="text-sm font-medium text-slate-500">Welcome back</p>
            <h1
              className="mt-2 text-3xl font-black tracking-tight text-slate-950"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {first}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              {metrics.total === 0
                ? "You have not started any applications yet. Begin with a destination and keep every next step in one place."
                : `${metrics.active} active, ${metrics.approved} approved, ${metrics.total} total applications.`}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <StatTile
                label="Applications"
                value={metrics.total}
                detail="All submitted and in-progress cases"
              />
              <StatTile
                label="In progress"
                value={metrics.active}
                detail="Currently moving through review"
              />
              <StatTile
                label="Approved"
                value={metrics.approved}
                detail="Successfully completed visas"
              />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Quick actions
              </p>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/countries"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
                >
                  Start new application
                </Link>
                <Link
                  href="/user/documents"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
                >
                  Manage documents
                </Link>
                <Link
                  href="/user/profile"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
                >
                  Update profile
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Notifications
              </p>
              <p className="mt-2 text-2xl font-black text-slate-950">
                {unread}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Unread updates across your applications and support messages.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-12">
        <section className="space-y-4 xl:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Applications
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Your journey
              </h2>
            </div>
            <Link
              href="/user/applications"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-60 animate-pulse rounded-[28px] bg-slate-100" />
              <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : apps.length === 0 ? (
            <div
              className={`${shellCard()} flex flex-col items-center justify-center px-6 py-16 text-center`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <path
                    d="M12 8v4l2.5 2.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="mt-4 text-lg font-semibold text-slate-950">
                No applications yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Browse destinations and start your first visa application.
              </p>
              <Link
                href="/countries"
                className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
              >
                Browse destinations
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeApp ? <ActiveApplicationCard app={activeApp} /> : null}
              {otherApps.map((app) => (
                <OtherRow key={app.id} app={app} />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4 xl:col-span-5">
          <section className={`${shellCard()} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Checklist
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Next steps
                </h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {[
                {
                  done: metrics.total > 0,
                  label: "Submit your first application",
                  sub: "Choose a destination and visa type",
                  href: "/countries",
                },
                {
                  done: apps.length > 0,
                  label: "Upload your documents",
                  sub: "Passport, photos, and supporting records",
                  href: "/user/documents",
                },
                {
                  done: !!(user?.phone && user?.country && user?.nationality),
                  label: "Complete your profile",
                  sub: "Reuse your information on future applications",
                  href: "/user/profile",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${item.done ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600"}`}
                    >
                      {item.done ? "OK" : "1"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold ${item.done ? "text-emerald-700" : "text-slate-950"}`}
                      >
                        {item.label}
                      </p>
                      {!item.done ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {item.sub}
                        </p>
                      ) : null}
                    </div>
                    {!item.done ? (
                      <Link
                        href={item.href}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                      >
                        Open
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={`${shellCard()} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Activity
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Recent updates
                </h2>
              </div>
              <Link
                href="/user/notifications"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
              >
                See all
              </Link>
            </div>

            {loading ? (
              <div className="mt-4 space-y-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                No activity yet.
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {notifications.slice(0, 5).map((notification) => (
                  <ActivityItem key={notification.id} note={notification} />
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
