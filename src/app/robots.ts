import type { MetadataRoute } from "next";

/**
 * Robots.txt generation.
 *
 * Public pages: / (marketing landing), /dashboard (live campaign view).
 * Private: /admin, /player, /portal (role dispatcher), /api/, /login.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.AUTH_URL || "https://necroforja.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/dashboard"],
        disallow: [
          "/admin",
          "/player",
          "/portal",
          "/api/",
          "/login",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
