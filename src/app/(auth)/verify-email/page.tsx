"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error" | "idle">(
    token ? "verifying" : "idle"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) { setStatus("success"); }
        else { setStatus("error"); setMessage(j.error ?? "Verification failed."); }
      })
      .catch(() => { setStatus("error"); setMessage("Network error. Please try again."); });
  }, [token]);

  const resend = async () => {
    const email = prompt("Enter your email to resend verification:");
    if (!email) return;
    const res = await fetch("/api/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(payload.error ?? "Unable to resend verification email right now.");
      return;
    }

    alert(
      payload.data?.message ??
        "If that email is registered and unverified, a new link has been sent."
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-800">Verifying your email…</h1>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Email Verified!</h1>
            <p className="text-slate-500 mb-6">Your account is now active. You can sign in.</p>
            <Link href="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
              Sign In
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h1>
            <p className="text-slate-500 mb-6">{message || "This link may have expired or already been used."}</p>
            <button onClick={resend} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
              Resend Verification Email
            </button>
          </>
        )}
        {status === "idle" && (
          <>
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Check Your Email</h1>
            <p className="text-slate-500 mb-6">
              We sent a verification link to your email. Click it to activate your account.
            </p>
            <button onClick={resend} className="text-indigo-600 underline text-sm">
              Resend verification email
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
