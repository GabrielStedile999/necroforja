import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal",
  robots: { index: false, follow: false },
};

/** Dispatches the authenticated user to the correct area based on role. */
export default async function PortalPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(session.user.role === "admin" ? "/admin" : "/player");
}
