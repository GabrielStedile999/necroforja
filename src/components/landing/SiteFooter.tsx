import Link from "next/link";

/**
 * Site footer — exact translation from NecroForja - Hi-Fi.dc.html.
 */
export default function SiteFooter() {
  return (
    <div
      className="ncf-section"
      style={{
        padding: "72px 0 44px",
        background: "#070609",
        borderTop: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <div className="ncf-wrap" style={{ maxWidth: "1380px", margin: "0 auto", padding: "0 48px" }}>
        {/* Main columns */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "40px", marginBottom: "52px", flexWrap: "wrap" }}>
          {/* Brand column */}
          <div style={{ flex: "0 0 320px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ color: "#ff2d6f", fontSize: "20px" }}>◣</span>
              <span style={{ fontWeight: 700, letterSpacing: "5px", fontSize: "17px" }}>NECROFORJA</span>
            </div>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: "rgba(245,245,250,.45)", maxWidth: "260px" }}>
              Tales of Necromunda — The Aranthian Succession. A free-to-play war for the underhive.
            </p>
          </div>

          {/* Link groups */}
          <div
            className="ncf-footer-links"
            style={{ display: "flex", gap: "72px", fontFamily: "'Share Tech Mono', monospace", flexWrap: "wrap" }}
          >
            {[
              {
                heading: "GAME",
                links: [
                  { label: "Overview", href: "/" },
                  { label: "Factions", href: "#factions" },
                  { label: "Roadmap", href: "/" },
                  { label: "Dashboard", href: "/dashboard" },
                ],
              },
              {
                heading: "COMMUNITY",
                links: [
                  { label: "Discord", href: "/" },
                  { label: "News", href: "/" },
                  { label: "Creators", href: "/" },
                  { label: "Forums", href: "/" },
                ],
              },
              {
                heading: "SUPPORT",
                links: [
                  { label: "Help", href: "/" },
                  { label: "Status", href: "/" },
                  { label: "Contact", href: "/" },
                  { label: "Account", href: "/login" },
                ],
              },
            ].map((group) => (
              <div key={group.heading}>
                <div style={{ fontSize: "12px", letterSpacing: "2px", color: "rgba(245,245,250,.4)", marginBottom: "16px" }}>
                  {group.heading}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "11px", fontSize: "13px", color: "rgba(245,245,250,.65)" }}>
                  {group.links.map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      style={{ cursor: "pointer", color: "inherit", textDecoration: "none" }}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "26px",
            borderTop: "1px solid rgba(255,255,255,.07)",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "11px",
            letterSpacing: "1px",
            color: "rgba(245,245,250,.35)",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <span>© 2026 NECROFORJA — FAN-MADE CONCEPT. NOT AFFILIATED WITH GAMES WORKSHOP.</span>
          <div style={{ display: "flex", gap: "18px" }}>
            <span style={{ cursor: "pointer" }}>PRIVACY</span>
            <span style={{ cursor: "pointer" }}>TERMS</span>
            <span>◈ ◇ ◆</span>
          </div>
        </div>
      </div>
    </div>
  );
}
