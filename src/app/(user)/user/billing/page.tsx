"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { applicationsApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/currency";
import type { ApplicationsListResponse } from "@/lib/store";

interface BillingApplication {
  id: string;
  visaName: string;
  countryName: string;
  totalPaid: number;
  status: string;
  submittedAt: string;
  supplierName: string;
}

const STATUS_TONE: Record<string, string> = {
  submitted: "text-sky-300 bg-sky-500/14 border-sky-400/25",
  processing: "text-amber-300 bg-amber-500/14 border-amber-400/25",
  approved: "text-emerald-300 bg-emerald-500/14 border-emerald-400/25",
  rejected: "text-rose-300 bg-rose-500/14 border-rose-400/25",
};

export default function BillingPage() {
  const [apps, setApps] = useState<BillingApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsApi
      .list()
      .then((response) => {
        const items = (response as ApplicationsListResponse).items ?? [];
        setApps(
          items.map((item) => ({
            id: item.id,
            visaName: item.visaName,
            countryName: item.countryName,
            totalPaid: item.totalPaid,
            status: item.status,
            submittedAt: item.submittedAt,
            supplierName: item.supplierName,
          })),
        );
      })
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const totalSpent = apps.reduce((sum, app) => sum + (app.totalPaid ?? 0), 0);
    const thisMonth = apps
      .filter((app) => new Date(app.submittedAt).getMonth() === new Date().getMonth())
      .reduce((sum, app) => sum + (app.totalPaid ?? 0), 0);
    const pending = apps.filter((app) => app.status === "submitted" || app.status === "processing").length;
    return { totalSpent, thisMonth, pending };
  }, [apps]);

  const recent = [...apps]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
          Billing
        </h1>
        <p className="text-sm text-indigo-100/60">Your payments and recent application transactions.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <article className="user-panel rounded-2xl p-4">
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalSpent)}</p>
          <p className="mt-1 text-xs text-indigo-100/65">Total Spent</p>
        </article>
        <article className="user-panel rounded-2xl p-4">
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.thisMonth)}</p>
          <p className="mt-1 text-xs text-indigo-100/65">This Month</p>
        </article>
        <article className="user-panel rounded-2xl p-4">
          <p className="text-2xl font-bold text-white">{apps.length}</p>
          <p className="mt-1 text-xs text-indigo-100/65">Transactions</p>
        </article>
        <article className="user-panel rounded-2xl p-4">
          <p className="text-2xl font-bold text-white">{summary.pending}</p>
          <p className="mt-1 text-xs text-indigo-100/65">In Progress</p>
        </article>
      </section>

      <section className="user-panel rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recent Payments</h2>
          <Link href="/user/billing/history" className="text-xs font-semibold text-indigo-200 hover:text-white">
            View full history
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-xl bg-[#101b3d]" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-indigo-300/18 bg-[#0b1430] p-8 text-center">
            <p className="text-base font-semibold text-white">No payments yet</p>
            <Link href="/countries" className="mt-2 inline-block text-sm text-indigo-200 hover:text-white">
              Browse visas
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((app) => (
              <Link key={app.id} href={`/user/applications/${app.id}`} className="block rounded-xl border border-indigo-300/20 bg-[#0b1431] px-4 py-3 hover:border-indigo-300/45">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{app.visaName}</p>
                    <p className="mt-1 text-xs text-indigo-100/58">
                      {app.countryName} · {app.supplierName} · {new Date(app.submittedAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-white">{formatCurrency(app.totalPaid)}</p>
                  <span className={`user-badge border capitalize ${STATUS_TONE[app.status] ?? STATUS_TONE.submitted}`}>{app.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="user-panel rounded-2xl p-4">
        <h2 className="mb-3 text-base font-semibold text-white">Payment Method</h2>
        <div className="rounded-xl border border-indigo-300/20 bg-[#0b1430] p-4">
          <p className="text-sm font-semibold text-white">Card ending in 4242</p>
          <p className="mt-1 text-xs text-indigo-100/58">Primary method for all visa transactions.</p>
        </div>
      </section>
    </div>
  );
}
