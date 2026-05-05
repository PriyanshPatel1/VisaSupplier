"use client";

import { useState, useEffect, useMemo } from "react";
import { adminApi } from "@/lib/api-client";
import type { StoredApplication } from "@/lib/store";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { getFlag } from "@/lib/flags";


export default function AdminPaymentsPage() {
  const [apps, setApps] = useState<StoredApplication[]>([]);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApi.getPayments({ limit: "100" })
      .then((data) => { setApps((data as { payments: StoredApplication[] }).payments ?? []); setMounted(true); })
      .catch(() => setMounted(true));
  }, []);

  const sorted = useMemo(
    () => [...apps].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()),
    [apps]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (a) => a.userName.toLowerCase().includes(q) || a.visaName.toLowerCase().includes(q) || a.id.includes(q)
    );
  }, [sorted, search]);

  const totalRevenue = apps.reduce((a, c) => a + c.totalPaid, 0);
  const avgPayment = apps.length > 0 ? Math.round(totalRevenue / apps.length) : 0;
  const thisMonth = apps
    .filter((a) => new Date(a.submittedAt).getMonth() === new Date().getMonth())
    .reduce((a, c) => a + c.totalPaid, 0);

  if (!mounted) return <SkeletonTable rows={6} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 text-sm mt-0.5">{apps.length} payment{apps.length !== 1 ? "s" : ""} · ${totalRevenue.toLocaleString()} total</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue",   value: `$${totalRevenue.toLocaleString()}`, icon: "💰", grad: "from-emerald-500 to-teal-600" },
          { label: "This Month",      value: `$${thisMonth.toLocaleString()}`,    icon: "📅", grad: "from-indigo-500 to-violet-600" },
          { label: "Avg per Payment", value: `$${avgPayment}`,                    icon: "📊", grad: "from-amber-400 to-orange-500" },
        ].map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.grad} rounded-2xl p-5 text-white`}>
            <span className="text-2xl">{s.icon}</span>
            <p className="text-3xl font-black mt-2">{s.value}</p>
            <p className="text-xs text-white/70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search by name or visa…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
      </div>

      {/* Payments table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_1fr_120px_100px_100px_100px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
          <span>Applicant</span>
          <span>Visa & Country</span>
          <span>Supplier</span>
          <span>Status</span>
          <span>Amount</span>
          <span>Date</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="💳" title="No payments yet" description="Payments appear here as applications are submitted." />
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((app) => (
              <div key={app.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_120px_100px_100px_100px] gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {app.userName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{app.userName}</p>
                    <p className="text-xs text-gray-400 truncate">{app.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getFlag(app.countryCode)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{app.visaName}</p>
                    <p className="text-xs text-gray-500">{app.countryName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-gray-600 truncate">{app.supplierName}</p>
                </div>
                <div className="flex items-center">
                  <StatusBadge status={app.status} />
                </div>
                <div className="flex items-center">
                  <p className="text-sm font-black text-gray-900">${app.totalPaid}</p>
                </div>
                <div className="flex items-center">
                  <p className="text-xs text-gray-400">
                    {new Date(app.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
