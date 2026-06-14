import type { NextAuthConfig } from "next-auth";

/**
 * Config edge-safe do Auth.js (sem DB nem argon2 — usada pelo middleware).
 * O provider Credentials (que toca o banco) vive em auth.ts, runtime Node.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    /** Autorização por rota usada pelo middleware. */
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
