"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { signOutAction } from "@/lib/auth/session-actions";
import { avatarAccent, getInitials } from "@/lib/avatar";
import type { SessionUser } from "@/components/auth/useSessionUser";

export type { SessionUser };

/**
 * Área de usuário logado unificada (issue #40) — usada pelo SiteNav
 * (landing/páginas públicas) e pelo SiteHeader (dashboard/admin/player).
 * Avatar por iniciais + dropdown com identidade, atalhos e sign out.
 * Padrão disclosure acessível: aria-expanded/aria-controls, Escape fecha
 * e devolve o foco ao botão, clique fora fecha.
 */

function displayName(user: SessionUser): string {
  return user.name?.trim() || user.email || "?";
}

export function UserAvatar({ name, size = 28 }: { name: string; size?: number }) {
  const accent = avatarAccent(name);
  return (
    <span
      aria-hidden
      className="flex shrink-0 select-none items-center justify-center rounded-full font-mono font-bold leading-none"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.36)),
        color: accent.color,
        background: accent.bg,
        border: `1px solid ${accent.border}`,
        boxShadow: `0 0 10px ${accent.shadow}`,
      }}
    >
      {getInitials(name)}
    </span>
  );
}

/** Atalhos do dropdown — Arbitrator só para admin. */
function useMenuLinks(role: SessionUser["role"]) {
  const t = useTranslations("UserMenu");
  const links = [
    { key: "dashboard", href: "/dashboard", label: t("dashboard") },
    { key: "myGang", href: "/player", label: t("myGang") },
  ];
  if (role === "admin") {
    links.push({ key: "adminArea", href: "/admin", label: t("adminArea") });
  }
  return links;
}

export function UserMenu({ user, className }: { user: SessionUser; className?: string }) {
  const t = useTranslations("UserMenu");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const name = displayName(user);
  const links = useMenuLinks(user.role);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t("openMenu")}
        className="flex cursor-pointer items-center gap-2 bg-transparent p-0 text-ink"
      >
        <UserAvatar name={name} />
        <span className="hidden max-w-[140px] truncate font-mono text-xs tracking-[1px] md:inline">
          {name}
        </span>
        <span aria-hidden className="text-[9px] opacity-70">
          ▼
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-[calc(100%+14px)] z-[70] w-[260px] border border-white/[0.12] bg-[rgba(9,8,11,.98)] shadow-mega backdrop-blur-[14px]"
        >
          {/* Identidade */}
          <div className="flex items-center gap-3 border-b border-white/[0.08] p-4">
            <UserAvatar name={name} size={40} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-ink">{name}</div>
              {user.email && (
                <div className="truncate font-mono text-[11px] text-muted">{user.email}</div>
              )}
              {user.role && (
                <div className="mt-1 font-mono text-[10px] tracking-[2px] text-hazard">
                  {user.role === "admin" ? t("roleAdmin") : t("rolePlayer")}
                </div>
              )}
            </div>
          </div>

          {/* Atalhos */}
          <nav className="flex flex-col py-2" aria-label={t("openMenu")}>
            {links.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-2 font-mono text-xs tracking-[1px] text-ink no-underline transition-colors hover:bg-white/[0.06] hover:text-hazard"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Sign out */}
          <form action={signOutAction} className="border-t border-white/[0.08] p-2">
            <button
              type="submit"
              className="w-full cursor-pointer bg-transparent px-2 py-2 text-left font-mono text-xs tracking-[1px] text-muted transition-colors hover:bg-white/[0.06] hover:text-hazard"
            >
              {t("signOut")} →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/**
 * Variante do menu mobile fullscreen do SiteNav: sem dropdown — identidade
 * e atalhos inline no lugar do botão SIGN IN.
 */
export function UserMenuMobile({
  user,
  onNavigate,
}: {
  user: SessionUser;
  onNavigate?: () => void;
}) {
  const t = useTranslations("UserMenu");
  const name = displayName(user);
  const links = useMenuLinks(user.role);

  return (
    <div className="mt-[26px] border-t border-white/[0.08] pt-5">
      <div className="flex items-center gap-3">
        <UserAvatar name={name} size={40} />
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold text-ink">{name}</div>
          {user.role && (
            <div className="font-mono text-[10px] tracking-[2px] text-hazard">
              {user.role === "admin" ? t("roleAdmin") : t("rolePlayer")}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {links.map((l) => (
          <Link
            key={l.key}
            href={l.href}
            onClick={onNavigate}
            className="font-mono text-[13px] tracking-[1px] text-[rgba(245,245,250,.85)] no-underline"
          >
            {l.label} →
          </Link>
        ))}
      </div>

      <form action={signOutAction} className="mt-5">
        <button
          type="submit"
          className="cursor-pointer bg-transparent p-0 font-mono text-[13px] tracking-[1px] text-muted"
        >
          {t("signOut")} →
        </button>
      </form>
    </div>
  );
}
