/**
 * 03 // DISPATCHES — three static news rows.
 * Exact translation from NecroForja - Hi-Fi.dc.html.
 */
const DISPATCHES = [
  {
    tag: "PATCH 1.4",
    tagColor: "#ff2d6f",
    date: "2026.06.18",
    title: "The Sump Sea Expansion",
    summary: "A new toxic biome, two gangs, and a reworked loot economy hit the underhive.",
    thumbBg: "linear-gradient(135deg,#1a1320,#0a0810)",
    thumbStripe: "rgba(255,45,111,.14)",
    borderBottom: false,
  },
  {
    tag: "DEV DIARY",
    tagColor: "#00e5ff",
    date: "2026.06.11",
    title: "Rebuilding Territory Control",
    summary: "How we tore down zone capture and rebuilt it around live, shifting front lines.",
    thumbBg: "linear-gradient(135deg,#0a1418,#06090d)",
    thumbStripe: "rgba(0,229,255,.14)",
    borderBottom: false,
  },
  {
    tag: "SEASON",
    tagColor: "#ff2d6f",
    date: "2026.06.02",
    title: "Season 2: The Aranthian Succession",
    summary: "The spire throne is empty. Five Houses. One hive. Claim it.",
    thumbBg: "linear-gradient(135deg,#16101b,#0a070d)",
    thumbStripe: "rgba(255,45,111,.16)",
    borderBottom: true,
  },
];

export default function News() {
  return (
    <div
      className="ncf-section"
      style={{
        padding: "96px 0",
        background: "#0a090c",
        borderTop: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div className="ncf-wrap" style={{ maxWidth: "1380px", margin: "0 auto", padding: "0 48px" }}>
        {/* Section header */}
        <div
          className="ncf-houses-head"
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "44px", gap: "16px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "13px", letterSpacing: "4px", color: "#ff2d6f" }}>
              03 // DISPATCHES
            </span>
          </div>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "13px", letterSpacing: "2px", color: "rgba(245,245,250,.7)", cursor: "pointer" }}>
            READ ALL DISPATCHES →
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {DISPATCHES.map((d, i) => (
            <div
              key={i}
              className="ncf-news-row ncf-news-row-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "28px",
                padding: "24px 8px",
                borderTop: "1px solid rgba(255,255,255,.09)",
                borderBottom: d.borderBottom ? "1px solid rgba(255,255,255,.09)" : undefined,
                cursor: "pointer",
              }}
            >
              {/* Tag + date */}
              <div style={{ flex: "0 0 130px", fontFamily: "'Share Tech Mono', monospace" }}>
                <div style={{ color: d.tagColor, fontSize: "12px", letterSpacing: "1px" }}>{d.tag}</div>
                <div style={{ color: "rgba(245,245,250,.4)", fontSize: "12px", marginTop: "4px" }}>{d.date}</div>
              </div>

              {/* Thumbnail */}
              <div
                className="ncf-news-thumb"
                style={{
                  flex: "0 0 160px",
                  height: "84px",
                  background: d.thumbBg,
                  border: "1px solid rgba(255,255,255,.08)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `repeating-linear-gradient(115deg,transparent,transparent 7px,${d.thumbStripe} 8px,transparent 9px)`,
                  }}
                />
              </div>

              {/* Title + summary */}
              <div style={{ flex: 1 }}>
                <div className="ncf-news-text-h" style={{ fontSize: "25px", fontWeight: 700, letterSpacing: ".5px", marginBottom: "6px" }}>
                  {d.title}
                </div>
                <div style={{ fontSize: "14px", color: "rgba(245,245,250,.55)", lineHeight: 1.55 }}>
                  {d.summary}
                </div>
              </div>

              {/* Arrow */}
              <span className="ncf-news-arrow" style={{ color: "#ff2d6f", fontSize: "22px" }}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
