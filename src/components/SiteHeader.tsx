import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/SignOutButton";

/** In-app header — shown on /dashboard, /admin, /player (not on the marketing landing). */
export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-20 border-b border-rivet bg-void/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted" aria-hidden>◣</span>
          <span className="stencil text-xl font-bold text-ink">
            Necro<span className="text-hazard glow-magenta">Forja</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost" className="text-xs">Arbitrator</Button>
                </Link>
              )}
              <Link href="/player">
                <Button variant="outline" className="text-xs">My Gang</Button>
              </Link>
              <span className="hidden font-mono text-xs text-muted sm:inline">
                {user.name}
              </span>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="text-xs">Sign In</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
