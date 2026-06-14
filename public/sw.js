/**
 * NecroForja — Service Worker
 *
 * Caching strategy (mirrors src/lib/pwa/cache-routes.ts):
 *
 *   network-only   /api/*, /admin*, /login*, /dashboard*, /_next/data/*
 *   cache-first    /_next/static/*, /icons/*, /icon.svg, /favicon.ico
 *   network-first  /player*, / (and everything else)
 *
 * Bump CACHE_VERSION when making breaking changes to the SW so that old
 * caches are purged on activation.
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `necroforja-${CACHE_VERSION}`;

/* ------------------------------------------------------------------ */
/*  Route helpers (keep in sync with src/lib/pwa/cache-routes.ts)      */
/* ------------------------------------------------------------------ */

function isNetworkOnly(pathname) {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/_next/data/")
  );
}

function isCacheFirst(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/icon.svg" ||
    pathname === "/favicon.ico"
  );
}

/* ------------------------------------------------------------------ */
/*  Lifecycle                                                           */
/* ------------------------------------------------------------------ */

self.addEventListener("install", () => {
  // Take control immediately without waiting for old SW to become idle.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/* ------------------------------------------------------------------ */
/*  Fetch interception                                                  */
/* ------------------------------------------------------------------ */

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests — POST/PUT/DELETE go straight to network.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only handle same-origin requests.
  if (url.origin !== self.location.origin) return;

  const { pathname } = url;

  // ---- Network-only: skip SW entirely ----
  if (isNetworkOnly(pathname)) return;

  // ---- Cache-first: serve from cache, populate on miss ----
  if (isCacheFirst(pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return response;
        });
      }),
    );
    return;
  }

  // ---- Network-first: try network, fall back to cache ----
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful navigation responses for offline fallback.
        if (response.ok && request.mode === "navigate") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Network failed — serve from cache if available.
        return caches.match(request).then(
          (cached) =>
            cached ??
            new Response("Offline — cached version not available.", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            }),
        );
      }),
  );
});
