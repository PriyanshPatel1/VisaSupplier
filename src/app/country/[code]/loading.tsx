export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0b0c14] text-white animate-pulse">
      <div className="h-[57px] border-b border-white/10 bg-black/50" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex gap-2 mb-8">
          <div className="h-4 w-12 bg-white/10 rounded" />
          <div className="h-4 w-4 bg-white/5 rounded" />
          <div className="h-4 w-20 bg-white/10 rounded" />
          <div className="h-4 w-4 bg-white/5 rounded" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>

        {/* Country header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-white/10 rounded-2xl" />
          <div>
            <div className="h-8 w-48 bg-white/10 rounded-xl mb-2" />
            <div className="h-4 w-72 bg-white/5 rounded-lg" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 h-12 bg-white/5 rounded-xl" />
          <div className="h-12 w-16 bg-white/5 rounded-xl" />
          <div className="h-12 w-24 bg-white/5 rounded-xl" />
          <div className="h-12 w-20 bg-white/5 rounded-xl" />
        </div>

        {/* Visa cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex justify-between">
                <div className="h-6 w-24 bg-white/10 rounded-full" />
                <div className="h-7 w-14 bg-white/10 rounded-lg" />
              </div>
              <div className="h-6 w-3/4 bg-white/10 rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-white/5 rounded-xl" />
                <div className="h-16 bg-white/5 rounded-xl" />
                <div className="h-14 bg-white/5 rounded-xl col-span-2" />
              </div>
              <div className="h-10 bg-white/5 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
