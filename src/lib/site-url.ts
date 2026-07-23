/**
 * Canonical public site URL — single source of truth for metadata that needs
 * an absolute URL (Open Graph, canonical link, sitemap, robots.txt).
 *
 * Reads `AUTH_URL` (already required by Auth.js and set in Vercel to the
 * production domain — see docs/DEPLOYMENT.md) and falls back to the real
 * canonical domain instead of a stale placeholder, so a build/preview that's
 * missing the env var still points somewhere correct (issue #20).
 */
export const SITE_URL =
  process.env.AUTH_URL || "https://www.necroforja.com.br";
