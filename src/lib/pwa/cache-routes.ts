/**
 * PWA caching strategy rules — pure, framework-agnostic, unit-testable.
 *
 * The service worker (public/sw.js) mirrors this logic in plain JavaScript.
 * Keep the two in sync whenever routes change.
 */

export type CacheStrategy =
  | "network-only"   // never cache (mutations, auth, admin)
  | "network-first"  // try network, fall back to cache (pages)
  | "cache-first";   // serve cache, revalidate in background (static assets)

/**
 * Returns the caching strategy for a given URL pathname.
 *
 * Rules:
 * - `/api/*`            → network-only  (Server Actions / REST mutations)
 * - `/admin*`           → network-only  (sensitive admin data)
 * - `/login*`           → network-only  (auth pages must always be fresh)
 * - `/portal*`          → network-only  (role-dispatch redirect — always fresh)
 * - `/_next/data/*`     → network-only  (Next.js dynamic data routes)
 * - `/_next/static/*`   → cache-first   (content-hashed bundles)
 * - `/icons/*`, `/icon.svg`, `/favicon.ico` → cache-first (static public assets)
 * - `/dashboard*`, `/player*`, `/` → network-first (public navigable pages)
 * - everything else     → network-first (safe default)
 */
export function getCacheStrategy(pathname: string): CacheStrategy {
  // Never cache auth, admin, or the role-dispatcher portal
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/_next/data/")
  ) {
    return "network-only";
  }

  // Content-hashed bundles and static public assets → aggressive cache
  if (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/icon.svg" ||
    pathname === "/favicon.ico"
  ) {
    return "cache-first";
  }

  // All navigable pages (landing, dashboard, player) → network-first
  return "network-first";
}
