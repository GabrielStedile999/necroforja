import Link from "next/link";

/**
 * "ENTER THE UNDERHIVE" — full-width call-to-action strip.
 * Exact translation from NecroForja - Hi-Fi.dc.html.
 */
export default function BigCTA() {
  return (
    <div
      className="ncf-section"
      style={{
        position: "relative",
        padding: "130px 0",
        textAlign: "center",
        overflow: "hidden",
        background: "radial-gradient(120% 140% at 50% 120%,#1c0e18,#08070a 70%)",
        borderTop: "1px solid rgba(255,255,255,.06)",
      }}
    >
      {/* Angled-stripe top bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "6px",
          background: "repeating-linear-gradient(45deg,#ff2d6f 0,#ff2d6f 14px,#0a0a0c 14px,#0a0a0c 28px)",
          opacity: 0.8,
        }}
      />

      {/* Perspective grid floor */}
      <div
        style={{
          position: "absolute",
          left: "-10%",
          right: "-10%",
          bottom: 0,
          height: "60%",
          backgroundImage:
            "linear-gradient(#ff2d6f 1px,transparent 1px),linear-gradient(90deg,#ff2d6f 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.12,
          transform: "perspective(420px) rotateX(64deg)",
          transformOrigin: "bottom",
          animation: "ncf-grid 5s linear infinite",
        }}
      />

      <div
        className="ncf-wrap"
        style={{ position: "relative", zIndex: 2, maxWidth: "1380px", margin: "0 auto", padding: "0 48px" }}
      >
        <div
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "13px",
            letterSpacing: "6px",
            color: "#ff2d6f",
            marginBottom: "22px",
          }}
        >
          FREE TO PLAY · PC · CONSOLE · CLOUD
        </div>

        <h2
          className="ncf-cta-h"
          style={{
            margin: "0 0 30px",
            fontSize: "clamp(48px,7vw,92px)",
            lineHeight: 0.95,
            fontWeight: 700,
            letterSpacing: "2px",
            textShadow: "0 0 30px #ff2d6f",
          }}
        >
          ENTER THE UNDERHIVE
        </h2>

        <div style={{ display: "flex", gap: "18px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/dashboard"
            style={{
              padding: "18px 46px",
              background: "#ff2d6f",
              color: "#0a0a0c",
              fontWeight: 700,
              fontSize: "18px",
              letterSpacing: "3px",
              clipPath: "polygon(0 0,100% 0,100% 70%,calc(100% - 14px) 100%,0 100%)",
              boxShadow: "0 0 34px rgba(255,45,111,.5)",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            PLAY NOW
          </Link>

          <div
            style={{
              padding: "18px 42px",
              border: "1px solid rgba(255,255,255,.22)",
              color: "#f5f5fa",
              fontWeight: 600,
              fontSize: "18px",
              letterSpacing: "3px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            + WISHLIST
          </div>
        </div>
      </div>
    </div>
  );
}
