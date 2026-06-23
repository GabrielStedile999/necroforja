import { Badge } from "@/components/ui/badge";
import type { CampaignPhase, PublicView } from "@/types";

const PHASE_LABEL: Record<CampaignPhase, string> = {
  great_darkness: "Great Darkness",
  downtime: "Downtime",
  spark_of_rebellion: "Spark of Rebellion",
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className="font-mono text-2xl font-bold text-ink">{value}</span>
    </div>
  );
}

export function CampaignStatus({ view }: { view: PublicView }) {
  const { campaign, gangs, sympathisers } = view;
  const controlled = sympathisers.filter((s) => s.controllerGangId).length;

  return (
    <section className="border border-hazard/30 bg-panel clip-chamfer scanlines">
      <div className="px-6 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="hazard">{PHASE_LABEL[campaign.phase]}</Badge>
            <h1 className="stencil mt-2 text-3xl font-bold text-ink md:text-4xl">
              {campaign.name}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {campaign.startDate} → {campaign.endDate}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            <Stat
              label="Cycle"
              value={`${campaign.currentCycle}/${campaign.totalCycles}`}
            />
            <Stat label="Gangs" value={gangs.length} />
            <Stat
              label="Sympathisers"
              value={`${controlled}/${sympathisers.length}`}
            />
            <Stat
              label="Contested"
              value={sympathisers.length - controlled}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
