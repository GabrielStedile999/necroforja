import Link from "next/link";

/**
 * Hero section — exact translation from NecroForja - Hi-Fi.dc.html.
 * Uses hero.png as background-image via inline style (right center).
 * Left-to-right gradient so title text reads clearly.
 */
export default function Hero() {
  return (
    <div
      className="ncf-hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
        background: "#0a0507",
        backgroundImage: "url(/hero.png)",
        backgroundSize: "cover",
        backgroundPosition: "right center",
      }}
    >
      {/* Left-to-right gradient so title text reads clearly */}
      <div
        className="ncf-hero-gradient"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg,rgba(5,3,4,.94) 0%,rgba(5,3,4,.82) 30%,rgba(5,3,4,.55) 52%,rgba(5,3,4,.15) 72%,transparent 100%)",
          zIndex: 1,
        }}
      />

      {/* Top/bottom darken */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,rgba(0,0,0,.35) 0%,transparent 30%,transparent 65%,rgba(0,0,0,.5) 100%)",
          zIndex: 2,
        }}
      />

      {/* Perspective grid floor */}
      <div
        style={{
          position: "absolute",
          left: "-10%",
          right: "-10%",
          bottom: 0,
          height: "42%",
          backgroundImage:
            "linear-gradient(#ff2d6f 1px,transparent 1px),linear-gradient(90deg,#ff2d6f 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.1,
          transform: "perspective(460px) rotateX(64deg)",
          transformOrigin: "bottom",
          animation: "ncf-grid 4.5s linear infinite",
          zIndex: 3,
        }}
      />

      {/* Particles */}
      <div style={{ position: "absolute", left: "22%", bottom: "8%", width: "3px", height: "3px", borderRadius: "50%", background: "#00e5ff", boxShadow: "0 0 8px #00e5ff", animation: "ncf-rise 9s linear infinite", zIndex: 5 }} />
      <div style={{ position: "absolute", left: "44%", bottom: "4%", width: "2px", height: "2px", borderRadius: "50%", background: "#ff2d6f", boxShadow: "0 0 8px #ff2d6f", animation: "ncf-rise 11s linear .8s infinite", zIndex: 5 }} />
      <div style={{ position: "absolute", left: "63%", bottom: "10%", width: "3px", height: "3px", borderRadius: "50%", background: "#00e5ff", boxShadow: "0 0 8px #00e5ff", animation: "ncf-rise 8s linear 1.6s infinite", zIndex: 5 }} />
      <div style={{ position: "absolute", left: "80%", bottom: "6%", width: "2px", height: "2px", borderRadius: "50%", background: "#ff2d6f", boxShadow: "0 0 8px #ff2d6f", animation: "ncf-rise 12s linear .4s infinite", zIndex: 5 }} />

      {/* Top-right HUD */}
      <div
        className="ncf-hero-deco"
        style={{
          position: "absolute",
          top: "26px",
          right: "48px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "12px",
          letterSpacing: "1px",
          color: "rgba(245,245,250,.7)",
          zIndex: 21,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
          <span
            style={{
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "#ff2d6f",
              boxShadow: "0 0 10px #ff2d6f",
              animation: "ncf-blink 1.4s steps(1) infinite",
              display: "inline-block",
            }}
          />
          REC
        </span>
        <span style={{ color: "rgba(245,245,250,.4)" }}>LIVE FEED · SECTOR-7G</span>
        <span style={{ padding: "3px 8px", border: "1px solid rgba(255,255,255,.15)" }}>02:14:08</span>
      </div>

      {/* Left vertical text */}
      <div
        className="ncf-hero-deco"
        style={{
          position: "absolute",
          left: "20px",
          top: "50%",
          transform: "translateY(-50%) rotate(180deg)",
          writingMode: "vertical-rl",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "11px",
          letterSpacing: "5px",
          color: "rgba(245,245,250,.32)",
          zIndex: 21,
        }}
      >
        UNDERHIVE // ARANTHIAN SUCCESSION // FORGE PROTOCOL
      </div>

      {/* Scroll cue (bottom-right) */}
      <div
        className="ncf-hero-deco"
        style={{
          position: "absolute",
          right: "48px",
          bottom: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          zIndex: 21,
        }}
      >
        <span
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "10px",
            letterSpacing: "3px",
            color: "rgba(245,245,250,.4)",
            writingMode: "vertical-rl",
          }}
        >
          SCROLL
        </span>
        <span
          style={{
            position: "relative",
            width: "18px",
            height: "30px",
            border: "1px solid rgba(245,245,250,.3)",
            borderRadius: "10px",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "50%",
              top: "6px",
              transform: "translateX(-50%)",
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              background: "#ff2d6f",
              animation: "ncf-scrolldot 1.8s ease-in-out infinite",
            }}
          />
        </span>
      </div>

      {/* Main content */}
      <div
        className="ncf-hero-content"
        style={{
          position: "relative",
          zIndex: 20,
          width: "100%",
          maxWidth: "1380px",
          margin: "0 auto",
          padding: "0 48px 96px",
        }}
      >
        {/* Pre-title line */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
          <span style={{ width: "54px", height: "1px", background: "#ff2d6f" }} />
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "13px", letterSpacing: "5px", color: "#ff2d6f" }}>
            TALES OF NECROMUNDA
          </span>
        </div>

        {/* H1 */}
        <h1
          className="ncf-h1"
          style={{
            margin: 0,
            fontSize: "clamp(64px,9.6vw,158px)",
            lineHeight: 0.9,
            fontWeight: 700,
            letterSpacing: "2px",
            color: "#fafaff",
            whiteSpace: "nowrap",
            textShadow: "0 0 34px #ff2d6f,0 0 4px rgba(255,255,255,.4)",
          }}
        >
          NECRO
          <span
            style={{ color: "#ff2d6f", animation: "ncf-flicker 5s steps(1) infinite" }}
          >
            FORJA
          </span>
        </h1>

        {/* Tagline */}
        <div
          className="ncf-hero-tagline"
          style={{
            margin: "16px 0 24px",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "clamp(15px,1.5vw,22px)",
            letterSpacing: "9px",
            color: "rgba(245,245,250,.82)",
          }}
        >
          THE ARANTHIAN SUCCESSION
        </div>

        {/* Lead */}
        <p
          className="ncf-hero-lead"
          style={{
            margin: "0 0 36px",
            maxWidth: "600px",
            fontSize: "18px",
            lineHeight: 1.65,
            color: "rgba(245,245,250,.62)",
          }}
        >
          Descend into the rust-choked underhive. Forge a gang, seize territory, and outlast rival Houses in a living war for the spires above.
        </p>

        {/* CTAs */}
        <div className="ncf-hero-cta" style={{ display: "flex", alignItems: "stretch", gap: "18px", flexWrap: "wrap" }}>
          {/* Primary CTA */}
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "16px 32px",
              background: "#ff2d6f",
              color: "#0a0a0c",
              clipPath: "polygon(0 0,100% 0,100% 72%,calc(100% - 14px) 100%,0 100%)",
              boxShadow: "0 0 30px rgba(255,45,111,.45)",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "17px", letterSpacing: "2px" }}>
              ENTER PUBLIC DASHBOARD →
            </span>
            <span
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "11px",
                letterSpacing: "1px",
                opacity: 0.7,
                marginTop: "3px",
              }}
            >
              LIVE CAMPAIGN · 14,212 ONLINE
            </span>
          </Link>

          {/* Watch Trailer (disabled) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "14px 24px 14px 14px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.14)",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "64px",
                height: "46px",
                background: "linear-gradient(135deg,#1a1320,#0a0810)",
                border: "1px solid rgba(255,255,255,.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flex: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "repeating-linear-gradient(115deg,transparent,transparent 6px,rgba(0,229,255,.12) 7px,transparent 8px)",
                }}
              />
              <span style={{ color: "#fff", fontSize: "16px", textShadow: "0 0 8px #00e5ff" }}>▶</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 600, fontSize: "14px", letterSpacing: "2px" }}>WATCH TRAILER</span>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", color: "rgba(245,245,250,.5)", letterSpacing: "1px" }}>
                OFFICIAL REVEAL · 02:14
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scanlines overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "repeating-linear-gradient(to bottom,rgba(0,0,0,0) 0,rgba(0,0,0,0) 2px,rgba(0,0,0,.22) 3px,rgba(0,0,0,0) 4px)",
          opacity: 0.8,
          zIndex: 8,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(130% 95% at 50% 24%,transparent 42%,rgba(0,0,0,.7) 100%)",
          zIndex: 9,
        }}
      />
    </div>
  );
}
