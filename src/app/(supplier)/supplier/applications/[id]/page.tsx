// "use client";

// import { supplierApi } from "@/lib/api-client";
// import type { StoredApplication } from "@/lib/store";

// import { useState, useEffect, use, useCallback, type ReactNode } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { getFlag } from "@/lib/flags";
// import { useToast } from "@/components/dashboard/toast";

// // ─── Constants ───────────────────────────────────────────────────────────────

// const STATUS_OPTIONS = [
//   {
//     value: "submitted",
//     label: "Submitted",
//     color: "text-blue-700",
//     bg: "bg-blue-50",
//     border: "border-blue-300",
//   },
//   {
//     value: "processing",
//     label: "Processing",
//     color: "text-amber-700",
//     bg: "bg-amber-50",
//     border: "border-amber-300",
//   },
//   {
//     value: "approved",
//     label: "Approved",
//     color: "text-green-700",
//     bg: "bg-green-50",
//     border: "border-green-300",
//   },
//   {
//     value: "rejected",
//     label: "Rejected",
//     color: "text-red-700",
//     bg: "bg-red-50",
//     border: "border-red-300",
//   },
// ] as const;

// const PROCESSING_STAGES = [
//   "Documents Received",
//   "Document Verification",
//   "Application Filed",
//   "Embassy Interview Scheduled",
//   "Awaiting Embassy Decision",
//   "Decision Received",
//   "Visa Stamped",
//   "Dispatched",
// ] as const;

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// function normalizeDialablePhone(v: string) {
//   return v.replace(/[^\d+]/g, "");
// }
// function normalizeWhatsappPhone(v: string) {
//   return v.replace(/\D/g, "");
// }
// function isImageUrl(v: string) {
//   try {
//     const url = new URL(v);
//     // Extension-based detection
//     if (/\.(jpe?g|png|gif|webp|bmp|svg|heic)(\?.*)?$/i.test(url.pathname))
//       return true;
//     // Cloudinary image delivery URLs (no extension in pathname)
//     if (
//       url.hostname.includes("cloudinary.com") &&
//       url.pathname.includes("/image/upload/")
//     )
//       return true;
//     // Cloudinary image with format appended via transformation (e.g. /c_fill,...,f_jpg/)
//     if (
//       url.hostname.includes("cloudinary.com") &&
//       /\/f_(jpg|jpeg|png|webp|gif)\//i.test(url.pathname)
//     )
//       return true;
//     return false;
//   } catch {
//     return false;
//   }
// }
// function isPdfUrl(v: string) {
//   try {
//     const url = new URL(v);
//     if (/\.pdf(\?.*)?$/i.test(url.pathname)) return true;
//     // Cloudinary raw/pdf delivery
//     if (
//       url.hostname.includes("cloudinary.com") &&
//       url.pathname.includes("/raw/upload/")
//     )
//       return true;
//     return false;
//   } catch {
//     return false;
//   }
// }
// function isFileUrl(v: string) {
//   try {
//     new URL(v);
//     return v.startsWith("http");
//   } catch {
//     return false;
//   }
// }
// /** Format an ISO date string to a short human-readable date, e.g. "15 Apr 2026" */
// function formatIsoDate(iso: string | null | undefined): string {
//   if (!iso) return "";
//   try {
//     const d = new Date(iso);
//     if (isNaN(d.getTime())) return iso;
//     return d.toLocaleDateString("en-GB", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   } catch {
//     return iso;
//   }
// }
// function humanLabel(key: string) {
//   return key
//     .replace(/([A-Z])/g, " $1")
//     .replace(/_/g, " ")
//     .replace(/^\w/, (c) => c.toUpperCase())
//     .trim();
// }

// // ─── Primitives ──────────────────────────────────────────────────────────────

// function Field({
//   label,
//   value,
// }: {
//   label: string;
//   value: string | null | undefined;
// }) {
//   if (value === null || value === undefined || value === "") return null;
//   return (
//     <div>
//       <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
//         {label}
//       </p>
//       <p className="text-sm text-gray-800 font-medium">{value}</p>
//     </div>
//   );
// }

// function Section({
//   title,
//   icon,
//   children,
// }: {
//   title: string;
//   icon: string;
//   children: ReactNode;
// }) {
//   return (
//     <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
//       <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
//         <span className="text-base">{icon}</span>
//         <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
//       </div>
//       <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
//         {children}
//       </div>
//     </div>
//   );
// }

// // ─── Image / Document Viewer ──────────────────────────────────────────────────

// function DocumentEntry({
//   label,
//   value,
//   onViewImage,
// }: {
//   label: string;
//   value: string;
//   onViewImage: (src: string, label: string) => void;
// }) {
//   if (!value) return null;

//   if (isImageUrl(value)) {
//     return (
//       <div className="flex flex-col gap-1">
//         <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
//           {label}
//         </p>
//         <button
//           type="button"
//           onClick={() => onViewImage(value, label)}
//           className="relative w-full h-28 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:border-blue-400 hover:shadow-md transition-all group"
//         >
//           {/* eslint-disable-next-line @next/next/no-img-element */}
//           <img
//             src={value}
//             alt={label}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
//             onError={(e) => {
//               (e.currentTarget as HTMLImageElement).src = "";
//               e.currentTarget.parentElement!.classList.add("img-error");
//             }}
//           />
//           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
//             <span className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 text-xs font-semibold px-2 py-1 rounded shadow transition-opacity">
//               View
//             </span>
//           </div>
//         </button>
//       </div>
//     );
//   }

//   if (isPdfUrl(value)) {
//     return (
//       <div className="flex flex-col gap-1">
//         <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
//           {label}
//         </p>
//         <a
//           href={value}
//           target="_blank"
//           rel="noreferrer noopener"
//           className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-red-50 hover:border-red-200 transition-colors group"
//         >
//           <span className="text-xl">📄</span>
//           <div className="min-w-0">
//             <p className="text-xs font-semibold text-gray-700 group-hover:text-red-700 truncate">
//               PDF Document
//             </p>
//             <p className="text-[10px] text-gray-400 truncate">
//               {value.split("/").pop()?.split("?")[0] ?? "file.pdf"}
//             </p>
//           </div>
//           <svg
//             className="w-3.5 h-3.5 text-gray-400 ml-auto flex-shrink-0"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
//             />
//           </svg>
//         </a>
//       </div>
//     );
//   }

//   if (isFileUrl(value)) {
//     return (
//       <div className="flex flex-col gap-1">
//         <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
//           {label}
//         </p>
//         <a
//           href={value}
//           target="_blank"
//           rel="noreferrer noopener"
//           className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
//         >
//           <span className="text-xl">📎</span>
//           <div className="min-w-0">
//             <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-700 truncate">
//               View File
//             </p>
//             <p className="text-[10px] text-gray-400 truncate">
//               {value.split("/").pop()?.split("?")[0] ?? "document"}
//             </p>
//           </div>
//           <svg
//             className="w-3.5 h-3.5 text-gray-400 ml-auto flex-shrink-0"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
//             />
//           </svg>
//         </a>
//       </div>
//     );
//   }

//   // Plain text value
//   return <Field label={label} value={value} />;
// }

// // ─── Image Lightbox ───────────────────────────────────────────────────────────

// function ImageLightbox({
//   src,
//   label,
//   onClose,
// }: {
//   src: string;
//   label: string;
//   onClose: () => void;
// }) {
//   useEffect(() => {
//     const handler = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", handler);
//     return () => window.removeEventListener("keydown", handler);
//   }, [onClose]);

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       onClick={onClose}
//     >
//       <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
//       <div
//         className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
//           <p className="text-sm font-semibold text-gray-800 truncate">
//             {label}
//           </p>
//           <div className="flex items-center gap-2 ml-4">
//             <a
//               href={src}
//               target="_blank"
//               rel="noreferrer noopener"
//               className="text-xs text-blue-600 hover:underline font-medium"
//               onClick={(e) => e.stopPropagation()}
//             >
//               Open original ↗
//             </a>
//             <button
//               type="button"
//               onClick={onClose}
//               className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
//             >
//               <svg
//                 className="w-4 h-4"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>
//           </div>
//         </div>
//         <div className="overflow-auto flex-1 flex items-center justify-center bg-gray-900 p-4">
//           {/* eslint-disable-next-line @next/next/no-img-element */}
//           <img
//             src={src}
//             alt={label}
//             className="max-w-full max-h-[75vh] object-contain rounded-lg shadow"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Withdraw Modal ───────────────────────────────────────────────────────────

// function WithdrawModal({
//   app,
//   withdrawing,
//   onConfirm,
//   onClose,
// }: {
//   app: StoredApplication;
//   withdrawing: boolean;
//   onConfirm: () => void;
//   onClose: () => void;
// }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div
//         className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//         onClick={onClose}
//       />
//       <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 text-center">
//         <p className="text-4xl mb-3">⚠️</p>
//         <h2 className="text-lg font-black text-gray-900 mb-1">
//           Withdraw Application?
//         </h2>
//         <p className="text-sm text-gray-500 mb-1">
//           <strong>{app.visaName}</strong> — {app.userName}
//         </p>
//         <p className="text-xs text-gray-400 mb-6">
//           This will permanently remove the application and notify the applicant.
//           Only submitted applications can be withdrawn.
//         </p>
//         <div className="flex gap-3">
//           <button
//             type="button"
//             onClick={onConfirm}
//             disabled={withdrawing}
//             className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70"
//           >
//             {withdrawing ? "Withdrawing…" : "Withdraw"}
//           </button>
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Page ─────────────────────────────────────────────────────────────────────

// export default function SupplierApplicationDetailPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = use(params);
//   const router = useRouter();
//   const { showToast } = useToast();

//   // App state
//   const [app, setApp] = useState<StoredApplication | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Supplier editable fields
//   const [status, setStatus] =
//     useState<StoredApplication["status"]>("submitted");
//   const [referenceNumber, setReferenceNumber] = useState("");
//   const [estimatedDecision, setEstimatedDecision] = useState("");
//   const [supplierNotes, setSupplierNotes] = useState("");
//   const [supplierStatus, setSupplierStatus] = useState("");

//   // Save state
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);

//   // Withdraw
//   const [withdrawOpen, setWithdrawOpen] = useState(false);
//   const [withdrawing, setWithdrawing] = useState(false);

//   // Lightbox
//   const [lightbox, setLightbox] = useState<{
//     src: string;
//     label: string;
//   } | null>(null);

//   // ── Sync app → form fields ───────────────────────────────────────────────

//   const syncFields = useCallback((a: StoredApplication) => {
//     setStatus(a.status);
//     setReferenceNumber(a.referenceNumber ?? "");
//     // estimatedDecision comes back as ISO string from DB — display as readable date
//     setEstimatedDecision(formatIsoDate(a.estimatedDecision));
//     setSupplierNotes(a.supplierNotes ?? "");
//     setSupplierStatus(a.supplierStatus ?? "");
//   }, []);

//   // ── Fetch ────────────────────────────────────────────────────────────────

//   useEffect(() => {
//     let active = true;

//     supplierApi
//       .getApplication(id)
//       .then((found) => {
//         if (!active) return;
//         const nextApp = found as StoredApplication;
//         setApp(nextApp);
//         syncFields(nextApp);
//         setLoading(false);
//       })
//       .catch(() => {
//         if (!active) return;
//         setLoading(false);
//         router.push("/supplier/dashboard");
//       });

//     return () => {
//       active = false;
//     };
//   }, [id, router, syncFields]);

//   // ── Save ─────────────────────────────────────────────────────────────────

//   const handleSave = async () => {
//     if (!app) return;
//     setSaving(true);
//     try {
//       const updated = await supplierApi.updateApplication(id, {
//         status,
//         referenceNumber,
//         estimatedDecision,
//         supplierNotes,
//         supplierStatus, // ← was missing
//       });
//       const nextApp = updated as StoredApplication;
//       setApp(nextApp);
//       syncFields(nextApp);
//       setSaved(true);
//       setTimeout(() => setSaved(false), 3000);
//       showToast("Application updated successfully", "success");
//     } catch {
//       showToast("Failed to update application", "error");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── Withdraw ─────────────────────────────────────────────────────────────

//   const handleWithdraw = async () => {
//     setWithdrawing(true);
//     try {
//       await supplierApi.withdrawApplication(id);
//       showToast("Application withdrawn", "success");
//       router.push("/supplier/applications");
//     } catch (e: unknown) {
//       showToast(e instanceof Error ? e.message : "Failed to withdraw", "error");
//       setWithdrawOpen(false);
//     } finally {
//       setWithdrawing(false);
//     }
//   };

//   // ── Loading ───────────────────────────────────────────────────────────────

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-32">
//         <div className="text-center">
//           <svg
//             className="w-8 h-8 animate-spin text-[#0f2d5a] mx-auto mb-3"
//             fill="none"
//             viewBox="0 0 24 24"
//           >
//             <circle
//               className="opacity-25"
//               cx="12"
//               cy="12"
//               r="10"
//               stroke="currentColor"
//               strokeWidth="4"
//             />
//             <path
//               className="opacity-75"
//               fill="currentColor"
//               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//             />
//           </svg>
//           <p className="text-gray-500 text-sm">Loading application…</p>
//         </div>
//       </div>
//     );
//   }

//   if (!app) return null;

//   // ── Derived values ────────────────────────────────────────────────────────

//   const currentStatusCfg =
//     STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0];

//   const applicantEmail = (app.personal?.email ?? app.userEmail ?? "").trim();
//   const applicantPhoneRaw = (app.personal?.phone ?? app.userPhone ?? "").trim();
//   const dialablePhone = normalizeDialablePhone(applicantPhoneRaw);
//   const whatsappPhone = normalizeWhatsappPhone(applicantPhoneRaw);
//   const hasEmail = applicantEmail.length > 3;
//   const hasPhone = dialablePhone.length >= 8;
//   const hasWhatsapp = whatsappPhone.length >= 8;

//   const mailSubject = encodeURIComponent(`VisaHub update: ${app.visaName}`);
//   const mailBody = encodeURIComponent(
//     `Hi ${app.userName},\n\nI am your processing partner from VisaHub. This is regarding your ${app.visaName} application for ${app.countryName}.\n\nBest regards,\n${app.supplierName}`,
//   );
//   const emailHref = hasEmail
//     ? `mailto:${applicantEmail}?subject=${mailSubject}&body=${mailBody}`
//     : "";

//   const whatsappText = encodeURIComponent(
//     `Hi ${app.userName}, this is your processing partner from VisaHub regarding your ${app.visaName} application for ${app.countryName}.`,
//   );
//   const whatsappHref = hasWhatsapp
//     ? `https://wa.me/${whatsappPhone}?text=${whatsappText}`
//     : "";

//   const documentEntries = Object.entries(app.documents ?? {}).filter(([, v]) =>
//     Boolean(v),
//   );

//   // ── Render ────────────────────────────────────────────────────────────────

//   return (
//     <div className="max-w-5xl mx-auto">
//       {/* Breadcrumb */}
//       <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
//         <Link
//           href="/supplier/dashboard"
//           className="hover:text-gray-700 transition-colors"
//         >
//           Dashboard
//         </Link>
//         <span>/</span>
//         <span className="text-gray-700 font-medium">
//           Application #{id.slice(-8).toUpperCase()}
//         </span>
//       </div>

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
//         <div className="flex items-center gap-4">
//           <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-3xl select-none">
//             {getFlag(app.countryCode)}
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">{app.visaName}</h1>
//             <p className="text-gray-500 mt-0.5">
//               {app.countryName} | Applicant:{" "}
//               <span className="font-semibold text-gray-700">
//                 {app.userName}
//               </span>
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 flex-wrap">
//           <span
//             className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${currentStatusCfg.bg} ${currentStatusCfg.color} ${currentStatusCfg.border}`}
//           >
//             {currentStatusCfg.label}
//           </span>
//           <span className="text-xs text-gray-400">
//             Submitted{" "}
//             {new Date(app.submittedAt).toLocaleDateString("en-GB", {
//               day: "numeric",
//               month: "short",
//               year: "numeric",
//             })}
//           </span>
//           {app.status === "submitted" && (
//             <button
//               type="button"
//               onClick={() => setWithdrawOpen(true)}
//               className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
//             >
//               Withdraw
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Body */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* ── Left: Application Data ── */}
//         <div className="lg:col-span-2 space-y-4">
//           <Section title="Personal Information" icon="👤">
//             {Object.keys(app.personal ?? {}).length === 0 ? (
//               <p className="text-sm text-gray-400 col-span-2">
//                 No personal information recorded.
//               </p>
//             ) : (
//               Object.entries(app.personal ?? {}).map(([key, val]) => (
//                 <Field
//                   key={key}
//                   label={humanLabel(key)}
//                   value={typeof val === "string" ? val : JSON.stringify(val)}
//                 />
//               ))
//             )}
//           </Section>

//           <Section title="Passport Details" icon="🛂">
//             {Object.keys(app.passport ?? {}).length === 0 ? (
//               <p className="text-sm text-gray-400 col-span-2">
//                 No passport details recorded.
//               </p>
//             ) : (
//               Object.entries(app.passport ?? {}).map(([key, val]) => (
//                 <Field
//                   key={key}
//                   label={humanLabel(key)}
//                   value={typeof val === "string" ? val : JSON.stringify(val)}
//                 />
//               ))
//             )}
//           </Section>

//           <Section title="Travel Plans" icon="✈️">
//             {Object.keys(app.travel ?? {}).length === 0 ? (
//               <p className="text-sm text-gray-400 col-span-2">
//                 No travel details recorded.
//               </p>
//             ) : (
//               Object.entries(app.travel ?? {}).map(([key, val]) => (
//                 <Field
//                   key={key}
//                   label={humanLabel(key)}
//                   value={typeof val === "string" ? val : JSON.stringify(val)}
//                 />
//               ))
//             )}
//           </Section>

//           {/* Custom admin-form sections stored in `other` */}
//           {app.other && Object.entries(app.other)
//             .filter(([key]) => key !== "_raw")
//             .map(([sectionTitle, sectionData]) =>
//               typeof sectionData === "object" && sectionData !== null ? (
//                 <Section key={sectionTitle} title={sectionTitle} icon="📋">
//                   {Object.entries(sectionData as Record<string, unknown>).length === 0 ? (
//                     <p className="text-sm text-gray-400 col-span-2">No data recorded.</p>
//                   ) : (
//                     Object.entries(sectionData as Record<string, unknown>).map(([key, val]) => (
//                       <Field
//                         key={key}
//                         label={humanLabel(key)}
//                         value={typeof val === "string" ? val : JSON.stringify(val)}
//                       />
//                     ))
//                   )}
//                 </Section>
//               ) : null
//             )
//           }

//           {/* Documents */}
//           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
//             <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
//               <span className="text-base">📁</span>
//               <h3 className="font-bold text-gray-800 text-sm">
//                 Uploaded Documents
//               </h3>
//               {documentEntries.length > 0 && (
//                 <span className="ml-auto text-xs text-gray-400 font-medium">
//                   {documentEntries.length} file
//                   {documentEntries.length !== 1 ? "s" : ""}
//                 </span>
//               )}
//             </div>

//             {documentEntries.length > 0 ? (
//               <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {documentEntries.map(([key, value]) => (
//                   <DocumentEntry
//                     key={key}
//                     label={humanLabel(key)}
//                     value={value as string}
//                     onViewImage={(src, label) => setLightbox({ src, label })}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="p-5 flex items-center gap-2 text-gray-400">
//                 <span className="text-lg">📭</span>
//                 <p className="text-sm">No documents uploaded.</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Right: Sidebar ── */}
//         <div className="space-y-4">
//           {/* Contact card */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//             <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
//               <h3 className="font-bold text-gray-800 text-sm">
//                 Applicant Contact
//               </h3>
//               <p className="text-xs text-gray-400 mt-0.5">
//                 Use direct channels to reach this applicant
//               </p>
//             </div>
//             <div className="p-5 space-y-3">
//               <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
//                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                   Email
//                 </p>
//                 <p className="text-sm text-gray-800 mt-0.5 break-all">
//                   {hasEmail ? applicantEmail : "Not provided"}
//                 </p>
//               </div>
//               <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
//                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                   Phone
//                 </p>
//                 <p className="text-sm text-gray-800 mt-0.5">
//                   {hasPhone ? applicantPhoneRaw : "Not provided"}
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 gap-2">
//                 {hasEmail ? (
//                   <a
//                     href={emailHref}
//                     className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
//                   >
//                     ✉️ Email Applicant
//                   </a>
//                 ) : (
//                   <button
//                     type="button"
//                     disabled
//                     className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-400 cursor-not-allowed"
//                   >
//                     Email unavailable
//                   </button>
//                 )}

//                 {hasPhone ? (
//                   <a
//                     href={`tel:${dialablePhone}`}
//                     className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
//                   >
//                     📞 Call Applicant
//                   </a>
//                 ) : (
//                   <button
//                     type="button"
//                     disabled
//                     className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-400 cursor-not-allowed"
//                   >
//                     Call unavailable
//                   </button>
//                 )}

//                 {hasWhatsapp ? (
//                   <a
//                     href={whatsappHref}
//                     target="_blank"
//                     rel="noreferrer noopener"
//                     className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25d366] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1fb85a]"
//                   >
//                     <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
//                       <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
//                     </svg>
//                     WhatsApp Applicant
//                   </a>
//                 ) : (
//                   <button
//                     type="button"
//                     disabled
//                     className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-400 cursor-not-allowed"
//                   >
//                     WhatsApp unavailable
//                   </button>
//                 )}
//               </div>

//               {!hasWhatsapp && hasPhone && (
//                 <p className="text-[11px] text-gray-400">
//                   WhatsApp links work best when the phone includes a country
//                   code.
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Amount paid */}
//           <div className="bg-[#0f2d5a] text-white rounded-xl p-5">
//             <p className="text-xs text-white/50 uppercase tracking-wide font-semibold mb-1">
//               Amount Paid
//             </p>
//             <p className="text-3xl font-bold">${app.totalPaid}</p>
//             <p className="text-xs text-white/50 mt-1">via {app.supplierName}</p>
//           </div>

//           {/* Supplier actions */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//             <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
//               <h3 className="font-bold text-gray-800 text-sm">
//                 Supplier Actions
//               </h3>
//               <p className="text-xs text-gray-400 mt-0.5">
//                 Fill in your details and update the application status
//               </p>
//             </div>

//             <div className="p-5 space-y-4">
//               {/* Status */}
//               <div>
//                 <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
//                   Application Status <span className="text-red-500">*</span>
//                 </label>
//                 <div className="grid grid-cols-2 gap-2">
//                   {STATUS_OPTIONS.map((option) => (
//                     <button
//                       key={option.value}
//                       type="button"
//                       onClick={() =>
//                         setStatus(option.value as StoredApplication["status"])
//                       }
//                       className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
//                         status === option.value
//                           ? `${option.bg} ${option.color} ${option.border} ring-2 ring-offset-1 ring-current`
//                           : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
//                       }`}
//                     >
//                       {option.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Reference */}
//               <div>
//                 <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
//                   Reference / Case Number
//                 </label>
//                 <input
//                   type="text"
//                   value={referenceNumber}
//                   onChange={(e) => setReferenceNumber(e.target.value)}
//                   placeholder="e.g. VH-2025-00123"
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30 placeholder-gray-400"
//                 />
//               </div>

//               {/* Decision date */}
//               <div>
//                 <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
//                   Estimated Decision Date
//                 </label>
//                 <input
//                   type="Date"
//                   value={estimatedDecision}
//                   onChange={(e) => setEstimatedDecision(e.target.value)}
//                   placeholder="e.g. 15 Apr 2026 or 2–3 weeks"
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30 placeholder-gray-400"
//                 />
//               </div>

//               {/* Processing stage */}
//               <div>
//                 <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
//                   Internal Processing Stage
//                 </label>
//                 <select
//                   value={supplierStatus}
//                   onChange={(e) => setSupplierStatus(e.target.value)}
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30 bg-white"
//                 >
//                   <option value="">Select stage</option>
//                   {PROCESSING_STAGES.map((s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Notes */}
//               <div>
//                 <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
//                   Notes / Message to Applicant
//                 </label>
//                 <textarea
//                   value={supplierNotes}
//                   onChange={(e) => setSupplierNotes(e.target.value)}
//                   rows={4}
//                   placeholder="Enter notes or updates for the applicant."
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30 placeholder-gray-400 resize-none"
//                 />
//               </div>

//               {/* Save button */}
//               <button
//                 type="button"
//                 onClick={handleSave}
//                 disabled={saving}
//                 className="w-full py-3 bg-[#0f2d5a] hover:bg-[#0b2347] text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
//               >
//                 {saving ? (
//                   <>
//                     <svg
//                       className="w-4 h-4 animate-spin"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       />
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//                       />
//                     </svg>
//                     Saving…
//                   </>
//                 ) : saved ? (
//                   "✓ Saved and notified"
//                 ) : (
//                   "Save and Notify Applicant"
//                 )}
//               </button>

//               {saved && (
//                 <p className="text-xs text-green-600 text-center font-medium">
//                   Application updated. The applicant has been notified.
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Last updated */}
//           {app.supplierUpdatedAt && (
//             <p className="text-xs text-gray-400 text-center">
//               Last updated:{" "}
//               {new Date(app.supplierUpdatedAt).toLocaleString("en-GB", {
//                 day: "numeric",
//                 month: "short",
//                 hour: "2-digit",
//                 minute: "2-digit",
//               })}
//             </p>
//           )}
//         </div>
//       </div>

//       {/* Modals */}
//       {withdrawOpen && (
//         <WithdrawModal
//           app={app}
//           withdrawing={withdrawing}
//           onConfirm={handleWithdraw}
//           onClose={() => setWithdrawOpen(false)}
//         />
//       )}

//       {lightbox && (
//         <ImageLightbox
//           src={lightbox.src}
//           label={lightbox.label}
//           onClose={() => setLightbox(null)}
//         />
//       )}
//     </div>
//   );
// }

"use client";

import { supplierApi } from "@/lib/api-client";
import type { StoredApplication } from "@/lib/store";

import { useState, useEffect, use, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFlag } from "@/lib/flags";
import { useToast } from "@/components/dashboard/toast";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  {
    value: "submitted",
    label: "Submitted",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-300",
  },
  {
    value: "processing",
    label: "Processing",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
  },
  {
    value: "approved",
    label: "Approved",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-300",
  },
  {
    value: "rejected",
    label: "Rejected",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-300",
  },
] as const;

const PROCESSING_STAGES = [
  "Documents Received",
  "Document Verification",
  "Application Filed",
  "Embassy Interview Scheduled",
  "Awaiting Embassy Decision",
  "Decision Received",
  "Visa Stamped",
  "Dispatched",
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeDialablePhone(v: string) {
  return v.replace(/[^\d+]/g, "");
}
function normalizeWhatsappPhone(v: string) {
  return v.replace(/\D/g, "");
}
function isImageUrl(v: string) {
  try {
    const url = new URL(v);
    if (/\.(jpe?g|png|gif|webp|bmp|svg|heic)(\?.*)?$/i.test(url.pathname))
      return true;
    if (
      url.hostname.includes("cloudinary.com") &&
      url.pathname.includes("/image/upload/")
    )
      return true;
    if (
      url.hostname.includes("cloudinary.com") &&
      /\/f_(jpg|jpeg|png|webp|gif)\//i.test(url.pathname)
    )
      return true;
    return false;
  } catch {
    return false;
  }
}
function isPdfUrl(v: string) {
  try {
    const url = new URL(v);
    if (/\.pdf(\?.*)?$/i.test(url.pathname)) return true;
    if (
      url.hostname.includes("cloudinary.com") &&
      url.pathname.includes("/raw/upload/")
    )
      return true;
    return false;
  } catch {
    return false;
  }
}
function isFileUrl(v: string) {
  try {
    new URL(v);
    return v.startsWith("http");
  } catch {
    return false;
  }
}
function formatIsoDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
function humanLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

/** Returns true if a plain object has at least one non-empty value */
function hasData(obj: Record<string, unknown> | null | undefined): boolean {
  if (!obj) return false;
  return Object.values(obj).some(
    (v) => v !== null && v !== undefined && v !== "",
  );
}

// ─── Primitives ──────────────────────────────────────────────────────────────

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
        {label}
      </p>
      <p className="text-sm text-gray-800 font-medium">{value}</p>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

// ─── Image / Document Viewer ──────────────────────────────────────────────────

function DocumentEntry({
  label,
  value,
  onViewImage,
}: {
  label: string;
  value: string;
  onViewImage: (src: string, label: string) => void;
}) {
  if (!value) return null;

  if (isImageUrl(value)) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
          {label}
        </p>
        <button
          type="button"
          onClick={() => onViewImage(value, label)}
          className="relative w-full h-28 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "";
              e.currentTarget.parentElement!.classList.add("img-error");
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
            <span className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 text-xs font-semibold px-2 py-1 rounded shadow transition-opacity">
              View
            </span>
          </div>
        </button>
      </div>
    );
  }

  if (isPdfUrl(value)) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
          {label}
        </p>
        <a
          href={value}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-red-50 hover:border-red-200 transition-colors group"
        >
          <span className="text-xl">📄</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 group-hover:text-red-700 truncate">
              PDF Document
            </p>
            <p className="text-[10px] text-gray-400 truncate">
              {value.split("/").pop()?.split("?")[0] ?? "file.pdf"}
            </p>
          </div>
          <svg
            className="w-3.5 h-3.5 text-gray-400 ml-auto flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    );
  }

  if (isFileUrl(value)) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
          {label}
        </p>
        <a
          href={value}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
        >
          <span className="text-xl">📎</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-700 truncate">
              View File
            </p>
            <p className="text-[10px] text-gray-400 truncate">
              {value.split("/").pop()?.split("?")[0] ?? "document"}
            </p>
          </div>
          <svg
            className="w-3.5 h-3.5 text-gray-400 ml-auto flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    );
  }

  return <Field label={label} value={value} />;
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────

function ImageLightbox({
  src,
  label,
  onClose,
}: {
  src: string;
  label: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {label}
          </p>
          <div className="flex items-center gap-2 ml-4">
            <a
              href={src}
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs text-blue-600 hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Open original ↗
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-auto flex-1 flex items-center justify-center bg-gray-900 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={label}
            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Withdraw Modal ───────────────────────────────────────────────────────────

function WithdrawModal({
  app,
  withdrawing,
  onConfirm,
  onClose,
}: {
  app: StoredApplication;
  withdrawing: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 text-center">
        <p className="text-4xl mb-3">⚠️</p>
        <h2 className="text-lg font-black text-gray-900 mb-1">
          Withdraw Application?
        </h2>
        <p className="text-sm text-gray-500 mb-1">
          <strong>{app.visaName}</strong> — {app.userName}
        </p>
        <p className="text-xs text-gray-400 mb-6">
          This will permanently remove the application and notify the applicant.
          Only submitted applications can be withdrawn.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={withdrawing}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70"
          >
            {withdrawing ? "Withdrawing…" : "Withdraw"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SupplierApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [app, setApp] = useState<StoredApplication | null>(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] =
    useState<StoredApplication["status"]>("submitted");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [estimatedDecision, setEstimatedDecision] = useState("");
  const [supplierNotes, setSupplierNotes] = useState("");
  const [supplierStatus, setSupplierStatus] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const [lightbox, setLightbox] = useState<{
    src: string;
    label: string;
  } | null>(null);

  const syncFields = useCallback((a: StoredApplication) => {
    setStatus(a.status);
    setReferenceNumber(a.referenceNumber ?? "");
    setEstimatedDecision(formatIsoDate(a.estimatedDecision));
    setSupplierNotes(a.supplierNotes ?? "");
    setSupplierStatus(a.supplierStatus ?? "");
  }, []);

  useEffect(() => {
    let active = true;
    supplierApi
      .getApplication(id)
      .then((found) => {
        if (!active) return;
        const nextApp = found as StoredApplication;
        setApp(nextApp);
        syncFields(nextApp);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
        router.push("/supplier/dashboard");
      });
    return () => {
      active = false;
    };
  }, [id, router, syncFields]);

  const handleSave = async () => {
    if (!app) return;
    setSaving(true);
    try {
      const updated = await supplierApi.updateApplication(id, {
        status,
        referenceNumber,
        estimatedDecision,
        supplierNotes,
        supplierStatus,
      });
      const nextApp = updated as StoredApplication;
      setApp(nextApp);
      syncFields(nextApp);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      showToast("Application updated successfully", "success");
    } catch {
      showToast("Failed to update application", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await supplierApi.withdrawApplication(id);
      showToast("Application withdrawn", "success");
      router.push("/supplier/applications");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to withdraw", "error");
      setWithdrawOpen(false);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <svg
            className="w-8 h-8 animate-spin text-[#0f2d5a] mx-auto mb-3"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-gray-500 text-sm">Loading application…</p>
        </div>
      </div>
    );
  }

  if (!app) return null;

  // ── Derived values ────────────────────────────────────────────────────────

  const currentStatusCfg =
    STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0];

  const applicantEmail = (app.personal?.email ?? app.userEmail ?? "").trim();
  const applicantPhoneRaw = (app.personal?.phone ?? app.userPhone ?? "").trim();
  const dialablePhone = normalizeDialablePhone(applicantPhoneRaw);
  const whatsappPhone = normalizeWhatsappPhone(applicantPhoneRaw);
  const hasEmail = applicantEmail.length > 3;
  const hasPhone = dialablePhone.length >= 8;
  const hasWhatsapp = whatsappPhone.length >= 8;

  const mailSubject = encodeURIComponent(`VisaHub update: ${app.visaName}`);
  const mailBody = encodeURIComponent(
    `Hi ${app.userName},\n\nI am your processing partner from VisaHub. This is regarding your ${app.visaName} application for ${app.countryName}.\n\nBest regards,\n${app.supplierName}`,
  );
  const emailHref = hasEmail
    ? `mailto:${applicantEmail}?subject=${mailSubject}&body=${mailBody}`
    : "";

  const whatsappText = encodeURIComponent(
    `Hi ${app.userName}, this is your processing partner from VisaHub regarding your ${app.visaName} application for ${app.countryName}.`,
  );
  const whatsappHref = hasWhatsapp
    ? `https://wa.me/${whatsappPhone}?text=${whatsappText}`
    : "";

  const documentEntries = Object.entries(app.documents ?? {}).filter(([, v]) =>
    Boolean(v),
  );

  // Only render standard sections that actually have data
  const showPersonal = hasData(app.personal as Record<string, unknown>);
  const showPassport = hasData(app.passport as Record<string, unknown>);
  const showTravel = hasData(app.travel as Record<string, unknown>);

  // Custom sections from `other` (admin-built forms) — skip _raw, skip empty
  const customSections = app.other
    ? Object.entries(app.other)
        .filter(([key]) => key !== "_raw")
        .filter(
          ([, data]) =>
            typeof data === "object" &&
            data !== null &&
            hasData(data as Record<string, unknown>),
        )
    : [];

  const hasAnyFormData =
    showPersonal ||
    showPassport ||
    showTravel ||
    customSections.length > 0 ||
    documentEntries.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link
          href="/supplier/dashboard"
          className="hover:text-gray-700 transition-colors"
        >
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">
          Application #{id.slice(-8).toUpperCase()}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-3xl select-none">
            {getFlag(app.countryCode)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{app.visaName}</h1>
            <p className="text-gray-500 mt-0.5">
              {app.countryName} | Applicant:{" "}
              <span className="font-semibold text-gray-700">
                {app.userName}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${currentStatusCfg.bg} ${currentStatusCfg.color} ${currentStatusCfg.border}`}
          >
            {currentStatusCfg.label}
          </span>
          <span className="text-xs text-gray-400">
            Submitted{" "}
            {new Date(app.submittedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          {app.status === "submitted" && (
            <button
              type="button"
              onClick={() => setWithdrawOpen(true)}
              className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
            >
              Withdraw
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Application Data ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* No data fallback */}
          {!hasAnyFormData && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 flex flex-col items-center text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500 font-semibold text-sm">
                No form data submitted
              </p>
              <p className="text-gray-400 text-xs mt-1">
                The applicant did not fill in any form fields.
              </p>
            </div>
          )}

          {/* Personal — only if has data */}
          {showPersonal && (
            <Section title="Personal Information" icon="👤">
              {Object.entries(app.personal ?? {})
                .filter(([, v]) => Boolean(v))
                .map(([key, val]) => (
                  <Field
                    key={key}
                    label={humanLabel(key)}
                    value={typeof val === "string" ? val : JSON.stringify(val)}
                  />
                ))}
            </Section>
          )}

          {/* Passport — only if has data */}
          {showPassport && (
            <Section title="Passport Details" icon="🛂">
              {Object.entries(app.passport ?? {})
                .filter(([, v]) => Boolean(v))
                .map(([key, val]) => (
                  <Field
                    key={key}
                    label={humanLabel(key)}
                    value={typeof val === "string" ? val : JSON.stringify(val)}
                  />
                ))}
            </Section>
          )}

          {/* Travel — only if has data */}
          {showTravel && (
            <Section title="Travel Plans" icon="✈️">
              {Object.entries(app.travel ?? {})
                .filter(([, v]) => Boolean(v))
                .map(([key, val]) => (
                  <Field
                    key={key}
                    label={humanLabel(key)}
                    value={typeof val === "string" ? val : JSON.stringify(val)}
                  />
                ))}
            </Section>
          )}

          {/* Custom admin-form sections — only if has data
          {customSections.map(([sectionTitle, sectionData]) => (
            <Section key={sectionTitle} title={sectionTitle} icon="📋">
              {Object.entries(sectionData as Record<string, unknown>)
                .filter(([, v]) => v !== null && v !== undefined && v !== "")
                .map(([key, val]) => (
                  <Field
                    key={key}
                    label={humanLabel(key)}
                    value={typeof val === "string" ? val : JSON.stringify(val)}
                  />
                ))}
            </Section>
          ))} */}

          {/* Documents — only if has data */}
          {documentEntries.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <span className="text-base">📁</span>
                <h3 className="font-bold text-gray-800 text-sm">
                  Uploaded Documents
                </h3>
                <span className="ml-auto text-xs text-gray-400 font-medium">
                  {documentEntries.length} file
                  {documentEntries.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documentEntries.map(([key, value]) => (
                  <DocumentEntry
                    key={key}
                    label={humanLabel(key)}
                    value={value as string}
                    onViewImage={(src, label) => setLightbox({ src, label })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="space-y-4">
          {/* Contact card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 text-sm">
                Applicant Contact
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Use direct channels to reach this applicant
              </p>
            </div>
            <div className="p-5 space-y-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Email
                </p>
                <p className="text-sm text-gray-800 mt-0.5 break-all">
                  {hasEmail ? applicantEmail : "Not provided"}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Phone
                </p>
                <p className="text-sm text-gray-800 mt-0.5">
                  {hasPhone ? applicantPhoneRaw : "Not provided"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {hasEmail ? (
                  <a
                    href={emailHref}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    ✉️ Email Applicant
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-400 cursor-not-allowed"
                  >
                    Email unavailable
                  </button>
                )}

                {hasPhone ? (
                  <a
                    href={`tel:${dialablePhone}`}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    📞 Call Applicant
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-400 cursor-not-allowed"
                  >
                    Call unavailable
                  </button>
                )}

                {hasWhatsapp ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25d366] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1fb85a]"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp Applicant
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-400 cursor-not-allowed"
                  >
                    WhatsApp unavailable
                  </button>
                )}
              </div>

              {!hasWhatsapp && hasPhone && (
                <p className="text-[11px] text-gray-400">
                  WhatsApp links work best when the phone includes a country
                  code.
                </p>
              )}
            </div>
          </div>

          {/* Amount paid */}
          <div className="bg-[#0f2d5a] text-white rounded-xl p-5">
            <p className="text-xs text-white/50 uppercase tracking-wide font-semibold mb-1">
              Amount Paid
            </p>
            <p className="text-3xl font-bold">${app.totalPaid}</p>
            <p className="text-xs text-white/50 mt-1">via {app.supplierName}</p>
          </div>

          {/* Supplier actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 text-sm">
                Supplier Actions
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Fill in your details and update the application status
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                  Application Status <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setStatus(option.value as StoredApplication["status"])
                      }
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        status === option.value
                          ? `${option.bg} ${option.color} ${option.border} ring-2 ring-offset-1 ring-current`
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                  Reference / Case Number
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. VH-2025-00123"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30 placeholder-gray-400"
                />
              </div>

              {/* Decision date */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                  Estimated Decision Date
                </label>
                <input
                  type="date"
                  value={estimatedDecision}
                  onChange={(e) => setEstimatedDecision(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30 placeholder-gray-400"
                />
              </div>

              {/* Processing stage */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                  Internal Processing Stage
                </label>
                <select
                  value={supplierStatus}
                  onChange={(e) => setSupplierStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30 bg-white"
                >
                  <option value="">Select stage</option>
                  {PROCESSING_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                  Notes / Message to Applicant
                </label>
                <textarea
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  rows={4}
                  placeholder="Enter notes or updates for the applicant."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Save button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-[#0f2d5a] hover:bg-[#0b2347] text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Saving…
                  </>
                ) : saved ? (
                  "✓ Saved and notified"
                ) : (
                  "Save and Notify Applicant"
                )}
              </button>

              {saved && (
                <p className="text-xs text-green-600 text-center font-medium">
                  Application updated. The applicant has been notified.
                </p>
              )}
            </div>
          </div>

          {/* Last updated */}
          {app.supplierUpdatedAt && (
            <p className="text-xs text-gray-400 text-center">
              Last updated:{" "}
              {new Date(app.supplierUpdatedAt).toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      {/* Modals */}
      {withdrawOpen && (
        <WithdrawModal
          app={app}
          withdrawing={withdrawing}
          onConfirm={handleWithdraw}
          onClose={() => setWithdrawOpen(false)}
        />
      )}

      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          label={lightbox.label}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
