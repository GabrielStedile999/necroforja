"use client";

import Link from "next/link";
import { useState } from "react";
import s from "./SiteNav.module.scss";

const FIVE_HOUSES = [
  { name: "House Vex",    sub: "The Rustsaints · Zealot",       color: "#ff2d6f", shadow: "rgba(255,45,111,.6)"  },
  { name: "Clan Karran",  sub: "The Splice-Born · Cybertech",   color: "#00e5ff", shadow: "rgba(0,229,255,.6)"   },
  { name: "House Greil",  sub: "The Ironbound · Bulwark",       color: "#ff8a3d", shadow: "rgba(255,138,61,.6)"  },
  { name: "The Sump-Born",sub: "Toxin Cults · Toxin",           color: "#59e36b", shadow: "rgba(89,227,107,.6)"  },
  { name: "Spire Exiles", sub: "The Disinherited · Control",    color: "#b07bff", shadow: "rgba(176,123,255,.6)" },
];

export default function SiteNav() {
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
              GAME <span className="text-[9px] opacity-70">▼</span>
            </span>

            <span
              onMouseEnter={() => setMenu("factions")}
              className={`${s.navLink} ${menu === "factions" ? s.active : ""}`}
              style={{ borderBottomColor: menu === "factions" ? "#00e5ff" : "transparent" }}
            >
              FACTIONS <span className="text-[9px] opacity-70">▼</span>
            </span>

            <span onMouseEnter={() => setMenu(null)} className={s.navText}>WORLD</span>
            <span onMouseEnter={() => setMenu(null)} className={s.navText}>NEWS</span>
            <Link href="/dashboard" onMouseEnter={() => setMenu(null)} className={s.navText}>DASHBOARD</Link>
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

            <span className={`font-mono text-xs tracking-[1px] text-[rgba(245,245,250,.5)] ${s.utilItem}`}>
              EN ▾
            </span>

            <Link href="/login" className={`font-mono text-xs tracking-[1px] text-[rgba(245,245,250,.7)] no-underline ${s.utilItem}`}>
              SIGN IN
            </Link>

            <Link href="/dashboard" className={s.playFreeBtn}>PLAY FREE</Link>
          </div>

          {/* Burger — mobile */}
          <button
            onClick={openNav}
            className={`ncf-burger ml-auto ${s.burger}`}
            aria-label="Open menu"
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
                  <div className="mb-5 font-mono text-[11px] tracking-[3px] text-hazard">// OVERVIEW</div>
                  <div className="flex flex-col gap-[15px]">
                    {["Game Overview","How to Play","Gang & Forge Systems","Roadmap","Patch Notes"].map((l) => (
                      <span key={l} className={s.megaLink}>{l}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-5 font-mono text-[11px] tracking-[3px] text-cyan">// MODES</div>
                  <div className="flex flex-col gap-[15px]">
                    {["Campaign","Territory War","Skirmish","Co-op Raids","Public Dashboard"].map((l) => (
                      <span key={l} className={s.megaLink}>{l}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Featured card */}
              <div className="relative shrink-0 basis-[420px] overflow-hidden border border-hazard/30 bg-[linear-gradient(150deg,#1a1020,#0a0810)] cursor-pointer clip-card-br-16">
                <div className="absolute inset-0 stripe-game-featured" />
                <div className="relative p-6">
                  <div className="mb-[10px] font-mono text-[11px] tracking-[2px] text-hazard">FEATURED · S2</div>
                  <div className="mb-2 text-[24px] font-bold leading-[1.05]">The Aranthian Succession</div>
                  <div className="mb-5 max-w-[300px] text-[13px] leading-[1.55] text-[rgba(245,245,250,.6)]">
                    Five Houses. One empty spire throne. The season ends in 14d 06h.
                  </div>
                  <Link href="/dashboard" className={s.megaPlayBtn}>PLAY FREE →</Link>
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
                <div className="mb-[22px] font-mono text-[11px] tracking-[3px] text-cyan">// THE FIVE HOUSES</div>
                <div className="grid grid-cols-2 gap-x-[40px] gap-y-[14px]">
                  {FIVE_HOUSES.map((h) => (
                    <div key={h.name} className={s.houseRow}>
                      <span className="h-[34px] w-1 shrink-0" style={{ background: h.color, boxShadow: `0 0 10px ${h.shadow}` }} />
                      <div>
                        <div className="text-[15px] font-semibold">{h.name}</div>
                        <div className="font-mono text-[11px] text-[rgba(245,245,250,.45)]">{h.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pick-a-side card */}
              <div className="relative shrink-0 basis-[360px] overflow-hidden border border-cyan/[0.28] bg-[linear-gradient(150deg,#0a1418,#06090d)] cursor-pointer clip-card-bl-16">
                <div className="absolute bottom-[-20%] left-[-10%] right-[-10%] h-[90%] opacity-[0.14] grid-factions-panel" />
                <div className="relative p-6">
                  <div className="mb-[10px] font-mono text-[11px] tracking-[2px] text-cyan">PICK A SIDE</div>
                  <div className="mb-2 text-[23px] font-bold leading-[1.05]">Choose Your House</div>
                  <div className="mb-5 max-w-[280px] text-[13px] leading-[1.55] text-[rgba(245,245,250,.6)]">
                    Your allegiance shapes the campaign — and who you betray.
                  </div>
                  <span className={s.compareLink}>COMPARE ALL HOUSES →</span>
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
            <button onClick={closeNav} className={s.mobileClose} aria-label="Close menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="relative z-[2] flex flex-col px-5 pb-10 pt-2">
            <div className="my-5 mb-1 font-mono text-[11px] tracking-[3px] text-hazard">// NAVIGATE</div>

            {[
              { num: "01", label: "GAME" },
              { num: "02", label: "FACTIONS" },
              { num: "03", label: "WORLD" },
              { num: "04", label: "NEWS" },
              { num: "05", label: "DASHBOARD" },
            ].map((item) => (
              <div key={item.num} onClick={closeNav} className={s.mobileNavItem}>
                <span className="font-mono text-xs text-[rgba(245,245,250,.35)]">{item.num}</span>
                <span className="text-[28px] font-bold tracking-[1px]">{item.label}</span>
              </div>
            ))}

            <div className="mb-[14px] mt-[30px] font-mono text-[11px] tracking-[3px] text-cyan">// THE FIVE HOUSES</div>
            <div className="flex flex-col gap-3">
              {FIVE_HOUSES.map((h) => (
                <div key={h.name} onClick={closeNav} className={s.mobileHouseRow}>
                  <span className="h-[30px] w-1 shrink-0" style={{ background: h.color, boxShadow: `0 0 10px ${h.shadow}` }} />
                  <div>
                    <div className="text-[15px] font-semibold">{h.name}</div>
                    <div className="font-mono text-[11px] text-[rgba(245,245,250,.45)]">{h.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-[30px] flex items-center gap-5 font-mono text-[13px] tracking-[1px] text-[rgba(245,245,250,.7)]">
              <span className="flex cursor-pointer items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" />
                </svg>
                SEARCH
              </span>
              <span className="cursor-pointer">EN ▾</span>
              <Link href="/login" onClick={closeNav} className="cursor-pointer text-[rgba(245,245,250,.7)] no-underline">SIGN IN</Link>
            </div>

            <Link href="/dashboard" onClick={closeNav} className={s.mobilePlayBtn}>
              PLAY FREE →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
