import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RulesChat } from "@/components/assistant/RulesChat";
import { requireUser } from "@/lib/auth/guards";
import { Bot } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Assistente de Regras" };
export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  await requireUser();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-hazard" aria-hidden />
          <h1 className="stencil text-2xl font-bold text-ink">
            Assistente de Regras
          </h1>
          <Badge variant="hazard">IA · RAG</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pergunte às regras</CardTitle>
            <span className="ml-auto text-xs text-muted">acesso restrito</span>
          </CardHeader>
          <CardContent>
            <RulesChat />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted">
          Respostas baseadas nas notas de regras carregadas pelo Arbitrator, de
          uso privado entre os jogadores.
        </p>
      </main>
    </>
  );
}
