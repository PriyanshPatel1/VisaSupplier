"use client";
import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api-client";

interface Notif {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

const TYPE_COLORS: Record<string, string> = {
  info:    "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  error:   "bg-red-100 text-red-700",
};
const TYPE_ICONS: Record<string, string> = {
  info: "ℹ️", success: "✅", warning: "⚠️", error: "❌",
};

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  const d = Math.floor(h / 24);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

export default function AdminNotificationsPage() {
  const [tab, setTab] = useState<"send" | "history">("send");

  // Send form
  const [userIds, setUserIds]       = useState<{ id: string; name: string; email: string }[]>([]);
  const [target, setTarget]         = useState<"all" | "specific">("all");
  const [selectedUser, setSelectedUser] = useState("");
  const [title, setTitle]           = useState("");
  const [message, setMessage]       = useState("");
  const [type, setType]             = useState<"info" | "success" | "warning" | "error">("info");
  const [actionUrl, setActionUrl]   = useState("");
  const [sending, setSending]       = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  // History
  const [notifs, setNotifs]         = useState<Notif[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    adminApi.getUsers()
      .then((data) => {
        const users = data as { id: string; name: string; email: string }[];
        setUserIds(users.map((u) => ({ id: u.id, name: u.name, email: u.email })));
      })
      .catch(() => {});
  }, []);

  const fetchHistory = useCallback(() => {
    setLoadingHistory(true);
    adminApi.getNotifications({ limit: "100" })
      .then((data) => {
        const d = data as { notifications: Notif[] };
        setNotifs(d.notifications ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    if (tab === "history") fetchHistory();
  }, [tab, fetchHistory]);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    if (target === "specific" && !selectedUser) return;
    setSending(true);
    try {
      const payload: Record<string, unknown> = { title, message, type, actionUrl: actionUrl || undefined };
      if (target === "specific") payload.userId = selectedUser;
      const result = await adminApi.sendNotification(payload);
      const count = (result as Record<string, unknown>)?.sent as number ?? 1;
      setSendResult(target === "all" ? `Sent to ${count} users` : "Sent to 1 user");
      setTitle(""); setMessage(""); setActionUrl("");
      setTimeout(() => setSendResult(null), 4000);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to send");
    } finally { setSending(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await adminApi.deleteNotification(id);
      setNotifs((prev) => prev.filter((n) => n.id !== id));
      setDeleteId(null);
      showToast("🗑️ Notification deleted");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to delete");
      setDeleteId(null);
    } finally { setDeleting(false); }
  };

  const handleMarkRead = async (id: string, read: boolean) => {
    try {
      await adminApi.updateNotification(id, { read });
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read } : n));
    } catch { /* ignore */ }
  };

  return (
    <div>
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold">{toast}</div>}

      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-0.5">Send and manage user notifications</p>
        </div>
        <div className="flex w-full bg-gray-100 p-1 rounded-xl gap-1 sm:w-auto">
          {(["send", "history"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all sm:flex-none ${tab === t ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {t === "send" ? "📤 Send" : "📋 History"}
            </button>
          ))}
        </div>
      </div>

      {tab === "send" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compose */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <p className="font-bold text-gray-900 mb-5">Compose Notification</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Send To</label>
                <div className="flex flex-col gap-2 mb-2 sm:flex-row">
                  <button onClick={() => setTarget("all")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${target === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    All Users ({userIds.length})
                  </button>
                  <button onClick={() => setTarget("specific")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${target === "specific" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    Specific User
                  </button>
                </div>
                {target === "specific" && (
                  <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                    <option value="">Select user...</option>
                    {userIds.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Type</label>
                <div className="flex gap-2 flex-wrap">
                  {(["info", "success", "warning", "error"] as const).map((t) => (
                    <button key={t} onClick={() => setType(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${type === t ? `${TYPE_COLORS[t]} ring-2 ring-offset-1` : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {TYPE_ICONS[t]} {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Title <span className="text-red-400">*</span></label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Message <span className="text-red-400">*</span></label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Notification message..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Action URL (optional)</label>
                <input type="text" value={actionUrl} onChange={(e) => setActionUrl(e.target.value)} placeholder="/user/applications"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
              </div>

              <button onClick={handleSend}
                disabled={!title.trim() || !message.trim() || (target === "specific" && !selectedUser) || sending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending…</>
                ) : sendResult ? `✅ ${sendResult}` : "🔔 Send Notification"}
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <p className="font-bold text-gray-900 mb-4">Quick Tips</p>
              <ul className="space-y-3 text-sm text-gray-500">
                {[
                  "Use **info** for general updates",
                  "Use **success** for approvals or completions",
                  "Use **warning** for important alerts",
                  "Use **error** for rejections or failures",
                  "Add an Action URL to deep-link users to a page",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-sm text-indigo-700">
              <p className="font-bold mb-1">📋 View History</p>
              <p>Switch to the <strong>History</strong> tab to see all sent notifications, mark them as read, or delete them.</p>
            </div>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{notifs.length} notification{notifs.length !== 1 ? "s" : ""} · {notifs.filter((n) => !n.read).length} unread</p>
            <button onClick={fetchHistory} className="text-xs text-indigo-600 font-semibold hover:underline">↺ Refresh</button>
          </div>

          {loadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse h-20" />)}
            </div>
          ) : notifs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500 font-semibold">No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifs.map((n) => (
                <div key={n.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4 transition-all sm:flex-row sm:items-start ${!n.read ? "border-indigo-200 bg-indigo-50/30" : "border-gray-100"}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${TYPE_COLORS[n.type]?.split(" ")[0] ?? "bg-gray-100"}`}>
                    {TYPE_ICONS[n.type] ?? "ℹ️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-2 mb-0.5 sm:flex-row sm:items-start sm:justify-between">
                      <p className="font-bold text-gray-900 text-sm truncate">{n.title}</p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[n.type] ?? "bg-gray-100 text-gray-600"}`}>{n.type}</span>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400 flex-wrap">
                      <span>To: <span className="font-semibold text-gray-600">{n.user.name}</span></span>
                      <span>·</span>
                      <span>{timeAgo(n.createdAt)}</span>
                      {n.actionUrl && <><span>·</span><span className="font-mono text-indigo-500 truncate max-w-32">{n.actionUrl}</span></>}
                      {!n.read ? (
                        <button onClick={() => handleMarkRead(n.id, true)} className="text-indigo-500 hover:text-indigo-700 font-semibold sm:ml-auto">Mark read</button>
                      ) : (
                        <button onClick={() => handleMarkRead(n.id, false)} className="text-gray-400 hover:text-gray-600 font-semibold sm:ml-auto">Mark unread</button>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setDeleteId(n.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 text-center">
            <p className="text-3xl mb-3">🗑️</p>
            <h2 className="font-black text-gray-900 mb-1">Delete Notification?</h2>
            <p className="text-xs text-gray-400 mb-6">This permanently removes the notification. Cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} disabled={deleting}
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
