import Link from "next/link";
import { Skull } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/SignOutButton";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-20 border-b border-rivet bg-void/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Skull className="h-6 w-6 text-hazard" aria-hidden />
          <span className="stencil text-xl font-bold text-ink">
            Necro<span className="text-hazard">Forja</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost">Arbitrator</Button>
                </Link>
              )}
              <Link href="/player">
                <Button variant="outline">Minha Gangue</Button>
              </Link>
              <span className="hidden text-xs text-muted sm:inline">
                {user.name}
              </span>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline">Entrar</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
