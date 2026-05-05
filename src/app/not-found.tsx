import Link from "next/link";
import Footer from "@/components/layout/footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#0B1354] via-[#1A1F71] to-[#0D1545] text-white">
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed right-[-80px] top-[-80px] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(250,166,26,0.1)_0%,transparent_70%)]" />
      <div className="pointer-events-none fixed bottom-[-100px] left-[-60px] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.04)_0%,transparent_70%)]" />

      <main className="relative flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          {/* Passport-stamp icon */}
          <div className="relative mx-auto mb-8 flex h-36 w-36 items-center justify-center">
            {/* Pulse rings */}
            {[0, 0.9, 1.8].map((delay, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border border-[rgba(250,166,26,0.15)] opacity-0"
                style={{
                  animation: `pulse-out 2.8s ease-out ${delay}s infinite`,
                }}
              />
            ))}

            {/* Dashed rotating ring */}
            <div
              className="absolute inset-0 rounded-full border-[2.5px] border-dashed border-[rgba(250,166,26,0.35)]"
              style={{ animation: "spin 18s linear infinite" }}
            />

            {/* Inner static ring */}
            <div className="absolute inset-3 rounded-full border border-white/[0.08]" />

            {/* Core badge */}
            <div className="flex h-[88px] w-[88px] flex-col items-center justify-center gap-0.5 rounded-full border-2 border-[rgba(250,166,26,0.3)] bg-[rgba(250,166,26,0.08)]">
              <span
                className="text-[28px] font-bold leading-none tracking-[2px] text-[#FAA61A]"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                404
              </span>
              <span className="text-[7px] font-medium uppercase tracking-[3px] text-[rgba(250,166,26,0.7)]">
                Denied
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1
            className="mb-3 text-[30px] font-bold tracking-[-0.3px] text-white"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Page Not Found
          </h1>

          {/* Gold rule */}
          <div className="mx-auto mb-5 h-[2px] w-12 rounded-full bg-gradient-to-r from-[#FAA61A] to-[#FFC53D]" />

          {/* Body copy */}
          <p className="mx-auto mb-8 max-w-sm text-sm font-light leading-relaxed text-white/50">
            The country, visa type, or page you&apos;re looking for doesn&apos;t
            exist or may have been moved to a new destination.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/countries"
              className="rounded-[10px] bg-gradient-to-br from-[#FAA61A] to-[#E8920A] px-6 py-[11px] text-[13px] font-semibold text-[#0B1354] transition-opacity hover:opacity-90"
            >
              Browse Countries
            </Link>
            <Link
              href="/"
              className="rounded-[10px] border border-white/[0.12] bg-white/[0.05] px-6 py-[11px] text-[13px] font-normal text-white/70 transition-colors hover:bg-white/[0.10] hover:text-white"
            >
              Go Home
            </Link>
          </div>
        </div>

        {/* Visa watermark */}
        <div className="absolute bottom-5 right-6 flex items-center gap-2 opacity-20">
          <div className="h-[5px] w-[5px] rounded-full bg-[#FAA61A]" />
          <span
            className="text-[20px] font-bold tracking-[2px] text-white"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            VISA
          </span>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-out {
          0%   { opacity: 0.35; transform: scale(0.7); }
          100% { opacity: 0;    transform: scale(1.7); }
        }
      `}</style>
    </div>
  );
}
