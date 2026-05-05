import Link from "next/link";

export default function SupplierNotFound() {
  return (
    <div className="rounded-2xl border border-sky-300/25 bg-sky-500/10 p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sky-200">Not Found</p>
      <h1 className="mt-2 text-2xl font-bold text-white">Supplier item not found</h1>
      <p className="mt-3 text-sm text-sky-100/85">
        This record may no longer exist or you may not have access to it.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/supplier/dashboard"
          className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          Supplier Dashboard
        </Link>
        <Link
          href="/supplier/applications"
          className="rounded-xl border border-sky-200/40 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20"
        >
          Applications
        </Link>
      </div>
    </div>
  );
}
