/**
 * Ticker — scrolling marquee bar at the top of the landing.
 * Exact translation from NecroForja - Hi-Fi.dc.html.
 */
export default function Ticker() {
  const items = [
    "● SEASON 2 LIVE",
    "THE ARANTHIAN SUCCESSION",
    "14,212 GANGERS ONLINE",
    "SUMP SEA EXPANSION — OUT NOW",
    "SPIRE THRONE: CONTESTED",
  ];

  // Doubled for seamless infinite loop (translateX(-50%))
  const all = [...items, ...items];

  return (
    <div
      style={{
        height: "32px",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "#ff2d6f",
        color: "#0a0a0c",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: "12px",
        letterSpacing: "1px",
        whiteSpace: "nowrap",
        position: "relative",
        zIndex: 30,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "46px",
          paddingLeft: "46px",
          animation: "ncf-ticker 26s linear infinite",
        }}
      >
        {all.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}
