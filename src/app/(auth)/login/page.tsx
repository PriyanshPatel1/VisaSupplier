"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/dashboard/toast";
import Link from "next/link";
import { loginSchema } from "@/lib/validators";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({
      email: formData.email,
      password: formData.password,
      rememberMe,
    });
    if (!parsed.success) {
      showToast(parsed.error.issues[0]?.message ?? "Please check your login details", "error");
      return;
    }
    try {
      await login(parsed.data.email, parsed.data.password, parsed.data.rememberMe);
      showToast("Login successful! Redirecting...", "success");
      const redirect = searchParams.get("redirect");
      router.push(redirect && redirect.startsWith("/") ? redirect : "/user/applications");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Login failed", "error");
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full opacity-20 -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 rounded-full opacity-20 -ml-48 -mb-48"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-indigo-600 font-bold">✈</span>
            </div>
            <span className="text-white text-2xl font-bold">VisaHub</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm mb-16">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>Trusted by 500+ agencies worldwide</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Streamline your visa operations{" "}
            <span className="text-indigo-200">effortlessly.</span>
          </h1>
          <p className="text-white/80 text-lg mb-12">
            Manage suppliers, track applications, and deliver seamless
            experiences to your clients — all in one platform.
          </p>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-12">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/60 text-sm mb-2">Monthly Applications</p>
                <p className="text-4xl font-bold text-white mb-4">1,284</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-1 bg-indigo-300 rounded-full" style={{ height: `${20 + i * 10}px` }}></div>
                  ))}
                </div>
              </div>
              <span className="text-green-400 text-xl font-semibold">+18.7%</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: "🌐", label: "50+ Countries" },
              { icon: "⚡", label: "Real-time Tracking" },
              { icon: "🔒", label: "Secure & Compliant" },
            ].map((badge) => (
              <div key={badge.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white/80 text-sm flex items-center gap-2">
                <span>{badge.icon}</span>
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 py-12">
        <div className="max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">✈</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">VisaHub</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
          <p className="text-slate-600 mb-8">Sign in to your account to continue</p>
          {searchParams.get("registered") === "1" && (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              Account created! Please check your email and verify your address before signing in.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} disabled={isLoading} placeholder="admin@visahub.com" className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors disabled:opacity-50" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} disabled={isLoading} placeholder="••••••••" className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors disabled:opacity-50" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <input id="remember" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-2 focus:ring-indigo-500" />
              <label htmlFor="remember" className="ml-2 text-sm text-slate-700">Remember me for 30 days</label>
            </div>
            <button type="submit" disabled={isLoading} className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? "Signing in..." : "Sign in to VisaHub"}
            </button>
          </form>
          <p className="text-center text-slate-600 text-sm mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
