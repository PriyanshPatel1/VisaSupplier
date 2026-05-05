"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { AdminTopbar } from "@/components/ui/AdminTopbar";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { ToastProvider } from "@/components/ui/ToastProvider";

/* ── SVG icon system ─────────────────────────────────────── */
const Icons = {
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
  payments: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <rect x="1.5" y="5" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M1.5 8.5h17" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 12.5h4M14 12.5h.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <circle cx="8" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M1.5 17c0-3.038 2.91-5.5 6.5-5.5s6.5 2.462 6.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M13.5 10.5a3 3 0 100-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 13.5c2.071.484 3.5 1.978 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  suppliers: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <path d="M3 9L10 2l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 8v9a1 1 0 001 1h8a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 18v-5h4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  visas: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <rect x="1.5" y="4" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="7" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11.5 8h5M11.5 10h4M11.5 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  countries: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M1.5 10h17M10 1.5a13.4 13.4 0 010 17M10 1.5a13.4 13.4 0 000 17" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  forms: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <rect x="2" y="2" width="16" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 7h8M6 10h5M6 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <path d="M10 2.5A5.5 5.5 0 004.5 8v4l-1.5 2h14l-1.5-2V8A5.5 5.5 0 0010 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 14.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  support: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <path d="M3 4.5A1.5 1.5 0 014.5 3h11A1.5 1.5 0 0117 4.5v8A1.5 1.5 0 0115.5 14H11l-3 3v-3H4.5A1.5 1.5 0 013 12.5v-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7 8h6M7 10.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M15.78 4.22l-1.42 1.42M5.64 14.36l-1.42 1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
      <path d="M13 15l4-5-4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 5H4a1 1 0 00-1 1v8a1 1 0 001 1h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5">
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M15 15l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

type NavItem =
  | { group: string; href?: undefined; icon?: undefined }
  | { href: string; label: string; icon: keyof typeof Icons; group?: undefined };

const NAV: NavItem[] = [
  { group: "Overview" },
  { href: "/admin/dashboard",     label: "Dashboard",       icon: "dashboard"      },
  { group: "Applications" },
  { href: "/admin/applications",  label: "Applications",    icon: "applications"   },
  { href: "/admin/payments",      label: "Payments",        icon: "payments"       },
  { group: "People" },
  { href: "/admin/users",         label: "Users",           icon: "users"          },
  { href: "/admin/suppliers",     label: "Suppliers",       icon: "suppliers"      },
  { group: "Catalog" },
  { href: "/admin/visas",         label: "Visa Types",      icon: "visas"          },
  { href: "/admin/countries",     label: "Countries",       icon: "countries"      },
  { group: "Tools" },
  { href: "/admin/forms",         label: "Form Builder",    icon: "forms"          },
  { href: "/admin/notifications", label: "Notifications",   icon: "notifications"  },
  { href: "/admin/support",       label: "Support Tickets", icon: "support"        },
  { href: "/admin/settings",      label: "Settings",        icon: "settings"       },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [paletteOpen,  setPaletteOpen]  = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  const openPalette  = useCallback(() => setPaletteOpen(true),  []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  if (pathname === "/admin/login") return <>{children}</>;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
  };

  return (
    <ToastProvider>
      <CommandPalette open={paletteOpen} onClose={closePalette} />

      <div className="min-h-screen flex" style={{ background: "#f4f5f7" }}>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto
            flex flex-col flex-shrink-0 w-[220px]
            transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          style={{ background: "var(--admin-bg)" }}
        >
          {/* Logo */}
          <div className="px-4 py-5 flex-shrink-0" style={{ borderBottom: "1px solid var(--admin-border)" }}>
            <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-xl transition-opacity hover:opacity-90">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5">
                  <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="1.5"/>
                  <path d="M2.5 10h15M10 2.5a10.9 10.9 0 000 15M10 2.5a10.9 10.9 0 010 15" stroke="white" strokeWidth="1.3"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                  VisaHub
                </p>
                <p className="text-[10px] font-medium" style={{ color: "var(--admin-text-muted)" }}>Admin Console</p>
              </div>
            </Link>
          </div>

          {/* Search */}
          <div className="px-3 pt-3 pb-1 flex-shrink-0">
            <button
              onClick={openPalette}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all"
              style={{
                background: "var(--admin-hover)",
                border: "1px solid var(--admin-border)",
                color: "var(--admin-text-muted)",
              }}
            >
              {Icons.search}
              <span className="flex-1 text-left">Search...</span>
              <kbd className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                style={{ background: "rgba(255,255,255,0.08)", color: "var(--admin-text-muted)" }}>
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5" style={{ scrollbarWidth: "none" }}>
            {NAV.map((item, i) => {
              if (!item.href) {
                return <p key={i} className="admin-nav-group">{item.group}</p>;
              }
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`admin-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="flex-shrink-0 opacity-80">{Icons[item.icon]}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

        {/* Footer */}
        <div className="px-3 pb-5 pt-3 flex-shrink-0" style={{ borderTop: "1px solid var(--admin-border)" }}>
            <Link href="/admin/dashboard" className="mb-1 flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:opacity-95"
              style={{ background: "var(--admin-hover)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                A
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">Administrator</p>
                <p className="text-[10px] truncate" style={{ color: "var(--admin-text-muted)" }}>admin@visahub.com</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="admin-nav-item w-full hover:!text-red-400"
              style={{ color: "var(--admin-text-muted)" }}
            >
              {Icons.logout}
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <AdminTopbar onCommandPaletteOpen={openPalette} onMobileMenuToggle={() => setSidebarOpen(s => !s)} />
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-7 py-5 sm:py-7 animate-fade-up">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
