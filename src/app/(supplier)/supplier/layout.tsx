"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const SupplierIcons = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  applications: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <path d="M4 6h12M4 10h8M4 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="2" y="2" width="16" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <path d="M10 2.5A5.5 5.5 0 004.5 8v4l-1.5 2h14l-1.5-2V8A5.5 5.5 0 0010 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 14.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  stats: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <path d="M3 16V10M7.5 16V6M12 16V9M16.5 16V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <path d="M13 15l4-5-4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 5H4a1 1 0 00-1 1v8a1 1 0 001 1h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

const NAV = [
  { href: "/supplier/dashboard",     label: "Dashboard",     icon: "dashboard"      },
  { href: "/supplier/applications",  label: "Applications",  icon: "applications"   },
  { href: "/supplier/notifications", label: "Notifications", icon: "notifications"  },
  { href: "/supplier/profile",       label: "My Profile",    icon: "profile"        },
] as const;

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [supplierName, setSupplierName] = useState<string | null>(null);
  const [appCount, setAppCount]         = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  useEffect(() => {
    fetch("/api/supplier/profile", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data?.name) setSupplierName(json.data.name);
        if (json?.data?.totalApplications !== undefined) setAppCount(json.data.totalApplications);
      })
      .catch(() => {});

    fetch("/api/supplier/stats", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(json => { if (json?.data?.submitted !== undefined) setPendingCount(json.data.submitted); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/supplier/login");
  };

  if (pathname === "/supplier/login") return <>{children}</>;

  const initials = supplierName
    ? supplierName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "SP";

  return (
    <div className="min-h-screen flex" style={{ background: "#f0f4f8" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto
          flex flex-col flex-shrink-0 w-[220px]
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: "var(--supplier-bg)" }}
      >
        {/* Logo */}
        <div className="px-4 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
              <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5">
                <path d="M3 10l7-7 7 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 8.5V17h4v-4h2v4h4V8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                VisaHub
              </p>
              <p className="text-[10px] font-medium" style={{ color: "rgba(186,230,253,0.5)" }}>
                Supplier Portal
              </p>
            </div>
          </div>
        </div>

        {/* Supplier info card */}
        <div className="px-3 pt-4 pb-2 flex-shrink-0">
          <div className="p-3 rounded-xl" style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.15)" }}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{supplierName ?? "Loading…"}</p>
                <p className="text-[10px]" style={{ color: "rgba(186,230,253,0.5)" }}>Supplier</p>
              </div>
            </div>
            {appCount !== null && (
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: "rgba(186,230,253,0.55)" }}>Total apps</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{appCount}</span>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-amber-900"
                      style={{ background: "#fbbf24" }}>
                      {pendingCount} new
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {NAV.map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/supplier/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`supplier-nav-item ${isActive ? "active" : ""}`}>
                <span className="flex-shrink-0 opacity-80">{SupplierIcons[item.icon]}</span>
                <span className="truncate">{item.label}</span>
                {item.href === "/supplier/applications" && pendingCount > 0 && !isActive && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full text-amber-900"
                    style={{ background: "#fbbf24" }}>
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 pt-3 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={handleLogout}
            className="supplier-nav-item w-full hover:!text-red-300 hover:!bg-red-500/10 transition-colors">
            {SupplierIcons.logout}
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-white flex items-center justify-between px-5 flex-shrink-0 sticky top-0 z-20"
          style={{ borderBottom: "1px solid #e9eaec" }}>
          <div className="flex items-center gap-3">
            {/* Mobile toggle */}
            <button onClick={() => setSidebarOpen(s => !s)}
              className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
              <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Page title from pathname */}
            <div>
              <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: "var(--font-display)" }}>
                {NAV.find(n => pathname === n.href || pathname.startsWith(n.href))?.label ?? "Supplier Portal"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {pendingCount > 0 && (
              <Link href="/supplier/applications"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 transition-colors"
                style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {pendingCount} pending review
              </Link>
            )}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}>
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-5 lg:px-7 py-7 animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
