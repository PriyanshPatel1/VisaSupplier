"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api-client";
import type { StoredApplication } from "@/lib/store";// from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { getFlag } from "@/lib/flags";


type Status = "submitted" | "processing" | "approved" | "rejected";
type SortKey = "submittedAt" | "totalPaid" | "userName" | "status";

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

const STATUSES: { value: Status | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "processing", label: "Processing" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<StoredApplication[]>([]);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("submittedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<Status>("processing");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    userId: "", supplierId: "", visaId: "", visaName: "", countryCode: "",
    countryName: "", totalPaid: "", status: "submitted",
  });
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchApps = () => {
    adminApi.getApplications()
      .then((data) => {
        const d = data as { apps: StoredApplication[] };
        setApps(d.apps ?? []);
        setMounted(true);
      })
      .catch(() => setMounted(true));
  };

  const handleCreate = async () => {
    setCreateError(null);
    const { userId, supplierId, visaId, visaName, countryCode, countryName, totalPaid } = createForm;
    if (!userId || !supplierId || !visaId || !visaName || !countryCode || !countryName || !totalPaid) {
      setCreateError("All fields are required."); return;
    }
    setCreateSaving(true);
    try {
      await adminApi.createApplication({
        ...createForm, totalPaid: Number(totalPaid),
      });
      setCreateOpen(false);
      setCreateForm({ userId: "", supplierId: "", visaId: "", visaName: "", countryCode: "", countryName: "", totalPaid: "", status: "submitted" });
      fetchApps();
      showToast("✅ Application created");
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setCreateSaving(false);
    }
  };

  useEffect(() => { fetchApps(); }, []);

  const filtered = useMemo(() => {
    let list = apps;
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.userName.toLowerCase().includes(q) ||
          a.userEmail.toLowerCase().includes(q) ||
          a.visaName.toLowerCase().includes(q) ||
          a.countryName.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let va: string | number = a[sortKey] as string | number;
      let vb: string | number = b[sortKey] as string | number;
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [apps, statusFilter, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const getSortIcon = (k: SortKey) =>
    sortKey === k ? (
      <span className="ml-1 text-indigo-500">{sortDir === "asc" ? "^" : "v"}</span>
    ) : (
      <span className="ml-1 text-gray-200">|-|</span>
    );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((a) => a.id)));
  };

  const applyBulkStatus = async () => {
    if (selected.size === 0) return;
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          adminApi.updateApplication(id, { status: bulkStatus }),
        ),
      );
      const refreshed = await adminApi.getApplications();
      setApps((refreshed as { apps: StoredApplication[] }).apps ?? []);
      setSelected(new Set());
    } catch {
      // keep current rows if bulk update fails
    }
  };

  const exportCSV = () => {
    const rows = [
      ["ID", "User", "Email", "Visa", "Country", "Status", "Paid", "Date"],
      ...filtered.map((a) => [
        a.id, a.userName, a.userEmail, a.visaName, a.countryName,
        a.status, String(a.totalPaid), a.submittedAt,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "applications.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (!mounted) return <SkeletonTable rows={8} />;

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold">{toast}</div>}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {filtered.length} application{filtered.length !== 1 ? "s" : ""} · {apps.filter((a) => a.status === "submitted").length} awaiting review
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            onClick={() => { setCreateOpen(true); setCreateError(null); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors"
          >
            + New Application
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, visa, country, ID…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatusFilter(s.value); setPage(1); }}
              className={[
                "px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all",
                statusFilter === s.value
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
              ].join(" ")}
            >
              {s.label}
              {s.value !== "all" && (
                <span className={["ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold",
                  statusFilter === s.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                ].join(" ")}>
                  {apps.filter((a) => a.status === s.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
          <span className="text-sm font-semibold text-indigo-700">{selected.size} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as Status)}
            className="text-sm border border-indigo-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="submitted">→ Submitted</option>
            <option value="processing">→ Processing</option>
            <option value="approved">→ Approved</option>
            <option value="rejected">→ Rejected</option>
          </select>
          <button
            onClick={applyBulkStatus}
            className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-gray-500 hover:text-gray-700 sm:ml-auto"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[40px_1fr_1fr_140px_100px_80px_90px_80px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selected.size === paginated.length && paginated.length > 0}
              onChange={selectAll}
              className="rounded accent-indigo-600"
            />
          </div>
          <button onClick={() => toggleSort("userName")} className="text-left flex items-center hover:text-gray-700">
            Applicant {getSortIcon("userName")}
          </button>
          <span>Visa & Country</span>
          <span>Supplier</span>
          <button onClick={() => toggleSort("status")} className="text-left flex items-center hover:text-gray-700">
            Status {getSortIcon("status")}
          </button>
          <button onClick={() => toggleSort("totalPaid")} className="text-left flex items-center hover:text-gray-700">
            Paid {getSortIcon("totalPaid")}
          </button>
          <button onClick={() => toggleSort("submittedAt")} className="text-left flex items-center hover:text-gray-700">
            When {getSortIcon("submittedAt")}
          </button>
          <span>Action</span>
        </div>

        {paginated.length === 0 ? (
          <EmptyState
            icon={search ? "🔍" : "📭"}
            title={search ? `No results for "${search}"` : "No applications yet"}
            description={search ? "Try different search terms or clear filters" : "Applications will appear here once users submit them"}
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {paginated.map((app) => (
              <div
                key={app.id}
                className={[
                  "flex flex-col sm:grid sm:grid-cols-[40px_1fr_1fr_140px_100px_80px_90px_80px] gap-4 px-5 py-3.5 hover:bg-gray-50/80 transition-colors group",
                  selected.has(app.id) ? "bg-indigo-50/30" : "",
                ].join(" ")}
              >
                {/* Checkbox */}
                <div className="hidden sm:flex items-center">
                  <input
                    type="checkbox"
                    checked={selected.has(app.id)}
                    onChange={() => toggleSelect(app.id)}
                    className="rounded accent-indigo-600"
                  />
                </div>

                {/* Applicant */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {app.userName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{app.userName}</p>
                    <p className="text-xs text-gray-500 truncate">{app.userEmail}</p>
                  </div>
                </div>

                {/* Visa & Country */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl flex-shrink-0">{getFlag(app.countryCode)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{app.visaName}</p>
                    <p className="text-xs text-gray-500">{app.countryName}</p>
                  </div>
                </div>

                {/* Supplier */}
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-700 truncate">{app.supplierName}</p>
                </div>

                {/* Status */}
                <div className="flex sm:block items-center gap-2">
                  <StatusBadge status={app.status} />
                </div>

                {/* Paid */}
                <div>
                  <p className="text-sm font-bold text-gray-800">${app.totalPaid}</p>
                </div>

                {/* When */}
                <div>
                  <p className="text-xs text-gray-400">{timeAgo(app.submittedAt)}</p>
                </div>

                {/* Action */}
                <div>
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages} · {filtered.length} total
            </p>
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + Math.max(1, page - 2);
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={[
                      "w-8 h-8 text-xs font-semibold rounded-lg transition-colors",
                      p === page
                        ? "bg-indigo-600 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE APPLICATION MODAL */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-900">Create Application</h2>
              <button onClick={() => setCreateOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {createError && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{createError}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "userId",      label: "User ID *",       placeholder: "MongoDB ObjectId" },
                { id: "supplierId",  label: "Supplier ID *",   placeholder: "MongoDB ObjectId" },
                { id: "visaId",      label: "Visa ID *",       placeholder: "e.g. us-tourist" },
                { id: "visaName",    label: "Visa Name *",     placeholder: "e.g. B-1/B-2 Tourist" },
                { id: "countryCode", label: "Country Code *",  placeholder: "e.g. US" },
                { id: "countryName", label: "Country Name *",  placeholder: "e.g. United States" },
                { id: "totalPaid",   label: "Total Paid (USD)*", placeholder: "185", type: "number" },
              ].map((f) => (
                <div key={f.id} className={f.id === "userId" || f.id === "supplierId" ? "sm:col-span-2" : ""}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">{f.label}</label>
                  <input
                    type={f.type ?? "text"}
                    placeholder={f.placeholder}
                    value={createForm[f.id as keyof typeof createForm]}
                    onChange={(e) => setCreateForm((p) => ({ ...p, [f.id]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Initial Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {["submitted", "processing", "approved", "rejected"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Tip: Copy User ID and Supplier ID from their respective detail pages.</p>
            <div className="flex flex-col-reverse gap-3 mt-5 sm:flex-row">
              <button onClick={handleCreate} disabled={createSaving}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70">
                {createSaving ? "Creating…" : "Create Application"}
              </button>
              <button onClick={() => setCreateOpen(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

