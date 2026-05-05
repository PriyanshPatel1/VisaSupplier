export default function AdminLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}
