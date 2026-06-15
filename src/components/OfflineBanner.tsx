"use client";

import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

/**
 * Displays a persistent banner at the top of the viewport when the browser
 * has no network connection.
 *
 * Uses `useSyncExternalStore` to read the browser's online/offline state — the
 * idiomatic way to subscribe to an external source without setState-in-effect.
 * The server snapshot assumes "online" so nothing renders during SSR.
 */
function subscribe(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function OfflineBanner() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine, // client snapshot
    () => true, // server snapshot (assume online during SSR)
  );

  if (online) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-rust/90 px-4 py-2 text-center text-sm font-medium text-ink backdrop-blur-sm"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      <span>
        You&apos;re offline. Viewing cached data —{" "}
        <strong>changes require a connection.</strong>
      </span>
    </div>
  );
}
