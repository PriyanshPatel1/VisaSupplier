// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { adminApi } from "@/lib/api-client";

// interface SupplierForm {
//   name: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   type: string;
//   priceMultiplier: string;
//   rating: string;
// }

// const DEFAULTS: SupplierForm = {
//   name: "",
//   email: "",
//   password: "",
//   confirmPassword: "",
//   type: "agency",
//   priceMultiplier: "1.0",
//   rating: "4.5",
// };

// export default function AdminSupplierNewPage() {
//   const router = useRouter();
//   const [form, setForm] = useState<SupplierForm>(DEFAULTS);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const update = (k: keyof SupplierForm, v: string) =>
//     setForm((f) => ({ ...f, [k]: v }));

//   const handleSubmit = async () => {
//     setError(null);

//     if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
//       setError("Name, email, and password are required.");
//       return;
//     }
//     if (form.password !== form.confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }
//     if (form.password.length < 6) {
//       setError("Password must be at least 6 characters.");
//       return;
//     }

//     setSaving(true);
//     try {
//       await adminApi.createSupplier({
//         name: form.name.trim(),
//         email: form.email.trim(),
//         password: form.password,
//         type: form.type,
//         priceMultiplier: parseFloat(form.priceMultiplier) || 1.0,
//         rating: parseFloat(form.rating) || 4.5,
//       });
//       router.push("/admin/suppliers");
//     } catch (e: unknown) {
//       setError(e instanceof Error ? e.message : "Failed to create supplier");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-8">
//         <Link
//           href="/admin/suppliers"
//           className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
//         >
//           <svg
//             className="w-5 h-5"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//         </Link>
//         <div>
//           <h1 className="text-2xl font-black text-gray-900">Add Supplier</h1>
//           <p className="text-gray-500 text-sm mt-0.5">
//             Create a new visa processing supplier
//           </p>
//         </div>
//       </div>

//       {error && (
//         <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
//           <span>⚠️</span> {error}
//         </div>
//       )}

//       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
//         {/* Basic Info */}
//         <div>
//           <p className="font-bold text-gray-900 mb-4">Basic Information</p>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//             <div className="sm:col-span-2">
//               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
//                 Supplier Name <span className="text-red-400">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={form.name}
//                 onChange={(e) => update("name", e.target.value)}
//                 placeholder="e.g. Global Visa Agency"
//                 className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
//               />
//             </div>

//             <div className="sm:col-span-2">
//               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
//                 Email Address <span className="text-red-400">*</span>
//               </label>
//               <input
//                 type="email"
//                 value={form.email}
//                 onChange={(e) => update("email", e.target.value)}
//                 placeholder="supplier@example.com"
//                 className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
//               />
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
//                 Password <span className="text-red-400">*</span>
//               </label>
//               <input
//                 type="password"
//                 value={form.password}
//                 onChange={(e) => update("password", e.target.value)}
//                 placeholder="Min 6 characters"
//                 className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
//               />
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
//                 Confirm Password <span className="text-red-400">*</span>
//               </label>
//               <input
//                 type="password"
//                 value={form.confirmPassword}
//                 onChange={(e) => update("confirmPassword", e.target.value)}
//                 placeholder="Repeat password"
//                 className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Config */}
//         <div className="pt-5 border-t border-gray-100">
//           <p className="font-bold text-gray-900 mb-4">Configuration</p>
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
//             <div>
//               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
//                 Supplier Type
//               </label>
//               <select
//                 value={form.type}
//                 onChange={(e) => update("type", e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
//               >
//                 <option value="agency">Agency</option>
//                 <option value="embassy">Embassy</option>
//                 <option value="government">Government</option>
//                 <option value="courier">Courier</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
//                 Price Multiplier
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 min="0.5"
//                 max="5"
//                 value={form.priceMultiplier}
//                 onChange={(e) => update("priceMultiplier", e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
//               />
//               <p className="text-xs text-gray-400 mt-1">1.0 = base price</p>
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
//                 Initial Rating
//               </label>
//               <input
//                 type="number"
//                 step="0.1"
//                 min="1"
//                 max="5"
//                 value={form.rating}
//                 onChange={(e) => update("rating", e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
//               />
//               <p className="text-xs text-gray-400 mt-1">1.0 – 5.0</p>
//             </div>
//           </div>
//         </div>

//         {/* Preview card */}
//         <div className="pt-5 border-t border-gray-100">
//           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
//             Preview
//           </p>
//           <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
//             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-black flex-shrink-0">
//               {form.name?.[0]?.toUpperCase() ?? "?"}
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="font-bold text-gray-900 truncate">
//                 {form.name || "Supplier Name"}
//               </p>
//               <p className="text-sm text-gray-500 truncate">
//                 {form.email || "email@example.com"}
//               </p>
//             </div>
//             <div className="text-right flex-shrink-0">
//               <span
//                 className={[
//                   "text-xs font-bold px-2.5 py-1 rounded-full capitalize",
//                   form.type === "embassy"
//                     ? "bg-blue-100 text-blue-700"
//                     : "bg-purple-100 text-purple-700",
//                 ].join(" ")}
//               >
//                 {form.type}
//               </span>
//               <p className="text-xs text-amber-500 mt-1">⭐ {form.rating}</p>
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex items-center gap-3 pt-2">
//           <button
//             onClick={handleSubmit}
//             disabled={saving}
//             className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
//           >
//             {saving ? (
//               <>
//                 <svg
//                   className="w-4 h-4 animate-spin"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   />
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v8H4z"
//                   />
//                 </svg>
//                 Creating…
//               </>
//             ) : (
//               "✅ Create Supplier"
//             )}
//           </button>
//           <Link
//             href="/admin/suppliers"
//             className="px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors"
//           >
//             Cancel
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi } from "@/lib/api-client";

interface SupplierForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  type: string;
  priceMultiplier: string;
  rating: string;
}

const DEFAULTS: SupplierForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  type: "agency",
  priceMultiplier: "1.0",
  rating: "4.5",
};

export default function AdminSupplierNewPage() {
  const router = useRouter();
  const [form, setForm] = useState<SupplierForm>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof SupplierForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Name, email, and password are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    try {
      await adminApi.createSupplier({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        type: form.type,
        priceMultiplier: parseFloat(form.priceMultiplier) || 1.0,
        rating: parseFloat(form.rating) || 4.5,
      });
      router.push("/admin/suppliers");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create supplier");
    } finally {
      setSaving(false);
    }
  };

  // Helper for dynamic badge colors
  const getTypeColor = (type: string) => {
    switch (type) {
      case "embassy":
        return "bg-blue-50 text-blue-700 ring-blue-600/20";
      case "government":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "courier":
        return "bg-orange-50 text-orange-700 ring-orange-600/20";
      default:
        return "bg-purple-50 text-purple-700 ring-purple-600/20";
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/suppliers"
          className="group p-2 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all"
        >
          <svg
            className="w-5 h-5 text-slate-500 group-hover:text-slate-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Add New Supplier
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Register a new visa processing partner into the system.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Error creating supplier
            </h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT SIDE: Form (Takes up 8 columns on large screens) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Profile Section */}
            <div className="p-6 sm:p-8 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900 mb-5">
                Supplier Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Global Visa Agency"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="supplier@example.com"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* System Configuration Section */}
            <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-base font-semibold text-slate-900 mb-5">
                System Configuration
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Supplier Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => update("type", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="agency">Agency</option>
                    <option value="embassy">Embassy</option>
                    <option value="government">Government</option>
                    <option value="courier">Courier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Price Multiplier
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.5"
                      max="5"
                      value={form.priceMultiplier}
                      onChange={(e) =>
                        update("priceMultiplier", e.target.value)
                      }
                      className="w-full pl-4 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 text-sm">x</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Base multiplier (e.g. 1.0)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Initial Rating
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={form.rating}
                      onChange={(e) => update("rating", e.target.value)}
                      className="w-full pl-4 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 text-sm">⭐</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Rating from 1.0 to 5.0
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="p-6 sm:p-8 bg-slate-50 flex items-center justify-end gap-3">
              <Link
                href="/admin/suppliers"
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                {saving ? (
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
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Create Supplier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Live Preview (Takes up 4 columns on large screens) */}
        <div className="lg:col-span-4">
          <div className="sticky top-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
              Live Preview
            </h3>

            {/* Preview Card */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
              {/* Card Banner / Header */}
              <div className="h-24 bg-gradient-to-r from-indigo-500 to-violet-600 relative">
                {/* Avatar */}
                <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-xl bg-white p-1 shadow-sm">
                  <div className="w-full h-full rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-black">
                    {form.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                </div>
                {/* Type Badge Floating */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ring-1 ring-inset ${getTypeColor(form.type)}`}
                  >
                    {form.type}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="pt-10 pb-6 px-6">
                <h4
                  className="text-lg font-bold text-slate-900 truncate"
                  title={form.name}
                >
                  {form.name || "Supplier Name"}
                </h4>
                <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm truncate">
                    {form.email || "email@example.com"}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Base Multiplier
                    </p>
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-bold text-slate-900">
                        {form.priceMultiplier || "1.0"}x
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Reputation
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-amber-500">
                        ⭐ {form.rating || "0.0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Helper Text below preview */}
            <p className="text-xs text-slate-400 mt-4 text-center px-4 leading-relaxed">
              This preview shows how the supplier will appear in directories and
              internal lists.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
