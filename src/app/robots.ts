import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/admin/", "/supplier/", "/user/", "/api/"],
      },
    ],
    sitemap: `${process.env.APP_URL ?? "https://visahub.com"}/sitemap.xml`,
  };
}
