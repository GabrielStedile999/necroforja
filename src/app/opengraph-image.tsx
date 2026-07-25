import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Open Graph image for the public landing.
 * Served at /opengraph-image by Next.js App Router.
 *
 * Size: 1200 × 630 (standard OG / Twitter card dimensions).
 * Design: Hi-Fi magenta/cyan aesthetic matching the new design system.
 *
 * Conteúdo é totalmente estático (sem params/dados dinâmicos), então não usa
 * `runtime = "edge"` — isso deixava o Next tratar a rota como dinâmica e pular
 * a geração estática dela no build (aviso "Using edge runtime on a page
 * currently disables static generation for that page"). Sem a declaração, a
 * imagem é pré-renderizada uma vez no build e servida como asset estático.
 *
 * Correção (25/jul): a primeira tentativa de remover o edge runtime manteve
 * `fetch(new URL("./og-crest.png", import.meta.url))` pra carregar o crest —
 * esse padrão só funciona sob Edge runtime (o fetch do Next lá sabe resolver
 * URLs de asset "bundladas"). No runtime Node.js padrão, o `fetch` nativo não
 * suporta `file://` e a build falhava ("TypeError: fetch failed" / "not
 * implemented... yet..."). Trocado por leitura direta do arquivo via
 * `fs.readFile`, o jeito documentado pelo Next.js pra assets locais fora do
 * Edge runtime (caminho relativo à raiz do projeto via `process.cwd()`).
 */
export const alt =
  "NecroForja — Necromunda campaign manager. Track gangs, Sympathisers and the campaign ranking in real time.";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  // Official crest (transparent PNG bundled next to this file)
  const crestBase64 = await readFile(
    join(process.cwd(), "src/app/og-crest.png"),
    "base64",
  );
  const crest = `data:image/png;base64,${crestBase64}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0b0a0d",
          padding: "72px 80px",
          justifyContent: "space-between",
        }}
      >
        {/* Official crest — right side (decorativo: renderizado como PNG pelo
            ImageResponse, sem árvore de acessibilidade real) */}
        <img
          src={crest}
          alt=""
          width={360}
          height={360}
          style={{
            position: "absolute",
            top: "135px",
            right: "80px",
          }}
        />
        {/* Top accent bar — magenta → cyan gradient */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "4px",
            background: "linear-gradient(90deg, #ff2d6f 0%, #00e5ff 100%)",
          }}
        />

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,45,111,0.12)",
              border: "1px solid rgba(255,45,111,0.4)",
              padding: "4px 12px",
              alignSelf: "flex-start",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#ff2d6f",
              }}
            />
            <span
              style={{
                color: "#ff2d6f",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Campaign Manager — Active
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              fontSize: "88px",
              fontWeight: 800,
              color: "#f5f5fa",
              lineHeight: 1.0,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            Necro
            <span style={{ color: "#ff2d6f" }}>Forja</span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "24px",
              color: "#7d7a95",
              maxWidth: "620px",
              lineHeight: 1.4,
              letterSpacing: "0.05em",
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
          {/* Campaign pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid #2a2535",
              padding: "10px 20px",
              color: "#7d7a95",
              fontSize: "15px",
              background: "#0f0d14",
            }}
          >
            <span style={{ color: "#00e5ff", fontSize: "16px" }}>◆</span>
            The Aranthian Succession: Cinderak Burning
          </div>

          {/* Author */}
          <div style={{ color: "#3a3750", fontSize: "14px", letterSpacing: "0.1em" }}>
            Gabriel Stedile
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "2px",
            background: "linear-gradient(90deg, #ff2d6f 0%, transparent 50%, #00e5ff 100%)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
