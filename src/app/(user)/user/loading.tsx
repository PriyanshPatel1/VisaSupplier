export default function UserLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-48 animate-pulse rounded bg-indigo-300/20" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-24 animate-pulse rounded-2xl bg-indigo-300/10" />
        <div className="h-24 animate-pulse rounded-2xl bg-indigo-300/10" />
        <div className="h-24 animate-pulse rounded-2xl bg-indigo-300/10" />
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-indigo-300/10" />
    </div>
  );
}
