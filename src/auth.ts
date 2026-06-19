import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { loginSchema } from "@/lib/validation";
import { getUserByEmail } from "@/lib/db/queries";
import { verifyPassword } from "@/lib/auth/password";

/**
 * Full Auth.js configuration (Node runtime — touches the database and argon2).
 * The middleware uses authConfig (edge-safe); here we add the provider.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.error("[auth] schema parse failed:", parsed.error);
          return null;
        }

        const { email, password } = parsed.data;
        console.log("[auth] looking up user:", email);

        let user;
        try {
          user = await getUserByEmail(email);
        } catch (e) {
          console.error("[auth] DB error:", e);
          return null;
        }

        if (!user) { console.error("[auth] user not found"); return null; }
        if (!user.isActive) { console.error("[auth] user inactive"); return null; }
        if (!user.passwordHash) { console.error("[auth] no password hash"); return null; }

        console.log("[auth] verifying password...");
        let ok;
        try {
          ok = await verifyPassword(user.passwordHash, password);
        } catch (e) {
          console.error("[auth] verifyPassword error:", e);
          return null;
        }
        console.log("[auth] password ok:", ok);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          role: user.role,
        };
      },
    }),
  ],
});
