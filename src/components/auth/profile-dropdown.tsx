"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/auth-provider";

function getInitials(name?: string) {
  if (!name) return "U";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfileDropdown() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      setOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const signOut = async () => {
    await logout();
    setOpen(false);
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="user-profile-chip group"
        aria-label="Open profile menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="user-profile-avatar">{getInitials(user.name)}</span>
        <span className="hidden min-w-0 flex-col items-start text-left lg:flex">
          <span className="max-w-[9rem] truncate text-[0.95rem] font-semibold text-[var(--user-text)]">
            {user.name}
          </span>
          <span className="max-w-[9rem] truncate text-[11px] text-[var(--user-text-soft)]">
            {user.role === "USER" ? "User" : user.role}
          </span>
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className={`hidden h-4 w-4 text-[var(--user-text-soft)] transition-transform lg:block ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M5 7.5l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div className="user-dropdown absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl">
          <div className="border-b border-[var(--user-border)] px-5 py-4">
            <p className="truncate text-[0.95rem] font-semibold text-[var(--user-text)]">
              {user.name}
            </p>
            <p className="truncate text-xs text-[var(--user-text-soft)]">
              {user.email}
            </p>
          </div>

          <nav className="p-2.5 text-sm">
            {[
              // { href: "/user/dashboard", label: "Dashboard" },
              { href: "/user/profile", label: "Profile" },
              // { href: "/user/applications", label: "Applications" },
              // { href: "/user/billing", label: "Billing" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="user-dropdown-item block px-4 py-3 text-[var(--user-text-muted)] hover:text-[var(--user-text)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-[var(--user-border)] p-2.5">
            <button
              type="button"
              onClick={signOut}
              className="user-dropdown-item block w-full px-4 py-3 text-left text-rose-500 hover:text-rose-400"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
