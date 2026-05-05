export default function Loading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0B1354] via-[#1A1F71] to-[#0D1545] px-4 py-16">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute right-[-60px] top-[-60px] h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(250,166,26,0.12)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-[-80px] left-[-40px] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.04)_0%,transparent_70%)]" />

      {/* Pulsing rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="pointer-events-none absolute right-[10%] top-1/2 h-[180px] w-[180px] -translate-y-1/2 rounded-full border border-[rgba(250,166,26,0.12)] opacity-0"
          style={{
            animation: "pulse-out 3s ease-out infinite",
            animationDelay: `${i}s`,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-[480px]">
        {/* Eyebrow tag */}
        <div className="mb-5 flex items-center gap-3">
          <div className="h-[3px] w-7 rounded-full bg-gradient-to-r from-[#FAA61A] to-[#FFC53D]" />
          <div className="h-[11px] w-24 animate-pulse rounded bg-[rgba(250,166,26,0.25)]" />
        </div>

        {/* Headline skeleton */}
        <div className="mb-3 h-[38px] w-[82%] animate-pulse rounded-md bg-white/10" />
        <div className="mb-6 h-[38px] w-[58%] animate-pulse rounded-md bg-white/[0.07]" />

        {/* Body lines */}
        <div className="mb-2 h-[12px] w-full animate-pulse rounded bg-white/[0.07]" />
        <div className="mb-2 h-[12px] w-[88%] animate-pulse rounded bg-white/[0.07]" />
        <div className="h-[12px] w-[70%] animate-pulse rounded bg-white/[0.07]" />

        {/* Gold divider */}
        <div className="my-6 h-px bg-[rgba(250,166,26,0.18)]" />

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-3">
          {[0.1, 0.35].map((delay, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.06] p-5"
            >
              {/* Card shimmer sweep */}
              <div
                className="absolute inset-y-0 left-0 w-[60%]"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)",
                  animation: `card-sweep 2.2s ease-in-out ${delay}s infinite`,
                }}
              />
              <div
                className="mb-4 h-8 w-8 animate-pulse rounded-lg"
                style={{ background: "rgba(250,166,26,0.22)" }}
              />
              <div className="mb-2 h-[11px] w-[75%] animate-pulse rounded bg-white/10" />
              <div className="h-[10px] w-[50%] animate-pulse rounded bg-white/[0.07]" />
            </div>
          ))}
        </div>

        {/* Visa wordmark watermark */}
        <div className="mt-6 flex items-center justify-end gap-2 opacity-20">
          <div className="h-[5px] w-[5px] rounded-full bg-[#FAA61A]" />
          <span
            style={{ fontFamily: "'Times New Roman', serif" }}
            className="text-[22px] font-semibold tracking-widest text-white"
          >
            VISA
          </span>
        </div>
      </div>

      {/* Keyframe injector (only needed once in your global CSS) */}
      <style>{`
        @keyframes pulse-out {
          0%   { opacity: 0.4; transform: translateY(-50%) scale(0.7); }
          100% { opacity: 0;   transform: translateY(-50%) scale(1.6); }
        }
        @keyframes card-sweep {
          0%   { left: -60%; }
          100% { left: 160%; }
        }
      `}</style>
    </div>
  );
}
