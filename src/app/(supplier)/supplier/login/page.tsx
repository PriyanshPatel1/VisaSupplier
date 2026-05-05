// "use client";

// import { useState, FormEvent } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function SupplierLoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const res = await fetch("/api/auth/supplier/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password }),
//       });
//       const json = await res.json();
//       if (!res.ok) {
//         setError(json.error ?? "Invalid credentials");
//         return;
//       }
//       router.push("/supplier/dashboard");
//     } catch {
//       setError("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0b1a35] to-[#0f2d5a] flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center gap-3 mb-4">
//             <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
//               <svg
//                 className="w-5 h-5 text-white"
//                 fill="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
//               </svg>
//             </div>
//             <span className="text-2xl font-bold text-white">VisaHub</span>
//           </div>
//           <h1 className="text-xl font-bold text-white">Supplier Portal</h1>
//           <p className="text-white/50 text-sm mt-1">
//             Sign in to manage your assigned applications
//           </p>
//         </div>

//         {/* Card */}
//         <div className="bg-white rounded-2xl shadow-2xl p-8">
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1.5">
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="you@supplier.com"
//                 required
//                 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30 focus:border-[#0f2d5a]/50 placeholder-gray-400"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1.5">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="••••••••"
//                 required
//                 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30 focus:border-[#0f2d5a]/50 placeholder-gray-400"
//               />
//             </div>

//             {error && (
//               <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
//                 {error}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-[#0f2d5a] hover:bg-[#0b2347] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <svg
//                     className="w-4 h-4 animate-spin"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     />
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//                     />
//                   </svg>
//                   Signing in...
//                 </>
//               ) : (
//                 "Sign In to Portal"
//               )}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supplierLoginSchema } from "@/lib/validators";

export default function SupplierLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const parsed = supplierLoginSchema.safeParse({ email, password });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Please check your credentials");
        return;
      }

      const res = await fetch("/api/auth/supplier/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed.data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Invalid credentials");
        return;
      }

      router.push("/supplier/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#0b1a35] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/20 blur-3xl rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/20 blur-3xl rounded-full bottom-[-120px] right-[-80px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </div>
            <span className="text-2xl font-semibold tracking-tight text-white">
              VisaHub
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Supplier Portal</h1>
          <p className="text-white/60 text-sm mt-1 leading-relaxed">
            Sign in to manage your assigned applications
          </p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@supplier.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-900
                bg-white/70 border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-900
                bg-white/70 border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-sm text-red-600 animate-in fade-in">
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-r from-blue-600 to-indigo-600
              hover:from-blue-700 hover:to-indigo-700
              transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]
              flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
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
                  Signing in...
                </>
              ) : (
                "Sign In to Portal"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
