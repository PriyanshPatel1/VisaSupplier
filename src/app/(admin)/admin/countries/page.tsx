// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { adminApi } from "@/lib/api-client";
// import Link from "next/link";

// interface Country {
//   id: string;
//   name: string;
//   code: string;
//   flag: string;
//   description: string;
//   continent: string;
//   source: "static" | "custom";
//   visaCount: number;
//   visas: { id: string; name: string; category: string; fee: number }[];
// }

// export default function AdminCountriesPage() {
//   const [countries, setCountries] = useState<Country[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [mounted, setMounted] = useState(false);
//   const [search, setSearch] = useState("");
//   const [deleteCountry, setDeleteCountry] = useState<Country | null>(null);
//   const [deleting, setDeleting] = useState(false);
//   const [toast, setToast] = useState<string | null>(null);

//   const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

//   const fetchCountries = useCallback(() => {
//     setLoading(true);
//     adminApi.getCountries()
//       .then((data) => { const d = data as { countries: Country[] }; setCountries(d.countries ?? []); })
//       .catch(() => { })
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => { setMounted(true); }, []);
//   useEffect(() => { fetchCountries(); }, [fetchCountries]);

//   const filtered = countries.filter((c) => {
//     const q = search.toLowerCase();
//     return !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (c.continent ?? "").toLowerCase().includes(q);
//   });

//   const handleDelete = async () => {
//     if (!deleteCountry) return;
//     setDeleting(true);
//     try {
//       await adminApi.deleteCountry(deleteCountry.id);
//       setDeleteCountry(null);
//       fetchCountries();
//       showToast("Country deleted");
//     } catch (e: unknown) {
//       showToast(e instanceof Error ? e.message : "Failed to delete");
//       setDeleteCountry(null);
//     } finally { setDeleting(false); }
//   };

//   if (!mounted) return null;

//   return (
//     <div className="min-h-screen bg-gray-50/50">
//       {/* Toast */}
//       {toast && (
//         <div className="fixed bottom-6 right-6 z-[100] rounded-2xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-xl">
//           {toast}
//         </div>
//       )}

//       {/* Page header */}
//       <div className="border-b border-gray-200/60 bg-white px-6 py-5">
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-500">Admin</p>
//             <h1 className="mt-0.5 text-2xl font-black text-gray-950">Countries</h1>
//             <p className="mt-1 text-sm text-gray-500">Manage destination countries used across visa types and application forms.</p>
//           </div>
//           <Link
//             href="/admin/countries/new"
//             className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition-all hover:shadow-lg hover:shadow-indigo-300"
//           >
//             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//             </svg>
//             Add country
//           </Link>
//         </div>
//         <div className="mt-4">
//           <div className="relative max-w-sm">
//             <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search countries..."
//               className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Body */}
//       <div className="p-6">
//         {loading ? (
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//             {[...Array(8)].map((_, i) => (
//               <div key={i} className="h-52 animate-pulse rounded-2xl bg-gray-200" />
//             ))}
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="py-20 text-center">
//             <p className="text-4xl">🌍</p>
//             <p className="mt-4 font-bold text-gray-800">No countries found</p>
//             <p className="mt-1 text-sm text-gray-400">Try a different search or add a new country.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//             {filtered.map((c) => (
//               <div key={c.id} className="flex flex-col rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="flex items-center gap-3">
//                     <span className="text-3xl">{c.flag}</span>
//                     <div>
//                       <p className="font-black text-gray-950">{c.name}</p>
//                       <p className="font-mono text-xs text-gray-400">{c.code}</p>
//                     </div>
//                   </div>
//                   <div className="flex gap-1">
//                     <Link href={`/admin/countries/${c.id}`} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600" title="Edit">
//                       <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                       </svg>
//                     </Link>
//                     {c.source === "custom" && (
//                       <button onClick={() => setDeleteCountry(c)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500" title="Delete">
//                         <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                         </svg>
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 {c.continent && <p className="mt-2 text-xs text-gray-400">{c.continent}</p>}

//                 <div className="mt-auto pt-4 space-y-1.5">
//                   <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     {c.visaCount} Visa Type{c.visaCount !== 1 ? "s" : ""}
//                   </p>
//                   {c.visas.slice(0, 3).map((v) => (
//                     <div key={v.id} className="flex items-center justify-between text-xs">
//                       <span className="min-w-0 truncate text-gray-700">{v.name}</span>
//                       <div className="ml-2 flex flex-shrink-0 items-center gap-2">
//                         <span className="font-bold text-gray-900">${v.fee}</span>
//                         <Link href={`/admin/visas/${v.id}`} className="text-indigo-600 hover:underline">Edit</Link>
//                       </div>
//                     </div>
//                   ))}
//                   {c.visas.length > 3 && <p className="text-xs text-gray-400">+{c.visas.length - 3} more</p>}
//                 </div>

//                 <div className="mt-4 border-t border-gray-100 pt-3">
//                   <Link href="/admin/forms" className="text-xs font-semibold text-purple-600 hover:underline">Manage forms</Link>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ── DELETE MODAL ───────────────────────────────────────────────── */}
//       {deleteCountry && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-gray-950/45 backdrop-blur-sm" onClick={() => setDeleteCountry(null)} />
//           <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
//             <div className="flex items-start gap-4">
//               <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
//                 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
//                 </svg>
//               </div>
//               <div>
//                 <h2 className="text-lg font-black text-gray-950">Delete country?</h2>
//                 <p className="mt-1 text-sm text-gray-500">
//                   This permanently removes <span className="font-semibold text-gray-800">{deleteCountry.flag} {deleteCountry.name}</span> from the catalog.
//                 </p>
//               </div>
//             </div>
//             <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
//               <p className="font-mono text-xs text-gray-500">{deleteCountry.code}</p>
//               <p className="mt-1 text-sm font-semibold text-gray-800">{deleteCountry.continent}</p>
//             </div>
//             <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
//               <button onClick={handleDelete} disabled={deleting} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60">
//                 {deleting ? "Deleting..." : "Delete country"}
//               </button>
//               <button onClick={() => setDeleteCountry(null)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api-client";
import Link from "next/link";

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  description: string;
  continent: string;
  source: "static" | "custom";
  visaCount: number;
  visas: { id: string; name: string; category: string; fee: number }[];
}

export default function AdminCountriesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteCountry, setDeleteCountry] = useState<Country | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCountries = useCallback(() => {
    setLoading(true);
    adminApi
      .getCountries()
      .then((data) => {
        const d = data as { countries: Country[] };
        setCountries(d.countries ?? []);
      })
      .catch((e) => console.error("Failed to fetch countries:", e))
      .finally(() => setLoading(false));
  }, []);

  // Guarantee hydration safety by waiting for the client to mount
  useEffect(() => {
    setIsMounted(true);
    fetchCountries();
  }, [fetchCountries]);

  const filtered = countries.filter((c) => {
    const q = search.toLowerCase().trim();
    return (
      !q ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.continent && c.continent.toLowerCase().includes(q))
    );
  });

  const handleDelete = async () => {
    if (!deleteCountry) return;
    setDeleting(true);
    try {
      await adminApi.deleteCountry(deleteCountry.id);
      setDeleteCountry(null);
      fetchCountries();
      showToast("Country deleted successfully");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to delete country");
      setDeleteCountry(null);
    } finally {
      setDeleting(false);
    }
  };

  // Determine if we should show the loading skeleton
  // This ensures the Server and Client perfectly match on the very first render
  const isLoadingState = !isMounted || loading;

  return (
    <div className="min-h-[80vh] bg-slate-50/50 pb-12" suppressHydrationWarning>
      {/* Toast Notification */}
      {isMounted && toast && (
        <div className="fixed bottom-6 right-6 z-[100] rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-xl transition-all animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {toast}
          </div>
        </div>
      )}

      {/* Page Header (Safe to render on Server) */}
      <div className="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Configuration
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
                Countries
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage destination countries used across visa types and forms.
              </p>
            </div>
            <Link
              href="/admin/countries/new"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Country
            </Link>
          </div>

          <div className="mt-6">
            <div className="relative max-w-md">
              <svg
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries by name, code, or continent..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
        {isLoadingState ? (
          /* Deterministic Skeleton for SSR and initial Client render */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="h-60 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-4xl mb-4 shadow-sm border border-slate-100">
              🌍
            </div>
            <p className="text-base font-semibold text-slate-900">
              No countries found
            </p>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              We couldn&apos;t find anything matching your search. Try adjusting
              your filters or add a new country.
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Clear search filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c, index) => (
              // Use fallbacks for key to strictly prevent duplicate key errors
              <div
                key={c.id ? `country-${c.id}` : `country-fallback-${index}`}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-2xl shadow-sm">
                      {c.flag || "🏳️"}
                    </div>
                    <div>
                      <p
                        className="font-bold text-slate-900 truncate max-w-[120px]"
                        title={c.name}
                      >
                        {c.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs text-slate-500">
                          {c.code}
                        </span>
                        {c.source === "custom" && (
                          <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-600">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 -mt-1 -mr-1">
                    <Link
                      href={`/admin/countries/${c.id}`}
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                      title="Edit Country"
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
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Link>
                    {c.source === "custom" && (
                      <button
                        onClick={() => setDeleteCountry(c)}
                        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete Country"
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
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {c.continent && (
                  <p className="mt-3 text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {c.continent}
                  </p>
                )}

                {/* Visas List */}
                <div className="mt-auto pt-5 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Linked Visas
                    </p>
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {c.visaCount || 0}
                    </span>
                  </div>

                  {!c.visas || c.visas.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      No visas configured yet.
                    </p>
                  ) : (
                    <>
                      {c.visas.slice(0, 3).map((v, vIndex) => (
                        <div
                          key={
                            v.id
                              ? `visa-${v.id}`
                              : `visa-fallback-${index}-${vIndex}`
                          }
                          className="flex items-center justify-between text-xs group"
                        >
                          <span
                            className="min-w-0 truncate text-slate-600"
                            title={v.name}
                          >
                            {v.name}
                          </span>
                          <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              ${v.fee}
                            </span>
                            <Link
                              href={`/admin/visas/${v.id}`}
                              className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      ))}
                      {c.visas.length > 3 && (
                        <p className="text-[11px] text-slate-400 pt-1">
                          +{c.visas.length - 3} more visa options
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Footer Link */}
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <Link
                    href="/admin/forms"
                    className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 w-fit"
                  >
                    Manage forms
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE MODAL (Only renders in browser when requested) */}
      {isMounted && deleteCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setDeleteCountry(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="pt-1">
                <h2 className="text-lg font-bold text-slate-900">
                  Delete country?
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong className="text-slate-800">
                    {deleteCountry.flag} {deleteCountry.name}
                  </strong>
                  ? This action cannot be undone and will remove it from the
                  catalog.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Country Details
              </p>
              <div className="mt-1 flex justify-between items-center">
                <p className="text-sm font-semibold text-slate-900">
                  {deleteCountry.continent || "Unknown Continent"}
                </p>
                <p className="font-mono text-sm text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {deleteCountry.code}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setDeleteCountry(null)}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors w-full sm:w-auto"
              >
                {deleting ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete Country"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
