import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Despacha o usuário para o dashboard certo conforme o papel. */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(session.user.role === "admin" ? "/admin" : "/player");
}
