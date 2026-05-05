// import Link from "next/link";

// export default function CTA() {
//   return (
//     <section className="bg-white py-20 sm:py-28">
//       <div className="max-w-6xl mx-auto px-5 sm:px-8">
//         <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-10 sm:p-16 text-center">
//           {/* Background decoration */}
//           <div className="absolute inset-0 pointer-events-none overflow-hidden">
//             <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
//             <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full" />
//             {/* Grid lines */}
//             <div
//               className="absolute inset-0 opacity-10"
//               style={{
//                 backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
//                 backgroundSize: "40px 40px",
//               }}
//             />
//           </div>

//           <div className="relative">
//             <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-6">
//               <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
//               Applications open — get started today
//             </div>

//             <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
//               Ready to start<br className="hidden sm:block" /> your journey?
//             </h2>
//             <p className="text-indigo-200 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
//               Join 50,000+ travellers who got their visa with VisaHub — fast, transparent, stress-free.
//             </p>

//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Link
//                 href="/countries"
//                 className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-colors text-sm sm:text-base shadow-xl shadow-black/10"
//               >
//                 Browse destinations →
//               </Link>
//               <Link
//                 href="/register"
//                 className="px-8 py-4 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-2xl border border-white/30 transition-colors text-sm sm:text-base backdrop-blur-sm"
//               >
//                 Create free account
//               </Link>
//             </div>

//             <div className="mt-10 flex flex-wrap justify-center gap-6 text-indigo-200/80 text-sm">
//               {["✓ No hidden fees", "✓ 96% approval rate", "✓ 24/7 expert support", "✓ Secure & encrypted"].map((t) => (
//                 <span key={t}>{t}</span>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import Link from "next/link";

export default function CTA() {
  const trustBadges = [
    { icon: "✦", text: "No hidden fees" },
    { icon: "✦", text: "96% approval rate" },
    { icon: "✦", text: "24/7 expert support" },
    { icon: "✦", text: "Secure & encrypted" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        .cta-section {
          background: #ffffff;
          padding: 6rem 0;
        }

        .cta-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .cta-card {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          background: #0c0d14;
          padding: 5rem 4rem;
          text-align: center;
          isolation: isolate;
          box-shadow:
            0 40px 100px -20px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.06) inset;
        }

        /* ── Mesh gradient background ── */
        .cta-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 15% 20%, rgba(99, 102, 241, 0.22) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 85% 75%, rgba(139, 92, 246, 0.18) 0%, transparent 55%),
            radial-gradient(ellipse 50% 70% at 50% 110%, rgba(99, 102, 241, 0.12) 0%, transparent 60%);
          z-index: 0;
        }

        /* ── Noise texture overlay ── */
        .cta-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 200px;
          opacity: 0.6;
          z-index: 0;
          pointer-events: none;
        }

        /* ── Constellation dots ── */
        .stars {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }

        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(129, 140, 248, 0.7);
          border-radius: 50%;
          animation: twinkle var(--dur, 3s) ease-in-out infinite var(--delay, 0s);
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.6); }
        }

        /* ── Accent horizontal rule ── */
        .accent-rule {
          width: 56px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #6366f1, transparent);
          margin: 0 auto 2rem;
        }

        /* ── Badge ── */
        .cta-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.35);
          color: #a5b4fc;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 0.45rem 1.1rem;
          border-radius: 100px;
          margin-bottom: 1.75rem;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
          box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4);
        }

        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
        }

        /* ── Headline ── */
        .cta-headline {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2.6rem, 5vw, 4.2rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #f5f0e8;
          margin-bottom: 1.25rem;
        }

        .cta-headline em {
          font-style: italic;
          background: linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Sub ── */
        .cta-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.05rem;
          font-weight: 300;
          color: rgba(245, 240, 232, 0.5);
          max-width: 480px;
          margin: 0 auto 2.75rem;
          line-height: 1.7;
          letter-spacing: 0.01em;
        }

        /* ── Buttons ── */
        .cta-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.95rem 2.25rem;
          background: #ffffff;
          color: #0c0d14;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          border-radius: 14px;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .btn-primary:hover {
          background: #f0f0ff;
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .btn-primary .arrow {
          transition: transform 0.2s ease;
        }

        .btn-primary:hover .arrow {
          transform: translateX(4px);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.95rem 2.25rem;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(245, 240, 232, 0.8);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          border-radius: 14px;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
          backdrop-filter: blur(8px);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateY(-2px);
          color: #f5f0e8;
        }

        /* ── Trust strip ── */
        .trust-strip {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem 2.5rem;
          padding-top: 2.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 400;
          color: rgba(245, 240, 232, 0.38);
          letter-spacing: 0.03em;
        }

        .trust-item span.icon {
          color: #6366f1;
          font-size: 0.55rem;
        }

        /* ── Corner flourishes ── */
        .flourish {
          position: absolute;
          width: 120px;
          height: 120px;
          z-index: 1;
          opacity: 0.25;
          pointer-events: none;
        }

        .flourish-tl { top: 24px; left: 24px; }
        .flourish-br { bottom: 24px; right: 24px; transform: rotate(180deg); }

        /* ── Relative container for z-index ── */
        .cta-inner {
          position: relative;
          z-index: 2;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .cta-card { padding: 3.5rem 1.75rem; }
          .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
        }
      `}</style>

      <section className="cta-section">
        <div className="cta-wrapper">
          <div className="cta-card">
            {/* Stars */}
            <div className="stars" aria-hidden="true">
              {[
                { top: "12%", left: "8%", dur: "4s", delay: "0s" },
                { top: "22%", left: "88%", dur: "3.2s", delay: "0.8s" },
                { top: "70%", left: "5%", dur: "5s", delay: "1.4s" },
                { top: "80%", left: "93%", dur: "3.8s", delay: "0.3s" },
                { top: "45%", left: "95%", dur: "4.5s", delay: "2s" },
                { top: "60%", left: "12%", dur: "3.5s", delay: "1s" },
                { top: "30%", left: "50%", dur: "6s", delay: "0.5s" },
                { top: "85%", left: "60%", dur: "4.2s", delay: "1.8s" },
                { top: "15%", left: "40%", dur: "3.7s", delay: "2.5s" },
                { top: "55%", left: "75%", dur: "5.5s", delay: "0.7s" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="star"
                  style={{
                    top: s.top,
                    left: s.left,
                    ["--dur" as string]: s.dur,
                    ["--delay" as string]: s.delay,
                  }}
                />
              ))}
            </div>

            {/* Corner flourishes */}
            <svg
              className="flourish flourish-tl"
              viewBox="0 0 120 120"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M0 120 L0 0 L120 0"
                stroke="#6366f1"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M0 80 L0 20 L60 20"
                stroke="#6366f1"
                strokeWidth="0.5"
                fill="none"
                opacity="0.5"
              />
              <circle cx="0" cy="0" r="3" fill="#6366f1" opacity="0.8" />
            </svg>
            <svg
              className="flourish flourish-br"
              viewBox="0 0 120 120"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M0 120 L0 0 L120 0"
                stroke="#6366f1"
                strokeWidth="1"
                fill="none"
              />
              <circle cx="0" cy="0" r="3" fill="#6366f1" opacity="0.8" />
            </svg>

            <div className="cta-inner">
              {/* Badge */}
              <div>
                <span className="cta-badge">
                  <span className="badge-dot" />
                  Applications open — get started today
                </span>
              </div>

              {/* Gold rule */}
              <div className="accent-rule" />

              {/* Headline */}
              <h2 className="cta-headline">
                Ready to start
                <br />
                <em>your journey?</em>
              </h2>

              {/* Subtext */}
              <p className="cta-sub">
                Join 50,000+ travellers who got their visa with VisaHub — fast,
                transparent, and completely stress-free.
              </p>

              {/* CTAs */}
              <div className="cta-buttons">
                <Link href="/countries" className="btn-primary">
                  Browse destinations
                  <span className="arrow">→</span>
                </Link>
                <Link href="/register" className="btn-secondary">
                  Create free account
                </Link>
              </div>

              {/* Trust strip */}
              <div className="trust-strip">
                {trustBadges.map((b) => (
                  <div key={b.text} className="trust-item">
                    <span className="icon">{b.icon}</span>
                    {b.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
