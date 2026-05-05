"use client";

import Link from "next/link";
import { useEffect } from "react";

type UserErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function UserError({ error, unstable_retry }: UserErrorProps) {
  useEffect(() => {
    console.error("User segment error:", error);
  }, [error]);

  return (
    <div className="user-panel rounded-2xl p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-indigo-100/70">Something Went Wrong</p>
      <h1 className="mt-2 text-xl font-bold text-white">We could not load this section</h1>
      <p className="mt-2 text-sm text-indigo-100/70">
        Please retry. If the issue continues, return to the dashboard and try again shortly.
      </p>
      {error.digest ? <p className="mt-3 text-xs text-indigo-100/60">Reference: {error.digest}</p> : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="user-cta px-4 py-2 text-sm"
        >
          Retry
        </button>
        <Link href="/user/dashboard" className="user-outline-btn px-4 py-2 text-sm font-semibold">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
