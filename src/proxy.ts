import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe proxy: uses only authConfig (no DB/argon2).
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  // Protects authenticated areas; ignores assets and the auth route.
  matcher: ["/admin/:path*", "/player/:path*", "/portal"],
};
