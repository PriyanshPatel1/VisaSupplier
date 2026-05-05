"use client";

import { use, useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/Badge";
import { Timeline } from "@/components/ui/Timeline";
import type { TimelineStatus } from "@/components/ui/Timeline";
import { getFlag } from "@/lib/flags";

const S_CFG = {
  submitted:  { label: "Submitted",  bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   ring: "ring-blue-300"   },
  processing: { label: "Processing", bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  ring: "ring-amber-300"  },
  approved:   { label: "Approved",   bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  ring: "ring-green-300"  },
  rejected:   { label: "Rejected",   bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    ring: "ring-red-300"    },
} as const;
type Status = keyof typeof S_CFG;

type Tab = "overview" | "formdata" | "timeline" | "notes";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview",  label: "Overview",  icon: "📋" },
  { id: "formdata",  label: "Form Data", icon: "📝" },
  { id: "timeline",  label: "Timeline",  icon: "🕐" },
  { id: "notes",     label: "Notes",     icon: "💬" },
];

interface AppData {
  id: string;
  visaName: string;
  countryCode: string;
  countryName: string;
  userName: string;
  userEmail: string;
  userId: string;
  supplierName: string;
  supplierId: string;
  totalPaid: number;
  status: Status;
  submittedAt: string;
  updatedAt: string;
  referenceNumber?: string;
  estimatedDecision?: string;
  supplierNotes?: string;
  personal?: Record<string, string>;
  passport?: Record<string, string>;
  travel?: Record<string, string>;
  other?: Record<string, unknown>;
  documents?: Record<string, string>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function humanizeKey(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-1 gap-1 py-3 border-b border-gray-50 last:border-0 sm:grid-cols-2 sm:gap-4">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
      <p className="break-words text-sm text-gray-800 font-medium">{value}</p>
    </div>
  );
}

function SectionCard({ title, icon, data }: { title: string; icon: string; data?: Record<string, string> }) {
  if (!data || Object.keys(data).length === 0) return null;
  const entries = Object.entries(data).filter(([, v]) => !!v);
  if (entries.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center gap-2.5">
        <span className="text-base">{icon}</span>
        <p className="font-bold text-gray-800 text-sm">{title}</p>
        <span className="ml-auto text-xs text-gray-400">{entries.length} fields</span>
      </div>
      <div className="divide-y divide-gray-50 px-5">
        {entries.map(([k, v]) => <InfoRow key={k} label={humanizeKey(k)} value={v} />)}
      </div>
    </div>
  );
}

export default function AdminAppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [app, setApp]             = useState<AppData | null>(null);
  const [status, setStatus]       = useState<Status>("submitted");
  const [note, setNote]           = useState("");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [toast, setToast]           = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    adminApi.getApplication(id)
      .then((data) => {
        const a = data as AppData;
        startTransition(() => {
          setApp(a);
          setStatus(a.status as Status);
          setNote(a.supplierNotes ?? "");
        });
      })
      .catch(() => router.push("/admin/applications"));
  }, [id, router]);

  if (!app) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg className="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await adminApi.updateApplication(id, {
        status,
        supplierNotes: note || undefined,
      }) as AppData;
      setApp({ ...app, ...updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      showToast("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteApplication(id);
      router.push("/admin/applications");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to delete application");
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const timelineEvents = [
    {
      id: "submitted",
      title: "Application Submitted",
      description: `${app.userName} submitted their ${app.visaName} application via ${app.supplierName}.`,
      timestamp: app.submittedAt,
      status: "submitted" as TimelineStatus,
      actor: app.userName,
    },
    ...(app.status !== "submitted"
      ? [{
          id: "status-change",
          title: `Status Updated to ${S_CFG[app.status as Status]?.label ?? app.status}`,
          description: app.supplierNotes ? `Admin note: "${app.supplierNotes}"` : "Status updated by admin.",
          timestamp: app.updatedAt,
          status: app.status as TimelineStatus,
          actor: "Admin",
        }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold">{toast}</div>}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link href="/admin/applications" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-2xl">{getFlag(app.countryCode)}</span>
              <h1 className="text-xl font-black text-gray-900 truncate">{app.visaName}</h1>
              <StatusBadge status={app.status} size="md" />
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{app.userName} · {app.userEmail} · ID: {app.id}</p>
          </div>
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-3 sm:flex sm:items-center sm:flex-shrink-0">
          <Link href={`/admin/users/${app.userId}`} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            👤 User Profile
          </Link>
          <Link href={`/admin/payments/${app.id}`} className="px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
            💳 Payment
          </Link>
          <button onClick={() => setDeleteOpen(true)} className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Tabs */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={["flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition-all",
                  activeTab === tab.id ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"].join(" ")}>
                <span className="text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-col gap-4 mb-5 sm:flex-row sm:items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-white text-xl font-black flex-shrink-0">
                    {app.userName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">{app.userName}</h2>
                    <p className="text-sm text-gray-500">{app.userEmail}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Visa",         value: app.visaName },
                    { label: "Country",      value: app.countryName },
                    { label: "Supplier",     value: app.supplierName },
                    { label: "Submitted",    value: formatDate(app.submittedAt) },
                    { label: "Last Updated", value: formatDate(app.updatedAt) },
                    { label: "Amount Paid",  value: `$${app.totalPaid}` },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">{item.label}</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <SectionCard title="Personal Information" icon="👤" data={app.personal} />
              <SectionCard title="Passport Details" icon="🛂" data={app.passport} />
            </div>
          )}

          {activeTab === "formdata" && (
            <div className="space-y-4">
              <SectionCard title="Personal Information" icon="👤" data={app.personal} />
              <SectionCard title="Passport Details"     icon="🛂" data={app.passport} />
              <SectionCard title="Travel Plans"         icon="✈️" data={app.travel} />
              <SectionCard title="Supporting Documents" icon="📎" data={app.documents} />
              {/* Render custom admin-form sections stored in `other` */}
              {app.other && Object.entries(app.other)
                .filter(([key]) => key !== "_raw")
                .map(([sectionTitle, sectionData]) => (
                  typeof sectionData === "object" && sectionData !== null ? (
                    <SectionCard
                      key={sectionTitle}
                      title={sectionTitle}
                      icon="📋"
                      data={Object.fromEntries(
                        Object.entries(sectionData as Record<string, unknown>)
                          .filter(([, v]) => v !== null && v !== undefined)
                          .map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])
                      )}
                    />
                  ) : null
                ))
              }
              {!app.personal && !app.passport && !app.travel && (!app.other || Object.keys(app.other).filter(k => k !== "_raw").length === 0) && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-4xl mb-3">📝</p>
                  <p className="text-gray-500 font-semibold">No form data found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-6">Application Timeline</h3>
              <Timeline events={timelineEvents} />
            </div>
          )}

          {activeTab === "notes" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">Supplier Notes</h3>
              {app.referenceNumber && (
                <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">Reference Number</p>
                  <p className="text-sm font-mono font-bold text-indigo-800 mt-0.5">{app.referenceNumber}</p>
                </div>
              )}
              {app.supplierNotes ? (
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">{app.supplierNotes}</div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-2xl mb-2">💬</p>
                  <p className="text-sm text-gray-400">No notes added yet. Add a note in the Actions panel.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-white/70 font-semibold">Amount Paid</p>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">Confirmed</span>
            </div>
            <p className="text-4xl font-black mb-1">${app.totalPaid}</p>
            <p className="text-xs text-white/60">via {app.supplierName}</p>
            <div className="mt-4 pt-4 border-t border-white/20 space-y-1 text-xs text-white/70">
              <div className="flex justify-between"><span>Submitted</span><span className="font-semibold text-white">{formatDate(app.submittedAt)}</span></div>
              <div className="flex justify-between"><span>Updated</span><span className="font-semibold text-white">{formatDate(app.updatedAt)}</span></div>
            </div>
            <Link href={`/admin/payments/${app.id}`} className="mt-4 block text-center text-xs font-bold bg-white/20 hover:bg-white/30 py-2 rounded-xl transition-colors">
              View Payment Receipt →
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="font-bold text-gray-800 mb-4 text-sm">Admin Actions</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(Object.entries(S_CFG) as [Status, typeof S_CFG[Status]][]).map(([v, c]) => (
                    <button key={v} onClick={() => setStatus(v)}
                      className={["py-2.5 px-2 rounded-xl text-xs font-bold border-2 transition-all",
                        status === v ? `${c.bg} ${c.text} ${c.border} ring-2 ${c.ring} ring-offset-1` : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"].join(" ")}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Message to User (optional)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                  placeholder="This note will be sent as a notification to the user…"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none text-gray-700 placeholder-gray-300" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>Saving…</>
                ) : saved ? "✅ Saved & Notified!" : "Save & Notify User"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="font-bold text-gray-800 text-sm mb-3">Application Info</p>
            <div className="space-y-2 text-xs">
              {[
                { label: "Application ID", value: app.id,          mono: true },
                { label: "User ID",        value: app.userId,       mono: true },
                { label: "Supplier",       value: app.supplierName, mono: false },
                { label: "Submitted",      value: formatDateTime(app.submittedAt), mono: false },
                { label: "Last Updated",   value: formatDateTime(app.updatedAt),   mono: false },
              ].map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-2">
                  <span className="text-gray-400 flex-shrink-0">{row.label}</span>
                  <span className={["text-gray-700 text-right break-all", row.mono ? "font-mono" : "font-semibold"].join(" ")}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <h2 className="text-lg font-black text-gray-900 mb-1">Delete Application?</h2>
            <p className="text-sm text-gray-500 mb-1"><strong>{app.visaName}</strong> — {app.userName}</p>
            <p className="text-xs text-gray-400 mb-6">This permanently removes the application and cannot be undone.</p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70">
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button onClick={() => setDeleteOpen(false)}
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
