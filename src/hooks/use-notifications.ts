"use client";

import { useEffect, useState, useCallback } from "react";
import { notificationsApi } from "@/lib/api-client";
import type { StoredNotification } from "@/lib/store";

const POLL_INTERVAL = 30_000;

/**
 * Single shared notification polling hook.
 * Previously: navbar.tsx AND sidebar.tsx each ran independent 30s intervals,
 * causing 2× network calls per cycle. This hook is the single source of truth.
 */
export function useNotifications(enabled: boolean) {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);

  const load = useCallback(() => {
    if (!enabled) return;
    notificationsApi
      .list()
      .then((items) => setNotifications((items as StoredNotification[]) ?? []))
      .catch(() => {});
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    load();
    const id = window.setInterval(load, POLL_INTERVAL);
    return () => window.clearInterval(id);
  }, [enabled, load]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    notificationsApi.markRead(id).catch(() => load());
  }, [load]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markRead, reload: load };
}
