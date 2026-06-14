import { ImageResponse } from "next/og";

/**
 * Dynamic Open Graph image for the public landing.
 * Served at /opengraph-image by Next.js App Router.
 *
 * Size: 1200 × 630 (standard OG / Twitter card dimensions).
 * Design: Necromunda dark aesthetic — void background, hazard yellow accent.
 *
 * Note: ImageResponse uses a Flexbox subset — no Tailwind classes here.
 */
export const runtime = "edge";

export const alt =
  "NecroForja — Necromunda campaign manager. Track gangs, Sympathisers and the campaign ranking in real time.";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0b0c0e",
          padding: "72px 80px",
          justifyContent: "space-between",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "6px",
            background: "linear-gradient(90deg, #f2a900 0%, #ff4500 100%)",
            borderRadius: "3px",
          }}
        />

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                background: "#f2a900",
                color: "#0b0c0e",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "4px 12px",
                borderRadius: "4px",
              }}
            >
              Necromunda Campaign
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "80px",
              fontWeight: 800,
              color: "#f0ede8",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Necro
            <span style={{ color: "#f2a900" }}>Forja</span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "28px",
              color: "#8a8a8a",
              maxWidth: "700px",
              lineHeight: 1.4,
            }}
          >
            Track gangs, Sympathisers and the campaign ranking in real time.
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Campaign name pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#1a1c20",
              border: "1px solid #2e2e2e",
              borderRadius: "8px",
              padding: "10px 20px",
              color: "#8a8a8a",
              fontSize: "16px",
            }}
          >
            <span style={{ color: "#f2a900", fontSize: "18px" }}>◆</span>
            The Aranthian Succession: Cinderak Burning
          </div>

          {/* Author */}
          <div style={{ color: "#4a4a4a", fontSize: "15px" }}>
            Gabriel Stedile
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "3px",
            background: "#1a1c20",
            borderRadius: "2px",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
