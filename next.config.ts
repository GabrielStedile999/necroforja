import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Native Node.js addons (NAPI/Rust) cannot be bundled by webpack.
  // Declaring them here tells Next.js to require() them at runtime instead.
  serverExternalPackages: ["@node-rs/argon2"],
  // Imagens externas (arte própria hospedada no Supabase Storage, por ex.)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
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

export default nextConfig;
