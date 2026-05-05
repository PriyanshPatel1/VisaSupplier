"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      reset();
      setRetrying(false);
    }, 800);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-600/10 blur-[120px]" />
        <div className="absolute left-1/4 top-2/3 h-[300px] w-[300px] rounded-full bg-violet-600/8 blur-[80px]" />
        <div className="absolute right-1/4 top-1/4 h-[200px] w-[200px] rounded-full bg-orange-500/6 blur-[60px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20">
        {/* Error code badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
          <span className="font-mono text-xs font-medium tracking-widest text-rose-300/90 uppercase">
            System Error
          </span>
        </div>

        {/* Main heading */}
        <h1
          className="mb-4 text-center font-black leading-none tracking-tight text-white"
          style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}
        >
          Something{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-rose-400 via-orange-300 to-rose-400 bg-clip-text text-transparent">
              broke
            </span>
            <span
              className="absolute -inset-1 -z-0 rounded-lg opacity-30 blur-sm"
              style={{
                background: "linear-gradient(90deg, #f43f5e, #fb923c, #f43f5e)",
              }}
            />
          </span>
        </h1>

        <p className="mb-2 max-w-md text-center text-base leading-relaxed text-white/50">
          An unexpected error occurred while loading this page. This is usually
          temporary — try again or head back home.
        </p>

        {/* Digest */}
        {error.digest && (
          <div className="mt-4 mb-8 inline-flex items-center gap-2 rounded-lg border border-white/5 bg-white/3 px-3 py-2">
            <span className="font-mono text-[10px] text-white/25 uppercase tracking-widest">
              ref
            </span>
            <span className="font-mono text-xs text-white/40">
              {error.digest}
            </span>
          </div>
        )}

        {!error.digest && <div className="mb-8" />}

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="group relative inline-flex h-11 min-w-[140px] items-center justify-center overflow-hidden rounded-xl bg-white px-6 text-sm font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span
              className={`transition-all duration-300 ${retrying ? "opacity-0" : "opacity-100"}`}
            >
              Try again
            </span>
            {retrying && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="h-4 w-4 animate-spin text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  />
                </svg>
              </span>
            )}
          </button>

          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-[0.98]"
          >
            <svg
              className="h-3.5 w-3.5 opacity-60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go home
          </Link>
        </div>

        {/* Divider */}
        <div className="mt-16 flex items-center gap-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-xs text-white/20">Need help?</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        {/* Quick links */}
        <div className="mt-5 flex gap-6">
          {[
            { label: "Dashboard", href: "/user/dashboard" },
            { label: "Status page", href: "/api/health" },
            { label: "Contact support", href: "/user/support" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-xs text-white/30 transition-colors hover:text-white/60"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
