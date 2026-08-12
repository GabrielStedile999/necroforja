/**
 * Public view repository. Reads from the database when DATABASE_URL is defined;
 * otherwise (or if tables do not yet exist) falls back to seed data.
 * This way the landing works with or without a connected database.
 */
import type { PublicView, GangRankRow, SympathiserView, Triumph } from "@/types";
import { SYMPATHISERS } from "@/lib/data/sympathisers";
import {
  CAMPAIGN,
  GANGS,
  SYMPATHISER_CONTROL,
  controllerOf,
} from "@/lib/data/campaign";
import { gangRating, gangWealth } from "@/lib/scoring";
import {
  buildRatingSeries,
  buildTimeline,
  type RatingSeries,
  type Timeline,
} from "@/lib/campaign-history";

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
    getLatestCampaign,
    getAllGangs,
    getSympathiserControlMap,
    getSympathiserControllerMap,
    listSympathisers,
    listChallenges,
    listTriumphs,
  } = await import("@/lib/db/queries");

  // Prefer an active campaign; fall back to the most recent finished one
  const campaignRow = (await getActiveCampaign()) ?? (await getLatestCampaign());
  if (!campaignRow) return getSeedView();

  const gangs = await getAllGangs();
  const controlMap = await getSympathiserControlMap();
  const controllerMap = await getSympathiserControllerMap();
  const enabledSymps = await listSympathisers(true); // enabled only
  const challenges = await listChallenges(campaignRow.id, 8);
  const triumphRows = await listTriumphs(campaignRow.id);

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

  const triumphs: Triumph[] = triumphRows.map((t) => ({
    id: t.id,
    gangId: t.gangId,
    gangName: t.gangId ? (nameById.get(t.gangId) ?? null) : null,
    title: t.title,
    awardedAt: t.awardedAt.toISOString(),
  }));

  return {
    campaign: {
      id: campaignRow.id,
      name: campaignRow.name,
      phase: campaignRow.phase,
      currentCycle: campaignRow.currentCycle,
      totalCycles: campaignRow.totalCycles,
      startDate: campaignRow.startDate ?? "",
      endDate: campaignRow.endDate ?? "",
      status: campaignRow.status,
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
    triumphs,
    source: "db",
  };
}

/* ------------------ Gang history & timeline (issue #70) ------------------ */

export type HistoryView = { series: RatingSeries[]; timeline: Timeline };

const EMPTY_HISTORY: HistoryView = {
  series: [],
  timeline: { cycles: [], triumphs: [] },
};

/**
 * Rating-evolution series + cycle-by-cycle timeline for the public
 * dashboard (issue #70). Same DB-or-fallback contract as getPublicView:
 * without a database (or before the migration runs) it degrades to an
 * empty view and the dashboard simply omits the sections.
 */
export async function getHistoryView(): Promise<HistoryView> {
  if (!process.env.DATABASE_URL) return EMPTY_HISTORY;
  try {
    const {
      getActiveCampaign,
      getLatestCampaign,
      listGangsBasic,
      listGangSnapshots,
      listResolvedChallenges,
      listTimelineBattleEvents,
      listTriumphs,
    } = await import("@/lib/db/queries");

    const campaign = (await getActiveCampaign()) ?? (await getLatestCampaign());
    if (!campaign) return EMPTY_HISTORY;

    const [gangs, snapshots, challenges, events, triumphRows] =
      await Promise.all([
        listGangsBasic(campaign.id),
        listGangSnapshots(campaign.id),
        listResolvedChallenges(campaign.id),
        listTimelineBattleEvents(campaign.id),
        listTriumphs(campaign.id),
      ]);

    const nameById = new Map(gangs.map((g) => [g.id, g.name]));
    const sympNameById = new Map(SYMPATHISERS.map((s) => [s.id, s.name]));

    // Inactive gangs leave the public ranking — and the chart, for the same
    // reason; their snapshots stay in the table for when they return.
    const series = buildRatingSeries(
      snapshots
        .filter((s) => s.gang.isActive)
        .map((s) => ({
          gangId: s.gangId,
          gangName: s.gang.name,
          cycle: s.cycle,
          rating: s.rating,
        })),
    );

    const timeline = buildTimeline(
      challenges.map((c) => ({
        id: c.id,
        cycle: c.cycle,
        challengerName: nameById.get(c.challengerGangId) ?? "—",
        challengedName: c.challengedGangId
          ? (nameById.get(c.challengedGangId) ?? null)
          : null,
        sympathiserName: c.sympathiserId
          ? (sympNameById.get(c.sympathiserId) ?? null)
          : null,
        outcome: c.outcome,
        playedAt: c.playedAt,
      })),
      events.map((e) => ({
        id: e.id,
        kind: e.kind as "fighter_dead" | "fighter_captured",
        cycle: e.cycle,
        gangName: nameById.get(e.gangId) ?? "—",
        fighterName: e.fighterName,
        createdAt: e.createdAt,
      })),
      triumphRows.map((t) => ({
        id: t.id,
        title: t.title,
        gangName: t.gangId ? (nameById.get(t.gangId) ?? null) : null,
        awardedAt: t.awardedAt,
      })),
    );

    return { series, timeline };
  } catch {
    // tables not yet migrated / database unavailable → graceful omission
    return EMPTY_HISTORY;
  }
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
    triumphs: [],
    source: "seed",
  };
}
