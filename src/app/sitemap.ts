import type { MetadataRoute } from "next";

/**
 * Sitemap — only the public landing is indexable.
 * Authenticated pages (/admin, /player) are excluded and already
 * protected by middleware + noindex metadata.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.AUTH_URL || "https://necroforja.vercel.app";

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
