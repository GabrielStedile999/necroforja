import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe middleware: uses only authConfig (no DB/argon2).
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protects authenticated areas; ignores assets and the auth route.
  matcher: ["/admin/:path*", "/player/:path*"],
};
