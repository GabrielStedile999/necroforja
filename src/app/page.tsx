import { SiteHeader } from "@/components/SiteHeader";
import { CampaignStatus } from "@/components/CampaignStatus";
import { GangRankingTable } from "@/components/GangRankingTable";
import { SympathiserMap } from "@/components/SympathiserMap";
import { ChallengeLog } from "@/components/ChallengeLog";
import { getPublicView } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const view = await getPublicView();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <CampaignStatus view={view} />
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
            <GangRankingTable gangs={view.gangs} />
            <ChallengeLog challenges={view.recentChallenges} />
          </div>
          <div className="min-w-0 lg:col-span-3">
            <SympathiserMap sympathisers={view.sympathisers} />
          </div>
        </div>
      </main>
      <footer className="border-t border-rivet py-6 text-center text-xs text-muted">
        Painel da campanha · Projeto de portfólio de Gabriel Stedile · Conteúdo
        de campanha de uso privado entre os jogadores.
      </footer>
    </>
  );
}
