import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/UserMenu";

/** In-app header — shown on /dashboard, /admin, /player (not on the marketing landing). */
export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;
  const t = await getTranslations("Nav");

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
            // issue #40 — área de usuário unificada com o SiteNav: avatar +
            // nome + dropdown (My Gang/Arbitrator viraram atalhos do menu).
            <UserMenu user={{ name: user.name, email: user.email, role: user.role }} />
          ) : (
            <Link href="/login">
              <Button variant="outline" className="text-xs">{t("signIn")}</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
