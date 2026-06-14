/**
 * Read layer (Drizzle). Maps database rows to the domain types
 * used by lib/scoring.ts. All functions run server-side only.
 */
import { eq, and, desc, type SQL } from "drizzle-orm";
import { db, schema } from "./index";
import type {
  Fighter,
  FighterCategory,
  FighterStatus,
  Gang,
} from "@/types";

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });
}

export async function getActiveCampaign() {
  return db.query.campaigns.findFirst({
    where: eq(schema.campaigns.status, "active"),
  });
}

/**
 * Returns the most recent campaign regardless of status (active or finished).
 * Used in the admin panel and public repo to handle post-closure state.
 */
export async function getLatestCampaign() {
  return db.query.campaigns.findFirst({
    orderBy: [desc(schema.campaigns.createdAt)],
  });
}

/** Triumphs for a campaign, most recently awarded first. */
export async function listTriumphs(campaignId: string) {
  return db.query.triumphs.findMany({
    where: eq(schema.triumphs.campaignId, campaignId),
    orderBy: [desc(schema.triumphs.awardedAt)],
  });
}

function findGangWithRelations(where: SQL | undefined) {
  return db.query.gangs.findFirst({
    where,
    with: {
      owner: true,
      fighters: { with: { equipment: { with: { equipment: true } } } },
      stash: { with: { equipment: true } },
    },
  });
}

type GangWithRelations = NonNullable<
  Awaited<ReturnType<typeof findGangWithRelations>>
>;

/** Converts a database row (with relations) to the Gang domain type. */
export function toDomainGang(g: GangWithRelations): Gang {
  const fighters: Fighter[] = g.fighters.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    category: f.category as FighterCategory,
    baseCost: f.baseCost,
    status: f.status as FighterStatus,
    xp: f.xp,
    profile: {
      m: f.m ?? 0, ws: f.ws ?? 0, bs: f.bs ?? 0, s: f.s ?? 0,
      t: f.t ?? 0, w: f.w ?? 0, i: f.i ?? 0, a: f.a ?? 0,
      ld: f.ld ?? 0, cl: f.cl ?? 0, wil: f.wil ?? 0, int: f.int ?? 0,
    },
    equipment: f.equipment.map((fe) => ({
      id: fe.equipment.id,
      name: fe.equipment.name,
      category: fe.equipment.category,
      cost: fe.equipment.cost,
    })),
  }));

  return {
    id: g.id,
    name: g.name,
    house: g.house,
    ownerName: g.owner?.displayName ?? "—",
    reputation: g.reputation,
    stashCredits: g.stashCredits,
    stash: g.stash.map((s) => ({
      id: s.id,
      qty: s.qty,
      equipment: {
        id: s.equipment.id,
        name: s.equipment.name,
        category: s.equipment.category,
        cost: s.equipment.cost,
      },
    })),
    fighters,
  };
}

export async function getGangByOwnerId(userId: string): Promise<Gang | null> {
  const row = await findGangWithRelations(
    eq(schema.gangs.ownerUserId, userId),
  );
  return row ? toDomainGang(row) : null;
}

export async function getGangById(gangId: string): Promise<Gang | null> {
  const row = await findGangWithRelations(eq(schema.gangs.id, gangId));
  return row ? toDomainGang(row) : null;
}

/** Checks whether a fighter belongs to a gang (authorisation in mutations). */
export async function fighterBelongsToGang(
  fighterId: string,
  gangId: string,
): Promise<boolean> {
  const row = await db.query.fighters.findFirst({
    where: and(
      eq(schema.fighters.id, fighterId),
      eq(schema.fighters.gangId, gangId),
    ),
    columns: { id: true },
  });
  return !!row;
}

/** Lists players (role player) with their respective gang, for the admin. */
export async function listPlayers() {
  const users = await db.query.users.findMany({
    where: eq(schema.users.role, "player"),
    with: { gangs: true },
  });
  return users;
}

/** All campaign gangs already mapped to domain types (public ranking). */
export async function getAllGangs(): Promise<Gang[]> {
  const rows = await db.query.gangs.findMany({
    with: {
      owner: true,
      fighters: { with: { equipment: { with: { equipment: true } } } },
      stash: { with: { equipment: true } },
    },
  });
  return rows.map(toDomainGang);
}

export async function getSympathiserControlMap(): Promise<
  Record<string, string[]>
> {
  const rows = await db.query.sympathiserControl.findMany({
    where: eq(schema.sympathiserControl.isCurrent, true),
  });
  const map: Record<string, string[]> = {};
  for (const r of rows) {
    if (!r.gangId) continue;
    (map[r.gangId] ??= []).push(r.sympathiserId);
  }
  return map;
}

/** Inverse map: sympathiserId -> gangId that currently controls it. */
export async function getSympathiserControllerMap(): Promise<
  Record<string, string>
> {
  const rows = await db.query.sympathiserControl.findMany({
    where: eq(schema.sympathiserControl.isCurrent, true),
  });
  const map: Record<string, string> = {};
  for (const r of rows) {
    if (r.gangId) map[r.sympathiserId] = r.gangId;
  }
  return map;
}

/** Lists Sympathisers from the catalogue (optionally only the enabled ones). */
export async function listSympathisers(onlyEnabled = false) {
  return db.query.sympathisers.findMany(
    onlyEnabled ? { where: eq(schema.sympathisers.enabled, true) } : undefined,
  );
}

/** Campaign challenges (most recent first). */
export async function listChallenges(campaignId: string, limit = 20) {
  return db.query.challenges.findMany({
    where: eq(schema.challenges.campaignId, campaignId),
    orderBy: [desc(schema.challenges.cycle), desc(schema.challenges.id)],
    limit,
  });
}

/**
 * Returns the other gangs in the same campaign (excluding the player's own).
 * Used in the capturing gang selector when marking a fighter as "captured".
 */
export async function getOtherGangsInCampaign(
  gangId: string,
): Promise<{ id: string; name: string }[]> {
  const ownGang = await db.query.gangs.findFirst({
    where: eq(schema.gangs.id, gangId),
    columns: { campaignId: true },
  });
  if (!ownGang) return [];

  const all = await db.query.gangs.findMany({
    where: eq(schema.gangs.campaignId, ownGang.campaignId),
    columns: { id: true, name: true },
  });
  return all.filter((g) => g.id !== gangId);
}

/** Checks whether a stash_item belongs to a gang (authorisation in mutations). */
export async function stashItemBelongsToGang(
  stashItemId: string,
  gangId: string,
): Promise<boolean> {
  const row = await db.query.stashItems.findFirst({
    where: and(
      eq(schema.stashItems.id, stashItemId),
      eq(schema.stashItems.gangId, gangId),
    ),
    columns: { id: true },
  });
  return !!row;
}

/** Gangs (id + name) for admin selects. */
export async function listGangsBasic(campaignId: string) {
  return db.query.gangs.findMany({
    where: eq(schema.gangs.campaignId, campaignId),
    columns: { id: true, name: true, ratingCached: true },
  });
}
