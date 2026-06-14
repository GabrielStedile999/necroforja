import type { MetadataRoute } from "next";

/**
 * Robots.txt generation.
 *
 * Only the public landing (/) should be indexed.
 * Authenticated and internal routes stay private.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.AUTH_URL || "https://necroforja.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/player",
          "/api/",
          "/dashboard",
          "/login",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
