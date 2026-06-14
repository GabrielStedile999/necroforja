import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (no DB or argon2 — used by the middleware).
 * The Credentials provider (which touches the database) lives in auth.ts, Node runtime.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    /** Route-based authorisation used by the middleware. */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const path = nextUrl.pathname;

      if (path.startsWith("/admin")) return isLoggedIn && role === "admin";
      if (path.startsWith("/player")) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.role) session.user.role = token.role as "admin" | "player";
      return session;
    },
  },
} satisfies NextAuthConfig;
