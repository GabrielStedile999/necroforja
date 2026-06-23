/**
 * 01 // THE GAME — two alternating feature rows.
 * Exact translation from NecroForja - Hi-Fi.dc.html.
 */
export default function Features() {
  return (
    <div
      className="ncf-section"
      style={{ padding: "104px 0", background: "#0a090c" }}
    >
      <div
        className="ncf-wrap"
        style={{ maxWidth: "1380px", margin: "0 auto", padding: "0 48px" }}
      >
        {/* Section label */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "56px" }}>
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "13px",
              letterSpacing: "4px",
              color: "#00e5ff",
            }}
          >
            01 // THE GAME
          </span>
          <span style={{ flex: 1, height: "1px", background: "rgba(255,255,255,.1)" }} />
        </div>

        {/* Feature 1 */}
        <div
          className="ncf-feature-row"
          style={{ display: "flex", gap: "56px", alignItems: "stretch", marginBottom: "44px" }}
        >
          {/* Media */}
          <div
            className="ncf-feature-media"
            style={{
              flex: "0 0 560px",
              position: "relative",
              height: "340px",
              background: "linear-gradient(135deg,#15101b,#0a070d)",
              border: "1px solid rgba(255,255,255,.08)",
              overflow: "hidden",
              clipPath: "polygon(0 0,100% 0,100% 100%,24px 100%,0 calc(100% - 24px))",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "linear-gradient(#ff2d6f 1px,transparent 1px),linear-gradient(90deg,#ff2d6f 1px,transparent 1px)",
                backgroundSize: "40px 40px",
                opacity: 0.08,
              }}
            />
            <div style={{ position: "absolute", left: "28px", top: "24px", fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "rgba(245,245,250,.5)" }}>
              GANG // ROSTER
            </div>
            <div style={{ position: "absolute", left: "28px", right: "28px", bottom: "28px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { name: "VEX, THE RUSTSAINT", level: "LV 24", leftColor: "#ff2d6f", bg: "linear-gradient(135deg,#ff2d6f,#3a1020)" },
                { name: 'KARRAN-9 "SPLICE"', level: "LV 19", leftColor: "#00e5ff", bg: "linear-gradient(135deg,#00e5ff,#0a2a30)" },
                { name: "+ RECRUIT FIGHTER", level: "320 ¢", leftColor: "rgba(255,255,255,.2)", bg: "linear-gradient(135deg,#444,#111)" },
              ].map((row) => (
                <div
                  key={row.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "11px 14px",
                    background: "rgba(255,255,255,.04)",
                    borderLeft: `2px solid ${row.leftColor}`,
                  }}
                >
                  <span style={{ width: "30px", height: "30px", background: row.bg, flex: "none" }} />
                  <span style={{ flex: 1, fontSize: "13px", fontWeight: 600 }}>{row.name}</span>
                  <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", color: "#00e5ff" }}>{row.level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Text */}
          <div
            className="ncf-feature-text"
            style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}
          >
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "13px", letterSpacing: "3px", color: "#ff2d6f", marginBottom: "14px" }}>01 / SYSTEM</span>
            <h3
              className="ncf-feature-h"
              style={{ margin: "0 0 16px", fontSize: "48px", lineHeight: 1, fontWeight: 700, letterSpacing: "1px" }}
            >
              FORGE YOUR GANG
            </h3>
            <p style={{ margin: "0 0 26px", fontSize: "17px", lineHeight: 1.65, color: "rgba(245,245,250,.6)", maxWidth: "460px" }}>
              Recruit fighters, bolt on cybernetics, and scavenge the forge for gear. Every scar, weapon, and upgrade persists across the entire campaign.
            </p>
            <div
              className="ncf-feature-tags"
              style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
            >
              {["DEEP CUSTOMIZATION", "PERSISTENT INJURIES", "5 HOUSES"].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: "12px",
                    letterSpacing: "1px",
                    padding: "8px 14px",
                    border: "1px solid rgba(255,255,255,.14)",
                    color: "rgba(245,245,250,.7)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div
          className="ncf-feature-row"
          style={{ display: "flex", gap: "56px", alignItems: "stretch", flexDirection: "row-reverse" }}
        >
          {/* Media */}
          <div
            className="ncf-feature-media"
            style={{
              flex: "0 0 560px",
              position: "relative",
              height: "340px",
              background: "linear-gradient(135deg,#0a1418,#06090d)",
              border: "1px solid rgba(255,255,255,.08)",
              overflow: "hidden",
              clipPath: "polygon(0 0,100% 0,100% calc(100% - 24px),calc(100% - 24px) 100%,0 100%)",
            }}
          >
            {/* Perspective grid */}
            <div
              style={{
                position: "absolute",
                left: "-20%",
                right: "-20%",
                bottom: "-10%",
                height: "80%",
                backgroundImage: "linear-gradient(#00e5ff 1px,transparent 1px),linear-gradient(90deg,#00e5ff 1px,transparent 1px)",
                backgroundSize: "46px 46px",
                opacity: 0.12,
                transform: "perspective(360px) rotateX(60deg)",
                transformOrigin: "bottom",
              }}
            />
            <div style={{ position: "absolute", left: "28px", top: "24px", fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "rgba(245,245,250,.5)" }}>
              TERRITORY // SECTOR-7G
            </div>
            {/* Radar circle */}
            <div style={{ position: "absolute", top: "42%", left: "30%", width: "90px", height: "90px", border: "1px solid #ff2d6f", borderRadius: "50%", opacity: 0.5 }} />
            <div style={{ position: "absolute", top: "42%", left: "30%", width: "90px", height: "90px" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", width: "50%", height: "1px", background: "linear-gradient(90deg,#ff2d6f,transparent)", transformOrigin: "left", animation: "ncf-sweep 4s linear infinite" }} />
            </div>
            {/* Dots */}
            <div style={{ position: "absolute", right: "60px", top: "90px", width: "14px", height: "14px", background: "#ff2d6f", boxShadow: "0 0 12px #ff2d6f" }} />
            <div style={{ position: "absolute", right: "120px", bottom: "80px", width: "10px", height: "10px", background: "#00e5ff", boxShadow: "0 0 12px #00e5ff" }} />
            <div style={{ position: "absolute", left: "40px", bottom: "30px", fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", color: "#00e5ff", letterSpacing: "1px" }}>
              CONTROL 62% ▲
            </div>
          </div>

          {/* Text (right-aligned when not mobile) */}
          <div
            className="ncf-feature-text"
            style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", textAlign: "right" }}
          >
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "13px", letterSpacing: "3px", color: "#00e5ff", marginBottom: "14px" }}>02 / WORLD</span>
            <h3
              className="ncf-feature-h"
              style={{ margin: "0 0 16px", fontSize: "48px", lineHeight: 1, fontWeight: 700, letterSpacing: "1px" }}
            >
              A LIVING UNDERHIVE
            </h3>
            <p style={{ margin: "0 0 26px", fontSize: "17px", lineHeight: 1.65, color: "rgba(245,245,250,.6)", maxWidth: "460px" }}>
              Territory shifts in real time as thousands fight for control. Seasons rewrite the map, alliances rise and burn, and the spire throne is always in play.
            </p>
            <div
              className="ncf-feature-tags"
              style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "flex-end" }}
            >
              {["LIVE TERRITORY WAR", "SEASONAL MAP"].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: "12px",
                    letterSpacing: "1px",
                    padding: "8px 14px",
                    border: "1px solid rgba(255,255,255,.14)",
                    color: "rgba(245,245,250,.7)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
