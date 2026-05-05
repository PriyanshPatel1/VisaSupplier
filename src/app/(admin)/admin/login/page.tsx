// "use client";

// import { useState, FormEvent } from "react";
// import { useRouter } from "next/navigation";

// export default function AdminLoginPage() {
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
//       const res = await fetch("/api/auth/admin/login", {
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
//       router.push("/admin/dashboard");
//     } catch {
//       setError("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white text-xl font-bold mb-4">
//             V
//           </div>
//           <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
//           <p className="text-white/40 text-sm mt-1">VisaHub Form Management</p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-2xl p-8">
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 placeholder="admin@visahub.com"
//                 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 placeholder="••••••••"
//                 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
//               />
//             </div>
//             {error && (
//               <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
//                 {error}
//               </p>
//             )}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
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
//                 "Sign In"
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
import { ClientOnly } from "@/components/ui/ClientOnly";
import { adminLoginSchema } from "@/lib/validators";

export default function AdminLoginPage() {
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
      const parsed = adminLoginSchema.safeParse({ email, password });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Please check your credentials");
        return;
      }

      const res = await fetch("/api/auth/admin/login", {
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

      router.push("/admin/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0f1f] overflow-hidden">
      {/* 🌌 Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent" />
      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-indigo-500/20 blur-[120px]" />
      <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-purple-500/20 blur-[120px]" />

      {/* 🌐 Layout */}
      <div className="relative grid lg:grid-cols-2 min-h-screen">
        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-between p-16 text-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-bold">
                V
              </div>
              <span className="text-lg font-medium tracking-wide">
                VisaHub Admin
              </span>
            </div>

            <h1 className="mt-16 text-5xl font-semibold leading-tight">
              Control your
              <br />
              visa operations
            </h1>

            <p className="mt-6 text-white/60 max-w-md text-sm leading-relaxed">
              Securely manage applications, approvals, and workflows in a
              centralized system built for reliability and scale.
            </p>
          </div>

          <ClientOnly fallback={<p className="text-white/30 text-xs">© VisaHub · Internal System</p>}>
            <p className="text-white/30 text-xs">
              © {new Date().getFullYear()} VisaHub · Internal System
            </p>
          </ClientOnly>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/20 to-white/5">
              {/* Glass Card */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.5)] p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-white">
                    Admin Login
                  </h2>
                  <p className="text-white/40 text-sm mt-1">
                    Access VisaHub dashboard
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="peer w-full px-4 pt-5 pb-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Email"
                    />
                    <label className="absolute left-4 top-2 text-xs text-white/40 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs">
                      Email Address
                    </label>
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="peer w-full px-4 pt-5 pb-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Password"
                    />
                    <label className="absolute left-4 top-2 text-xs text-white/40 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs">
                      Password
                    </label>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}

                  {/* Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 
                    text-white font-medium text-sm transition-all 
                    hover:brightness-110 active:scale-[0.98] 
                    shadow-lg shadow-indigo-900/40 
                    disabled:opacity-60"
                  >
                    {loading ? "Authenticating..." : "Sign In"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
