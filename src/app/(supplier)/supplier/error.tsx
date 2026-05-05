"use client";

import Link from "next/link";
import { useEffect } from "react";

type SupplierErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function SupplierError({ error, unstable_retry }: SupplierErrorProps) {
  useEffect(() => {
    console.error("Supplier segment error:", error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-sky-300/40 bg-sky-500/10 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sky-200">Supplier Error</p>
      <h1 className="mt-2 text-xl font-bold text-white">This supplier page is temporarily unavailable</h1>
      <p className="mt-2 text-sm text-sky-100/85">Please retry. Your data remains safe.</p>
      {error.digest ? <p className="mt-3 text-xs text-sky-100/70">Reference: {error.digest}</p> : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          Retry
        </button>
        <Link
          href="/supplier/dashboard"
          className="rounded-xl border border-sky-200/40 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20"
        >
          Supplier Dashboard
        </Link>
      </div>
    </div>
  );
}
