import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "https://visahub.com";

  let countryEntries: MetadataRoute.Sitemap = [];
  let visaEntries: MetadataRoute.Sitemap = [];

  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      select: { code: true, updatedAt: true },
    });
    countryEntries = countries.map((c) => ({
      url: `${base}/country/${c.code.toLowerCase()}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const visas = await prisma.visa.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
    });
    visaEntries = visas.map((v) => ({
      url: `${base}/visa/${v.id}`,
      lastModified: v.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // DB unavailable during static generation — return static routes only
  }

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/countries`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/register`, changeFrequency: "monthly", priority: 0.5 },
    ...countryEntries,
    ...visaEntries,
  ];
}
