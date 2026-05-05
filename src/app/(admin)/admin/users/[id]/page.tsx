"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getFlag } from "@/lib/flags";

interface UserApp {
  id: string;
  visaName: string;
  countryName: string;
  countryCode: string;
  status: "submitted" | "processing" | "approved" | "rejected";
  totalPaid: number;
  submittedAt: string;
  supplierName: string;
}

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  nationality?: string;
  dob?: string;
  gender?: string;
  address?: string;
  createdAt: string;
  _count: { applications: number; documents: number; notifications: number };
  applications: UserApp[];
}

interface EditForm {
  name: string;
  email: string;
  phone: string;
  country: string;
  nationality: string;
  dob: string;
  gender: string;
  address: string;
  password: string;
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "", email: "", phone: "", country: "", nationality: "", dob: "", gender: "", address: "", password: "",
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Notify
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [notifType, setNotifType] = useState<"info" | "success" | "warning" | "error">("info");
  const [notifSent, setNotifSent] = useState(false);
  const [notifSending, setNotifSending] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    adminApi.getUser(id)
      .then((data) => {
        const u = data as UserDetail;
        setUser(u);
        setEditForm({
          name: u.name ?? "",
          email: u.email ?? "",
          phone: u.phone ?? "",
          country: u.country ?? "",
          nationality: u.nationality ?? "",
          dob: u.dob ?? "",
          gender: u.gender ?? "",
          address: u.address ?? "",
          password: "",
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setEditError(null);
    setSaving(true);
    try {
      const patch: Record<string, unknown> = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || null,
        country: editForm.country || null,
        nationality: editForm.nationality || null,
        dob: editForm.dob || null,
        gender: editForm.gender || null,
        address: editForm.address || null,
      };
      if (editForm.password) patch.password = editForm.password;

      await adminApi.updateUser(id, patch);
      setEditOpen(false);
      setTimeout(() => router.push("/admin/users"), 800);
      showToast("✅ User updated");
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteUser(id);
      router.push("/admin/users");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to delete user");
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleSendNotif = async () => {
    if (!notifTitle.trim() || !notifMsg.trim()) return;
    setNotifSending(true);
    try {
      await adminApi.sendNotification({ userId: id, title: notifTitle, message: notifMsg, type: notifType });
      setNotifSent(true);
      setNotifTitle(""); setNotifMsg("");
      setTimeout(() => { setNotifSent(false); setNotifOpen(false); }, 2000);
    } catch { /* ignore */ } finally { setNotifSending(false); }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">👤</p>
        <p className="text-gray-500 font-semibold">User not found</p>
        <Link href="/admin/users" className="text-indigo-600 text-sm hover:underline mt-2 block">← Back to Users</Link>
      </div>
    );
  }

  const apps = user.applications;
  const totalSpent = apps.reduce((a, c) => a + (c.totalPaid ?? 0), 0);
  const approved = apps.filter((a) => a.status === "approved").length;
  const pending  = apps.filter((a) => a.status === "submitted" || a.status === "processing").length;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold">{toast}</div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href="/admin/users" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-gray-900">{user.name}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex">
          <button onClick={() => setEditOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors">
            ✏️ Edit
          </button>
          <button onClick={() => setDeleteOpen(true)}
            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors">
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left */}
        <div className="xl:col-span-2 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Applications", value: apps.length,             grad: "from-indigo-500 to-violet-600" },
              { label: "Total Spent",         value: `$${totalSpent.toLocaleString()}`, grad: "from-emerald-500 to-teal-600" },
              { label: "Approved",            value: approved,               grad: "from-green-500 to-emerald-600" },
              { label: "Pending",             value: pending,                grad: "from-amber-400 to-orange-500" },
            ].map((s) => (
              <div key={s.label} className={`bg-gradient-to-br ${s.grad} rounded-2xl p-4 text-white`}>
                <p className="text-2xl font-black mt-1">{s.value}</p>
                <p className="text-[10px] text-white/70 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Application history */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-gray-900">Application History</p>
              <span className="text-xs text-gray-400">{apps.length} total</span>
            </div>
            {apps.length === 0 ? (
              <EmptyState icon="📭" title="No applications" description="This user has not submitted any applications yet." />
            ) : (
              <div className="divide-y divide-gray-50">
                {[...apps].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map((app) => (
                  <div key={app.id} className="flex flex-col gap-3 px-4 py-4 hover:bg-gray-50 transition-colors group sm:flex-row sm:items-center sm:gap-4 sm:px-6">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                      {getFlag(app.countryCode)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{app.visaName}</p>
                      <p className="text-xs text-gray-400 truncate">{app.countryName} · {app.supplierName} · {timeAgo(app.submittedAt)}</p>
                    </div>
                    <StatusBadge status={app.status} />
                    <p className="text-sm font-black text-gray-800 flex-shrink-0">${app.totalPaid}</p>
                    <Link href={`/admin/applications/${app.id}`}
                      className="text-xs text-indigo-600 font-bold flex-shrink-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Profile + actions */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-white text-3xl font-black mx-auto mb-4">
              {user.name[0]?.toUpperCase() ?? "?"}
            </div>
            <h2 className="text-lg font-black text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1">Member since {formatDate(user.createdAt)}</p>
            <div className="mt-4">
              <span className={["inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                totalSpent >= 1000 ? "bg-indigo-100 text-indigo-700" : totalSpent >= 500 ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"].join(" ")}>
                {totalSpent >= 1000 ? "🌟 Gold Member" : totalSpent >= 500 ? "⭐ Silver Member" : "🔹 Standard"}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="font-bold text-gray-800 text-sm mb-4">Account Details</p>
            <div className="space-y-2.5">
              {[
                { label: "User ID",      value: id.slice(0, 20) + "…" },
                { label: "Phone",        value: user.phone || "—" },
                { label: "Country",      value: user.country || "—" },
                { label: "Nationality",  value: user.nationality || "—" },
                { label: "Gender",       value: user.gender || "—" },
                { label: "Date of Birth",value: user.dob || "—" },
                { label: "Applications", value: String(user._count.applications) },
                { label: "Documents",    value: String(user._count.documents) },
                { label: "Total Spent",  value: `$${totalSpent.toLocaleString()}` },
                { label: "Approval Rate",value: apps.length > 0 ? `${Math.round((approved / apps.length) * 100)}%` : "0%" },
              ].map((row) => (
                <div key={row.label} className="flex items-start justify-between">
                  <span className="text-xs text-gray-400">{row.label}</span>
                  <span className="text-xs font-semibold text-gray-700 text-right max-w-[55%] truncate">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Send notification */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-gray-800 text-sm">Send Notification</p>
              <button onClick={() => setNotifOpen((v) => !v)} className="text-xs text-indigo-600 font-semibold">
                {notifOpen ? "Cancel" : "Compose"}
              </button>
            </div>
            {notifOpen ? (
              <div className="space-y-3">
                <div className="flex gap-1.5 flex-wrap">
                  {(["info", "success", "warning", "error"] as const).map((t) => (
                    <button key={t} onClick={() => setNotifType(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${notifType === t ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <input type="text" placeholder="Title…" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                <textarea placeholder="Message…" value={notifMsg} onChange={(e) => setNotifMsg(e.target.value)} rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
                <button onClick={handleSendNotif} disabled={!notifTitle.trim() || !notifMsg.trim() || notifSending}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                  {notifSent ? "✅ Sent!" : notifSending ? "Sending…" : "🔔 Send"}
                </button>
              </div>
            ) : (
              <button onClick={() => setNotifOpen(true)}
                className="w-full py-2.5 border-2 border-dashed border-indigo-200 text-indigo-500 hover:bg-indigo-50 rounded-xl text-sm font-semibold transition-all">
                + Compose notification
              </button>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-900">Edit User</h2>
              <button onClick={() => setEditOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {editError && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{editError}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "name",        label: "Full Name",        type: "text",     placeholder: "John Doe" },
                { id: "email",       label: "Email",            type: "email",    placeholder: "user@example.com" },
                { id: "phone",       label: "Phone",            type: "tel",      placeholder: "+1 234 567 8900" },
                { id: "country",     label: "Country",          type: "text",     placeholder: "United States" },
                { id: "nationality", label: "Nationality",      type: "text",     placeholder: "American" },
                { id: "dob",         label: "Date of Birth",    type: "date",     placeholder: "" },
                { id: "gender",      label: "Gender",           type: "text",     placeholder: "Male / Female / Other" },
                { id: "password",    label: "New Password",     type: "password", placeholder: "Leave blank to keep" },
              ].map((f) => (
                <div key={f.id} className={f.id === "address" ? "sm:col-span-2" : ""}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={editForm[f.id as keyof EditForm]}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, [f.id]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Address</label>
                <textarea value={editForm.address} onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                  rows={2} placeholder="Street, City, State, ZIP"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none" />
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 mt-5 sm:flex-row">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70">
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => setEditOpen(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">⚠️</div>
            <h2 className="text-lg font-black text-gray-900 mb-1">Delete User?</h2>
            <p className="text-sm text-gray-500 mb-1"><strong>{user.name}</strong></p>
            <p className="text-xs text-gray-400 mb-6">All applications, documents and notifications for this user will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70">
                {deleting ? "Deleting…" : "Delete User"}
              </button>
              <button onClick={() => setDeleteOpen(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
