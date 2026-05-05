// "use client";

// import Link from "next/link";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { applicationsApi } from "@/lib/api-client";
// import type { ApplicationsListResponse, ApplicationTrackingSummary, StoredApplication } from "@/lib/store";
// import { getFlag } from "@/lib/flags";
// import { useToast } from "@/components/dashboard/toast";

// type StatusFilter = "all" | "submitted" | "processing" | "approved" | "rejected";

// type SortBy = "updatedAt" | "submittedAt";
// type SortDir = "asc" | "desc";

// const FALLBACK_PROGRESS: Record<Exclude<StatusFilter, "all">, number> = {
//   submitted: 25,
//   processing: 70,
//   approved: 100,
//   rejected: 60,
// };

// const DEFAULT_COUNTS = {
//   all: 0,
//   submitted: 0,
//   processing: 0,
//   approved: 0,
//   rejected: 0,
// };

// function formatDate(input: string) {
//   return new Date(input).toLocaleDateString("en-GB", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//   });
// }

// function toneClass(tone?: ApplicationTrackingSummary["tone"]) {
//   switch (tone) {
//     case "success":
//       return "text-emerald-300 bg-emerald-500/14 border-emerald-400/25";
//     case "warning":
//       return "text-amber-300 bg-amber-500/14 border-amber-400/25";
//     case "active":
//       return "text-indigo-200 bg-indigo-500/14 border-indigo-400/25";
//     default:
//       return "text-sky-300 bg-sky-500/14 border-sky-400/25";
//   }
// }

// function statusLabel(app: StoredApplication) {
//   return app.tracking?.label ?? app.status.charAt(0).toUpperCase() + app.status.slice(1);
// }

// function statusProgress(app: StoredApplication) {
//   if (app.tracking?.progress !== undefined) return app.tracking.progress;
//   return FALLBACK_PROGRESS[app.status];
// }

// export default function ApplicationsPage() {
//   const { showToast } = useToast();

//   const [payload, setPayload] = useState<ApplicationsListResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState<StatusFilter>("all");
//   const [searchInput, setSearchInput] = useState("");
//   const [query, setQuery] = useState("");
//   const [sortBy, setSortBy] = useState<SortBy>("updatedAt");
//   const [sortDir, setSortDir] = useState<SortDir>("desc");
//   const [page, setPage] = useState(1);
//   const searchTimerRef = useRef<number | null>(null);

//   useEffect(() => {
//     return () => {
//       if (searchTimerRef.current !== null) {
//         window.clearTimeout(searchTimerRef.current);
//       }
//     };
//   }, []);

//   const handleSearchChange = (value: string) => {
//     setSearchInput(value);

//     if (searchTimerRef.current !== null) {
//       window.clearTimeout(searchTimerRef.current);
//     }

//     searchTimerRef.current = window.setTimeout(() => {
//       setLoading(true);
//       setQuery(value.trim());
//       setPage(1);
//     }, 350);
//   };

//   useEffect(() => {
//     let mounted = true;

//     applicationsApi
//       .list({
//         status: filter,
//         q: query,
//         page,
//         pageSize: 8,
//         sortBy,
//         sortDir,
//       })
//       .then((data) => {
//         if (!mounted) return;
//         setPayload(data);
//       })
//       .catch((error: unknown) => {
//         if (!mounted) return;
//         setPayload(null);
//         showToast(error instanceof Error ? error.message : "Unable to load applications.", "error");
//       })
//       .finally(() => {
//         if (!mounted) return;
//         setLoading(false);
//       });

//     return () => {
//       mounted = false;
//     };
//   }, [filter, page, query, sortBy, sortDir, showToast]);

//   const items = payload?.items ?? [];
//   const meta = payload?.meta;
//   const counts = meta?.statusCounts ?? DEFAULT_COUNTS;

//   const titleSummary = useMemo(() => {
//     if (!meta) return "No applications found.";
//     if (meta.total === 0) return "No matching applications.";
//     return `${meta.total} matching application${meta.total > 1 ? "s" : ""}`;
//   }, [meta]);

//   return (
//     <div className="space-y-5">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
//             Track Applications
//           </h1>
//           <p className="text-sm text-indigo-100/60">{titleSummary}</p>
//         </div>
//         <Link href="/user/applications/new" className="user-cta inline-flex items-center px-4 py-2 text-sm">
//           + Start New Application
//         </Link>
//       </div>

//       <div className="user-panel rounded-2xl p-3">
//         <div className="mb-3 flex flex-wrap gap-2">
//           {(["all", "submitted", "processing", "approved", "rejected"] as const).map((status) => (
//           <button
//               key={status}
//               type="button"
//               onClick={() => {
//                 setLoading(true);
//                 setFilter(status);
//                 setPage(1);
//               }}
//               className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition ${
//                 filter === status
//                   ? "border-indigo-300/65 bg-indigo-500/24 text-white"
//                   : "border-indigo-300/25 bg-[#0b1432]/80 text-indigo-100/75 hover:text-white"
//               }`}
//             >
//               {status} · {counts[status]}
//             </button>
//           ))}
//         </div>

//         <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
//           <div className="relative">
//             <input
//               type="text"
//               value={searchInput}
//               onChange={(event) => handleSearchChange(event.target.value)}
//               placeholder="Search by visa, country, supplier, or reference"
//               className="user-input pl-9"
//             />
//             <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-100/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5-5m2-4a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>

//           <select
//             value={sortBy}
//             onChange={(event) => {
//               setLoading(true);
//               setSortBy(event.target.value as SortBy);
//               setPage(1);
//             }}
//             className="user-select text-sm"
//           >
//             <option value="updatedAt">Sort: Last updated</option>
//             <option value="submittedAt">Sort: Submitted date</option>
//           </select>

//           <button
//             type="button"
//             onClick={() => {
//               setLoading(true);
//               setSortDir((current) => (current === "desc" ? "asc" : "desc"));
//               setPage(1);
//             }}
//             className="user-outline-btn px-3 py-2 text-xs font-semibold"
//           >
//             {sortDir === "desc" ? "Newest" : "Oldest"}
//           </button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="space-y-3">
//           {[1, 2, 3].map((item) => (
//             <div key={item} className="user-panel h-32 animate-pulse rounded-2xl" />
//           ))}
//         </div>
//       ) : items.length === 0 ? (
//         <div className="user-panel rounded-2xl p-10 text-center">
//           <p className="text-base font-semibold text-white">No matching applications</p>
//           <p className="mt-1 text-sm text-indigo-100/60">Try changing filters or start a new application.</p>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {items.map((app) => {
//             const progress = statusProgress(app);
//             const docs = Object.keys(app.documents ?? {}).length;
//             return (
//               <Link key={app.id} href={`/user/applications/${app.id}`} className="user-panel block rounded-2xl p-4 transition hover:border-indigo-300/45">
//                 <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
//                   <div className="min-w-0">
//                     <div className="flex items-center gap-2">
//                       <span className="text-xl leading-none">{getFlag(app.countryCode)}</span>
//                       <p className="truncate text-base font-semibold text-white">{app.visaName}</p>
//                     </div>
//                     <p className="mt-1 text-xs text-indigo-100/58">
//                       {app.countryName} · Ref {app.referenceNumber ?? app.id.slice(-8).toUpperCase()} · Submitted {formatDate(app.submittedAt)}
//                     </p>
//                   </div>
//                   <span className={`user-badge border ${toneClass(app.tracking?.tone)}`}>{statusLabel(app)}</span>
//                 </div>

//                 <div className="mb-3">
//                   <div className="mb-1 flex items-center justify-between text-[11px] text-indigo-100/70">
//                     <span>Progress</span>
//                     <span>{progress}%</span>
//                   </div>
//                   <div className="h-1.5 overflow-hidden rounded-full bg-indigo-200/15">
//                     <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400" style={{ width: `${progress}%` }} />
//                   </div>
//                 </div>

//                 <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-100/62">
//                   <p>
//                     {docs} docs · {app.totalPaid > 0 ? "Paid" : "Unpaid"} · Supplier: {app.supplierName}
//                   </p>
//                   <p className="font-semibold text-indigo-200">Last activity: {formatDate(app.tracking?.lastEventAt ?? app.updatedAt)}</p>
//                 </div>

//                 {app.tracking?.actionRequired ? (
//                   <div className="mt-3 rounded-lg border border-amber-400/35 bg-amber-500/12 px-3 py-2 text-xs text-amber-200">
//                     Action required: additional documents or corrections are needed.
//                   </div>
//                 ) : null}
//               </Link>
//             );
//           })}
//         </div>
//       )}

//       {meta && meta.totalPages > 1 ? (
//         <div className="user-panel rounded-2xl p-3">
//           <div className="flex items-center justify-between gap-2">
//             <p className="text-xs text-indigo-100/70">
//               Page {meta.page} of {meta.totalPages}
//             </p>
//             <div className="flex gap-2">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setLoading(true);
//                   setPage((value) => Math.max(1, value - 1));
//                 }}
//                 disabled={!meta.hasPrevPage}
//                 className="user-outline-btn px-3 py-1.5 text-xs font-semibold disabled:opacity-45"
//               >
//                 Previous
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setLoading(true);
//                   setPage((value) => value + 1);
//                 }}
//                 disabled={!meta.hasNextPage}
//                 className="user-outline-btn px-3 py-1.5 text-xs font-semibold disabled:opacity-45"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { applicationsApi } from "@/lib/api-client";
import type {
  ApplicationsListResponse,
  ApplicationTrackingSummary,
  StoredApplication,
} from "@/lib/store";
import { getFlag } from "@/lib/flags";
import { useToast } from "@/components/dashboard/toast";

type StatusFilter =
  | "all"
  | "submitted"
  | "processing"
  | "approved"
  | "rejected";
type SortBy = "updatedAt" | "submittedAt";
type SortDir = "asc" | "desc";

const FALLBACK_PROGRESS: Record<Exclude<StatusFilter, "all">, number> = {
  submitted: 25,
  processing: 70,
  approved: 100,
  rejected: 60,
};

const DEFAULT_COUNTS = {
  all: 0,
  submitted: 0,
  processing: 0,
  approved: 0,
  rejected: 0,
};

function formatDate(input: string) {
  return new Date(input).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const TONE_STYLES: Record<string, { bar: string; badge: string; dot: string }> =
  {
    success: {
      bar: "from-emerald-500 to-teal-400",
      badge: "text-emerald-300 bg-emerald-500/15 border-emerald-400/30",
      dot: "bg-emerald-400",
    },
    warning: {
      bar: "from-amber-500 to-orange-400",
      badge: "text-amber-300 bg-amber-500/15 border-amber-400/30",
      dot: "bg-amber-400",
    },
    active: {
      bar: "from-indigo-500 to-violet-400",
      badge: "text-indigo-200 bg-indigo-500/15 border-indigo-400/30",
      dot: "bg-indigo-400",
    },
    default: {
      bar: "from-sky-500 to-cyan-400",
      badge: "text-sky-300 bg-sky-500/15 border-sky-400/30",
      dot: "bg-sky-400",
    },
  };

function getTone(tone?: ApplicationTrackingSummary["tone"]) {
  return TONE_STYLES[tone ?? "default"] ?? TONE_STYLES.default;
}

function statusLabel(app: StoredApplication) {
  return (
    app.tracking?.label ??
    app.status.charAt(0).toUpperCase() + app.status.slice(1)
  );
}

function statusProgress(app: StoredApplication) {
  return app.tracking?.progress !== undefined
    ? app.tracking.progress
    : FALLBACK_PROGRESS[app.status];
}

const STATUS_TABS = [
  "all",
  "submitted",
  "processing",
  "approved",
  "rejected",
] as const;

export default function ApplicationsPage() {
  const { showToast } = useToast();

  const [payload, setPayload] = useState<ApplicationsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const searchTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (searchTimerRef.current !== null)
        window.clearTimeout(searchTimerRef.current);
    },
    [],
  );

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimerRef.current !== null)
      window.clearTimeout(searchTimerRef.current);
    searchTimerRef.current = window.setTimeout(() => {
      setLoading(true);
      setQuery(value.trim());
      setPage(1);
    }, 350);
  };

  useEffect(() => {
    let mounted = true;
    applicationsApi
      .list({ status: filter, q: query, page, pageSize: 8, sortBy, sortDir })
      .then((data) => {
        if (mounted) setPayload(data);
      })
      .catch((err: unknown) => {
        if (mounted) {
          setPayload(null);
          showToast(
            err instanceof Error ? err.message : "Unable to load applications.",
            "error",
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [filter, page, query, sortBy, sortDir, showToast]);

  const items = payload?.items ?? [];
  const meta = payload?.meta;
  const counts = meta?.statusCounts ?? DEFAULT_COUNTS;

  const titleSummary = useMemo(() => {
    if (!meta) return "No applications found.";
    if (meta.total === 0) return "No matching applications.";
    return `${meta.total} application${meta.total > 1 ? "s" : ""} found`;
  }, [meta]);

  return (
    <div className="space-y-4">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Applications
          </h1>
          <p className="mt-0.5 text-sm text-indigo-100/50">{titleSummary}</p>
        </div>
        <Link
          href="/user/applications/new"
          className="user-cta inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg shadow-indigo-900/40 transition hover:scale-[1.02]"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Application
        </Link>
      </div>

      {/* ── FILTER + SEARCH BAR ── */}
      <div className="user-panel rounded-2xl p-4 space-y-3">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((status) => {
            const active = filter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setLoading(true);
                  setFilter(status);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize transition ${
                  active
                    ? "border-indigo-400/60 bg-indigo-500/25 text-white shadow-sm shadow-indigo-900/30"
                    : "border-indigo-300/20 bg-white/4 text-indigo-100/60 hover:border-indigo-300/40 hover:text-indigo-100"
                }`}
              >
                {status}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums ${active ? "bg-indigo-400/30 text-white" : "bg-white/8 text-indigo-100/50"}`}
                >
                  {counts[status]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + sort row */}
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-100/35"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-5-5m2-4a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search visa, country, supplier, reference…"
              className="user-input w-full pl-9 text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-100/40 hover:text-indigo-100"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => {
              setLoading(true);
              setSortBy(e.target.value as SortBy);
              setPage(1);
            }}
            className="user-select text-xs font-semibold"
          >
            <option value="updatedAt">Last updated</option>
            <option value="submittedAt">Submitted date</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setSortDir((d) => (d === "desc" ? "asc" : "desc"));
              setPage(1);
            }}
            className="user-outline-btn flex items-center gap-1.5 px-3 py-2 text-xs font-bold"
          >
            {sortDir === "desc" ? (
              <>
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
                Newest
              </>
            ) : (
              <>
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                  />
                </svg>
                Oldest
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── APPLICATION LIST ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="user-panel h-36 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="user-panel flex flex-col items-center justify-center rounded-2xl p-14 text-center">
          <span className="mb-3 text-4xl">🗂️</span>
          <p className="text-base font-bold text-white">
            No applications found
          </p>
          <p className="mt-1 text-sm text-indigo-100/50">
            Adjust filters or start a new application.
          </p>
          <Link
            href="/user/applications/new"
            className="user-cta mt-5 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold"
          >
            + New Application
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((app) => {
            const progress = statusProgress(app);
            const tone = getTone(app.tracking?.tone);
            const docs = Object.keys(app.documents ?? {}).length;

            return (
              <Link
                key={app.id}
                href={`/user/applications/${app.id}`}
                className="user-panel group block rounded-2xl p-5 transition hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-900/20"
              >
                {/* Top row */}
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-2xl leading-none">
                      {getFlag(app.countryCode)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[0.9375rem] font-bold text-white group-hover:text-indigo-200 transition-colors">
                        {app.visaName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-indigo-100/45">
                        {app.countryName} · #
                        {app.referenceNumber ?? app.id.slice(-8).toUpperCase()}{" "}
                        · {formatDate(app.submittedAt)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                    {statusLabel(app)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="mb-1.5 flex items-center justify-between text-[11px] text-indigo-100/55">
                    <span>Progress</span>
                    <span className="font-bold tabular-nums">{progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${tone.bar}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-[11px] text-indigo-100/50">
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {docs} docs
                    </span>
                    <span>·</span>
                    <span
                      className={
                        app.totalPaid > 0
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }
                    >
                      {app.totalPaid > 0 ? "✓ Paid" : "Unpaid"}
                    </span>
                    <span>·</span>
                    <span>{app.supplierName}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-indigo-300/70">
                    Updated{" "}
                    {formatDate(app.tracking?.lastEventAt ?? app.updatedAt)}
                  </p>
                </div>

                {/* Action required banner */}
                {app.tracking?.actionRequired && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2">
                    <span className="text-sm">⚠️</span>
                    <p className="text-xs font-semibold text-amber-200">
                      Action required — additional documents or corrections
                      needed.
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {meta && meta.totalPages > 1 && (
        <div className="user-panel flex items-center justify-between rounded-2xl px-4 py-3">
          <p className="text-xs font-semibold text-indigo-100/50">
            Page <span className="text-white">{meta.page}</span> of{" "}
            <span className="text-white">{meta.totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setPage((p) => Math.max(1, p - 1));
              }}
              disabled={!meta.hasPrevPage}
              className="user-outline-btn flex items-center gap-1 px-3 py-1.5 text-xs font-bold disabled:opacity-40"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Prev
            </button>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setPage((p) => p + 1);
              }}
              disabled={!meta.hasNextPage}
              className="user-outline-btn flex items-center gap-1 px-3 py-1.5 text-xs font-bold disabled:opacity-40"
            >
              Next
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
