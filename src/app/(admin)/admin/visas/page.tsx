// "use client";

// import { useState, useEffect, useCallback, useMemo } from "react";
// import Link from "next/link";
// import { adminApi } from "@/lib/api-client";
// import { getFlag } from "@/lib/flags";

// interface Visa {
//   id: string;
//   name: string;
//   countryCode: string;
//   category: string;
//   fee: number;
//   processingTime: string;
//   validity: string;
//   stayDuration: string;
//   description?: string;
//   formSchemaId?: string;
//   source?: "static" | "custom";
// }

// interface CountryOption {
//   id: string;
//   name: string;
//   code: string;
//   flag?: string;
// }

// interface FormOption {
//   visaId: string;
//   formLabel: string;
//   sections: unknown[];
//   hasOverride?: boolean;
// }

// const CAT_COLOR: Record<string, string> = {
//   tourist: "bg-emerald-50 text-emerald-700 border-emerald-200",
//   student: "bg-sky-50 text-sky-700 border-sky-200",
//   work: "bg-amber-50 text-amber-700 border-amber-200",
//   business: "bg-violet-50 text-violet-700 border-violet-200",
//   medical: "bg-rose-50 text-rose-700 border-rose-200",
//   transit: "bg-slate-50 text-slate-700 border-slate-200",
//   family: "bg-pink-50 text-pink-700 border-pink-200",
// };

// function inputClass(extra = "") {
//   return [
//     "w-full rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 text-sm text-gray-900",
//     "shadow-sm outline-none transition-all placeholder:text-gray-400",
//     "hover:border-gray-300 focus:border-indigo-400 focus:ring-[3px] focus:ring-indigo-500/10 focus:shadow-[0_0_0_1px_rgba(99,102,241,0.2)]",
//     extra,
//   ].join(" ");
// }

// function formatCurrency(value: number) {
//   return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
// }

// function labelForCountry(countries: CountryOption[], code: string) {
//   const country = countries.find((item) => item.code === code);
//   return country ? `${country.name} (${country.code})` : code;
// }

// function getAssignedForm(visa: Pick<Visa, "id" | "formSchemaId">, forms: FormOption[]) {
//   return forms.find((form) => form.visaId === visa.formSchemaId) ?? forms.find((form) => form.visaId === visa.id) ?? null;
// }

// function IconButton({
//   children,
//   title,
//   className = "",
//   onClick,
// }: {
//   children: React.ReactNode;
//   title: string;
//   className?: string;
//   onClick?: () => void;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       title={title}
//       aria-label={title}
//       className={[
//         "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500",
//         "transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
//         className,
//       ].join(" ")}
//     >
//       {children}
//     </button>
//   );
// }

// export default function AdminVisasPage() {
//   const [visas, setVisas] = useState<Visa[]>([]);
//   const [countries, setCountries] = useState<CountryOption[]>([]);
//   const [forms, setForms] = useState<FormOption[]>([]);
//   const [mounted, setMounted] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [cat, setCat] = useState("all");
//   const [countryFilter, setCountryFilter] = useState("all");
//   const [deleteVisa, setDeleteVisa] = useState<Visa | null>(null);
//   const [deleting, setDeleting] = useState(false);
//   const [toast, setToast] = useState<string | null>(null);

//   const showToast = (msg: string) => {
//     setToast(msg);
//     setTimeout(() => setToast(null), 3000);
//   };

//   const fetchData = useCallback(() => {
//     setLoading(true);
//     Promise.all([
//       adminApi.getVisas(),
//       adminApi.getCountries(),
//       adminApi.getForms(),
//     ])
//       .then(([visaData, countryData, formData]) => {
//         const v = visaData as { visas: Visa[] };
//         const c = countryData as { countries: CountryOption[] };
//         const f = formData as { forms: FormOption[] };
//         setVisas(v.visas ?? []);
//         setCountries(c.countries ?? []);
//         setForms(f.forms ?? []);
//       })
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => { setMounted(true); }, []);
//   useEffect(() => { fetchData(); }, [fetchData]);

//   const categories = useMemo(() => ["all", ...Array.from(new Set(visas.map((v) => v.category).filter(Boolean)))], [visas]);
//   const countryCodes = useMemo(() => ["all", ...Array.from(new Set(visas.map((v) => v.countryCode).filter(Boolean))).sort()], [visas]);

//   const filtered = useMemo(() => {
//     const q = search.toLowerCase().trim();
//     return visas.filter((v) => {
//       const matchCat = cat === "all" || v.category === cat;
//       const matchCountry = countryFilter === "all" || v.countryCode === countryFilter;
//       const assignedForm = getAssignedForm(v, forms);
//       const matchSearch =
//         !q ||
//         v.name.toLowerCase().includes(q) ||
//         v.countryCode.toLowerCase().includes(q) ||
//         v.category.toLowerCase().includes(q) ||
//         v.id.toLowerCase().includes(q) ||
//         assignedForm?.formLabel.toLowerCase().includes(q);

//       return matchCat && matchCountry && matchSearch;
//     });
//   }, [visas, forms, search, cat, countryFilter]);

//   const stats = useMemo(() => {
//     const custom = visas.filter((v) => v.source === "custom").length;
//     const assigned = visas.filter((v) => Boolean(getAssignedForm(v, forms))).length;
//     return [
//       { label: "Visa types", value: visas.length },
//       { label: "Countries", value: new Set(visas.map((v) => v.countryCode)).size },
//       { label: "Assigned forms", value: assigned },
//       { label: "Custom visas", value: custom },
//     ];
//   }, [visas, forms]);

//   const handleDelete = async () => {
//     if (!deleteVisa) return;
//     setDeleting(true);
//     try {
//       await adminApi.deleteVisa(deleteVisa.id);
//       setDeleteVisa(null);
//       await fetchData();
//       showToast("Visa type deleted");
//     } catch (e: unknown) {
//       showToast(e instanceof Error ? e.message : "Failed to delete visa");
//       setDeleteVisa(null);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   if (!mounted) {
//     return (
//       <div className="space-y-6">
//         <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
//           <div>
//             <div className="h-3 w-40 rounded bg-gray-200" />
//             <div className="mt-3 h-8 w-56 rounded bg-gray-200" />
//             <div className="mt-3 h-4 w-full max-w-xl rounded bg-gray-200" />
//           </div>
//           <div className="h-10 w-40 rounded-xl bg-gray-200" />
//         </div>
//         <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
//           {[1, 2, 3, 4].map((item) => (
//             <div key={item} className="h-24 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//               <div className="h-7 w-12 rounded bg-gray-200" />
//               <div className="mt-3 h-3 w-24 rounded bg-gray-100" />
//             </div>
//           ))}
//         </div>
//         <div className="h-80 rounded-2xl border border-gray-200 bg-white shadow-sm" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {toast && (
//         <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
//           {toast}
//         </div>
//       )}

//       <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Catalog management</p>
//           <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-950">Visa Types</h1>
//           <p className="mt-1 max-w-2xl text-sm text-gray-500">
//             Create destination-specific visa products, assign the correct country, and connect each visa to the application form users should complete.
//           </p>
//         </div>
//         <Link
//           href="/admin/visas/new"
//           className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
//         >
//           <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           Create visa type
//         </Link>
//       </div>

//       <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
//         {stats.map((stat) => (
//           <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//             <p className="text-2xl font-black text-gray-950">{stat.value}</p>
//             <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{stat.label}</p>
//           </div>
//         ))}
//       </div>

//       <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
//         <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
//           <div className="relative">
//             <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             <input
//               type="text"
//               placeholder="Search by visa, country, category, ID, or form..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className={inputClass("pl-10")}
//             />
//           </div>
//           <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className={inputClass()}>
//             {countryCodes.map((code) => (
//               <option key={code} value={code}>
//                 {code === "all" ? "All countries" : labelForCountry(countries, code)}
//               </option>
//             ))}
//           </select>
//           <select value={cat} onChange={(e) => setCat(e.target.value)} className={inputClass("capitalize")}>
//             {categories.map((category) => (
//               <option key={category} value={category}>
//                 {category === "all" ? "All visa types" : category}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {loading ? (
//         <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
//           <div className="mx-auto h-4 w-56 animate-pulse rounded bg-gray-200" />
//         </div>
//       ) : (
//         <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[920px] text-sm">
//               <thead className="border-b border-gray-200 bg-gray-50">
//                 <tr>
//                   {["Visa type", "Country", "Category", "Form assignment", "Fee", "Timeline", "Actions"].map((h) => (
//                     <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {filtered.map((v) => {
//                   const assignedForm = getAssignedForm(v, forms);
//                   const country = countries.find((item) => item.code === v.countryCode);

//                   return (
//                     <tr key={v.id} className="transition-colors hover:bg-gray-50/80">
//                       <td className="px-5 py-4">
//                         <div className="flex items-start gap-3">
//                           <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-lg">
//                             {getFlag(v.countryCode)}
//                           </div>
//                           <div className="min-w-0">
//                             <p className="font-bold text-gray-950">{v.name}</p>
//                             <div className="mt-1 flex flex-wrap items-center gap-2">
//                               <span className="font-mono text-xs text-gray-400">{v.id}</span>
//                               {v.source === "custom" ? (
//                                 <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
//                                   custom
//                                 </span>
//                               ) : null}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-5 py-4">
//                         <p className="font-semibold text-gray-800">{country?.name ?? v.countryCode}</p>
//                         <p className="mt-0.5 text-xs font-mono text-gray-400">{v.countryCode}</p>
//                       </td>
//                       <td className="px-5 py-4">
//                         <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${CAT_COLOR[v.category] ?? "border-gray-200 bg-gray-50 text-gray-600"}`}>
//                           {v.category}
//                         </span>
//                       </td>
//                       <td className="px-5 py-4">
//                         {assignedForm ? (
//                           <div>
//                             <Link href={`/admin/forms/${assignedForm.visaId}`} className="font-semibold text-indigo-700 hover:underline">
//                               {assignedForm.formLabel}
//                             </Link>
//                             <p className="mt-0.5 font-mono text-xs text-gray-400">{assignedForm.visaId}</p>
//                           </div>
//                         ) : (
//                           <div>
//                             <p className="font-semibold text-amber-700">No form assigned</p>
//                             <p className="mt-0.5 text-xs text-gray-400">Users will see a missing-form state.</p>
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-5 py-4 font-bold text-gray-950">{formatCurrency(v.fee)}</td>
//                       <td className="px-5 py-4">
//                         <p className="font-semibold text-gray-700">{v.processingTime}</p>
//                         <p className="mt-0.5 text-xs text-gray-400">{v.validity}</p>
//                       </td>
//                       <td className="px-5 py-4">
//                         <div className="flex items-center gap-2">
//                           <Link
//                             href={`/admin/visas/${v.id}`}
//                             className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-indigo-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50"
//                             title="Edit visa"
//                             aria-label="Edit visa"
//                           >
//                             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                             </svg>
//                           </Link>
//                           <Link
//                             href={`/visa/${v.id}`}
//                             target="_blank"
//                             rel="noreferrer noopener"
//                             className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50"
//                             title="Preview public page"
//                             aria-label="Preview public page"
//                           >
//                             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z" />
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                             </svg>
//                           </Link>
//                           {v.source === "custom" ? (
//                             <IconButton title="Delete visa" onClick={() => setDeleteVisa(v)} className="text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700">
//                               <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                               </svg>
//                             </IconButton>
//                           ) : null}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {filtered.length === 0 ? (
//             <div className="px-6 py-14 text-center">
//               <p className="font-bold text-gray-800">No visa types match your filters</p>
//               <p className="mt-1 text-sm text-gray-400">Clear the search or create a new visa type for this destination.</p>
//             </div>
//           ) : null}
//         </div>
//       )}

//       {/* Delete confirmation modal */}
//       {deleteVisa && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-gray-950/45 backdrop-blur-sm" onClick={() => setDeleteVisa(null)} />
//           <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
//             <div className="flex items-start gap-4">
//               <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
//                 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
//                 </svg>
//               </div>
//               <div>
//                 <h2 className="text-lg font-black text-gray-950">Delete visa type?</h2>
//                 <p className="mt-1 text-sm text-gray-500">
//                   This permanently removes <span className="font-semibold text-gray-800">{deleteVisa.name}</span> from the catalog.
//                 </p>
//               </div>
//             </div>
//             <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
//               <p className="font-mono text-xs text-gray-500">{deleteVisa.id}</p>
//               <p className="mt-1 text-sm font-semibold text-gray-800">{labelForCountry(countries, deleteVisa.countryCode)}</p>
//             </div>
//             <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
//               <button
//                 type="button"
//                 onClick={handleDelete}
//                 disabled={deleting}
//                 className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
//               >
//                 {deleting ? "Deleting..." : "Delete visa"}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setDeleteVisa(null)}
//                 className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api-client";
import { getFlag } from "@/lib/flags";

interface Visa {
  id: string;
  name: string;
  countryCode: string;
  category: string;
  fee: number;
  processingTime: string;
  validity: string;
  stayDuration: string;
  description?: string;
  formSchemaId?: string;
  source?: "static" | "custom";
}

interface CountryOption {
  id: string;
  name: string;
  code: string;
  flag?: string;
}

interface FormOption {
  visaId: string;
  formLabel: string;
  sections: unknown[];
  hasOverride?: boolean;
}

const CAT_COLOR: Record<string, string> = {
  tourist: "bg-emerald-50 text-emerald-700 border-emerald-200",
  student: "bg-sky-50 text-sky-700 border-sky-200",
  work: "bg-amber-50 text-amber-700 border-amber-200",
  business: "bg-violet-50 text-violet-700 border-violet-200",
  medical: "bg-rose-50 text-rose-700 border-rose-200",
  transit: "bg-slate-50 text-slate-700 border-slate-200",
  family: "bg-pink-50 text-pink-700 border-pink-200",
};

function inputClass(extra = "") {
  return [
    "w-full rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 text-sm text-gray-900",
    "shadow-sm outline-none transition-all placeholder:text-gray-400",
    "hover:border-gray-300 focus:border-indigo-400 focus:ring-[3px] focus:ring-indigo-500/10 focus:shadow-[0_0_0_1px_rgba(99,102,241,0.2)]",
    extra,
  ].join(" ");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function labelForCountry(countries: CountryOption[], code: string) {
  const country = countries.find((item) => item.code === code);
  return country ? `${country.name} (${country.code})` : code;
}

function getAssignedForm(
  visa: Pick<Visa, "id" | "formSchemaId">,
  forms: FormOption[],
) {
  return (
    forms.find((form) => form.visaId === visa.formSchemaId) ??
    forms.find((form) => form.visaId === visa.id) ??
    null
  );
}

function IconButton({
  children,
  title,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500",
        "transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function AdminVisasPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [visas, setVisas] = useState<Visa[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [forms, setForms] = useState<FormOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [deleteVisa, setDeleteVisa] = useState<Visa | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      adminApi.getVisas(),
      adminApi.getCountries(),
      adminApi.getForms(),
    ])
      .then(([visaData, countryData, formData]) => {
        const v = visaData as { visas: Visa[] };
        const c = countryData as { countries: CountryOption[] };
        const f = formData as { forms: FormOption[] };
        setVisas(v.visas ?? []);
        setCountries(c.countries ?? []);
        setForms(f.forms ?? []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setIsMounted(true); // Guarantees we only render complex UI in the browser
    fetchData();
  }, [fetchData]);

  const categories = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(visas.map((v) => v.category?.trim()).filter(Boolean)),
      ),
    ],
    [visas],
  );
  const countryCodes = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(visas.map((v) => v.countryCode?.trim()).filter(Boolean)),
      ).sort(),
    ],
    [visas],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return visas.filter((v) => {
      const matchCat = cat === "all" || v.category === cat;
      const matchCountry =
        countryFilter === "all" || v.countryCode === countryFilter;
      const assignedForm = getAssignedForm(v, forms);
      const matchSearch =
        !q ||
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.countryCode && v.countryCode.toLowerCase().includes(q)) ||
        (v.category && v.category.toLowerCase().includes(q)) ||
        (v.id && v.id.toLowerCase().includes(q)) ||
        (assignedForm && assignedForm.formLabel.toLowerCase().includes(q));

      return matchCat && matchCountry && matchSearch;
    });
  }, [visas, forms, search, cat, countryFilter]);

  const stats = useMemo(() => {
    const custom = visas.filter((v) => v.source === "custom").length;
    const assigned = visas.filter((v) =>
      Boolean(getAssignedForm(v, forms)),
    ).length;
    return [
      { label: "Visa types", value: visas.length },
      {
        label: "Countries",
        value: new Set(visas.map((v) => v.countryCode)).size,
      },
      { label: "Assigned forms", value: assigned },
      { label: "Custom visas", value: custom },
    ];
  }, [visas, forms]);

  const handleDelete = async () => {
    if (!deleteVisa) return;
    setDeleting(true);
    try {
      await adminApi.deleteVisa(deleteVisa.id);
      setDeleteVisa(null);
      await fetchData();
      showToast("Visa type deleted");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to delete visa");
      setDeleteVisa(null);
    } finally {
      setDeleting(false);
    }
  };

  // 100% Hydration mismatch prevention: Do not render anything on the server.
  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            Catalog management
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-950">
            Visa Types
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Create destination-specific visa products, assign the correct
            country, and connect each visa to the application form users should
            complete.
          </p>
        </div>
        <Link
          href="/admin/visas/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
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
          Create visa type
        </Link>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={`stat-${index}`}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-2xl font-black text-gray-950">{stat.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
              placeholder="Search by visa, country, category, ID, or form..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass("pl-10")}
            />
          </div>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className={inputClass()}
          >
            {countryCodes.map((code, index) => (
              <option key={`cc-${code}-${index}`} value={code}>
                {code === "all"
                  ? "All countries"
                  : labelForCountry(countries, code)}
              </option>
            ))}
          </select>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className={inputClass("capitalize")}
          >
            {categories.map((category, index) => (
              <option key={`cat-${category}-${index}`} value={category}>
                {category === "all" ? "All visa types" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-16 shadow-sm min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
          <p className="mt-4 text-sm font-semibold text-gray-500 animate-pulse">
            Loading visa types...
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {[
                    "Visa type",
                    "Country",
                    "Category",
                    "Form assignment",
                    "Fee",
                    "Timeline",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={`th-${h}-${i}`}
                      className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((v, index) => {
                  const assignedForm = getAssignedForm(v, forms);
                  const country = countries.find(
                    (item) => item.code === v.countryCode,
                  );

                  return (
                    <tr
                      key={`visa-${v.id}-${index}`}
                      className="transition-colors hover:bg-gray-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-lg">
                            {getFlag(v.countryCode)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-950">{v.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs text-gray-400">
                                {v.id}
                              </span>
                              {v.source === "custom" ? (
                                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                                  custom
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">
                          {country?.name ?? v.countryCode}
                        </p>
                        <p className="mt-0.5 text-xs font-mono text-gray-400">
                          {v.countryCode}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${CAT_COLOR[v.category] ?? "border-gray-200 bg-gray-50 text-gray-600"}`}
                        >
                          {v.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {assignedForm ? (
                          <div>
                            <Link
                              href={`/admin/forms/${assignedForm.visaId}`}
                              className="font-semibold text-indigo-700 hover:underline"
                            >
                              {assignedForm.formLabel}
                            </Link>
                            <p className="mt-0.5 font-mono text-xs text-gray-400">
                              {assignedForm.visaId}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-amber-700">
                              No form assigned
                            </p>
                            <p className="mt-0.5 text-xs text-gray-400">
                              Users will see a missing-form state.
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-950">
                        {formatCurrency(v.fee)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-700">
                          {v.processingTime}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {v.validity}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/visas/${v.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-indigo-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50"
                            title="Edit visa"
                            aria-label="Edit visa"
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
                          <Link
                            href={`/visa/${v.id}`}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50"
                            title="Preview public page"
                            aria-label="Preview public page"
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
                                d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </Link>
                          {v.source === "custom" ? (
                            <IconButton
                              title="Delete visa"
                              onClick={() => setDeleteVisa(v)}
                              className="text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
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
                            </IconButton>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="font-bold text-gray-800">
                No visa types match your filters
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Clear the search or create a new visa type for this destination.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteVisa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-950/45 backdrop-blur-sm"
            onClick={() => setDeleteVisa(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-950">
                  Delete visa type?
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  This permanently removes{" "}
                  <span className="font-semibold text-gray-800">
                    {deleteVisa.name}
                  </span>{" "}
                  from the catalog.
                </p>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="font-mono text-xs text-gray-500">{deleteVisa.id}</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {labelForCountry(countries, deleteVisa.countryCode)}
              </p>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete visa"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteVisa(null)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
