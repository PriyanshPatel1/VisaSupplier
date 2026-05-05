import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Not Found</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Requested admin resource was not found</h1>
      <p className="mt-3 text-sm text-gray-600">
        The record may have been deleted or the identifier may be invalid.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/admin/dashboard"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Admin Dashboard
        </Link>
        <Link
          href="/admin/applications"
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          View Applications
        </Link>
      </div>
    </div>
  );
}
