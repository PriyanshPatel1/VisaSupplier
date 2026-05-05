import Link from "next/link";

const COLS = [
  {
    heading: "Product",
    links: [
      { label: "Browse Countries", href: "/countries" },
      { label: "Apply Now", href: "/user/applications/new" },
      { label: "Track Application", href: "/user/applications" },
      { label: "How it works", href: "/#how-it-works" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About VisaHub", href: "/#features" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Destinations", href: "/countries" },
      { label: "Supplier Login", href: "/supplier/login" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Centre", href: "/user/support" },
      { label: "Contact", href: "/user/support" },
      { label: "Terms", href: "/terms" },
      { label: "Sign In", href: "/login" },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    label: "Twitter / X",
    href: "https://x.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.27l-4.9-6.44L6.4 22H3.3l7.24-8.27L1 2h6.43l4.43 5.83L18.9 2z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M6.94 8.5H3.56V20h3.38V8.5zm.22-3.55A1.96 1.96 0 115.2 3a1.95 1.95 0 011.96 1.95zM20.44 13.42V20h-3.38v-6.15c0-1.55-.56-2.61-1.95-2.61-1.06 0-1.7.72-1.98 1.42-.1.25-.13.6-.13.95V20H9.62V8.5H13v1.57c.45-.7 1.25-1.7 3.03-1.7 2.2 0 3.85 1.44 3.85 4.55z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 .5a12 12 0 00-3.79 23.39c.6.1.82-.26.82-.58v-2.2c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.77-1.34-1.77-1.1-.74.08-.73.08-.73 1.21.09 1.85 1.25 1.85 1.25 1.08 1.86 2.84 1.32 3.54 1.01.11-.79.42-1.32.77-1.62-2.67-.3-5.47-1.34-5.47-5.97 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.53.12-3.2 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.67.25 2.9.12 3.2.77.84 1.24 1.92 1.24 3.23 0 4.64-2.81 5.66-5.48 5.96.43.38.82 1.1.82 2.22v3.28c0 .32.22.69.83.58A12 12 0 0012 .5z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0918] text-gray-400">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
                Visa<span className="text-indigo-400">Hub</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 mb-5">
              Your trusted visa partner for seamless international travel. 50,000+ travellers served.
            </p>
            <div className="flex gap-2">
              {["Secure Payments", "Verified Partners", "Fast Processing"].map((badge) => (
                <span key={badge} className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2.5 py-1 rounded-lg">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-5">{col.heading}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-500 hover:text-gray-100 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>(c) 2026 VisaHub Inc. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={social.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-indigo-300/50 hover:bg-indigo-500/10 hover:text-gray-100"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
