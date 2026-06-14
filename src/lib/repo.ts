/**
 * Public view repository. Reads from the database when DATABASE_URL is defined;
 * otherwise (or if tables do not yet exist) falls back to seed data.
 * This way the landing works with or without a connected database.
 */
import type { PublicView, GangRankRow, SympathiserView } from "@/types";
import { SYMPATHISERS } from "@/lib/data/sympathisers";
import {
  CAMPAIGN,
  GANGS,
  SYMPATHISER_CONTROL,
  controllerOf,
} from "@/lib/data/campaign";
import { gangRating, gangWealth } from "@/lib/scoring";

function rankGangs(rows: GangRankRow[]): GangRankRow[] {
  return [...rows].sort(
    (a, b) => b.sympathiserCount - a.sympathiserCount || b.rating - a.rating,
  );
}

export async function getPublicView(): Promise<PublicView> {
  if (process.env.DATABASE_URL) {
    try {
      return await getDbView();
    } catch {
      // tables not yet migrated / database unavailable → fallback
      return getSeedView();
    }
  }
  return getSeedView();
}

async function getDbView(): Promise<PublicView> {
  const {
    getActiveCampaign,
    getAllGangs,
    getSympathiserControlMap,
    getSympathiserControllerMap,
    listSympathisers,
    listChallenges,
  } = await import("@/lib/db/queries");

  const campaignRow = await getActiveCampaign();
  if (!campaignRow) return getSeedView();

  const gangs = await getAllGangs();
  const controlMap = await getSympathiserControlMap();
  const controllerMap = await getSympathiserControllerMap();
  const enabledSymps = await listSympathisers(true); // enabled only
  const challenges = await listChallenges(campaignRow.id, 8);

  const nameById = new Map(gangs.map((g) => [g.id, g.name]));
  const sympNameById = new Map(SYMPATHISERS.map((s) => [s.id, s.name]));
  const sympOrder = new Map(SYMPATHISERS.map((s, i) => [s.id, i]));

  const gangRows: GangRankRow[] = gangs.map((g) => ({
    id: g.id,
    name: g.name,
    house: g.house,
    ownerName: g.ownerName,
    rating: gangRating(g),
    wealth: gangWealth(g),
    sympathiserCount: controlMap[g.id]?.length ?? 0,
  }));

  const sympathisers: SympathiserView[] = enabledSymps
    .slice()
    .sort((a, b) => (sympOrder.get(a.id) ?? 0) - (sympOrder.get(b.id) ?? 0))
    .map((s) => {
      const controllerGangId = controllerMap[s.id] ?? null;
      return {
        id: s.id,
        name: s.name,
        controllerGangId,
        controllerName: controllerGangId
          ? (nameById.get(controllerGangId) ?? null)
          : null,
      };
    });

  return {
    campaign: {
      id: campaignRow.id,
      name: campaignRow.name,
      phase: campaignRow.phase,
      currentCycle: campaignRow.currentCycle,
      totalCycles: campaignRow.totalCycles,
      startDate: campaignRow.startDate ?? "",
      endDate: campaignRow.endDate ?? "",
    },
    gangs: rankGangs(gangRows),
    sympathisers,
    recentChallenges: challenges.map((c) => ({
      id: c.id,
      cycle: c.cycle,
      challengerName: nameById.get(c.challengerGangId) ?? "—",
      challengedName: c.challengedGangId
        ? (nameById.get(c.challengedGangId) ?? null)
        : null,
      sympathiserName: c.sympathiserId
        ? (sympNameById.get(c.sympathiserId) ?? null)
        : null,
      scenario: c.scenario,
      outcome: c.outcome,
      resolved: c.resolved,
    })),
    source: "db",
  };
}

function getSeedView(): PublicView {
  const nameById = new Map(GANGS.map((g) => [g.id, g.name]));

  const gangRows: GangRankRow[] = GANGS.map((g) => ({
    id: g.id,
    name: g.name,
    house: g.house,
    ownerName: g.ownerName,
    rating: gangRating(g),
    wealth: gangWealth(g),
    sympathiserCount: SYMPATHISER_CONTROL[g.id]?.length ?? 0,
  }));

  const sympathisers: SympathiserView[] = SYMPATHISERS.map((s) => {
    const controllerGangId = controllerOf(s.id);
    return {
      id: s.id,
      name: s.name,
      controllerGangId,
      controllerName: controllerGangId
        ? (nameById.get(controllerGangId) ?? null)
        : null,
    };
  });

  return {
    campaign: CAMPAIGN,
    gangs: rankGangs(gangRows),
    sympathisers,
    recentChallenges: [],
    source: "seed",
  };
}
