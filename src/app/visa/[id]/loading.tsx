export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0b0c14] text-white animate-pulse">
      <div className="h-[57px] border-b border-white/10 bg-black/50" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex gap-2 mb-8">
          {[12, 4, 16, 4, 20, 4, 24].map((w, i) => (
            <div key={i} className={`h-4 w-${w} bg-white/${i % 2 === 0 ? "10" : "5"} rounded`} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Hero card */}
            <div className="h-36 bg-white/10 rounded-2xl" />
            {/* Description */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="h-5 w-40 bg-white/10 rounded-lg" />
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-5/6 bg-white/5 rounded" />
              <div className="h-4 w-4/6 bg-white/5 rounded" />
            </div>
            {/* Documents */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="h-5 w-48 bg-white/10 rounded-lg" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex-shrink-0" />
                  <div className="h-4 bg-white/5 rounded flex-1" style={{ width: `${60 + i * 5}%` }} />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="h-4 w-24 bg-white/10 rounded-lg" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-28 bg-white/10 rounded" />
                  <div className="h-4 w-20 bg-white/5 rounded" />
                </div>
              ))}
              <div className="h-12 bg-indigo-500/20 rounded-xl mt-4" />
              <div className="h-10 bg-white/5 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
