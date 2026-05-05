"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useNotifications } from "@/hooks/use-notifications";
import { getInitials } from "@/lib/ui";

const Icons = {
  dashboard: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true"><rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
  applications: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true"><path d="M4 6h12M4 10h8M4 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="2" y="2" width="16" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
  documents: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true"><path d="M11 2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M11 2v6h6M7 12h6M7 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  notifications: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true"><path d="M10 2.5A5.5 5.5 0 004.5 8v4l-1.5 2h14l-1.5-2V8A5.5 5.5 0 0010 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 14.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5"/></svg>,
  billing: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true"><rect x="1.5" y="5" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M1.5 8.5h17" stroke="currentColor" strokeWidth="1.5"/><path d="M5 12.5h4M14 12.5h.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  support: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true"><path d="M3 4.5A1.5 1.5 0 014.5 3h11A1.5 1.5 0 0117 4.5v8A1.5 1.5 0 0115.5 14H11l-3 3v-3H4.5A1.5 1.5 0 013 12.5v-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  globe: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/><path d="M2.5 10h15M10 2.5a10.9 10.9 0 000 15M10 2.5a10.9 10.9 0 010 15" stroke="currentColor" strokeWidth="1.3"/></svg>,
  logout: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true"><path d="M13 15l4-5-4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 5H4a1 1 0 00-1 1v8a1 1 0 001 1h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  profile: <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
} as const;

type IconKey = keyof typeof Icons;

const NAV_ITEMS: { label: string; href: string; icon: IconKey }[] = [
  { label: "Dashboard",     href: "/user/dashboard",     icon: "dashboard"     },
  { label: "Applications",  href: "/user/applications",  icon: "applications"  },
  { label: "Documents",     href: "/user/documents",     icon: "documents"     },
  { label: "Notifications", href: "/user/notifications", icon: "notifications" },
  { label: "Billing",       href: "/user/billing",       icon: "billing"       },
  { label: "Support",       href: "/user/support",       icon: "support"       },
];

const QUICK_LINKS: { label: string; href: string; icon: IconKey }[] = [
  { label: "Browse Visas", href: "/countries", icon: "globe" },
];

export default function DashboardSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Reuse shared hook — no duplicate polling
  const { unreadCount } = useNotifications(!!user?.id);

  const handleLogout = async () => { await logout(); router.push("/"); };
  const initials = getInitials(user?.name);
  const isActive = (href: string) =>
    href === "/user/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex-shrink-0 border-b border-[var(--user-border)]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--user-avatar-from), var(--user-avatar-to))" }}
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
              <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="1.5"/>
              <path d="M2.5 10h15M10 2.5a10.9 10.9 0 000 15M10 2.5a10.9 10.9 0 010 15" stroke="white" strokeWidth="1.3"/>
            </svg>
          </div>
          <span className="font-bold text-[var(--user-text)] text-sm" style={{ fontFamily: "var(--font-display)" }}>
            Visa<span style={{ color: "var(--user-accent)" }}>Hub</span>
          </span>
        </Link>
      </div>

      {/* User card */}
      <div className="px-3 pt-4 pb-2 flex-shrink-0">
        <Link
          href="/user/profile"
          className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[var(--user-hover)] transition-colors group"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--user-avatar-from), var(--user-avatar-to))" }}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--user-text)] truncate">{user?.name ?? "Loading..."}</p>
            <p className="text-xs text-[var(--user-text-soft)] truncate">{user?.email}</p>
          </div>
          {Icons.profile}
        </Link>
      </div>

      {/* Apply CTA */}
      <div className="px-3 pb-2 flex-shrink-0">
        <Link
          href="/countries"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, var(--user-avatar-from), var(--user-avatar-to))" }}
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
            <path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Apply for Visa
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: "none" }} aria-label="Dashboard navigation">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const badge = item.href === "/user/notifications" && unreadCount > 0 ? unreadCount : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={
                active
                  ? { background: "var(--user-accent-soft)", color: "var(--user-accent-strong)" }
                  : { color: "var(--user-text-muted)" }
              }
            >
              <span className="flex-shrink-0" style={{ color: active ? "var(--user-accent)" : "var(--user-text-soft)" }}>
                {Icons[item.icon]}
              </span>
              <span className="flex-1">{item.label}</span>
              {badge && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: "var(--user-accent)" }} aria-label={`${badge} unread`}>
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-3 mt-2 border-t border-[var(--user-border)]">
          <p className="text-[10px] font-bold uppercase tracking-wider px-3 mb-1" style={{ color: "var(--user-text-soft)" }}>Quick Links</p>
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-[var(--user-hover)]"
              style={{ color: "var(--user-text-soft)" }}
            >
              <span>{Icons[item.icon]}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-3 flex-shrink-0 border-t border-[var(--user-border)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all hover:bg-red-50 hover:text-red-600"
          style={{ color: "var(--user-text-soft)" }}
        >
          {Icons.logout}
          Sign Out
        </button>
      </div>
    </div>
  );
}
