export default function SupplierLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-52 animate-pulse rounded bg-sky-100" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-24 animate-pulse rounded-2xl bg-sky-50" />
        <div className="h-24 animate-pulse rounded-2xl bg-sky-50" />
        <div className="h-24 animate-pulse rounded-2xl bg-sky-50" />
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-sky-50" />
    </div>
  );
}
