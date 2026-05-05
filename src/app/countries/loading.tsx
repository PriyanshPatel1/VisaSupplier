export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0b0c14] text-white animate-pulse">
      {/* Navbar skeleton */}
      <div className="h-[57px] border-b border-white/10 bg-black/50" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero skeleton */}
        <div className="text-center mb-12">
          <div className="h-4 w-32 bg-white/10 rounded-full mx-auto mb-4" />
          <div className="h-10 w-80 bg-white/10 rounded-xl mx-auto mb-3" />
          <div className="h-5 w-64 bg-white/5 rounded-xl mx-auto" />
        </div>

        {/* Filter bar skeleton */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 h-12 bg-white/5 rounded-xl" />
          <div className="h-12 w-20 bg-white/5 rounded-xl" />
          <div className="h-12 w-24 bg-white/5 rounded-xl" />
          <div className="h-12 w-20 bg-white/5 rounded-xl" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3"
              style={{ opacity: 1 - i * 0.08 }}
            >
              <div className="w-12 h-12 bg-white/10 rounded-xl" />
              <div className="h-5 w-3/4 bg-white/10 rounded-lg" />
              <div className="h-3 w-1/3 bg-white/5 rounded-full" />
              <div className="h-3 w-full bg-white/5 rounded-lg" />
              <div className="h-3 w-5/6 bg-white/5 rounded-lg" />
              <div className="mt-2 h-8 w-24 bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
