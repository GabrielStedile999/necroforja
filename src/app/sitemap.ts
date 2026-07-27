import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import { SITE_URL } from "@/lib/site-url";

/**
 * Sitemap — public pages only: /, /lore, /how-to-play, /skirmish, /campaign,
 * /faq, /house-rules, /gangs, /reports (plus published posts), /gallery and
 * /dashboard. Authenticated pages are excluded.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = SITE_URL;

  // Posts publicados (issue #5) — fallback gracioso se o banco estiver fora.
  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await listPublishedPosts();
    postEntries = posts.map((post) => ({
      url: `${siteUrl}/reports/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    logger.warn("sitemap: failed to list posts", { error });
  }

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
      url: `${siteUrl}/skirmish`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/campaign`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/house-rules`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/gangs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/reports`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...postEntries,
    {
      url: `${siteUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/creator`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
