import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Dispatches the user to the correct dashboard based on their role. */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(session.user.role === "admin" ? "/admin" : "/player");
}
