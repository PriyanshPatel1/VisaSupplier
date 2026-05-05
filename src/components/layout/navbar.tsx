"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  startTransition,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import ProfileDropdown from "@/components/auth/profile-dropdown";
import { useNotifications } from "@/hooks/use-notifications";
import { getInitials, timeAgo } from "@/lib/ui";

/* ─── constants ─────────────────────────────────────────────────────────── */

const HIDDEN_EXACT = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
]);
const HIDDEN_PREFIX = ["/admin", "/supplier", "/api"];

const MARKETING_LINKS = [
  { id: "destinations", label: "Destinations", href: "/countries" },
  {
    id: "visa-types",
    label: "Visa Types",
    href: "/#visa-types",
  },
  { id: "how-it-works", label: "How It Works", href: "/#how-it-works" },
  { id: "track", label: "Track", href: "/user/applications" },
  { id: "terms", label: "Terms", href: "/terms" },
];

/* ─── helpers ────────────────────────────────────────────────────────────── */

function isMarketingActive(pathname: string, href: string) {
  if (href.startsWith("/countries"))
    return pathname === "/countries" || pathname.startsWith("/country/");
  if (href.startsWith("/#")) return pathname === "/";
  return pathname === href;
}

/* ─── injected styles ────────────────────────────────────────────────────── */

const STYLES = `
  :root {
    --aw-white:          #ffffff;
    --aw-bg:             rgba(255,255,255,0.88);
    --aw-bg-scrolled:    rgba(255,255,255,0.97);
    --aw-border:         rgba(15,23,42,0.08);
    --aw-border-md:      rgba(15,23,42,0.13);
    --aw-border-strong:  rgba(15,23,42,0.2);
    --aw-text:           #0F172A;
    --aw-text-2:         #1E293B;
    --aw-text-muted:     #64748B;
    --aw-text-soft:      #94A3B8;
    --aw-blue:           #2563EB;
    --aw-blue-deep:      #1D4ED8;
    --aw-blue-light:     #3B82F6;
    --aw-blue-bg:        rgba(37,99,235,0.07);
    --aw-blue-border:    rgba(37,99,235,0.2);
    --aw-surface:        #F8FAFC;
    --aw-surface-2:      #F1F5F9;
    --aw-red:            #DC2626;
    --aw-red-bg:         rgba(220,38,38,0.05);
    --aw-red-border:     rgba(220,38,38,0.14);
    --aw-font-display:   var(--font-fraunces, Georgia, serif);
    --aw-font-ui:        var(--font-outfit, system-ui, sans-serif);
    --aw-pill:           9999px;
    --aw-ease:           cubic-bezier(0.16,1,0.3,1);
  }

  /* shell */
  .aw-nav {
    position: sticky; top: 0; z-index: 50;
    background: var(--aw-bg);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    border-bottom: 1px solid var(--aw-border);
    box-shadow: 0 1px 3px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.05);
    transition: background .3s ease, box-shadow .3s ease, border-color .3s ease;
  }
  .aw-nav.scrolled {
    background: var(--aw-bg-scrolled);
    border-bottom-color: var(--aw-border-md);
    box-shadow: 0 1px 0 rgba(15,23,42,0.05), 0 12px 40px rgba(15,23,42,0.09), 0 2px 8px rgba(15,23,42,0.04);
  }
  /* blue accent sweep bottom */
  .aw-nav::after {
    content:''; position:absolute; bottom:-1px; left:0; right:0; height:2px;
    background: linear-gradient(90deg, transparent 0%, var(--aw-blue-light) 30%, var(--aw-blue) 65%, transparent 100%);
    opacity:0; transition: opacity .35s ease; pointer-events:none;
  }
  .aw-nav.scrolled::after { opacity:.55; }

  /* row */
  .aw-row {
    display:flex; align-items:center; gap:1rem;
    height:68px; max-width:90rem; margin:0 auto; padding:0 1.5rem;
  }
  @media(min-width:1024px){ .aw-row{ padding:0 2.5rem; } }

  /* logo mark */
  .aw-logo-mark {
    width:40px; height:40px; border-radius:11px; flex-shrink:0;
    background: linear-gradient(145deg, var(--aw-blue-light) 0%, var(--aw-blue-deep) 100%);
    display:flex; align-items:center; justify-content:center;
    position:relative; overflow:hidden;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.18) inset, 0 4px 12px rgba(37,99,235,0.28), 0 1px 3px rgba(37,99,235,0.18);
    transition: box-shadow .22s ease, transform .2s ease;
  }
  .aw-logo-mark:hover { transform:translateY(-1px); box-shadow:0 0 0 1px rgba(255,255,255,0.22) inset, 0 8px 20px rgba(37,99,235,0.34), 0 2px 6px rgba(37,99,235,0.2); }
  .aw-logo-mark::before {
    content:''; position:absolute; inset:0; border-radius:inherit;
    background: linear-gradient(145deg,rgba(255,255,255,0.22) 0%,transparent 55%); pointer-events:none;
  }

  /* brand */
  .aw-brand-name {
    font-family: var(--aw-font-display); font-size:1.18rem; font-weight:700;
    color:var(--aw-text); letter-spacing:-0.03em; line-height:1.1; display:block;
  }
  .aw-brand-sub {
    font-family:var(--aw-font-ui); font-size:9.5px; font-weight:500;
    letter-spacing:.13em; text-transform:uppercase; color:var(--aw-text-soft);
    display:block; margin-top:2px;
  }
  @media(max-width:639px){ .aw-brand-sub{ display:none; } }

  /* links wrap */
  .aw-links-wrap {
    display:flex; align-items:center; gap:1px; padding:4px;
    border-radius:var(--aw-pill); background:var(--aw-surface); border:1px solid var(--aw-border);
  }

  /* nav link */
  .aw-link {
    font-family:var(--aw-font-ui); font-size:13.5px; font-weight:500;
    color:var(--aw-text-muted); padding:6.5px 15px; border-radius:var(--aw-pill);
    text-decoration:none; white-space:nowrap; letter-spacing:-0.01em;
    transition: color .16s ease, background .16s ease;
  }
  .aw-link:hover { color:var(--aw-text-2); background:var(--aw-white); }
  .aw-link.active {
    color:var(--aw-blue); background:var(--aw-white); font-weight:600;
    box-shadow: 0 1px 4px rgba(15,23,42,0.08), 0 0 0 1px var(--aw-border);
  }

  /* ghost btn */
  .aw-btn-ghost {
    font-family:var(--aw-font-ui); font-size:13.5px; font-weight:500;
    color:var(--aw-text-muted); padding:8px 18px; border-radius:var(--aw-pill);
    border:1px solid var(--aw-border-md); background:transparent;
    cursor:pointer; text-decoration:none; display:inline-flex; align-items:center;
    justify-content:center; letter-spacing:-0.01em; transition:all .18s ease; white-space:nowrap;
  }
  .aw-btn-ghost:hover { color:var(--aw-text); border-color:var(--aw-border-strong); background:var(--aw-surface); }

  /* primary */
  .aw-btn-primary {
    font-family:var(--aw-font-ui); font-size:13.5px; font-weight:600;
    color:#fff; padding:8px 20px; border-radius:var(--aw-pill); border:none;
    background: linear-gradient(135deg, var(--aw-blue-light) 0%, var(--aw-blue-deep) 100%);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.14) inset, 0 4px 14px rgba(37,99,235,0.3), 0 1px 3px rgba(37,99,235,0.18);
    cursor:pointer; text-decoration:none; display:inline-flex; align-items:center;
    justify-content:center; letter-spacing:-0.01em;
    transition: transform .2s ease, box-shadow .2s ease; white-space:nowrap;
    position:relative; overflow:hidden;
  }
  .aw-btn-primary::before {
    content:''; position:absolute; inset:0; border-radius:inherit;
    background:linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 55%); pointer-events:none;
  }
  .aw-btn-primary:hover { transform:translateY(-1px); box-shadow:0 0 0 1px rgba(255,255,255,0.18) inset, 0 8px 22px rgba(37,99,235,0.36), 0 2px 6px rgba(37,99,235,0.2); }
  .aw-btn-primary:active { transform:translateY(0); }

  /* icon btn */
  .aw-icon-btn {
    width:38px; height:38px; border-radius:50%;
    border:1px solid var(--aw-border-md); background:var(--aw-white);
    color:var(--aw-text-muted); display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all .18s ease; position:relative; flex-shrink:0;
    box-shadow:0 1px 3px rgba(15,23,42,0.06);
  }
  .aw-icon-btn:hover { color:var(--aw-text); border-color:var(--aw-border-strong); background:var(--aw-surface); box-shadow:0 2px 8px rgba(15,23,42,0.09); }

  /* badge */
  .aw-badge {
    position:absolute; top:-3px; right:-3px;
    min-width:16px; height:16px; padding:0 4px;
    border-radius:var(--aw-pill); background:var(--aw-red); color:#fff;
    font-family:var(--aw-font-ui); font-size:9px; font-weight:700;
    display:flex; align-items:center; justify-content:center;
    border:2px solid var(--aw-white); box-shadow:0 2px 5px rgba(220,38,38,0.3);
  }

  /* notif panel */
  .aw-notif-panel {
    position:absolute; right:0; top:calc(100% + 10px);
    width:min(22rem, calc(100vw - 1.5rem));
    background:var(--aw-white); border:1px solid var(--aw-border-md);
    border-radius:20px; padding:16px;
    box-shadow:0 4px 6px rgba(15,23,42,0.03), 0 20px 60px rgba(15,23,42,0.12), 0 8px 24px rgba(15,23,42,0.06);
    animation:aw-drop .22s var(--aw-ease);
  }

  /* notif card */
  .aw-notif-card {
    border-radius:12px; padding:12px 13px;
    border:1px solid var(--aw-border); background:var(--aw-surface);
    position:relative; overflow:hidden;
  }
  .aw-notif-card+.aw-notif-card{ margin-top:7px; }
  .aw-notif-card.unread { border-color:var(--aw-blue-border); background:var(--aw-blue-bg); }
  .aw-notif-card.unread::before {
    content:''; position:absolute; left:0; top:10px; bottom:10px; width:3px;
    background:linear-gradient(180deg,var(--aw-blue-light),var(--aw-blue-deep)); border-radius:0 3px 3px 0;
  }
  .aw-unread-dot {
    width:7px; height:7px; border-radius:50%; background:var(--aw-blue);
    flex-shrink:0; margin-top:3px; box-shadow:0 0 6px rgba(37,99,235,0.35);
  }
  .aw-notif-action {
    font-family:var(--aw-font-ui); font-size:11.5px; font-weight:600; color:var(--aw-blue);
    text-decoration:none; cursor:pointer; background:none; border:none; padding:0;
    transition:color .15s;
  }
  .aw-notif-action:hover{ color:var(--aw-blue-deep); }
  .aw-notif-action.muted{ color:var(--aw-text-soft); }
  .aw-notif-action.muted:hover{ color:var(--aw-text-muted); }
  .aw-divider{ height:1px; background:var(--aw-border); margin:11px 0; }
  .aw-notif-empty {
    text-align:center; padding:22px 16px; border-radius:12px;
    border:1.5px dashed var(--aw-border-md); background:var(--aw-surface);
    font-family:var(--aw-font-ui); font-size:13px; color:var(--aw-text-soft);
  }

  /* mobile */
  .aw-mobile-menu {
    background:var(--aw-white); border-top:1px solid var(--aw-border);
    box-shadow:0 12px 40px rgba(15,23,42,0.1); animation:aw-drop .25s var(--aw-ease);
  }
  .aw-mobile-inner { max-width:90rem; margin:0 auto; padding:14px 16px 22px; }
  .aw-mobile-user-card {
    background:var(--aw-surface); border:1px solid var(--aw-border-md);
    border-radius:16px; padding:14px 16px; margin-bottom:12px;
  }
  .aw-mobile-link {
    display:flex; align-items:center; justify-content:space-between;
    padding:13px 16px; border-radius:12px; border:1px solid var(--aw-border);
    background:var(--aw-surface); color:var(--aw-text-muted); text-decoration:none;
    transition:all .16s ease; font-family:var(--aw-font-ui); font-size:14px;
    font-weight:500; width:100%; cursor:pointer; margin-bottom:5px;
  }
  .aw-mobile-link:hover { background:var(--aw-white); border-color:var(--aw-border-md); color:var(--aw-text); box-shadow:0 2px 8px rgba(15,23,42,0.07); }
  .aw-mobile-link.active { background:var(--aw-blue-bg); border-color:var(--aw-blue-border); color:var(--aw-blue); }
  .aw-mobile-actions { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px; }
  .aw-mobile-action {
    display:flex; align-items:center; justify-content:space-between; gap:6px;
    padding:11px 14px; border-radius:12px; border:1px solid var(--aw-border-md);
    background:var(--aw-white); color:var(--aw-text-muted); font-family:var(--aw-font-ui);
    font-size:13px; font-weight:500; text-decoration:none; cursor:pointer;
    transition:all .16s ease; box-shadow:0 1px 3px rgba(15,23,42,0.05);
  }
  .aw-mobile-action:hover { border-color:var(--aw-border-strong); color:var(--aw-text); box-shadow:0 2px 8px rgba(15,23,42,0.08); }

  /* avatar */
  .aw-avatar {
    width:40px; height:40px; border-radius:50%;
    background:linear-gradient(145deg,var(--aw-blue-light),var(--aw-blue-deep));
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-family:var(--aw-font-ui); font-size:13px; font-weight:700;
    flex-shrink:0; box-shadow:0 0 0 3px rgba(37,99,235,0.12), 0 2px 8px rgba(37,99,235,0.2);
  }

  /* error */
  .aw-error-bar {
    background:var(--aw-red-bg); border-bottom:1px solid var(--aw-red-border);
    padding:8px 16px; text-align:center; font-family:var(--aw-font-ui);
    font-size:12px; color:#B91C1C; display:flex; align-items:center;
    justify-content:center; gap:12px;
  }

  @keyframes aw-drop {
    from{ opacity:0; transform:translateY(-8px) scale(0.985); }
    to  { opacity:1; transform:translateY(0)   scale(1);     }
  }

  /* utilities */
  .aw-show-md{ display:none; }
  @media(min-width:768px){ .aw-show-md{ display:flex; } }
  .aw-hide-md{ display:flex; }
  @media(min-width:768px){ .aw-hide-md{ display:none !important; } }
  .aw-show-sm{ display:none; }
  @media(min-width:640px){ .aw-show-sm{ display:inline-flex; } }
`;

/* ─── component ──────────────────────────────────────────────────────────── */

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const notificationPanelRef = useRef<HTMLDivElement | null>(null);
  const notificationWrapperRef = useRef<HTMLDivElement | null>(null);
  const notificationTriggerRef = useRef<HTMLButtonElement | null>(null);

  const showUserControls =
    isAuthenticated &&
    user?.role === "USER" &&
    !HIDDEN_EXACT.has(pathname) &&
    !HIDDEN_PREFIX.some((p) => pathname.startsWith(p));

  const initials = getInitials(user?.name);

  const { notifications, unreadCount, markRead } = useNotifications(
    !!(showUserControls && user?.id),
  );
  const recentNotifications = notifications.slice(0, 4);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    startTransition(() => {
      setMobileOpen(false);
      setNotificationOpen(false);
      setLogoutError(null);
    });
  }, [pathname]);

  useEffect(() => {
    if (!notificationOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!notificationWrapperRef.current?.contains(e.target as Node)) {
        setNotificationOpen(false);
        notificationTriggerRef.current?.focus();
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotificationOpen(false);
        notificationTriggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [notificationOpen]);

  useEffect(() => {
    if (!notificationOpen || !notificationPanelRef.current) return;
    const panel = notificationPanelRef.current;
    const els = panel.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
    );
    const first = els[0];
    const last = els[els.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    panel.addEventListener("keydown", trap);
    first?.focus();
    return () => panel.removeEventListener("keydown", trap);
  }, [notificationOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      startTransition(() => {
        setMobileOpen(false);
        setNotificationOpen(false);
      });
      router.push("/");
    } catch {
      setLogoutError("Sign out failed. Please try again.");
    }
  }, [logout, router]);

  if (
    HIDDEN_EXACT.has(pathname) ||
    HIDDEN_PREFIX.some((p) => pathname.startsWith(p))
  )
    return null;

  /* desktop right controls */
  const renderDesktopAuthControls = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Link href="/login" className="aw-btn-ghost aw-show-sm">
            Sign in
          </Link>
          <Link href="/register" className="aw-btn-primary">
            Get Started
          </Link>
        </>
      );
    }

    if (showUserControls) {
      return (
        <>
          <div style={{ position: "relative" }} ref={notificationWrapperRef}>
            <button
              ref={notificationTriggerRef}
              type="button"
              onClick={() => setNotificationOpen((v) => !v)}
              className="aw-icon-btn"
              aria-label="Open notifications"
              aria-expanded={notificationOpen}
              aria-haspopup="dialog"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                style={{ width: 18, height: 18 }}
                aria-hidden="true"
              >
                <path
                  d="M10 3.5a3.25 3.25 0 00-3.25 3.25v1.08c0 .86-.28 1.7-.8 2.38L4.8 11.8a.9.9 0 00.72 1.45h8.96a.9.9 0 00.72-1.45l-1.15-1.59a3.96 3.96 0 01-.8-2.38V6.75A3.25 3.25 0 0010 3.5zM8.35 14.5a1.75 1.75 0 003.3 0"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span aria-live="polite" aria-atomic="true" className="sr-only">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : ""}
              </span>

              {unreadCount > 0 && (
                <span className="aw-badge" aria-hidden="true">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div
                ref={notificationPanelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Notifications"
                className="aw-notif-panel"
                tabIndex={-1}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--aw-font-ui)",
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: "var(--aw-text)",
                        margin: 0,
                      }}
                    >
                      Notifications
                    </p>

                    <p
                      style={{
                        fontFamily: "var(--aw-font-ui)",
                        fontSize: 11.5,
                        color: "var(--aw-text-soft)",
                        margin: "4px 0 0",
                      }}
                    >
                      {unreadCount > 0
                        ? `${unreadCount} unread update${
                            unreadCount > 1 ? "s" : ""
                          }`
                        : "Everything's up to date"}
                    </p>
                  </div>

                  <Link
                    href="/user/notifications"
                    onClick={() => setNotificationOpen(false)}
                    className="aw-notif-action"
                    style={{ marginTop: 2, fontSize: 12 }}
                  >
                    View all →
                  </Link>
                </div>

                <div className="aw-divider" />

                {recentNotifications.length > 0 ? (
                  <div>
                    {recentNotifications.map((item) => (
                      <article
                        key={item.id}
                        className={`aw-notif-card${item.read ? "" : " unread"}`}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontFamily: "var(--aw-font-ui)",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--aw-text)",
                                margin: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.title}
                            </p>

                            <p
                              style={{
                                fontFamily: "var(--aw-font-ui)",
                                fontSize: 12,
                                color: "var(--aw-text-muted)",
                                margin: "4px 0 0",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.message}
                            </p>
                          </div>

                          {!item.read && (
                            <span
                              className="aw-unread-dot"
                              aria-label="Unread"
                            />
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 10,
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--aw-font-ui)",
                              fontSize: 11,
                              color: "var(--aw-text-soft)",
                            }}
                          >
                            {timeAgo(item.createdAt)}
                          </span>

                          <div style={{ display: "flex", gap: 12 }}>
                            {item.actionUrl && (
                              <Link
                                href={item.actionUrl}
                                onClick={() => {
                                  markRead(item.id);
                                  setNotificationOpen(false);
                                }}
                                className="aw-notif-action"
                              >
                                Open
                              </Link>
                            )}

                            {!item.read && (
                              <button
                                type="button"
                                onClick={() => markRead(item.id)}
                                className="aw-notif-action muted"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="aw-notif-empty">
                    No new notifications yet.
                  </div>
                )}
              </div>
            )}
          </div>
          <ProfileDropdown />
        </>
      );
    }

    return (
      <button
        type="button"
        onClick={() => {
          void handleLogout();
        }}
        className="aw-btn-ghost"
      >
        Sign out
      </button>
    );
  };

  /* render */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <nav
        className={`aw-nav${scrolled ? " scrolled" : ""}`}
        aria-label="Main navigation"
      >
        {logoutError && (
          <div role="alert" className="aw-error-bar">
            <span>{logoutError}</span>
            <button
              type="button"
              onClick={() => setLogoutError(null)}
              style={{
                fontFamily: "var(--aw-font-ui)",
                fontSize: 11,
                fontWeight: 600,
                color: "#B91C1C",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="aw-row">
          {/* brand */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              flexShrink: 0,
              textDecoration: "none",
            }}
          >
            <div className="aw-logo-mark">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                style={{ width: 19, height: 19, color: "#fff" }}
                aria-hidden="true"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.25"
                />
                <path
                  d="M3.5 10h13"
                  stroke="currentColor"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                />
                <path
                  d="M10 3.5C7.6 5.5 7.6 14.5 10 16.5C12.4 14.5 12.4 5.5 10 3.5Z"
                  stroke="currentColor"
                  strokeWidth="1.15"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <div>
              <span className="aw-brand-name">VisaHub</span>
              <span className="aw-brand-sub">Explore</span>
            </div>
          </Link>

          {/* desktop nav links */}
          <div
            className="aw-show-md"
            style={{ flex: 1, justifyContent: "center" }}
          >
            <div className="aw-links-wrap">
              {MARKETING_LINKS.map((item) => {
                const active = isMarketingActive(pathname, item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`aw-link${active ? " active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* right side */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              className="aw-show-md"
              style={{ display: "flex", alignItems: "center", gap: 9 }}
            >
              {renderDesktopAuthControls()}
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="aw-icon-btn aw-hide-md"
              aria-label={
                mobileOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={mobileOpen}
              aria-controls="aw-mobile-nav"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                style={{ width: 18, height: 18 }}
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <path
                    d="M5.5 5.5l9 9M14.5 5.5l-9 9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M3 5.5h14M3 10h14M3 14.5h14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* mobile menu */}
        {mobileOpen && (
          <div id="aw-mobile-nav" className="aw-mobile-menu aw-hide-md">
            <div className="aw-mobile-inner">
              {showUserControls ? (
                <div className="aw-mobile-user-card">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div className="aw-avatar" aria-hidden="true">
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: "var(--aw-font-ui)",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--aw-text)",
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user?.name}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--aw-font-ui)",
                          fontSize: 12,
                          color: "var(--aw-text-muted)",
                          margin: "3px 0 0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href="/user/profile"
                      onClick={() => setMobileOpen(false)}
                      className="aw-btn-ghost"
                      style={{ fontSize: 12, padding: "7px 14px" }}
                    >
                      Profile
                    </Link>
                  </div>

                  <div className="aw-mobile-actions">
                    <Link
                      href="/user/notifications"
                      onClick={() => setMobileOpen(false)}
                      className="aw-mobile-action"
                      style={{ textDecoration: "none" }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          fontWeight: 600,
                          color: "var(--aw-text-2)",
                        }}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          style={{ width: 15, height: 15, flexShrink: 0 }}
                          aria-hidden="true"
                        >
                          <path
                            d="M10 3.5a3.25 3.25 0 00-3.25 3.25v1.08c0 .86-.28 1.7-.8 2.38L4.8 11.8a.9.9 0 00.72 1.45h8.96a.9.9 0 00.72-1.45l-1.15-1.59a3.96 3.96 0 01-.8-2.38V6.75A3.25 3.25 0 0010 3.5zM8.35 14.5a1.75 1.75 0 003.3 0"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Alerts
                      </span>
                      {unreadCount > 0 ? (
                        <span
                          style={{
                            background: "var(--aw-red)",
                            color: "#fff",
                            borderRadius: 9999,
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 7px",
                            fontFamily: "var(--aw-font-ui)",
                          }}
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontFamily: "var(--aw-font-ui)",
                            fontSize: 10,
                            color: "var(--aw-text-soft)",
                          }}
                        >
                          All read
                        </span>
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        void handleLogout();
                      }}
                      className="aw-mobile-action"
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          fontWeight: 600,
                          color: "var(--aw-text-2)",
                        }}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          style={{ width: 15, height: 15, flexShrink: 0 }}
                          aria-hidden="true"
                        >
                          <path
                            d="M13 15l4-5-4-5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M17 10H7.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        Sign out
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--aw-font-ui)",
                          fontSize: 10,
                          color: "var(--aw-text-soft)",
                        }}
                      >
                        Secure
                      </span>
                    </button>
                  </div>
                </div>
              ) : isAuthenticated ? (
                <div className="aw-mobile-user-card">
                  <button
                    type="button"
                    onClick={() => {
                      void handleLogout();
                    }}
                    className="aw-btn-ghost"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="aw-btn-ghost"
                    style={{ justifyContent: "center" }}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="aw-btn-primary"
                    style={{ justifyContent: "center" }}
                  >
                    Get Started
                  </Link>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column" }}>
                {MARKETING_LINKS.map((item) => {
                  const active = isMarketingActive(pathname, item.href);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`aw-mobile-link${active ? " active" : ""}`}
                      aria-current={active ? "page" : undefined}
                      style={{ textDecoration: "none" }}
                    >
                      <span
                        style={{
                          fontWeight: active ? 600 : 500,
                          color: active ? "var(--aw-blue)" : "var(--aw-text-2)",
                        }}
                      >
                        {item.label}
                      </span>
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        style={{
                          width: 14,
                          height: 14,
                          color: "var(--aw-text-soft)",
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      >
                        <path
                          d="M7 5l5 5-5 5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
