"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "DB", group: "Navigation" },
  { label: "Applications", href: "/admin/applications", icon: "AP", group: "Navigation" },
  { label: "Payments", href: "/admin/payments", icon: "PM", group: "Navigation" },
  { label: "Users", href: "/admin/users", icon: "US", group: "Navigation" },
  { label: "Suppliers", href: "/admin/suppliers", icon: "SP", group: "Navigation" },
  { label: "Visa Types", href: "/admin/visas", icon: "VS", group: "Navigation" },
  { label: "Countries", href: "/admin/countries", icon: "CT", group: "Navigation" },
  { label: "Form Builder", href: "/admin/forms", icon: "FM", group: "Navigation" },
  { label: "New Form", href: "/admin/forms/new", icon: "+", group: "Actions" },
  { label: "Notifications", href: "/admin/notifications", icon: "NT", group: "Navigation" },
  { label: "Support Tickets", href: "/admin/support", icon: "TK", group: "Navigation" },
  { label: "Settings", href: "/admin/settings", icon: "ST", group: "Navigation" },
];

type ResultItem =
  | { kind: "nav"; label: string; href: string; icon: string; group: string }
  | { kind: "app"; label: string; href: string; sub: string; icon: string };

interface SearchableApplication {
  id: string;
  userName: string;
  userEmail: string;
  visaName: string;
  status: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [appHits, setAppHits] = useState<ResultItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const normalizedQuery = query.toLowerCase().trim();

  const navHits: ResultItem[] = useMemo(
    () =>
      NAV_ITEMS.filter(
        (n) =>
          !normalizedQuery ||
          n.label.toLowerCase().includes(normalizedQuery) ||
          n.group.toLowerCase().includes(normalizedQuery),
      ).map((n) => ({ kind: "nav" as const, ...n })),
    [normalizedQuery],
  );

  useEffect(() => {
    if (normalizedQuery.length < 2) return;

    let active = true;
    const loadApps = async () => {
      try {
        const appsData = await fetch("/api/admin/applications?limit=50", {
          credentials: "include",
        }).then((r) => (r.ok ? r.json() : { data: { apps: [] } }));

        if (!active) return;

        const apps = (appsData?.data?.apps ?? []) as SearchableApplication[];
        const hits = apps
          .filter(
            (a) =>
              a.userName.toLowerCase().includes(normalizedQuery) ||
              a.userEmail.toLowerCase().includes(normalizedQuery) ||
              a.id.toLowerCase().includes(normalizedQuery) ||
              a.visaName.toLowerCase().includes(normalizedQuery),
          )
          .slice(0, 5)
          .map(
            (a): ResultItem => ({
              kind: "app",
              label: a.userName,
              href: `/admin/applications/${a.id}`,
              sub: `${a.visaName} · ${a.status}`,
              icon: "AP",
            }),
          );

        setAppHits(hits);
      } catch {
        if (active) setAppHits([]);
      }
    };

    void loadApps();

    return () => {
      active = false;
    };
  }, [normalizedQuery]);

  const results: ResultItem[] = useMemo(
    () => [
      ...(normalizedQuery.length < 2 ? [] : appHits),
      ...navHits,
    ].slice(0, 12),
    [appHits, navHits, normalizedQuery],
  );
  const activeCursor = Math.min(cursor, Math.max(results.length - 1, 0));

  const resetSearch = useCallback(() => {
    setQuery("");
    setCursor(0);
  }, []);

  const closePalette = useCallback(() => {
    resetSearch();
    onClose();
  }, [onClose, resetSearch]);

  useEffect(() => {
    if (!open) return;

    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        if (results.length === 0) return;
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, results.length - 1));
        return;
      }

      if (e.key === "ArrowUp") {
        if (results.length === 0) return;
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const item = results[activeCursor];
        if (item) {
          router.push(item.href);
          closePalette();
        }
        return;
      }

      if (e.key === "Escape") {
        closePalette();
      }
    },
    [activeCursor, closePalette, results, router],
  );

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${activeCursor}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeCursor]);

  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePalette();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closePalette, open]);

  if (!open) return null;

  const groups = Array.from(
    new Set(results.map((r) => (r.kind === "app" ? "Applications" : r.group))),
  );

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={closePalette}
      />

      <div className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4 animate-fadeInUp">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCursor(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, applications, actions..."
              className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-lg border border-gray-200">
              ESC
            </kbd>
          </div>

          <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
            {results.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">--</p>
                <p className="text-sm text-gray-400">No results for &ldquo;{query}&rdquo;</p>
              </div>
            )}

            {groups.map((group) => {
              const groupItems = results.filter(
                (r) => (r.kind === "app" ? "Applications" : r.group) === group,
              );
              if (groupItems.length === 0) return null;
              const globalOffset = results.indexOf(groupItems[0]);

              return (
                <div key={group}>
                  <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {group}
                  </p>
                  {groupItems.map((item, localIdx) => {
                    const idx = globalOffset + localIdx;
                    const isActive = idx === cursor;
                    return (
                      <button
                        key={item.href}
                        data-idx={idx}
                        onClick={() => {
                          router.push(item.href);
                          closePalette();
                        }}
                        onMouseEnter={() => setCursor(idx)}
                        className={[
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          isActive ? "bg-indigo-50" : "hover:bg-gray-50",
                        ].join(" ")}
                      >
                        <span className="text-xl w-7 flex-shrink-0 text-center">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={[
                              "text-sm font-semibold truncate",
                              isActive ? "text-indigo-700" : "text-gray-800",
                            ].join(" ")}
                          >
                            {item.label}
                          </p>
                          {item.kind === "app" && (
                            <p className="text-xs text-gray-400 truncate">{item.sub}</p>
                          )}
                          {item.kind === "nav" && (
                            <p className="text-xs text-gray-400 truncate">{item.href}</p>
                          )}
                        </div>
                        {isActive && (
                          <kbd className="flex-shrink-0 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded border border-indigo-200">
                            ?
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1 border border-gray-200 rounded">UD</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 border border-gray-200 rounded">?</kbd> select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 border border-gray-200 rounded">esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default CommandPalette;

