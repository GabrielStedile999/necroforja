import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// i18n (issue #12): cookie-based locale, default "en", no browser detection.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Permite redirecionar o diretório de build (útil em sandboxes/CI).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Native Node.js addons (NAPI/Rust) cannot be bundled by webpack.
  // Declaring them here tells Next.js to require() them at runtime instead.
  serverExternalPackages: ["@node-rs/argon2"],
  // Imagens externas (arte própria hospedada no Supabase Storage, por ex.)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    // Qualidades permitidas para next/image (90 usada nas figuras do lore)
    qualities: [75, 90],
  },
  // Cabeçalhos de segurança básicos (ver seção 9 do PLANO-TECNICO.md)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Service worker must always be re-fetched so updates are picked up
      // immediately.  Service-Worker-Allowed: / grants the SW its full scope.
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
