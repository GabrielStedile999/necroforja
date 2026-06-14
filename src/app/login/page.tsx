import Link from "next/link";
import { Skull } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
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
            Acesso restrito
          </h1>
          <p className="mb-5 text-sm text-muted">
            Contas são criadas pelo Arbitrator. Entre com suas credenciais.
          </p>
          <LoginForm />
        </CardContent>
      </Card>

      <Link
        href="/"
        className="mt-6 text-center text-xs text-muted hover:text-ink"
      >
        ← Voltar ao painel público
      </Link>
    </main>
  );
}
