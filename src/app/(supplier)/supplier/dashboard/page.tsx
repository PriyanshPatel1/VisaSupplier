"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supplierApi } from "@/lib/api-client";
import type { StoredApplication } from "@/lib/store";
import { getFlag } from "@/lib/flags";

const STATUS_CONFIG = {
  submitted:  { label: "Submitted",  color: "text-blue-700",   dot: "bg-blue-500",   bg: "bg-blue-50",   border: "border-blue-200" },
  processing: { label: "Processing", color: "text-amber-700",  dot: "bg-amber-500",  bg: "bg-amber-50",  border: "border-amber-200" },
  approved:   { label: "Approved",   color: "text-green-700",  dot: "bg-green-500",  bg: "bg-green-50",  border: "border-green-200" },
  rejected:   { label: "Rejected",   color: "text-red-700",    dot: "bg-red-500",    bg: "bg-red-50",    border: "border-red-200" },
};


function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function SupplierDashboardPage() {
  const router = useRouter();
  const [apps, setApps] = useState<StoredApplication[]>([]);
  const supplierName = "Supplier";
  const [filter, setFilter] = useState<"all" | "submitted" | "processing" | "approved" | "rejected">("all");

  useEffect(() => {
    // Auth is handled by middleware — just load data
    supplierApi.getApplications()
      .then((data) => setApps(data as StoredApplication[]))
      .catch(() => router.push("/supplier/login"));
  }, [router]);

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  const counts = {
    all: apps.length,
    submitted: apps.filter((a) => a.status === "submitted").length,
    processing: apps.filter((a) => a.status === "processing").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, <span className="text-[#0f2d5a]">{supplierName}</span>
        </h1>
        <p className="text-gray-500 mt-1">
          You have <span className="font-semibold text-gray-700">{counts.submitted}</span> new application{counts.submitted !== 1 ? "s" : ""} awaiting your review.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Assigned", count: counts.all, icon: "📋", color: "border-l-[#0f2d5a]" },
          { label: "New / Pending", count: counts.submitted, icon: "🔔", color: "border-l-blue-500" },
          { label: "In Progress", count: counts.processing, icon: "⚙️", color: "border-l-amber-500" },
          { label: "Completed", count: counts.approved + counts.rejected, icon: "✅", color: "border-l-green-500" },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-xl p-5 border border-gray-100 border-l-4 ${s.color} shadow-sm`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-3xl font-bold text-gray-900">{s.count}</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Applications table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-gray-900 text-lg">Assigned Applications</h2>
          <div className="flex gap-2 flex-wrap">
            {(["all", "submitted", "processing", "approved", "rejected"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === s ? "bg-[#0f2d5a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s === "all" ? `All (${counts.all})` : `${s} (${counts[s] ?? 0})`}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 font-semibold text-lg">
              {apps.length === 0 ? "No applications assigned yet" : "No applications in this status"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {apps.length === 0
                ? "Applications assigned to you will appear here once users complete payment."
                : "Try a different filter above."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((app) => {
              const cfg = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.submitted;
              const isNew = app.status === "submitted" && !app.supplierNotes;
              return (
                <div key={app.id} className={`p-5 hover:bg-gray-50 transition-colors ${isNew ? "bg-blue-50/30" : ""}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Flag + info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {isNew && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0 border border-gray-200">
                        {getFlag(app.countryCode)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900">{app.userName}</p>
                          {isNew && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">NEW</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{app.visaName} — {app.countryName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{app.userEmail}</p>
                      </div>
                    </div>

                    {/* Status + meta */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-400">Received</p>
                        <p className="text-sm font-medium text-gray-700">{timeAgo(app.submittedAt)}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <Link
                        href={`/supplier/applications/${app.id}`}
                        className="px-4 py-2 bg-[#0f2d5a] hover:bg-[#0b2347] text-white rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        {app.status === "submitted" && !app.supplierNotes ? "Review →" : "View / Edit →"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
