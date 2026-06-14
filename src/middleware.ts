import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Middleware edge-safe: usa apenas authConfig (sem DB/argon2).
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protege as áreas autenticadas; ignora assets e a rota de auth.
  matcher: ["/admin/:path*", "/player/:path*"],
};
