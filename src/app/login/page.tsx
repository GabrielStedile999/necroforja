import Link from "next/link";
import { Skull } from "lucide-react";
import { useTranslations } from "next-intl";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  const t = useTranslations("Login");
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <Link href="/" className="mb-6 flex items-center justify-center gap-2">
        <Skull className="h-7 w-7 text-hazard" aria-hidden />
        <span className="stencil text-2xl font-bold text-ink">
          Necro<span className="text-hazard">Forja</span>
        </span>
      </Link>

      <Card>
        <CardContent className="py-6">
          <h1 className="stencil mb-1 text-xl font-bold text-ink">
            {t("title")}
          </h1>
          <p className="mb-5 text-sm text-muted">
            {t("subtitle")}
          </p>
          <LoginForm />
        </CardContent>
      </Card>

      <Link
        href="/dashboard"
        className="mt-6 text-center text-xs text-muted hover:text-ink"
      >
        {t("backToDashboard")}
      </Link>
    </main>
  );
}
