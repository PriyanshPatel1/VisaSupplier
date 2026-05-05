"use client";

import Link from "next/link";
import Image from "next/image";
import { useContentCatalog } from "@/hooks/use-content-catalog";
import { useSiteContent } from "@/hooks/use-site-content";

export default function CountriesSection() {
  const { countries, visas } = useContentCatalog();
  const { content } = useSiteContent();
  const section = content?.countriesSection;

  if (!section) return null;

  const featured = section.featured
    .map((entry) => {
      const country = countries.find((item) => item.code === entry.code);
      if (!country) return null;
      const visaCount = visas.filter(
        (visa) => visa.countryCode === country.code,
      ).length;
      return {
        ...country,
        visaCount,
        image: entry.image,
        tag: entry.tag,
        tagColor: entry.tagColor ?? "bg-indigo-100 text-indigo-700",
      };
    })
    .filter((country): country is NonNullable<typeof country> =>
      Boolean(country),
    );

  if (featured.length === 0) return null;

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="animate-fade-up">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-2">
              {section.eyebrow}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              {section.title}
            </h2>
            <p className="text-gray-500 mt-2">{section.description}</p>
          </div>
          <Link
            href="/countries"
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl transition-colors animate-fade-up"
          >
            {section.ctaLabel}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((country, index) => (
            <Link
              key={country.code}
              href={`/country/${country.code}`}
              className="group block card-hover animate-fade-up"
              style={{ animationDelay: `${Math.min(index, 5) * 100}ms` }}
            >
              <div className="relative h-52 rounded-2xl overflow-hidden bg-gray-100">
                {country.image ? (
                  <Image
                    src={country.image}
                    alt={country.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {country.flag}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl drop-shadow">{country.flag}</span>
                    <div>
                      <p className="text-white font-semibold text-sm leading-tight">
                        {country.name}
                      </p>
                      <p className="text-white/60 text-xs">
                        {country.visaCount} visa types
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg
                      className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>

                {country.tag && (
                  <div
                    className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${country.tagColor}`}
                  >
                    {country.tag}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
