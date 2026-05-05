"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api-client";
import type { StoredApplication } from "@/lib/store";
import { getFlag } from "@/lib/flags";

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

const STATUS_CONFIG = {
  submitted: { label: "Submitted", bg: "bg-blue-100", color: "text-blue-700" },
  processing: { label: "Processing", bg: "bg-amber-100", color: "text-amber-700" },
  approved: { label: "Approved", bg: "bg-green-100", color: "text-green-700" },
  rejected: { label: "Rejected", bg: "bg-red-100", color: "text-red-700" },
};

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const startPoint = polarToCartesian(cx, cy, r, start);
  const endPoint = polarToCartesian(cx, cy, r, end);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${startPoint.x} ${startPoint.y} A ${r} ${r} 0 ${largeArc} 1 ${endPoint.x} ${endPoint.y}`;
}

function ApprovalGauge({ rate }: { rate: number }) {
  const color = rate >= 70 ? "#22c55e" : rate >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-44 overflow-hidden">
        <svg viewBox="0 0 200 110" className="absolute inset-0 h-full w-full">
          <path d={describeArc(100, 110, 78, -135, -45)} fill="none" stroke="#fee2e2" strokeWidth="16" strokeLinecap="round" />
          <path d={describeArc(100, 110, 78, -45, 45)} fill="none" stroke="#fef3c7" strokeWidth="16" strokeLinecap="round" />
          <path d={describeArc(100, 110, 78, 45, 135)} fill="none" stroke="#dcfce7" strokeWidth="16" strokeLinecap="round" />
          <path
            d={describeArc(100, 110, 78, -135, -135 + (rate / 100) * 270)}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <p className="text-2xl font-black text-gray-900">{rate}%</p>
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500">Approval Rate</p>
    </div>
  );
}

function DonutChart({ segments }: { segments: Array<{ value: number; color: string; label: string }> }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const chartSegments = segments.reduce<
    Array<{ key: string; dash: number; offset: number; color: string; label: string; value: number }>
  >((acc, segment, index) => {
    const dash = (segment.value / total) * circumference;
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.dash : 0;
    return [
      ...acc,
      {
        key: `${segment.label}-${index}`,
        dash,
        offset,
        color: segment.color,
        label: segment.label,
        value: segment.value,
      },
    ];
  }, []);

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-20 w-20 shrink-0 -rotate-90">
        {chartSegments.map((segment) => (
          <circle
            key={segment.key}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth="16"
            strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
            strokeDashoffset={-segment.offset}
          />
        ))}
        <circle cx="50" cy="50" r="24" fill="white" />
      </svg>
      <div className="min-w-0 space-y-1">
        {chartSegments.map((segment) => (
          <div key={segment.key} className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="truncate text-gray-600">{segment.label}</span>
            <span className="ml-auto pl-2 font-bold text-gray-900">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);

  return (
    <div className="flex h-14 items-end gap-1">
      {data.map((value, index) => (
        <div
          key={index}
          className="min-h-[4px] flex-1 rounded-t-md transition-all"
          style={{ height: `${(value / max) * 100}%`, backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded-xl bg-gray-100" />
        </div>
        <div className="hidden space-y-2 sm:block">
          <div className="ml-auto h-4 w-40 animate-pulse rounded-xl bg-gray-100" />
          <div className="ml-auto h-5 w-32 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-2xl bg-white shadow-sm" />
        ))}
      </div>

      <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm" />
    </div>
  );
}

export default function AdminDashboardPage() {
  const [apps, setApps] = useState<StoredApplication[]>([]);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    adminApi.getStats()
      .then((data) => {
        if (!active) return;
        const payload = data as Record<string, unknown>;
        setApps((payload.recentApps ?? []) as StoredApplication[]);
        setStats(payload);
      })
      .catch(() => {
        if (!active) return;
        setApps([]);
        setStats({});
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const total = (stats.total as number) ?? apps.length;
  const submitted = (stats.submitted as number) ?? 0;
  const processing = (stats.processing as number) ?? 0;
  const approved = (stats.approved as number) ?? 0;
  const rejected = (stats.rejected as number) ?? 0;
  const revenue = (stats.revenue as number) ?? 0;
  const approvalRate = (stats.approvalRate as number) ?? 0;

  const revenueByMonth = Array<number>(6).fill(0);
  apps.forEach((app) => {
    const monthDiff = (new Date().getMonth() - new Date(app.submittedAt).getMonth() + 12) % 12;
    if (monthDiff < 6) revenueByMonth[5 - monthDiff] += app.totalPaid || 0;
  });

  const countryCounts: Record<string, number> = {};
  apps.forEach((app) => {
    countryCounts[app.countryName] = (countryCounts[app.countryName] || 0) + 1;
  });
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const supplierCounts: Record<string, number> = {};
  apps.forEach((app) => {
    supplierCounts[app.supplierName] = (supplierCounts[app.supplierName] || 0) + 1;
  });

  const recentApplications = [...apps]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Admin overview</h1>
          <p className="mt-0.5 text-sm text-gray-500">A live snapshot of applications, suppliers, and revenue.</p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs text-gray-400">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <p className="mt-0.5 text-sm font-bold text-indigo-600">${revenue.toLocaleString()} total revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Applications", value: total, icon: "Apps", grad: "from-indigo-500 to-indigo-700", sub: `${submitted} new` },
          { label: "In Processing", value: processing, icon: "Flow", grad: "from-amber-400 to-orange-500", sub: "under review" },
          { label: "Approved", value: approved, icon: "OK", grad: "from-emerald-500 to-green-600", sub: `${approvalRate}% rate` },
          { label: "Revenue (USD)", value: `$${revenue.toLocaleString()}`, icon: "USD", grad: "from-purple-500 to-violet-700", sub: "total collected" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.grad} p-5 text-white shadow-md`}>
            <div className="mb-3 flex items-start justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.2em]">{stat.icon}</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">{stat.sub}</span>
            </div>
            <p className="text-3xl font-black">{stat.value}</p>
            <p className="mt-0.5 text-xs text-white/70">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="mb-3 self-start text-sm font-bold text-gray-800">Application Health</p>
          <ApprovalGauge rate={approvalRate} />
          <div className="mt-4 grid w-full grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-green-50 p-2 text-center">
              <p className="text-xl font-black text-green-700">{approved}</p>
              <p className="text-green-600">Approved</p>
            </div>
            <div className="rounded-xl bg-red-50 p-2 text-center">
              <p className="text-xl font-black text-red-700">{rejected}</p>
              <p className="text-red-600">Rejected</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-200" />Low</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-amber-200" />Mid</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-green-200" />High</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-bold text-gray-800">Status Breakdown</p>
          <DonutChart
            segments={[
              { value: submitted, color: "#3b82f6", label: "Submitted" },
              { value: processing, color: "#f59e0b", label: "Processing" },
              { value: approved, color: "#22c55e", label: "Approved" },
              { value: rejected, color: "#ef4444", label: "Rejected" },
            ]}
          />
          <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
            Total <span className="font-bold text-gray-900">{total}</span> applications across all statuses
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">Revenue - Last 6 Months</p>
          </div>
          <BarChart data={revenueByMonth} color="#6366f1" />
          <div className="mb-3 mt-1 flex justify-between text-[10px] text-gray-400">
            {["6mo", "5mo", "4mo", "3mo", "2mo", "Now"].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-center">
              <p className="text-base font-black text-indigo-700">${revenueByMonth[5].toLocaleString()}</p>
              <p className="text-indigo-500">This month</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-2.5 text-center">
              <p className="text-base font-black text-gray-700">${total > 0 ? Math.round(revenue / total) : 0}</p>
              <p className="text-gray-500">Avg / app</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-bold text-gray-800">Top Destinations</p>
          {topCountries.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-400">No applications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topCountries.map(([country, count], index) => (
                <div key={country} className="flex items-center gap-3">
                  <span className="w-4 text-xs font-bold text-gray-400">#{index + 1}</span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">{country}</span>
                      <span className="text-gray-500">{count} apps</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${(count / topCountries[0][1]) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">Supplier Performance</p>
            <Link href="/admin/suppliers" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          {Object.entries(supplierCounts).length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-400">No supplier data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(supplierCounts).sort((a, b) => b[1] - a[1]).map(([name, count], index) => (
                <div key={name} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${index === 0 ? "bg-indigo-600" : index === 1 ? "bg-purple-500" : "bg-blue-500"}`}>
                    {name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800">{name}</p>
                    <p className="text-xs text-gray-500">{count} application{count !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${index === 0 ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-600"}`}>#{index + 1}</span>
                    <p className="mt-0.5 text-xs text-gray-400">{total > 0 ? Math.round((count / total) * 100) : 0}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-6">
          <p className="font-bold text-gray-900">Recent Applications</p>
          <Link href="/admin/applications" className="text-xs font-semibold text-indigo-600 hover:underline">View all</Link>
        </div>
        {recentApplications.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">No applications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentApplications.map((app) => {
              const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.submitted;
              return (
                <div key={app.id} className="flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg">
                    {getFlag(app.countryCode)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{app.userName}</p>
                    <p className="truncate text-xs text-gray-500">{app.visaName} · {app.countryName}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                  <span className="hidden shrink-0 text-xs text-gray-400 sm:block">{timeAgo(app.submittedAt)}</span>
                  <span className="shrink-0 text-sm font-bold text-gray-700">${app.totalPaid}</span>
                  <Link href={`/admin/applications/${app.id}`} className="shrink-0 text-xs font-semibold text-indigo-500 hover:text-indigo-700">View</Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/admin/applications", label: "Applications", code: "AP", cls: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" },
          { href: "/admin/users", label: "Users", code: "US", cls: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" },
          { href: "/admin/forms", label: "Form Builder", code: "FB", cls: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100" },
          { href: "/admin/payments", label: "Payments", code: "PY", cls: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" },
        ].map((action) => (
          <Link key={action.href} href={action.href} className={`flex min-w-0 items-center gap-3 rounded-2xl border p-4 text-sm font-semibold transition-all ${action.cls}`}>
            <span className="text-xs font-bold uppercase tracking-[0.2em]">{action.code}</span>
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
