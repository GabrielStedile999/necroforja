"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import s from "./SiteNav.module.scss";

// House names are canonical game terms and stay in English (issue #12:
// identifiers/logic in English — only display copy is translated).
// hrefs point at the house dossier anchors on the Gangs page (issue #8).
const GREAT_HOUSES = [
  { key: "cawdor",  name: "House Cawdor",   href: "/gangs#house-cawdor",   color: "#ffc23d", shadow: "rgba(255,194,61,.6)"  },
  { key: "delaque", name: "House Delaque",  href: "/gangs#house-delaque",  color: "#b07bff", shadow: "rgba(176,123,255,.6)" },
  { key: "escher",  name: "House Escher",   href: "/gangs#house-escher",   color: "#ff2d6f", shadow: "rgba(255,45,111,.6)"  },
  { key: "goliath", name: "House Goliath",  href: "/gangs#house-goliath",  color: "#ff8a3d", shadow: "rgba(255,138,61,.6)"  },
  { key: "orlock",  name: "House Orlock",   href: "/gangs#house-orlock",   color: "#59e36b", shadow: "rgba(89,227,107,.6)"  },
  { key: "vanSaar", name: "House Van Saar", href: "/gangs#house-van-saar", color: "#00e5ff", shadow: "rgba(0,229,255,.6)"   },
] as const;

const GAME_OVERVIEW_LINKS = [
  { key: "gameOverview" },
  { key: "howToPlay", href: "/how-to-play" },
  { key: "gangForge" },
  { key: "loreSetting", href: "/lore" },
  { key: "campaignJournal" },
] as const;

const GAME_MODE_KEYS = ["campaign", "territoryWar", "skirmish", "ashWastes", "publicDashboard"] as const;

export default function SiteNav() {
  const t = useTranslations("Nav");
  const [menu, setMenu]       = useState<"game" | "factions" | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  const openNav = () => {
    document.body.style.overflow = "hidden";
    setNavOpen(true);
    setMenu(null);
  };
  const closeNav = () => {
    document.body.style.overflow = "";
    setNavOpen(false);
  };

  return (
    <>
      {/* ── Sticky nav bar ── */}
      <div
        onMouseLeave={() => setMenu(null)}
        className="sticky top-0 z-[60] border-b border-white/[0.08] bg-[rgba(8,7,10,.82)] backdrop-blur-[12px] shadow-nav"
      >
        <div className="ncf-nav-inner mx-auto flex h-[74px] max-w-[1380px] items-center gap-4 px-[30px]">

          {/* Logo */}
          <Link
            href="/"
            onMouseEnter={() => setMenu(null)}
            className="flex shrink-0 items-center gap-3 no-underline text-ink"
          >
            <span className={`text-hazard text-[23px] leading-none ${s.logoGlyph}`}>◣</span>
            <span className="text-[18px] font-bold tracking-[5px]">NECROFORJA</span>
          </Link>

          {/* Center links — desktop */}
          <nav className="ncf-nav-links flex flex-1 items-center justify-center gap-0.5 font-mono text-xs tracking-[1px]">
            <span
              onMouseEnter={() => setMenu("game")}
              className={`${s.navLink} ${menu === "game" ? s.active : ""}`}
              style={{ borderBottomColor: menu === "game" ? "#ff2d6f" : "transparent" }}
            >
              {t("game")} <span className="text-[9px] opacity-70">▼</span>
            </span>

            <Link
              href="/gangs"
              onMouseEnter={() => setMenu("factions")}
              className={`${s.navLink} ${menu === "factions" ? s.active : ""} no-underline`}
              style={{ borderBottomColor: menu === "factions" ? "#00e5ff" : "transparent" }}
            >
              {t("factions")} <span className="text-[9px] opacity-70">▼</span>
            </Link>

            <Link href="/lore" onMouseEnter={() => setMenu(null)} className={`${s.navText} no-underline`}>{t("world")}</Link>
            <span onMouseEnter={() => setMenu(null)} className={s.navText}>{t("news")}</span>
            <Link href="/dashboard" onMouseEnter={() => setMenu(null)} className={s.navText}>{t("dashboard")}</Link>
          </nav>

          {/* Utility cluster — desktop */}
          <div
            onMouseEnter={() => setMenu(null)}
            className="ncf-nav-util flex shrink-0 items-center gap-[11px]"
          >
            <span className={s.searchBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" />
              </svg>
            </span>

            <span className="h-[20px] w-px bg-white/[0.14]" />

            <LocaleSwitcher align="right" />

            <Link href="/login" className={s.playFreeBtn}>{t("signIn")}</Link>
          </div>

          {/* Burger — mobile */}
          <button
            onClick={openNav}
            className={`ncf-burger ml-auto ${s.burger}`}
            aria-label={t("openMenu")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── GAME mega-panel ── */}
        {menu === "game" && (
          <div className="animate-ncf-menu absolute left-0 right-0 top-full z-[59] border-b border-hazard bg-[rgba(9,8,11,.98)] backdrop-blur-[14px] shadow-mega">
            <div className="ncf-mega-inner mx-auto flex max-w-[1380px] gap-[56px] px-[48px] py-[40px] pb-[44px]">

              {/* Link columns */}
              <div className="flex flex-1 gap-[64px]">
                <div>
                  <div className="mb-5 font-mono text-[11px] tracking-[3px] text-hazard">{t("gameMenu.overviewLabel")}</div>
                  <div className="flex flex-col gap-[15px]">
                    {GAME_OVERVIEW_LINKS.map((item) =>
                      "href" in item ? (
                        <Link key={item.key} href={item.href} className={`${s.megaLink} no-underline`}>{t(`gameMenu.overview.${item.key}`)}</Link>
                      ) : (
                        <span key={item.key} className={s.megaLink}>{t(`gameMenu.overview.${item.key}`)}</span>
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <div className="mb-5 font-mono text-[11px] tracking-[3px] text-cyan">{t("gameMenu.modesLabel")}</div>
                  <div className="flex flex-col gap-[15px]">
                    {GAME_MODE_KEYS.map((k) => (
                      <span key={k} className={s.megaLink}>{t(`gameMenu.modes.${k}`)}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Featured card */}
              <div className="relative shrink-0 basis-[420px] overflow-hidden border border-hazard/30 bg-[linear-gradient(150deg,#1a1020,#0a0810)] cursor-pointer clip-card-br-16">
                <div className="absolute inset-0 stripe-game-featured" />
                <div className="relative p-6">
                  <div className="mb-[10px] font-mono text-[11px] tracking-[2px] text-hazard">{t("gameMenu.featuredKicker")}</div>
                  <div className="mb-2 text-[24px] font-bold leading-[1.05]">{t("gameMenu.featuredTitle")}</div>
                  <div className="mb-5 max-w-[300px] text-[13px] leading-[1.55] text-[rgba(245,245,250,.6)]">
                    {t("gameMenu.featuredDesc")}
                  </div>
                  <Link href="/login" className={s.megaPlayBtn}>{t("signInArrow")}</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FACTIONS mega-panel ── */}
        {menu === "factions" && (
          <div className="animate-ncf-menu absolute left-0 right-0 top-full z-[59] border-b border-cyan bg-[rgba(9,8,11,.98)] backdrop-blur-[14px] shadow-mega">
            <div className="ncf-mega-inner mx-auto flex max-w-[1380px] gap-[56px] px-[48px] py-[36px] pb-[40px]">

              {/* Houses grid */}
              <div className="flex-1">
                <div className="mb-[22px] font-mono text-[11px] tracking-[3px] text-cyan">{t("factionsMenu.housesLabel")}</div>
                <div className="grid grid-cols-2 gap-x-[40px] gap-y-[14px]">
                  {GREAT_HOUSES.map((h) => (
                    <Link key={h.name} href={h.href} className={`${s.houseRow} no-underline text-ink`}>
                      <span className="h-[34px] w-1 shrink-0" style={{ background: h.color, boxShadow: `0 0 10px ${h.shadow}` }} />
                      <div>
                        <div className="text-[15px] font-semibold">{h.name}</div>
                        <div className="font-mono text-[11px] text-[rgba(245,245,250,.45)]">{t(`houses.${h.key}`)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Pick-a-side card */}
              <div className="relative shrink-0 basis-[360px] overflow-hidden border border-cyan/[0.28] bg-[linear-gradient(150deg,#0a1418,#06090d)] cursor-pointer clip-card-bl-16">
                <div className="absolute bottom-[-20%] left-[-10%] right-[-10%] h-[90%] opacity-[0.14] grid-factions-panel" />
                <div className="relative p-6">
                  <div className="mb-[10px] font-mono text-[11px] tracking-[2px] text-cyan">{t("factionsMenu.pickASide")}</div>
                  <div className="mb-2 text-[23px] font-bold leading-[1.05]">{t("factionsMenu.chooseTitle")}</div>
                  <div className="mb-5 max-w-[280px] text-[13px] leading-[1.55] text-[rgba(245,245,250,.6)]">
                    {t("factionsMenu.chooseDesc")}
                  </div>
                  <Link href="/gangs" className={`${s.compareLink} no-underline`}>{t("factionsMenu.compareAll")}</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile fullscreen menu ── */}
      {navOpen && (
        <div className="fixed inset-0 z-[120] flex flex-col overflow-auto bg-[rgba(7,6,9,.985)] backdrop-blur-[10px]">
          {/* Scanlines */}
          <div className="scanlines-dark pointer-events-none absolute inset-0 opacity-[0.55]" />
          {/* Grid floor */}
          <div className="absolute bottom-0 left-[-20%] right-[-20%] h-[34%] pointer-events-none opacity-[0.08] grid-mobile-menu" />

          {/* Header */}
          <div className="relative z-[2] flex shrink-0 items-center justify-between border-b border-white/[0.08] px-5 py-4">
            <div className="flex items-center gap-[10px]">
              <span className={`text-hazard text-[20px] leading-none ${s.logoGlyph}`}>◣</span>
              <span className="text-[16px] font-bold tracking-[4px]">NECROFORJA</span>
            </div>
            <button onClick={closeNav} className={s.mobileClose} aria-label={t("closeMenu")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="relative z-[2] flex flex-col px-5 pb-10 pt-2">
            <div className="my-5 mb-1 font-mono text-[11px] tracking-[3px] text-hazard">{t("navigate")}</div>

            {[
              { num: "01", label: t("game") },
              { num: "02", label: t("howToPlay"), href: "/how-to-play" },
              { num: "03", label: t("factions"), href: "/gangs" },
              { num: "04", label: t("world"), href: "/lore" },
              { num: "05", label: t("news") },
              { num: "06", label: t("dashboard"), href: "/dashboard" },
            ].map((item) =>
              item.href ? (
                <Link key={item.num} href={item.href} onClick={closeNav} className={`${s.mobileNavItem} no-underline text-ink`}>
                  <span className="font-mono text-xs text-[rgba(245,245,250,.35)]">{item.num}</span>
                  <span className="text-[28px] font-bold tracking-[1px]">{item.label}</span>
                </Link>
              ) : (
                <div key={item.num} onClick={closeNav} className={s.mobileNavItem}>
                  <span className="font-mono text-xs text-[rgba(245,245,250,.35)]">{item.num}</span>
                  <span className="text-[28px] font-bold tracking-[1px]">{item.label}</span>
                </div>
              ),
            )}

            <div className="mb-[14px] mt-[30px] font-mono text-[11px] tracking-[3px] text-cyan">{t("factionsMenu.housesLabel")}</div>
            <div className="flex flex-col gap-3">
              {GREAT_HOUSES.map((h) => (
                <Link key={h.name} href={h.href} onClick={closeNav} className={`${s.mobileHouseRow} no-underline text-ink`}>
                  <span className="h-[30px] w-1 shrink-0" style={{ background: h.color, boxShadow: `0 0 10px ${h.shadow}` }} />
                  <div>
                    <div className="text-[15px] font-semibold">{h.name}</div>
                    <div className="font-mono text-[11px] text-[rgba(245,245,250,.45)]">{t(`houses.${h.key}`)}</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-[30px] flex items-center gap-5 font-mono text-[13px] tracking-[1px] text-[rgba(245,245,250,.7)]">
              <span className="flex cursor-pointer items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" />
                </svg>
                {t("search")}
              </span>
              <LocaleSwitcher align="left" />
            </div>

            <Link href="/login" onClick={closeNav} className={s.mobilePlayBtn}>
              {t("signInArrow")}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
