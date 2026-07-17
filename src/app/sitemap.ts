import type { MetadataRoute } from "next";

/**
 * Sitemap — public pages only: /, /lore, /how-to-play, /gangs and /dashboard.
 * Authenticated pages (/admin, /player, /portal) are excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.AUTH_URL || "https://necroforja.vercel.app";

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/lore`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/how-to-play`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/gangs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
