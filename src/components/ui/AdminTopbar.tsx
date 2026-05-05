"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, startTransition } from "react";

interface AdminNotification {
  id: string; title: string; message: string; type: string;
  createdAt: string; read: boolean; href?: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin", dashboard: "Dashboard", applications: "Applications",
  payments: "Payments", users: "Users", suppliers: "Suppliers",
  visas: "Visa Types", countries: "Countries", forms: "Form Builder",
  notifications: "Notifications", support: "Support Tickets",
  settings: "Settings", new: "New",
};

function buildCrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let href = "";
  for (const part of parts) {
    href += `/${part}`;
    crumbs.push({ label: SEGMENT_LABELS[part] ?? decodeURIComponent(part), href });
  }
  return crumbs;
}

function NotificationBell() {
  const [count, setCount]       = useState(0);
  const [open, setOpen]         = useState(false);
  const [notifs, setNotifs]     = useState<AdminNotification[]>([]);
  const [loading, setLoading]   = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/notifications?limit=10", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return;
        const list = (json.data.notifications ?? []) as AdminNotification[];
        setNotifs(list);
        setCount(list.filter(n => !n.read).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(o => !o); if (!open) load(); }}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-100"
        aria-label="Notifications"
      >
        <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5 text-gray-500">
          <path d="M10 2.5A5.5 5.5 0 004.5 8v4l-1.5 2h14l-1.5-2V8A5.5 5.5 0 0010 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M8 14.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="fixed left-3 right-3 top-14 z-40 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-scale-in origin-top-right sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-80">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-gray-900 text-sm" style={{ fontFamily: "var(--font-display)" }}>
                Notifications
              </p>
              <div className="flex items-center gap-2">
                {count > 0 && <span className="text-xs text-indigo-600 font-semibold">{count} unread</span>}
                <Link href="/admin/notifications" onClick={() => setOpen(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  See all →
                </Link>
              </div>
            </div>
            {loading ? (
              <div className="py-6 text-center">
                <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : notifs.length === 0 ? (
              <div className="py-10 text-center">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {notifs.map(n => (
                  <div key={n.id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? "bg-indigo-50/30" : ""}`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${!n.read ? "bg-indigo-500" : "bg-transparent"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${!n.read ? "text-gray-900" : "text-gray-600"}`}>{n.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{n.message}</p>
                        <p className="text-[10px] text-gray-300 mt-0.5">
                          {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatsTicker() {
  const [stats, setStats] = useState({ total: 0, pending: 0 });
  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return;
        startTransition(() => setStats({ total: json.data.total ?? 0, pending: json.data.submitted ?? 0 }));
      })
      .catch(() => {});
  }, []);
  if (!stats.total) return null;
  return (
    <div className="hidden lg:flex items-center gap-4 text-xs text-gray-400">
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        <span className="font-semibold text-gray-600">{stats.total.toLocaleString()}</span> apps
      </span>
      {stats.pending > 0 && (
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold text-amber-600">{stats.pending}</span> pending
        </span>
      )}
    </div>
  );
}

interface AdminTopbarProps {
  onCommandPaletteOpen: () => void;
  onMobileMenuToggle?: () => void;
}

export function AdminTopbar({ onCommandPaletteOpen, onMobileMenuToggle }: AdminTopbarProps) {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); onCommandPaletteOpen(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCommandPaletteOpen]);

  return (
    <header className="h-14 bg-white flex items-center justify-between px-3 sm:px-5 flex-shrink-0 sticky top-0 z-20"
      style={{ borderBottom: "1px solid #e9eaec" }}>

      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button onClick={onMobileMenuToggle}
          className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm min-w-0 max-w-[calc(100vw-8.75rem)] overflow-hidden sm:max-w-none">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                {i > 0 && (
                  <svg viewBox="0 0 20 20" fill="none" className="w-3 h-3 text-gray-300 flex-shrink-0">
                    <path d="M7 5l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {isLast ? (
                  <span className="font-semibold text-gray-800 truncate">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-gray-400 hover:text-gray-600 transition-colors truncate">
                    {crumb.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <StatsTicker />

        <button onClick={onCommandPaletteOpen}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-400 font-medium transition-colors hover:bg-gray-100"
          style={{ border: "1px solid #e9eaec" }}>
          <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M15 15l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Search…
          <kbd className="ml-1 px-1 py-0.5 bg-gray-100 rounded text-[10px] border border-gray-200 font-bold text-gray-300">⌘K</kbd>
        </button>

        <NotificationBell />

        <Link
          href="/admin/dashboard"
          aria-label="Go to admin dashboard"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", fontFamily: "var(--font-display)" }}
        >
          A
        </Link>
      </div>
    </header>
  );
}

export default AdminTopbar;
