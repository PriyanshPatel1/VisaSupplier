"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void; // FIX: was `unstable_retry` — that prop no longer exists in Next.js 14+
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global app error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white">
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4">
          <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Critical Error</p>
            <h1 className="mt-2 text-2xl font-bold">VisaHub encountered an application error</h1>
            <p className="mt-3 text-sm text-slate-300">
              Please retry. If the issue continues, refresh the page or come back shortly.
            </p>
            {error.digest ? <p className="mt-4 text-xs text-slate-400">Reference: {error.digest}</p> : null}

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Retry
              </button>
              <Link
                href="/"
                className="rounded-xl border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Go Home
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
