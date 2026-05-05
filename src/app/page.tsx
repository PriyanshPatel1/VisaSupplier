import { Suspense } from "react";
import type { Metadata } from "next";

import Footer from "@/components/layout/footer";
import Hero from "@/components/hero";
import Stats from "@/components/stats";
import VisaCategories from "@/components/visa-categories";
import CountriesSection from "@/components/countries-section";
import HowItWorks from "@/components/how-it-works";
import Features from "@/components/features";
import Testimonials from "@/components/testimonials";
import FAQ from "@/components/faq";
import CTASection from "@/components/cta-section";

export const metadata: Metadata = {
  title: "Visa Guide - Find Visa Requirements for Any Country",
  description:
    "Explore visa requirements, application checklists, and processing times for 190+ countries. Plan your travel with confidence.",
  openGraph: {
    title: "Visa Guide - Find Visa Requirements for Any Country",
    description:
      "Explore visa requirements, application checklists, and processing times for 190+ countries.",
    type: "website",
  },
};

function SectionSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-16">
      <div className="mb-4 h-8 w-48 rounded bg-white/10" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="h-40 rounded-2xl bg-white/5" />
        <div className="h-40 rounded-2xl bg-white/5" />
        <div className="h-40 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <main className="marketing-shell min-h-screen">
        <Hero />
        <Stats />
        <VisaCategories />

        <Suspense fallback={<SectionSkeleton />}>
          <CountriesSection />
        </Suspense>

        <HowItWorks />
        <Features />

        <Suspense fallback={null}>
          <Testimonials />
        </Suspense>

        <FAQ />
        <CTASection />
      </main>

      <Footer />
    </>
  );
}
