import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const SITE_CONTENT_KEY = "site_content";

export type SiteHeroStat = {
  value: string;
  label: string;
};

export type SiteStatItem = {
  value: string;
  label: string;
  sub: string;
  icon: string;
};

export type SiteFeatureItem = {
  icon: string;
  title: string;
  desc: string;
  color: string;
};

export type SiteTestimonialItem = {
  name: string;
  role: string;
  country: string;
  quote: string;
  avatar: string;
  avatarColor: string;
  rating: number;
};

export type SiteFaqItem = {
  question: string;
  answer: string;
};

export type SiteVisaCategoryItem = {
  icon: string;
  label: string;
  desc: string;
  gradient: string;
  bg: string;
  text: string;
  query: string;
};

export type SiteFeaturedCountryItem = {
  code: string;
  image: string;
  tag?: string;
  tagColor?: string;
};

export type SiteContent = {
  hero: {
    trustedLabel: string;
    trustedNote: string;
    titlePrefix: string;
    titleHighlight: string;
    description: string;
    searchPlaceholder: string;
    searchButtonLabel: string;
    popularLabel: string;
    popularCodes: string[];
    stats: SiteHeroStat[];
  };
  visaCategories: {
    eyebrow: string;
    title: string;
    items: SiteVisaCategoryItem[];
  };
  countriesSection: {
    eyebrow: string;
    title: string;
    description: string;
    ctaLabel: string;
    featured: SiteFeaturedCountryItem[];
  };
  features: {
    eyebrow: string;
    title: string;
    description: string;
    items: SiteFeatureItem[];
  };
  testimonials: {
    eyebrow: string;
    title: string;
    description: string;
    summaryRating: string;
    summaryLabel: string;
    items: SiteTestimonialItem[];
  };
  faq: {
    eyebrow: string;
    title: string;
    description: string;
    ctaLabel: string;
    items: SiteFaqItem[];
  };
  stats: {
    items: SiteStatItem[];
  };
  support: {
    phoneLabel: string;
    phoneNumber: string;
    phoneHref: string;
    liveChatLabel: string;
    liveChatWait: string;
    liveChatMessage: string;
    emailLabel: string;
    emailAddress: string;
    topics: string[];
    faq: SiteFaqItem[];
  };
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

function normalizeHeroStat(value: unknown): SiteHeroStat | null {
  if (!isObjectRecord(value)) return null;
  const normalized = {
    value: toString(value.value).trim(),
    label: toString(value.label).trim(),
  };
  return normalized.value && normalized.label ? normalized : null;
}

function normalizeStatItem(value: unknown): SiteStatItem | null {
  if (!isObjectRecord(value)) return null;
  const normalized = {
    value: toString(value.value).trim(),
    label: toString(value.label).trim(),
    sub: toString(value.sub).trim(),
    icon: toString(value.icon).trim(),
  };
  return normalized.value && normalized.label ? normalized : null;
}

function normalizeFeatureItem(value: unknown): SiteFeatureItem | null {
  if (!isObjectRecord(value)) return null;
  const normalized = {
    icon: toString(value.icon).trim(),
    title: toString(value.title).trim(),
    desc: toString(value.desc).trim(),
    color: toString(value.color).trim(),
  };
  return normalized.title && normalized.desc ? normalized : null;
}

function normalizeTestimonialItem(value: unknown): SiteTestimonialItem | null {
  if (!isObjectRecord(value)) return null;
  const normalized = {
    name: toString(value.name).trim(),
    role: toString(value.role).trim(),
    country: toString(value.country).trim(),
    quote: toString(value.quote).trim(),
    avatar: toString(value.avatar).trim(),
    avatarColor: toString(value.avatarColor).trim(),
    rating: Number(value.rating ?? 5),
  };
  return normalized.name && normalized.quote ? normalized : null;
}

function normalizeFaqItem(value: unknown): SiteFaqItem | null {
  if (!isObjectRecord(value)) return null;
  const normalized = {
    question: toString(value.question ?? value.q).trim(),
    answer: toString(value.answer ?? value.a).trim(),
  };
  return normalized.question && normalized.answer ? normalized : null;
}

function normalizeVisaCategoryItem(value: unknown): SiteVisaCategoryItem | null {
  if (!isObjectRecord(value)) return null;
  const normalized = {
    icon: toString(value.icon).trim(),
    label: toString(value.label).trim(),
    desc: toString(value.desc).trim(),
    gradient: toString(value.gradient).trim(),
    bg: toString(value.bg).trim(),
    text: toString(value.text).trim(),
    query: toString(value.query).trim(),
  };
  return normalized.label && normalized.query ? normalized : null;
}

function normalizeFeaturedCountryItem(value: unknown): SiteFeaturedCountryItem | null {
  if (!isObjectRecord(value)) return null;
  const normalized = {
    code: toString(value.code).trim().toUpperCase(),
    image: toString(value.image).trim(),
    tag: toString(value.tag).trim() || undefined,
    tagColor: toString(value.tagColor).trim() || undefined,
  };
  return normalized.code ? normalized : null;
}

export function normalizeSiteContent(value: unknown): SiteContent | null {
  if (!isObjectRecord(value)) return null;

  const hero = isObjectRecord(value.hero) ? value.hero : {};
  const visaCategories = isObjectRecord(value.visaCategories) ? value.visaCategories : {};
  const countriesSection = isObjectRecord(value.countriesSection) ? value.countriesSection : {};
  const features = isObjectRecord(value.features) ? value.features : {};
  const testimonials = isObjectRecord(value.testimonials) ? value.testimonials : {};
  const faq = isObjectRecord(value.faq) ? value.faq : {};
  const stats = isObjectRecord(value.stats) ? value.stats : {};
  const support = isObjectRecord(value.support) ? value.support : {};

  return {
    hero: {
      trustedLabel: toString(hero.trustedLabel).trim(),
      trustedNote: toString(hero.trustedNote).trim(),
      titlePrefix: toString(hero.titlePrefix).trim(),
      titleHighlight: toString(hero.titleHighlight).trim(),
      description: toString(hero.description).trim(),
      searchPlaceholder: toString(hero.searchPlaceholder).trim(),
      searchButtonLabel: toString(hero.searchButtonLabel).trim(),
      popularLabel: toString(hero.popularLabel).trim(),
      popularCodes: toStringArray(hero.popularCodes),
      stats: (Array.isArray(hero.stats) ? hero.stats : [])
        .map((item) => normalizeHeroStat(item))
        .filter((item): item is SiteHeroStat => Boolean(item)),
    },
    visaCategories: {
      eyebrow: toString(visaCategories.eyebrow).trim(),
      title: toString(visaCategories.title).trim(),
      items: (Array.isArray(visaCategories.items) ? visaCategories.items : [])
        .map((item) => normalizeVisaCategoryItem(item))
        .filter((item): item is SiteVisaCategoryItem => Boolean(item)),
    },
    countriesSection: {
      eyebrow: toString(countriesSection.eyebrow).trim(),
      title: toString(countriesSection.title).trim(),
      description: toString(countriesSection.description).trim(),
      ctaLabel: toString(countriesSection.ctaLabel).trim(),
      featured: (Array.isArray(countriesSection.featured) ? countriesSection.featured : [])
        .map((item) => normalizeFeaturedCountryItem(item))
        .filter((item): item is SiteFeaturedCountryItem => Boolean(item)),
    },
    features: {
      eyebrow: toString(features.eyebrow).trim(),
      title: toString(features.title).trim(),
      description: toString(features.description).trim(),
      items: (Array.isArray(features.items) ? features.items : [])
        .map((item) => normalizeFeatureItem(item))
        .filter((item): item is SiteFeatureItem => Boolean(item)),
    },
    testimonials: {
      eyebrow: toString(testimonials.eyebrow).trim(),
      title: toString(testimonials.title).trim(),
      description: toString(testimonials.description).trim(),
      summaryRating: toString(testimonials.summaryRating).trim(),
      summaryLabel: toString(testimonials.summaryLabel).trim(),
      items: (Array.isArray(testimonials.items) ? testimonials.items : [])
        .map((item) => normalizeTestimonialItem(item))
        .filter((item): item is SiteTestimonialItem => Boolean(item)),
    },
    faq: {
      eyebrow: toString(faq.eyebrow).trim(),
      title: toString(faq.title).trim(),
      description: toString(faq.description).trim(),
      ctaLabel: toString(faq.ctaLabel).trim(),
      items: (Array.isArray(faq.items) ? faq.items : [])
        .map((item) => normalizeFaqItem(item))
        .filter((item): item is SiteFaqItem => Boolean(item)),
    },
    stats: {
      items: (Array.isArray(stats.items) ? stats.items : [])
        .map((item) => normalizeStatItem(item))
        .filter((item): item is SiteStatItem => Boolean(item)),
    },
    support: {
      phoneLabel: toString(support.phoneLabel).trim(),
      phoneNumber: toString(support.phoneNumber).trim(),
      phoneHref: toString(support.phoneHref).trim(),
      liveChatLabel: toString(support.liveChatLabel).trim(),
      liveChatWait: toString(support.liveChatWait).trim(),
      liveChatMessage: toString(support.liveChatMessage).trim(),
      emailLabel: toString(support.emailLabel).trim(),
      emailAddress: toString(support.emailAddress).trim(),
      topics: toStringArray(support.topics),
      faq: (Array.isArray(support.faq) ? support.faq : [])
        .map((item) => normalizeFaqItem(item))
        .filter((item): item is SiteFaqItem => Boolean(item)),
    },
  };
}

export async function getSiteContent(): Promise<SiteContent | null> {
  const record = await prisma.adminConfig.findUnique({ where: { key: SITE_CONTENT_KEY } });
  return normalizeSiteContent(record?.value);
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  const normalized = normalizeSiteContent(content);
  if (!normalized) {
    throw new Error("Invalid site content payload");
  }

  await prisma.adminConfig.upsert({
    where: { key: SITE_CONTENT_KEY },
    update: { value: normalized as unknown as Prisma.InputJsonValue },
    create: { key: SITE_CONTENT_KEY, value: normalized as unknown as Prisma.InputJsonValue },
  });

  return normalized;
}
