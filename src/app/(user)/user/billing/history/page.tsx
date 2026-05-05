"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/dashboard/toast";
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

export default function BillingHistoryPage() {
  const { showToast } = useToast();

  const [apps, setApps] = useState<BillingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    applicationsApi
      .list()
      .then((response) => {
        const items = (response as ApplicationsListResponse).items ?? [];
        const sorted = [...items].map((item) => ({
          id: item.id,
          visaName: item.visaName,
          countryName: item.countryName,
          totalPaid: item.totalPaid,
          status: item.status,
          submittedAt: item.submittedAt,
          supplierName: item.supplierName,
        })).sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
        );
        setApps(sorted);
      })
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return apps;
    return apps.filter((app) => app.status === filter);
  }, [apps, filter]);

  const summary = useMemo(() => {
    const totalSpent = apps
      .filter((app) => app.status === "approved" || app.status === "processing")
      .reduce((sum, app) => sum + app.totalPaid, 0);
    return {
      totalSpent,
      transactions: apps.length,
      approved: apps.filter((app) => app.status === "approved").length,
      progress: apps.filter((app) => app.status === "submitted" || app.status === "processing").length,
    };
  }, [apps]);

  const exportCsv = () => {
    const rows = [
      ["Date", "Visa", "Country", "Supplier", "Amount", "Status"],
      ...apps.map((app) => [
        new Date(app.submittedAt).toLocaleDateString("en-GB"),
        app.visaName,
        app.countryName,
        app.supplierName,
        String(app.totalPaid),
        app.status,
      ]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "visahub-payments.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Billing history exported.", "success");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link href="/user/billing" className="user-outline-btn px-2 py-1 text-xs">
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Billing History
            </h1>
            <p className="text-sm text-indigo-100/60">All payment transactions for your applications.</p>
          </div>
        </div>

        <button type="button" onClick={exportCsv} className="user-outline-btn px-4 py-2 text-sm font-semibold">
          Export CSV
        </button>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <article className="user-panel rounded-2xl p-4">
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalSpent)}</p>
          <p className="mt-1 text-xs text-indigo-100/65">Total Spent</p>
        </article>
        <article className="user-panel rounded-2xl p-4">
          <p className="text-2xl font-bold text-white">{summary.transactions}</p>
          <p className="mt-1 text-xs text-indigo-100/65">Transactions</p>
        </article>
        <article className="user-panel rounded-2xl p-4">
          <p className="text-2xl font-bold text-white">{summary.approved}</p>
          <p className="mt-1 text-xs text-indigo-100/65">Approved</p>
        </article>
        <article className="user-panel rounded-2xl p-4">
          <p className="text-2xl font-bold text-white">{summary.progress}</p>
          <p className="mt-1 text-xs text-indigo-100/65">In Progress</p>
        </article>
      </section>

      <section className="user-panel rounded-2xl p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {["all", "submitted", "processing", "approved", "rejected"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                filter === status
                  ? "border-indigo-300/65 bg-indigo-500/24 text-white"
                  : "border-indigo-300/24 text-indigo-100/72"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-xl bg-[#101b3d]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-indigo-300/18 bg-[#0b1430] p-8 text-center">
            <p className="text-base font-semibold text-white">No records found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((app) => (
              <Link key={app.id} href={`/user/applications/${app.id}`} className="block rounded-xl border border-indigo-300/20 bg-[#0b1431] px-4 py-3 hover:border-indigo-300/45">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {app.visaName} · {app.countryName}
                    </p>
                    <p className="mt-1 text-xs text-indigo-100/58">
                      TXN-{app.id.slice(0, 8).toUpperCase()} · {app.supplierName} · {new Date(app.submittedAt).toLocaleDateString("en-GB")}
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
    </div>
  );
}
