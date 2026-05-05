"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { notificationsApi } from "@/lib/api-client";
import type { StoredNotification } from "@/lib/store";

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day === 1) return "Yesterday";
  if (day < 30) return `${day}d ago`;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const TYPE_TONE: Record<StoredNotification["type"], string> = {
  success: "border-emerald-400/30 bg-emerald-500/12 text-emerald-200",
  info: "border-sky-400/30 bg-sky-500/12 text-sky-200",
  warning: "border-amber-400/30 bg-amber-500/12 text-amber-200",
  error: "border-rose-400/30 bg-rose-500/12 text-rose-200",
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<StoredNotification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!user?.id) return;
    notificationsApi
      .list()
      .then((data) => setItems((data as StoredNotification[]) ?? []))
      .catch(() => setItems([]));
  }, [user?.id]);

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  const visible = useMemo(() => {
    if (filter === "unread") return items.filter((item) => !item.read);
    return items;
  }, [filter, items]);

  const markRead = (id: string) => {
    notificationsApi
      .markRead(id)
      .then(() => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
      })
      .catch(() => {});
  };

  const markAllRead = () => {
    const unread = items.filter((item) => !item.read);
    Promise.all(unread.map((item) => notificationsApi.markRead(item.id)))
      .then(() => {
        setItems((prev) => prev.map((item) => ({ ...item, read: true })));
      })
      .catch(() => {});
  };

  const dismiss = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    notificationsApi.dismiss(id).catch(() => {
      notificationsApi
        .list()
        .then((data) => setItems((data as StoredNotification[]) ?? []))
        .catch(() => {});
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold user-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            Notifications
          </h1>
          <p className="text-sm user-text-muted">Latest updates about your applications and account.</p>
        </div>
        {unreadCount > 0 ? (
          <button type="button" onClick={markAllRead} className="user-outline-btn px-4 py-2 text-sm font-semibold">
            Mark all as read
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "unread"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
              filter === value
                ? "border-indigo-300/65 bg-indigo-500/24 text-white"
                : "border-indigo-300/24 user-text-muted"
            }`}
          >
            {value} · {value === "all" ? items.length : unreadCount}
          </button>
        ))}
      </div>

      <section className="user-panel rounded-2xl p-4">
        {visible.length === 0 ? (
          <div className="rounded-xl border border-indigo-300/18 bg-[#0b1430] p-8 text-center">
            <p className="text-base font-semibold user-text-primary">No notifications</p>
            <p className="mt-1 text-sm user-text-muted">You are all caught up.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((item) => (
              <article
                key={item.id}
                className={`rounded-xl border px-4 py-3 ${item.read ? "border-indigo-300/20 bg-[#0a1330]" : "border-indigo-300/35 bg-[#101a3b]"}`}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold user-text-primary">{item.title}</p>
                    <p className="mt-1 text-xs user-text-muted">{item.message}</p>
                  </div>
                  <div className="text-right">
                    {!item.read ? <span className="mb-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-400" /> : null}
                    <p className="text-[11px] user-text-soft">{timeAgo(item.createdAt)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded-full border px-2 py-0.5 font-semibold ${TYPE_TONE[item.type]}`}>{item.type}</span>
                  {item.actionUrl ? (
                    <Link href={item.actionUrl} onClick={() => markRead(item.id)} className="user-link-inline">
                      View details
                    </Link>
                  ) : null}
                  {!item.read ? (
                    <button type="button" onClick={() => markRead(item.id)} className="user-link-inline">
                      Mark as read
                    </button>
                  ) : null}
                  <button type="button" onClick={() => dismiss(item.id)} className="ml-auto user-link-inline hover:text-rose-400">
                    Dismiss
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
