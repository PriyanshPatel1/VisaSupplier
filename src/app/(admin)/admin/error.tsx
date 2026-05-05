"use client";

import Link from "next/link";
import { useEffect } from "react";

type AdminErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function AdminError({ error, unstable_retry }: AdminErrorProps) {
  useEffect(() => {
    console.error("Admin segment error:", error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-rose-700">Admin Error</p>
      <h1 className="mt-2 text-xl font-bold text-rose-900">This admin screen failed to load</h1>
      <p className="mt-2 text-sm text-rose-800">
        Retry to fetch fresh data. If this repeats, return to dashboard and try again.
      </p>
      {error.digest ? <p className="mt-3 text-xs text-rose-700">Reference: {error.digest}</p> : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
        >
          Retry
        </button>
        <Link
          href="/admin/dashboard"
          className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
