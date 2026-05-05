"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/ui";

const PAGE_TITLES: Record<string, string> = {
  "/user/dashboard": "Dashboard",
  "/user/applications": "My Applications",
  "/user/applications/new": "New Application",
  "/user/documents": "Documents",
  "/user/notifications": "Notifications",
  "/user/billing": "Billing",
  "/user/billing/history": "Payment History",
  "/user/support": "Support",
  "/user/profile": "Profile",
};

// SVG icon replacements for emoji (screen readers announce full unicode names for emoji)
const ProfileIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
    <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const AppsIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
    <path d="M4 6h12M4 10h8M4 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="2" y="2" width="16" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const DocsIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
    <path d="M11 2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M11 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const BillingIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
    <rect x="1.5" y="5" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1.5 8.5h17" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const SignOutIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
    <path d="M13 15l4-5-4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 5H4a1 1 0 00-1 1v8a1 1 0 001 1h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const DROPDOWN_ITEMS = [
  { label: "My Profile",    href: "/user/profile",       Icon: ProfileIcon },
  { label: "Applications",  href: "/user/applications",  Icon: AppsIcon },
  { label: "Documents",     href: "/user/documents",     Icon: DocsIcon },
  { label: "Billing",       href: "/user/billing",       Icon: BillingIcon },
];

export default function DashboardTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const title = Object.entries(PAGE_TITLES).find(
    ([key]) => pathname.startsWith(key) && (key === pathname || pathname[key.length] === "/"),
  )?.[1] ?? "Dashboard";

  // Click-outside + Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") { setDropdownOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", onEsc); };
  }, [dropdownOpen]);

  const handleLogout = () => { logout(); router.push("/login"); };
  const initials = getInitials(user?.name);

  return (
    <header className="bg-white border-b border-[var(--user-border)] sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--user-hover)] transition-colors"
            aria-label="Open sidebar menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--user-avatar-from), var(--user-avatar-to))" }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="1.5"/>
                <path d="M2.5 10h15" stroke="white" strokeWidth="1.3"/>
              </svg>
            </div>
            <span className="font-bold text-[var(--user-text)] text-lg hidden sm:block tracking-tight" style={{ fontFamily: "var(--font-display)" }}>VisaHub</span>
          </Link>

          <div className="hidden lg:flex items-center gap-3">
            <span className="text-[var(--user-border-strong)]" aria-hidden="true">|</span>
            <h1 className="text-sm font-semibold text-[var(--user-text-muted)]">{title}</h1>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link
            href="/countries"
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--user-avatar-from), var(--user-avatar-to))" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Application
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              ref={triggerRef}
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-[var(--user-hover)] transition-colors"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-label="Account menu"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, var(--user-avatar-from), var(--user-avatar-to))" }}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-[var(--user-text)] leading-tight">{user?.name ?? "User"}</p>
                <p className="text-xs text-[var(--user-text-soft)] leading-tight">{user?.email}</p>
              </div>
              <svg className="w-4 h-4 text-[var(--user-text-soft)] hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-[var(--user-border)] rounded-xl shadow-xl py-1.5 z-50">
                <div className="px-3 py-2 border-b border-[var(--user-border)] mb-1">
                  <p className="text-xs text-[var(--user-text-soft)]">Signed in as</p>
                  <p className="text-sm font-semibold text-[var(--user-text)] truncate">{user?.email}</p>
                </div>
                {DROPDOWN_ITEMS.map(({ label, href, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--user-text)] hover:bg-[var(--user-hover)] transition-colors"
                  >
                    <Icon />
                    {label}
                  </Link>
                ))}
                <div className="border-t border-[var(--user-border)] mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <SignOutIcon />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
