"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (/sw.js) on mount.
 * Renders nothing — purely a side-effect component.
 * Placed in the root layout so it runs on every page.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => {
        // Non-fatal: app works without the SW; log for debugging.
        console.error("[PWA] Service worker registration failed:", err);
      });
  }, []);

  return null;
}
