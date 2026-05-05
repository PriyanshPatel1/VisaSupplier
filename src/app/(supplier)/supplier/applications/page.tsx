"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supplierApi } from "@/lib/api-client";
import type { StoredApplication } from "@/lib/store";

type Status = "submitted" | "processing" | "approved" | "rejected";

const STATUS_CONFIG: Record<Status, { label: string; color: string; dot: string; bg: string; border: string }> = {
  submitted:  { label: "Submitted",  color: "text-blue-700",   dot: "bg-blue-500",   bg: "bg-blue-50",   border: "border-blue-200"  },
  processing: { label: "Processing", color: "text-amber-700",  dot: "bg-amber-500",  bg: "bg-amber-50",  border: "border-amber-200" },
  approved:   { label: "Approved",   color: "text-green-700",  dot: "bg-green-500",  bg: "bg-green-50",  border: "border-green-200" },
  rejected:   { label: "Rejected",   color: "text-red-700",    dot: "bg-red-500",    bg: "bg-red-50",    border: "border-red-200"   },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

export default function SupplierApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<StoredApplication[]>([]);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    supplierApi.getApplications()
      .then((data) => { setApps(data as StoredApplication[]); setMounted(true); })
      .catch(() => { router.push("/supplier/login"); });
  }, [router]);

  const filtered = apps.filter((a) => {
    const matchStatus = filter === "all" || a.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || a.userName.toLowerCase().includes(q) || a.visaName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    all:        apps.length,
    submitted:  apps.filter((a) => a.status === "submitted").length,
    processing: apps.filter((a) => a.status === "processing").length,
    approved:   apps.filter((a) => a.status === "approved").length,
    rejected:   apps.filter((a) => a.status === "rejected").length,
  };

  if (!mounted) return (
    <div className="flex items-center justify-center py-24">
      <svg className="w-8 h-8 animate-spin text-[#0f2d5a]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">{apps.length} total application{apps.length !== 1 ? "s" : ""} assigned to you</p>
        </div>
        <Link href="/supplier/dashboard" className="text-sm text-[#0f2d5a] font-semibold hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {(["all", "submitted", "processing", "approved", "rejected"] as const).map((s) => {
          const cfg = s !== "all" ? STATUS_CONFIG[s] : null;
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === s ? "bg-[#0f2d5a] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {cfg && <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${cfg.dot}`} />}
              {s === "all" ? "All" : STATUS_CONFIG[s].label} ({counts[s]})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by applicant name, visa type, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30 bg-white text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Applications list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500 font-medium">No applications found</p>
          {search && <p className="text-sm text-gray-400 mt-1">Try a different search term</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const cfg = STATUS_CONFIG[app.status as Status] ?? STATUS_CONFIG.submitted;
            return (
              <Link key={app.id} href={`/supplier/applications/${app.id}`}
                className="block bg-white rounded-2xl border border-gray-200 hover:border-[#0f2d5a]/30 hover:shadow-md transition-all p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900 truncate">{app.userName}</p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color} border ${cfg.border} flex-shrink-0`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{app.visaName} · {app.countryName}</p>
                    <p className="text-xs text-gray-400 mt-1">ID: {app.id} · Submitted {timeAgo(app.submittedAt)}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${app.totalPaid}</p>
                      <p className="text-xs text-gray-400">Total paid</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
