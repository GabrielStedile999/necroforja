/**
 * 02 // THE HOUSES — five gang house cards.
 * Exact translation from NecroForja - Hi-Fi.dc.html.
 */
const HOUSES = [
  {
    id: "H-01",
    name: "HOUSE VEX",
    tagline: "THE RUSTSAINTS",
    desc: "Scrap-priests who bless every blade with rust and prayer.",
    role: "ZEALOT",
    color: "#ff2d6f",
    shadow: "rgba(255,45,111,.7)",
    roleBorder: "rgba(255,45,111,.4)",
    hoverClass: "ncf-house-card-vex",
  },
  {
    id: "H-02",
    name: "CLAN KARRAN",
    tagline: "THE SPLICE-BORN",
    desc: "Gene-smiths trading flesh for chrome and colder nerves.",
    role: "CYBERTECH",
    color: "#00e5ff",
    shadow: "rgba(0,229,255,.7)",
    roleBorder: "rgba(0,229,255,.4)",
    hoverClass: "ncf-house-card-kar",
  },
  {
    id: "H-03",
    name: "HOUSE GREIL",
    tagline: "THE IRONBOUND",
    desc: "Foundry lords who march behind walls of welded plate.",
    role: "BULWARK",
    color: "#ff8a3d",
    shadow: "rgba(255,138,61,.7)",
    roleBorder: "rgba(255,138,61,.4)",
    hoverClass: "ncf-house-card-gre",
  },
  {
    id: "H-04",
    name: "THE SUMP-BORN",
    tagline: "TOXIN CULTS",
    desc: "Drowned tribes weaponizing the poison that birthed them.",
    role: "TOXIN",
    color: "#59e36b",
    shadow: "rgba(89,227,107,.7)",
    roleBorder: "rgba(89,227,107,.4)",
    hoverClass: "ncf-house-card-sum",
  },
  {
    id: "H-05",
    name: "SPIRE EXILES",
    tagline: "THE DISINHERITED",
    desc: "Fallen nobility buying back a throne with other men's blood.",
    role: "CONTROL",
    color: "#b07bff",
    shadow: "rgba(176,123,255,.7)",
    roleBorder: "rgba(176,123,255,.4)",
    hoverClass: "ncf-house-card-spi",
  },
];

export default function Houses() {
  return (
    <div
      id="factions"
      className="ncf-section"
      style={{
        padding: "104px 0",
        background: "#0b0a0d",
        borderTop: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div className="ncf-wrap" style={{ maxWidth: "1380px", margin: "0 auto", padding: "0 48px" }}>
        {/* Section header */}
        <div
          className="ncf-houses-head"
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", marginBottom: "14px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "13px", letterSpacing: "4px", color: "#ff2d6f" }}>
              02 // THE HOUSES
            </span>
          </div>
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "13px",
              letterSpacing: "2px",
              color: "rgba(245,245,250,.6)",
              cursor: "pointer",
            }}
          >
            COMPARE ALL HOUSES →
          </span>
        </div>

        <h2
          className="ncf-section-h"
          style={{ margin: "0 0 48px", fontSize: "40px", fontWeight: 700, letterSpacing: "1px" }}
        >
          Five dynasties. One empty throne.
        </h2>

        <div className="ncf-houses" style={{ display: "flex", gap: "20px", alignItems: "stretch" }}>
          {HOUSES.map((h) => (
            <div
              key={h.id}
              className={`ncf-house-card ${h.hoverClass}`}
              style={{
                flex: 1,
                position: "relative",
                background: "linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.01))",
                border: "1px solid rgba(255,255,255,.09)",
                overflow: "hidden",
                cursor: "pointer",
                clipPath: "polygon(0 0,100% 0,100% 100%,14px 100%,0 calc(100% - 14px))",
              }}
            >
              {/* Colored top bar */}
              <div
                style={{
                  height: "4px",
                  background: h.color,
                  boxShadow: `0 0 14px ${h.shadow}`,
                }}
              />
              <div
                style={{
                  padding: "24px 22px 26px",
                  display: "flex",
                  flexDirection: "column",
                  height: "280px",
                }}
              >
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "rgba(245,245,250,.4)", marginBottom: "18px" }}>
                  {h.id}
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: ".5px" }}>{h.name}</div>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "12px", letterSpacing: "1px", color: h.color, margin: "4px 0 16px" }}>
                  {h.tagline}
                </div>
                <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: "rgba(245,245,250,.58)", flex: 1 }}>
                  {h.desc}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "18px" }}>
                  <span
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: "11px",
                      letterSpacing: "1px",
                      padding: "6px 11px",
                      border: `1px solid ${h.roleBorder}`,
                      color: h.color,
                    }}
                  >
                    {h.role}
                  </span>
                  <span style={{ color: h.color, fontSize: "18px" }}>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
