import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (no DB or argon2 — used by the middleware).
 * The Credentials provider (which touches the database) lives in auth.ts, Node runtime.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  // maxAge explícito (issue #40, pedido do Gabriel): sessão JWT de 7 dias
  // — e ROLANTE: o Auth.js reemite o cookie a cada leitura da sessão,
  // então na prática é "7 dias desde a última visita", não desde o login.
  // (Default do Auth.js seria 30 dias; 7 é um equilíbrio melhor entre
  // conveniência e segurança pra uma conta admin.)
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
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
