import type { MetadataRoute } from "next";

/**
 * Web App Manifest — enables PWA installability on Android, Chrome OS, and
 * desktop Chromium. iOS uses the <link rel="apple-touch-icon"> in layout.tsx.
 *
 * Served at /manifest.webmanifest by Next.js App Router automatically.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NecroForja — Necromunda Campaign Manager",
    short_name: "NecroForja",
    description:
      "Track gangs, Sympathisers and the campaign ranking in real time.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0b0c0e",
    theme_color: "#f2a900",
    lang: "en",
    categories: ["games", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        // "any" → used for the home-screen icon
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        // "maskable" → safe-zone design allows circular/squircle masking on Android
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
