import { auth } from "@/auth";

/** Garante usuário autenticado (uso em Server Actions / Server Components). */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  return session.user;
}

/** Garante papel de admin (Arbitrator). */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Acesso negado.");
  return user;
}
