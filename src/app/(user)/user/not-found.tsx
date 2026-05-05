import Link from "next/link";

export default function UserNotFound() {
  return (
    <div className="user-panel rounded-2xl p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-indigo-100/60">Not Found</p>
      <h1 className="mt-2 text-2xl font-bold text-white">The requested item was not found</h1>
      <p className="mt-3 text-sm text-indigo-100/70">
        It may have been removed, or the link might be outdated.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/user/dashboard" className="user-cta px-4 py-2 text-sm">
          Dashboard
        </Link>
        <Link href="/user/applications" className="user-outline-btn px-4 py-2 text-sm font-semibold">
          Applications
        </Link>
      </div>
    </div>
  );
}
