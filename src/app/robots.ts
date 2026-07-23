import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/**
 * Robots.txt generation.
 *
 * Public pages: / (marketing landing), /dashboard (live campaign view).
 * Private: /admin, /player, /portal (role dispatcher), /api/, /login.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = SITE_URL;

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
