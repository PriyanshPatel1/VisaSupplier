"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api-client";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";

interface SupplierStats {
  id: string;
  name: string;
  email: string;
  type: string;
  totalApps: number;
  approved: number;
  rejected: number;
  processing: number;
  revenue: number;
  approvalRate: number;
  rating: number;
}

export default function AdminSuppliersPage() {
  const [stats, setStats]   = useState<SupplierStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getSuppliers()
      .then((data) => setStats(((data as SupplierStats[]) ?? []).sort((a, b) => b.totalApps - a.totalApps)))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load suppliers"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonTable rows={4} />;

  const totalRevenue = stats.reduce((a, s) => a + s.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {stats.length} suppliers | ${totalRevenue.toLocaleString()} total processed
          </p>
        </div>
        <Link href="/admin/suppliers/new"
          className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors text-center sm:w-auto">
          + Add Supplier
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {stats.length === 0 ? (
        <EmptyState icon="S" title="No suppliers found" description="Add suppliers to see analytics here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {stats.map((sup, rank) => (
            <Link key={sup.id} href={`/admin/suppliers/${sup.id}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all block">
              <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={[
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
                      rank === 0 ? "bg-indigo-600" : rank === 1 ? "bg-violet-500" : "bg-blue-500",
                    ].join(" ")}>
                      {sup.name[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm">{sup.name}</h3>
                      <span className={[
                        "text-xs font-semibold px-2 py-0.5 rounded-full capitalize",
                        sup.type === "embassy" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700",
                      ].join(" ")}>
                        {sup.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-400">#{rank + 1}</span>
                    <p className="text-xs text-amber-500 mt-0.5">⭐ {sup.rating}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4">
                <div className="text-center p-3 bg-indigo-50 rounded-xl">
                  <p className="text-2xl font-black text-indigo-700">{sup.totalApps}</p>
                  <p className="text-xs text-indigo-500 font-semibold">Total Apps</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-2xl font-black text-emerald-700">{sup.approvalRate}%</p>
                  <p className="text-xs text-emerald-500 font-semibold">Approval Rate</p>
                </div>
              </div>

              <div className="px-4 pb-4 space-y-2">
                {sup.totalApps > 0 && [
                  { label: "Approved",   val: sup.approved,   color: "bg-emerald-500" },
                  { label: "Processing", val: sup.processing, color: "bg-amber-500" },
                  { label: "Rejected",   val: sup.rejected,   color: "bg-red-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-xs">
                    <span className="w-20 text-gray-500 font-medium">{item.label}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={["h-full rounded-full transition-all", item.color].join(" ")}
                        style={{ width: `${(item.val / sup.totalApps) * 100}%` }} />
                    </div>
                    <span className="w-4 text-right font-bold text-gray-700">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="px-4 pb-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-500 font-semibold">Revenue Processed</span>
                  <span className="text-sm font-black text-gray-800">${sup.revenue.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
