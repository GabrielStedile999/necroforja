import { auth } from "@/auth";

/** Ensures an authenticated user (used in Server Actions / Server Components). */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated.");
  return session.user;
}

/** Ensures the admin role (Arbitrator). */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Access denied.");
  return user;
}
