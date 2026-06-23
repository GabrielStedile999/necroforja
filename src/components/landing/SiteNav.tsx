"use client";

import Link from "next/link";
import { useState } from "react";

export default function SiteNav() {
  const [menu, setMenu] = useState<"game" | "factions" | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  const openNav = () => {
    if (typeof document !== "undefined") document.body.style.overflow = "hidden";
    setNavOpen(true);
    setMenu(null);
  };
  const closeNav = () => {
    if (typeof document !== "undefined") document.body.style.overflow = "";
    setNavOpen(false);
  };

  const gameLinkColor = menu === "game" ? "#fff" : "rgba(245,245,250,.7)";
  const gameLinkBorder = menu === "game" ? "#ff2d6f" : "transparent";
  const factionsLinkColor = menu === "factions" ? "#fff" : "rgba(245,245,250,.7)";
  const factionsLinkBorder = menu === "factions" ? "#00e5ff" : "transparent";

  return (
    <>
      <div
        onMouseLeave={() => setMenu(null)}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 60,
          background: "rgba(8,7,10,.82)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          boxShadow: "0 1px 0 rgba(255,45,111,.12),0 18px 40px rgba(0,0,0,.4)",
        }}
      >
        <div
          className="ncf-nav-inner"
          style={{
            maxWidth: "1380px",
            margin: "0 auto",
            height: "74px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "0 30px",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            onMouseEnter={() => setMenu(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              flex: "none",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span
              style={{
                color: "#ff2d6f",
                fontSize: "23px",
                lineHeight: 1,
                textShadow: "0 0 12px #ff2d6f",
              }}
            >
              ◣
            </span>
            <span
              style={{
                fontWeight: 700,
                letterSpacing: "5px",
                fontSize: "18px",
                color: "#f5f5fa",
              }}
            >
              NECROFORJA
            </span>
          </Link>

          {/* Center primary links (desktop) */}
          <div
            className="ncf-nav-links"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "12px",
              letterSpacing: "1px",
            }}
          >
            <div
              onMouseEnter={() => setMenu("game")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "9px 11px",
                cursor: "pointer",
                color: gameLinkColor,
                borderBottom: `2px solid ${gameLinkBorder}`,
                transition: "color .15s",
              }}
            >
              GAME <span style={{ fontSize: "9px", opacity: 0.7 }}>▼</span>
            </div>
            <div
              onMouseEnter={() => setMenu("factions")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "9px 11px",
                cursor: "pointer",
                color: factionsLinkColor,
                borderBottom: `2px solid ${factionsLinkBorder}`,
                transition: "color .15s",
              }}
            >
              FACTIONS <span style={{ fontSize: "9px", opacity: 0.7 }}>▼</span>
            </div>
            <div
              onMouseEnter={() => setMenu(null)}
              style={{ padding: "9px 11px", cursor: "pointer", color: "rgba(245,245,250,.7)", borderBottom: "2px solid transparent" }}
            >
              WORLD
            </div>
            <div
              onMouseEnter={() => setMenu(null)}
              style={{ padding: "9px 11px", cursor: "pointer", color: "rgba(245,245,250,.7)", borderBottom: "2px solid transparent" }}
            >
              NEWS
            </div>
            <Link
              href="/dashboard"
              onMouseEnter={() => setMenu(null)}
              style={{ padding: "9px 11px", cursor: "pointer", color: "rgba(245,245,250,.7)", borderBottom: "2px solid transparent", textDecoration: "none" }}
            >
              DASHBOARD
            </Link>
          </div>

          {/* Utility cluster (desktop) */}
          <div
            className="ncf-nav-util"
            onMouseEnter={() => setMenu(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
              flex: "none",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                border: "1px solid rgba(255,255,255,.14)",
                color: "rgba(245,245,250,.7)",
                cursor: "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.5" y2="16.5" />
              </svg>
            </span>
            <span style={{ width: "1px", height: "20px", background: "rgba(255,255,255,.14)" }} />
            <span
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "12px",
                color: "rgba(245,245,250,.5)",
                letterSpacing: "1px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              EN ▾
            </span>
            <Link
              href="/login"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "12px",
                color: "rgba(245,245,250,.7)",
                letterSpacing: "1px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                textDecoration: "none",
              }}
            >
              SIGN IN
            </Link>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 18px",
                background: "#ff2d6f",
                color: "#0a0a0c",
                fontWeight: 700,
                fontSize: "12px",
                letterSpacing: "1.5px",
                clipPath: "polygon(0 0,100% 0,100% 70%,calc(100% - 10px) 100%,0 100%)",
                boxShadow: "0 0 18px rgba(255,45,111,.4)",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              PLAY FREE
            </Link>
          </div>

          {/* Burger (mobile) */}
          <div
            className="ncf-burger"
            onClick={openNav}
            style={{
              marginLeft: "auto",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              border: "1px solid rgba(255,255,255,.18)",
              color: "#f5f5fa",
              cursor: "pointer",
              flex: "none",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </div>
        </div>

        {/* GAME mega-panel */}
        {menu === "game" && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "rgba(9,8,11,.98)",
              backdropFilter: "blur(14px)",
              borderBottom: "1px solid #ff2d6f",
              boxShadow: "0 30px 60px rgba(0,0,0,.6)",
              animation: "ncf-menu .16s ease both",
              zIndex: 59,
            }}
          >
            <div
              className="ncf-mega-inner"
              style={{
                maxWidth: "1380px",
                margin: "0 auto",
                padding: "40px 48px 44px",
                display: "flex",
                gap: "56px",
              }}
            >
              <div style={{ display: "flex", gap: "64px", flex: 1 }}>
                <div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", letterSpacing: "3px", color: "#ff2d6f", marginBottom: "20px" }}>// OVERVIEW</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {["Game Overview", "How to Play", "Gang & Forge Systems", "Roadmap", "Patch Notes"].map((l) => (
                      <span key={l} style={{ fontSize: "15px", color: "rgba(245,245,250,.78)", cursor: "pointer" }}>{l}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", letterSpacing: "3px", color: "#00e5ff", marginBottom: "20px" }}>// MODES</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {["Campaign", "Territory War", "Skirmish", "Co-op Raids", "Public Dashboard"].map((l) => (
                      <span key={l} style={{ fontSize: "15px", color: "rgba(245,245,250,.78)", cursor: "pointer" }}>{l}</span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Featured card */}
              <div
                style={{
                  flex: "0 0 420px",
                  position: "relative",
                  background: "linear-gradient(150deg,#1a1020,#0a0810)",
                  border: "1px solid rgba(255,45,111,.3)",
                  overflow: "hidden",
                  clipPath: "polygon(0 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%)",
                  cursor: "pointer",
                }}
              >
                <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(115deg,transparent,transparent 8px,rgba(255,45,111,.12) 9px,transparent 10px)" }} />
                <div style={{ position: "relative", padding: "24px" }}>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "#ff2d6f", marginBottom: "10px" }}>FEATURED · S2</div>
                  <div style={{ fontSize: "24px", fontWeight: 700, lineHeight: 1.05, marginBottom: "8px" }}>The Aranthian Succession</div>
                  <div style={{ fontSize: "13px", color: "rgba(245,245,250,.6)", lineHeight: 1.55, marginBottom: "20px", maxWidth: "300px" }}>Five Houses. One empty spire throne. The season ends in 14d 06h.</div>
                  <Link
                    href="/dashboard"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 18px",
                      background: "#ff2d6f",
                      color: "#0a0a0c",
                      fontWeight: 700,
                      fontSize: "12px",
                      letterSpacing: "2px",
                      clipPath: "polygon(0 0,100% 0,100% 70%,calc(100% - 9px) 100%,0 100%)",
                      textDecoration: "none",
                    }}
                  >
                    PLAY FREE →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FACTIONS mega-panel */}
        {menu === "factions" && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "rgba(9,8,11,.98)",
              backdropFilter: "blur(14px)",
              borderBottom: "1px solid #00e5ff",
              boxShadow: "0 30px 60px rgba(0,0,0,.6)",
              animation: "ncf-menu .16s ease both",
              zIndex: 59,
            }}
          >
            <div
              className="ncf-mega-inner"
              style={{
                maxWidth: "1380px",
                margin: "0 auto",
                padding: "36px 48px 40px",
                display: "flex",
                gap: "56px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", letterSpacing: "3px", color: "#00e5ff", marginBottom: "22px" }}>// THE FIVE HOUSES</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 40px" }}>
                  {[
                    { name: "House Vex", sub: "The Rustsaints · Zealot", color: "#ff2d6f", shadow: "rgba(255,45,111,.6)" },
                    { name: "Clan Karran", sub: "The Splice-Born · Cybertech", color: "#00e5ff", shadow: "rgba(0,229,255,.6)" },
                    { name: "House Greil", sub: "The Ironbound · Bulwark", color: "#ff8a3d", shadow: "rgba(255,138,61,.6)" },
                    { name: "The Sump-Born", sub: "Toxin Cults · Toxin", color: "#59e36b", shadow: "rgba(89,227,107,.6)" },
                    { name: "Spire Exiles", sub: "The Disinherited · Control", color: "#b07bff", shadow: "rgba(176,123,255,.6)" },
                  ].map((h) => (
                    <div key={h.name} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "8px 0", cursor: "pointer" }}>
                      <span style={{ width: "4px", height: "34px", background: h.color, boxShadow: `0 0 10px ${h.shadow}` }} />
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 600 }}>{h.name}</div>
                        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", color: "rgba(245,245,250,.45)" }}>{h.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Featured pick-a-side card */}
              <div
                style={{
                  flex: "0 0 360px",
                  position: "relative",
                  background: "linear-gradient(150deg,#0a1418,#06090d)",
                  border: "1px solid rgba(0,229,255,.28)",
                  overflow: "hidden",
                  clipPath: "polygon(0 0,100% 0,100% 100%,16px 100%,0 calc(100% - 16px))",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "-10%",
                    right: "-10%",
                    bottom: "-20%",
                    height: "90%",
                    backgroundImage: "linear-gradient(#00e5ff 1px,transparent 1px),linear-gradient(90deg,#00e5ff 1px,transparent 1px)",
                    backgroundSize: "34px 34px",
                    opacity: 0.14,
                    transform: "perspective(300px) rotateX(60deg)",
                    transformOrigin: "bottom",
                  }}
                />
                <div style={{ position: "relative", padding: "24px" }}>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "#00e5ff", marginBottom: "10px" }}>PICK A SIDE</div>
                  <div style={{ fontSize: "23px", fontWeight: 700, lineHeight: 1.05, marginBottom: "8px" }}>Choose Your House</div>
                  <div style={{ fontSize: "13px", color: "rgba(245,245,250,.6)", lineHeight: 1.55, marginBottom: "20px", maxWidth: "280px" }}>Your allegiance shapes the campaign — and who you betray.</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "'Share Tech Mono', monospace", fontSize: "13px", letterSpacing: "1px", color: "#00e5ff", cursor: "pointer" }}>
                    COMPARE ALL HOUSES →
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile full-screen menu */}
      {navOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            background: "rgba(7,6,9,.985)",
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          {/* scanlines overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "repeating-linear-gradient(to bottom,rgba(0,0,0,0) 0,rgba(0,0,0,0) 2px,rgba(0,0,0,.25) 3px,rgba(0,0,0,0) 4px)",
              opacity: 0.55,
            }}
          />
          {/* grid floor */}
          <div
            style={{
              position: "absolute",
              left: "-20%",
              right: "-20%",
              bottom: 0,
              height: "34%",
              backgroundImage: "linear-gradient(#ff2d6f 1px,transparent 1px),linear-gradient(90deg,#ff2d6f 1px,transparent 1px)",
              backgroundSize: "54px 54px",
              opacity: 0.08,
              transform: "perspective(420px) rotateX(64deg)",
              transformOrigin: "bottom",
              pointerEvents: "none",
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,.08)",
              position: "relative",
              zIndex: 2,
              flex: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: "#ff2d6f", fontSize: "20px", lineHeight: 1, textShadow: "0 0 12px #ff2d6f" }}>◣</span>
              <span style={{ fontWeight: 700, letterSpacing: "4px", fontSize: "16px" }}>NECROFORJA</span>
            </div>
            <div
              onClick={closeNav}
              style={{
                width: "44px",
                height: "44px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,.18)",
                color: "#f5f5fa",
                cursor: "pointer",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </div>
          </div>

          {/* Body */}
          <div style={{ position: "relative", zIndex: 2, padding: "8px 20px 40px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", letterSpacing: "3px", color: "#ff2d6f", margin: "20px 0 4px" }}>// NAVIGATE</div>
            {[
              { num: "01", label: "GAME" },
              { num: "02", label: "FACTIONS" },
              { num: "03", label: "WORLD" },
              { num: "04", label: "NEWS" },
              { num: "05", label: "DASHBOARD" },
            ].map((item) => (
              <div
                key={item.num}
                onClick={closeNav}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "14px",
                  padding: "15px 0",
                  borderBottom: "1px solid rgba(255,255,255,.07)",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "12px", color: "rgba(245,245,250,.35)" }}>{item.num}</span>
                <span style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "1px" }}>{item.label}</span>
              </div>
            ))}

            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", letterSpacing: "3px", color: "#00e5ff", margin: "30px 0 14px" }}>// THE FIVE HOUSES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { name: "House Vex", sub: "The Rustsaints · Zealot", color: "#ff2d6f", shadow: "rgba(255,45,111,.6)" },
                { name: "Clan Karran", sub: "The Splice-Born · Cybertech", color: "#00e5ff", shadow: "rgba(0,229,255,.6)" },
                { name: "House Greil", sub: "The Ironbound · Bulwark", color: "#ff8a3d", shadow: "rgba(255,138,61,.6)" },
                { name: "The Sump-Born", sub: "Toxin Cults · Toxin", color: "#59e36b", shadow: "rgba(89,227,107,.6)" },
                { name: "Spire Exiles", sub: "The Disinherited · Control", color: "#b07bff", shadow: "rgba(176,123,255,.6)" },
              ].map((h) => (
                <div key={h.name} onClick={closeNav} style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}>
                  <span style={{ width: "4px", height: "30px", background: h.color, boxShadow: `0 0 10px ${h.shadow}` }} />
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 600 }}>{h.name}</div>
                    <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", color: "rgba(245,245,250,.45)" }}>{h.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "30px", fontFamily: "'Share Tech Mono', monospace", fontSize: "13px", letterSpacing: "1px", color: "rgba(245,245,250,.7)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
                SEARCH
              </span>
              <span style={{ cursor: "pointer" }}>EN ▾</span>
              <Link href="/login" onClick={closeNav} style={{ cursor: "pointer", color: "inherit", textDecoration: "none" }}>SIGN IN</Link>
            </div>

            <Link
              href="/dashboard"
              onClick={closeNav}
              style={{
                marginTop: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "17px",
                background: "#ff2d6f",
                color: "#0a0a0c",
                fontWeight: 700,
                fontSize: "15px",
                letterSpacing: "2px",
                clipPath: "polygon(0 0,100% 0,100% 76%,calc(100% - 12px) 100%,0 100%)",
                boxShadow: "0 0 22px rgba(255,45,111,.4)",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              PLAY FREE →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
