"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/**
 * Displays a persistent banner at the top of the viewport when the browser
 * has no network connection.
 *
 * Behaviour:
 *  - Reads navigator.onLine on mount to catch the initial state.
 *  - Listens to the "online" / "offline" window events for live updates.
 *  - When offline: warns that the roster may be stale and that mutations
 *    (adding fighters, editing equipment, etc.) require a connection.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Initialise from the current network state.
    setOffline(!navigator.onLine);

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!offline) return null;

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
