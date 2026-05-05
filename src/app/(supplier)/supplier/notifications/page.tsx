"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supplierApi } from "@/lib/api-client";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  user?: { id: string; name: string; email: string } | null;
}

interface AppUser {
  id: string;
  name: string;
  email: string;
}

const TYPE_CFG: Record<string, { bg: string; color: string; icon: string }> = {
  info: { bg: "bg-blue-100", color: "text-blue-700", icon: "ℹ️" },
  success: { bg: "bg-green-100", color: "text-green-700", icon: "✅" },
  warning: { bg: "bg-amber-100", color: "text-amber-700", icon: "⚠️" },
  error: { bg: "bg-red-100", color: "text-red-700", icon: "❌" },
};

const DEFAULT_CFG = TYPE_CFG.info;

function getTypeCfg(type?: string | null) {
  if (!type) return DEFAULT_CFG;
  return TYPE_CFG[type] ?? DEFAULT_CFG;
}

function timeAgo(iso: string) {
  if (!iso) return "Unknown";
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600000);
  const d = Math.floor(ms / 86400000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

export default function SupplierNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Compose form
  const [composeOpen, setComposeOpen] = useState(false);
  const [toUser, setToUser] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "success" | "warning" | "error">(
    "info",
  );
  const [actionUrl, setActionUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNotifications = useCallback(() => {
    supplierApi
      .getNotifications()
      .then((data) => {
        const d = data as { notifications: Notification[] };
        setNotifications(d.notifications ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/supplier/profile", { credentials: "include" })
      .then((r) => {
        if (!r.ok) router.push("/supplier/login");
      })
      .catch(() => router.push("/supplier/login"));

    fetchNotifications();

    fetch("/api/supplier/applications", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        const apps: Record<string, unknown>[] = Array.isArray(json.data)
          ? json.data
          : [];
        const seen = new Set<string>();
        const uniqueUsers: AppUser[] = [];
        for (const app of apps) {
          const userId = typeof app.userId === "string" ? app.userId : "";
          const userName =
            typeof app.userName === "string" ? app.userName : "Unknown";
          const userEmail =
            typeof app.userEmail === "string" ? app.userEmail : "";
          if (userId && !seen.has(userId)) {
            seen.add(userId);
            uniqueUsers.push({ id: userId, name: userName, email: userEmail });
          }
        }
        setUsers(uniqueUsers);
      })
      .catch(() => {});
  }, [router, fetchNotifications]);

  const handleSend = async () => {
    setSendError(null);
    if (!toUser || !title.trim() || !message.trim()) {
      setSendError("Recipient, title, and message are required.");
      return;
    }
    setSending(true);
    try {
      await supplierApi.sendNotification({
        userId: toUser,
        title: title.trim(),
        message: message.trim(),
        type,
        actionUrl: actionUrl.trim() || undefined,
      });
      setComposeOpen(false);
      setTitle("");
      setMessage("");
      setToUser("");
      setActionUrl("");
      fetchNotifications();
      showToast("✅ Notification sent");
    } catch (e: unknown) {
      setSendError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await supplierApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast("🗑️ Notification removed");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold">
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {notifications.length} notification
            {notifications.length !== 1 ? "s" : ""} sent to your applicants
          </p>
        </div>
        <button
          onClick={() => {
            setComposeOpen(true);
            setSendError(null);
          }}
          className="px-4 py-2.5 bg-[#0f2d5a] hover:bg-[#0b2347] text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
        >
          🔔 Send Notification
        </button>
      </div>

      {/* Compose panel */}
      {composeOpen && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Compose Notification</h2>
            <button
              onClick={() => setComposeOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          </div>

          {sendError && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {sendError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                Recipient *
              </label>
              <select
                value={toUser}
                onChange={(e) => setToUser(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30"
              >
                <option value="">Select applicant…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                Type
              </label>
              <div className="flex gap-2 flex-wrap">
                {(["info", "success", "warning", "error"] as const).map((t) => {
                  const cfg = getTypeCfg(t);
                  return (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                        type === t
                          ? `${cfg.bg} ${cfg.color} ring-2 ring-offset-1`
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {cfg.icon} {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Your documents have been received"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Write your message to the applicant…"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30 resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                Action URL (optional)
              </label>
              <input
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="/user/applications/..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSend}
              disabled={sending || !toUser || !title.trim() || !message.trim()}
              className="flex-1 py-2.5 bg-[#0f2d5a] hover:bg-[#0b2347] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send Notification"}
            </button>
            <button
              onClick={() => setComposeOpen(false)}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notifications list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse h-24"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-500 font-medium">No notifications sent yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Send your first notification to an applicant above
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const cfg = getTypeCfg(n.type);
            const userName = n.user?.name ?? "Unknown User";
            const userEmail = n.user?.email ?? "—";
            return (
              <div
                key={n.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${cfg.bg}`}
                >
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {n.title ?? "Untitled"}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.color}`}
                    >
                      {n.type ?? "info"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {n.message ?? ""}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                    <span>
                      To:{" "}
                      <span className="font-semibold text-gray-600">
                        {userName}
                      </span>
                    </span>
                    <span>·</span>
                    <span>{userEmail}</span>
                    <span>·</span>
                    <span>{timeAgo(n.createdAt)}</span>
                    {n.actionUrl && (
                      <>
                        <span>·</span>
                        <span className="text-[#0f2d5a] font-mono truncate max-w-32">
                          {n.actionUrl}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(n.id)}
                  disabled={deleting === n.id}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors flex-shrink-0 disabled:opacity-50"
                  title="Delete"
                >
                  {deleting === n.id ? (
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
