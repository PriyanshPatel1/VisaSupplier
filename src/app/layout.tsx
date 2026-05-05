import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastProvider } from "@/components/dashboard/toast";

import "./globals.css";
import Navbar from "@/components/layout/navbar";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "VisaHub - Visa Applications, Simplified",
    template: "%s | VisaHub",
  },
  description:
    "Apply for 150+ visas online. Track your application in real-time and get expert support at every step.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "VisaHub - Visa Applications, Simplified",
    description:
      "Apply for 150+ visas online. Track your application in real-time and get expert support at every step.",
    type: "website",
    siteName: "VisaHub",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${sora.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* Skip-to-content — WCAG 2.4.1: keyboard users bypass nav on every page */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <div id="main-content" tabIndex={-1}>
              {children}
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
