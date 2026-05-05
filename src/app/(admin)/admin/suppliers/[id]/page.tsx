"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api-client";
import type { StoredApplication } from "@/lib/store";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getFlag } from "@/lib/flags";

interface SupplierDetail {
  id: string;
  name: string;
  email: string;
  type: string;
  priceMultiplier: number;
  rating: number;
  createdAt: string;
  stats: { totalApps: number; approved: number; rejected: number; processing: number; submitted: number; revenue: number; approvalRate: number };
  applications: (StoredApplication & { userName: string; userEmail: string })[];
}

const EMPTY_APPS: SupplierDetail["applications"] = [];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function MiniDonut({
  approved,
  rejected,
  processing,
  total,
}: {
  approved: number;
  rejected: number;
  processing: number;
  total: number;
}) {
  const r = 32;
  const cx = 40;
  const cy = 40;
  const circ = 2 * Math.PI * r;
  const safeTotal = total || 1;

  const segments = [
    { value: approved, color: "#22c55e", label: "Approved" },
    { value: processing, color: "#f59e0b", label: "Processing" },
    { value: rejected, color: "#ef4444", label: "Rejected" },
  ];

  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90 flex-shrink-0">
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        ) : (
          segments.map((segment, idx) => {
            const dash = (segment.value / safeTotal) * circ;
            const node = (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={segment.color}
                strokeWidth="12"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return node;
          })
        )}
        <circle cx={cx} cy={cy} r="20" fill="white" />
      </svg>

      <div className="space-y-1">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: segment.color }} />
            <span className="text-gray-500">{segment.label}</span>
            <span className="font-bold text-gray-900 ml-auto pl-3">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminSupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData]       = useState<SupplierDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", type: "agency", priceMultiplier: "1.0", rating: "4.5", password: "" });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    adminApi
      .getSupplier(id)
      .then((d) => {
        const sup = d as SupplierDetail;
        setData(sup);
        setEditForm({ name: sup.name, email: sup.email, type: sup.type, priceMultiplier: String(sup.priceMultiplier), rating: String(sup.rating), password: "" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setEditError(null); setSaving(true);
    try {
      await adminApi.updateSupplier(id, {
        name: editForm.name, email: editForm.email, type: editForm.type,
        priceMultiplier: parseFloat(editForm.priceMultiplier) || 1.0,
        rating: parseFloat(editForm.rating) || 4.5,
        ...(editForm.password ? { password: editForm.password } : {}),
      });
      setEditOpen(false);
      showToast("Supplier updated");
      setTimeout(() => router.push("/admin/suppliers"), 800);
    } catch (e: unknown) { setEditError(e instanceof Error ? e.message : "Failed to update"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteSupplier(id);
      router.push("/admin/suppliers");
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Failed to delete"); setDeleteOpen(false); }
    finally { setDeleting(false); }
  };

  const apps = data?.applications ?? EMPTY_APPS;
  const displayName   = data?.name ?? id;
  const supplierType  = data?.type ?? "agent";

  const stats = data?.stats ?? (() => {
    const approved = apps.filter((a) => a.status === "approved").length;
    const rejected = apps.filter((a) => a.status === "rejected").length;
    const processing = apps.filter((a) => a.status === "processing").length;
    const submitted = apps.filter((a) => a.status === "submitted").length;
    const revenue = apps.reduce((sum, app) => sum + (app.totalPaid ?? 0), 0);
    const approvalRate = apps.length > 0 ? Math.round((approved / apps.length) * 100) : 0;

    return { approved, rejected, processing, submitted, revenue, approvalRate };
  })();

  const sortedApps = [...apps].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-gray-500">Loading supplier details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold">{toast}</div>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href="/admin/suppliers" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">{displayName}</h1>
            <span
              className={[
                "text-xs font-bold px-2.5 py-1 rounded-full capitalize",
                supplierType === "embassy" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700",
              ].join(" ")}
            >
              {supplierType}
            </span>
          </div>
          <p className="text-gray-400 text-sm font-mono mt-0.5">{id}</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex">
          <button onClick={() => setEditOpen(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors">✏️ Edit</button>
          <button onClick={() => setDeleteOpen(true)} className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors">🗑️ Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: apps.length, grad: "from-indigo-500 to-indigo-700" },
          { label: "Revenue Generated", value: `$${stats.revenue.toLocaleString()}`, grad: "from-emerald-500 to-teal-600" },
          { label: "Approval Rate", value: `${stats.approvalRate}%`, grad: "from-green-500 to-emerald-600" },
          { label: "Pending Review", value: stats.submitted, grad: "from-amber-400 to-orange-500" },
        ].map((card) => (
          <div key={card.label} className={`bg-gradient-to-br ${card.grad} rounded-2xl p-5 text-white`}>
            <p className="text-3xl font-black mt-1">{card.value}</p>
            <p className="text-xs text-white/70 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-gray-900">Assigned Applications</p>
              <span className="text-xs text-gray-400">{apps.length} total</span>
            </div>

            {sortedApps.length === 0 ? (
              <EmptyState
                icon="S"
                title="No applications yet"
                description="Applications will appear here when assigned to this supplier."
              />
            ) : (
              <div className="divide-y divide-gray-50">
                {sortedApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-col gap-3 px-4 py-4 hover:bg-gray-50 transition-colors group sm:flex-row sm:items-center sm:gap-4 sm:px-6"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                      {getFlag(app.countryCode)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{app.userName}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {app.visaName} | {app.countryName} | {timeAgo(app.submittedAt)}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                    <p className="text-sm font-black text-gray-800 flex-shrink-0">${app.totalPaid}</p>
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="text-xs text-indigo-600 font-bold flex-shrink-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      View -&gt;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="font-bold text-gray-800 text-sm mb-4">Status Breakdown</p>
            <MiniDonut
              approved={stats.approved}
              rejected={stats.rejected}
              processing={stats.processing}
              total={apps.length}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="font-bold text-gray-800 text-sm mb-4">Performance</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500 font-medium">Approval Rate</span>
                  <span className="font-black text-emerald-600">{stats.approvalRate}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.approvalRate}%` }} />
                </div>
              </div>

              {apps.length > 0 &&
                [
                  { label: "Processing", val: stats.processing, color: "bg-amber-400" },
                  { label: "Rejected", val: stats.rejected, color: "bg-red-400" },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500 font-medium">{bar.label}</span>
                      <span className="font-bold text-gray-700">{Math.round((bar.val / apps.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={["h-full rounded-full transition-all", bar.color].join(" ")} style={{ width: `${(bar.val / apps.length) * 100}%` }} />
                    </div>
                  </div>
                ))}

              <div className="pt-2 mt-2 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Avg Revenue / App</span>
                  <span className="font-bold text-gray-800">{apps.length > 0 ? `$${Math.round(stats.revenue / apps.length)}` : "$0"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Submitted (Queue)</span>
                  <span className="font-bold text-gray-800">{stats.submitted}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-900">Edit Supplier</h2>
              <button onClick={() => setEditOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {editError && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{editError}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "name",  label: "Name",  type: "text",     placeholder: "Supplier name" },
                { id: "email", label: "Email", type: "email",    placeholder: "email@example.com" },
              ].map((f) => (
                <div key={f.id} className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={editForm[f.id as keyof typeof editForm]}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, [f.id]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Type</label>
                <select value={editForm.type} onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                  {["agency", "embassy", "government", "courier"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Price Multiplier</label>
                <input type="number" step="0.01" min="0.5" max="5" value={editForm.priceMultiplier}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, priceMultiplier: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Rating</label>
                <input type="number" step="0.1" min="1" max="5" value={editForm.rating}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, rating: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">New Password</label>
                <input type="password" placeholder="Leave blank to keep" value={editForm.password}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 mt-5 sm:flex-row">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70">
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => setEditOpen(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
            <h2 className="text-lg font-black text-gray-900 mb-1">Delete Supplier?</h2>
            <p className="text-sm text-gray-500 mb-1"><strong>{displayName}</strong></p>
            <p className="text-xs text-gray-400 mb-6">This cannot be undone. All data associated with this supplier will be removed.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70">
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button onClick={() => setDeleteOpen(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
