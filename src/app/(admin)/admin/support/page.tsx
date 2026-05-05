"use client";
import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api-client";

interface Ticket {
  id: string;
  userName: string;
  email: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  replies?: Array<{
    id: string;
    message: string;
    createdAt: string;
  }>;
}

const PRIORITY_CFG = {
  low:    { bg: "bg-gray-100",  color: "text-gray-600"  },
  medium: { bg: "bg-amber-100", color: "text-amber-700" },
  high:   { bg: "bg-red-100",   color: "text-red-700"   },
  urgent: { bg: "bg-rose-100",  color: "text-rose-700"  },
};
const STATUS_CFG = {
  open:        { bg: "bg-blue-100",  color: "text-blue-700"  },
  in_progress: { bg: "bg-amber-100", color: "text-amber-700" },
  resolved:    { bg: "bg-green-100", color: "text-green-700" },
  closed:      { bg: "bg-gray-100",  color: "text-gray-700"  },
};

export default function AdminSupportPage() {
  const [tickets, setTickets]   = useState<Ticket[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [filter, setFilter]     = useState<"all" | Ticket["status"]>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast]       = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchTickets = useCallback(() => {
    setLoading(true);
    adminApi.getTickets()
      .then((data) => {
        const payload = data as Ticket[] | { tickets?: Ticket[] };
        setTickets(Array.isArray(payload) ? payload : (payload.tickets ?? []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const updateTicket = async (id: string, patch: Partial<Ticket> & { reply?: string }) => {
    setSaving(true);
    try {
      const updated = (await adminApi.updateTicket(id, patch)) as Ticket;
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      if (selected?.id === id) setSelected(updated);
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleDeleteTicket = async (id: string) => {
    setDeleting(true);
    try {
      await adminApi.deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      if (selected?.id === id) setSelected(null);
      setDeleteId(null);
      showToast("🗑️ Ticket deleted");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to delete");
      setDeleteId(null);
    } finally { setDeleting(false); }
  };

  const handleReply = async (id: string) => {
    if (!reply.trim()) return;
    await updateTicket(id, { reply, status: "resolved" });
    setReply("");
  };

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);
  const counts = {
    all:           tickets.length,
    open:          tickets.filter((t) => t.status === "open").length,
    in_progress:   tickets.filter((t) => t.status === "in_progress").length,
    resolved:      tickets.filter((t) => t.status === "resolved").length,
    closed:        tickets.filter((t) => t.status === "closed").length,
  };

  return (
    <div>
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold">{toast}</div>}

      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Support Tickets</h1>
        <p className="text-gray-500 text-sm mt-0.5">{counts.open} open · {tickets.length} total</p>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {(["all", "open", "in_progress", "resolved", "closed"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter === s ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {s.replace("_", " ")} ({counts[s]})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Ticket list */}
        <div className="space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-gray-400 text-sm">No tickets in this category</p>
            </div>
          ) : (
            filtered.map((t) => {
              const pcfg = PRIORITY_CFG[t.priority];
              const scfg = STATUS_CFG[t.status];
              return (
                <div key={t.id}
                  className={`bg-white rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md ${selected?.id === t.id ? "border-indigo-400 ring-2 ring-indigo-200" : "border-gray-200"}`}>
                  {/* clickable area */}
                  <div className="cursor-pointer" onClick={() => { setSelected(t); setReply(""); }}>
                    <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-start sm:justify-between">
                      <p className="font-bold text-gray-900 text-sm">{t.subject}</p>
                      <div className="flex gap-1.5 flex-wrap sm:flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${pcfg.bg} ${pcfg.color}`}>{t.priority}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${scfg.bg} ${scfg.color}`}>{t.status}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{t.message}</p>
                    <div className="flex flex-col gap-1 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                      <span>{t.userName} · {t.email}</span>
                      <span>{new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    </div>
                  </div>
                  {/* Delete button */}
                  <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(t.id); }}
                      className="text-xs text-red-400 hover:text-red-600 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 lg:sticky lg:top-8">
            <div className="flex items-start justify-between mb-1">
              <p className="font-black text-gray-900">{selected.subject}</p>
              <button onClick={() => setDeleteId(selected.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors flex-shrink-0 ml-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              {selected.userName} · {selected.email} · {new Date(selected.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">{selected.message}</p>
            </div>
            {(selected.replies?.length ?? 0) > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-indigo-600 mb-2">Replies</p>
                <div className="space-y-2">
                  {selected.replies?.map((ticketReply) => (
                    <div key={ticketReply.id}>
                      <p className="text-sm text-indigo-800">{ticketReply.message}</p>
                      <p className="mt-1 text-[11px] text-indigo-500">
                        {new Date(ticketReply.createdAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                {(["open", "in_progress", "resolved", "closed"] as const).map((s) => (
                  <button key={s} onClick={() => updateTicket(selected.id, { status: s })} disabled={saving}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${selected.status === s ? `${STATUS_CFG[s].bg} ${STATUS_CFG[s].color} ring-2 ring-offset-1` : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3}
                placeholder="Type your reply to the user..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none" />
              <button onClick={() => handleReply(selected.id)} disabled={!reply.trim() || saving}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                {saving ? "Sending..." : "Send Reply & Mark Resolved"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-center p-12">
            <div><p className="text-3xl mb-2">💬</p><p className="text-sm text-gray-400">Select a ticket to view and reply</p></div>
          </div>
        )}
      </div>

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 text-center">
            <p className="text-3xl mb-3">⚠️</p>
            <h2 className="font-black text-gray-900 mb-1">Delete Ticket?</h2>
            <p className="text-sm text-gray-500 mb-6">This permanently removes the support ticket and cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDeleteTicket(deleteId)} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70">
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button onClick={() => setDeleteId(null)}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
