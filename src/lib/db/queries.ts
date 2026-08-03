/**
 * Read layer (Drizzle). Maps database rows to the domain types
 * used by lib/scoring.ts. All functions run server-side only.
 */
import { eq, and, or, ilike, asc, desc, lt, sql, isNull, type SQL } from "drizzle-orm";
import { db, schema, type DbOrTx } from "./index";
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

function findGangWithRelations(where: SQL | undefined, dbc: DbOrTx = db) {
  return dbc.query.gangs.findFirst({
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
    avatarPath: f.avatarPath ?? null,
    // null preserved: "never set" renders as an empty field (issue #63)
    profile: {
      m: f.m, ws: f.ws, bs: f.bs, s: f.s,
      t: f.t, w: f.w, i: f.i, a: f.a,
      ld: f.ld, cl: f.cl, wil: f.wil, int: f.int,
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

export async function getGangById(
  gangId: string,
  dbc: DbOrTx = db,
): Promise<Gang | null> {
  const row = await findGangWithRelations(eq(schema.gangs.id, gangId), dbc);
  return row ? toDomainGang(row) : null;
}

/**
 * Number of weapons currently equipped on a fighter (issue #63 follow-up —
 * enforces the three-weapon cap of "Equipping a Fighter", Core Rulebook
 * 2023, p.83).
 */
export async function countFighterWeapons(
  fighterId: string,
  dbc: DbOrTx = db,
): Promise<number> {
  const rows = await dbc.query.fighterEquipment.findMany({
    where: eq(schema.fighterEquipment.fighterId, fighterId),
    with: { equipment: { columns: { category: true } } },
  });
  return rows.filter((r) => r.equipment?.category === "weapon").length;
}

/* -------------------- Equipment catalogue (issue #67) -------------------- */

/** Full official catalogue, disabled items included (/admin/catalog). */
export async function listCatalogItems() {
  return db.query.equipmentCatalog.findMany({
    orderBy: [
      asc(schema.equipmentCatalog.category),
      asc(schema.equipmentCatalog.name),
    ],
  });
}

/** Enabled catalogue items only — feeds the equipment pick lists. */
export async function listEnabledCatalogItems() {
  return db.query.equipmentCatalog.findMany({
    where: eq(schema.equipmentCatalog.enabled, true),
    orderBy: [
      asc(schema.equipmentCatalog.category),
      asc(schema.equipmentCatalog.name),
    ],
  });
}

/**
 * One catalogue row — the server-authoritative source of name/category/cost
 * when a player acquires gear "from catalogue" (snapshot on write).
 */
export async function getCatalogItemById(catalogId: string, dbc: DbOrTx = db) {
  const row = await dbc.query.equipmentCatalog.findFirst({
    where: eq(schema.equipmentCatalog.id, catalogId),
  });
  return row ?? null;
}

/**
 * Keyword glossary (issue #67 follow-up) — rewritten rule summaries stored
 * only in the private database (IP strategy, see schema.ts keywordRules).
 */
export async function listKeywordRules() {
  return db.query.keywordRules.findMany({
    orderBy: [asc(schema.keywordRules.keyword)],
  });
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

/** Gangs without an owner (issue #64) — shown in the admin dashboard. */
export async function listUnassignedGangs() {
  return db.query.gangs.findMany({
    where: isNull(schema.gangs.ownerUserId),
    columns: { id: true, name: true, house: true, reputation: true },
  });
}

/** All campaign gangs already mapped to domain types (public ranking). */
export async function getAllGangs(): Promise<Gang[]> {
  const rows = await db.query.gangs.findMany({
    // inactive gangs sit out of the campaign (issue #66 follow-up)
    where: eq(schema.gangs.isActive, true),
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
    where: and(
      eq(schema.gangs.campaignId, ownGang.campaignId),
      eq(schema.gangs.isActive, true),
    ),
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

/**
 * Public, lightweight gang list for the Gangs page (issue #8):
 * name + house + cached rating/reputation, best rating first.
 */
export async function listGangsPublic() {
  return db.query.gangs.findMany({
    columns: {
      id: true,
      name: true,
      house: true,
      ratingCached: true,
      reputation: true,
    },
    orderBy: [desc(schema.gangs.ratingCached)],
  });
}

/**
 * Jogadores ativos da campanha (issue #18) — carrossel da landing.
 * Critério de "ativo": gangue registrada na campanha cujo dono é um
 * `app_user` com role `player` e `is_active = true`. Retorna só o que a
 * seção pública precisa (nome do jogador, gangue e casa).
 */
export async function listActivePlayersPublic() {
  const rows = await db.query.gangs.findMany({
    columns: { id: true, name: true, house: true },
    with: {
      owner: {
        columns: { displayName: true, isActive: true, role: true },
      },
    },
    orderBy: [desc(schema.gangs.ratingCached)],
  });
  return rows
    .filter((g) => g.owner?.isActive && g.owner.role === "player")
    .map((g) => ({
      id: g.id,
      playerName: g.owner!.displayName,
      gangName: g.name,
      house: g.house,
    }));
}

/* ------------------------- Campaign journal (issue #5) ------------------ */

/** Published posts, newest first (public /reports listing). */
export async function listPublishedPosts(limit = 50) {
  return db.query.posts.findMany({
    where: eq(schema.posts.published, true),
    orderBy: [desc(schema.posts.publishedAt), desc(schema.posts.createdAt)],
    limit,
  });
}

/** A single published post by slug (public /reports/[slug]). */
export async function getPublishedPostBySlug(slug: string) {
  return db.query.posts.findFirst({
    where: and(eq(schema.posts.slug, slug), eq(schema.posts.published, true)),
  });
}

/** All posts (drafts included) for the admin panel, newest first. */
export async function listPostsAdmin() {
  return db.query.posts.findMany({
    orderBy: [desc(schema.posts.createdAt)],
  });
}

/** A post by id (admin edit form). */
export async function getPostById(postId: string) {
  return db.query.posts.findFirst({
    where: eq(schema.posts.id, postId),
  });
}

/** Gangs (id + name) for admin selects. */
export async function listGangsBasic(campaignId: string) {
  const rows = await db.query.gangs.findMany({
    where: eq(schema.gangs.campaignId, campaignId),
    columns: { id: true, name: true, ratingCached: true, isActive: true },
    with: { owner: { columns: { displayName: true, isActive: true } } },
  });
  return rows.map((g) => ({
    id: g.id,
    name: g.name,
    ratingCached: g.ratingCached,
    isActive: g.isActive,
    ownerName: g.owner?.displayName ?? null,
    ownerActive: g.owner?.isActive ?? false,
  }));
}

/* ------------------------- Gallery (issues #6/#24) ------------------------- */

/** Published gallery images for the public /gallery page, newest first. */
export async function listPublishedGalleryImages(limit = 200) {
  return db.query.galleryImages.findMany({
    where: eq(schema.galleryImages.published, true),
    orderBy: [desc(schema.galleryImages.createdAt)],
    limit,
  });
}

/** Every gallery image (drafts included) for the admin panel. */
export async function listGalleryImagesAdmin() {
  return db.query.galleryImages.findMany({
    orderBy: [desc(schema.galleryImages.createdAt)],
  });
}

/* ------------- Gallery ratings & comments (issue #52) ------------- */

/** A published image (id only) — guards the public interaction endpoints. */
export async function getPublishedGalleryImageById(imageId: string) {
  return db.query.galleryImages.findFirst({
    where: and(
      eq(schema.galleryImages.id, imageId),
      eq(schema.galleryImages.published, true),
    ),
    columns: { id: true },
  });
}

/**
 * Rating aggregates for every image, keyed by image id. Feeds the public
 * /gallery page through ISR — a 5-minute lag on averages is acceptable;
 * the voter sees their own action optimistically on the client.
 */
export async function getGalleryRatingSummaries(): Promise<
  Map<string, { avg: number; count: number }>
> {
  const rows = await db
    .select({
      imageId: schema.galleryRatings.imageId,
      avg: sql<number>`avg(${schema.galleryRatings.rating})::float`,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.galleryRatings)
    .groupBy(schema.galleryRatings.imageId);
  return new Map(rows.map((r) => [r.imageId, { avg: r.avg, count: r.count }]));
}

/** Fresh aggregate for one image (returned right after a vote). */
export async function getGalleryRatingSummary(
  imageId: string,
): Promise<{ avg: number | null; count: number }> {
  const rows = await db
    .select({
      avg: sql<number | null>`avg(${schema.galleryRatings.rating})::float`,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.galleryRatings)
    .where(eq(schema.galleryRatings.imageId, imageId));
  const row = rows[0];
  return { avg: row?.avg ?? null, count: row?.count ?? 0 };
}

/** The current visitor's vote on an image, if any ("my rating"). */
export async function getGalleryRatingByVoter(
  imageId: string,
  voterHash: string,
): Promise<number | null> {
  const row = await db.query.galleryRatings.findFirst({
    where: and(
      eq(schema.galleryRatings.imageId, imageId),
      eq(schema.galleryRatings.voterHash, voterHash),
    ),
    columns: { rating: true },
  });
  return row?.rating ?? null;
}

/**
 * Approved comments for a photo, newest first (public lightbox section).
 * Simple keyset pagination on created_at (`before` = ISO date of the last
 * item the client already has).
 */
export async function listApprovedGalleryComments(
  imageId: string,
  limit = 30,
  before?: Date,
) {
  return db.query.galleryComments.findMany({
    where: and(
      eq(schema.galleryComments.imageId, imageId),
      eq(schema.galleryComments.status, "approved"),
      before ? lt(schema.galleryComments.createdAt, before) : undefined,
    ),
    columns: { id: true, authorName: true, body: true, createdAt: true },
    orderBy: [desc(schema.galleryComments.createdAt)],
    limit,
  });
}

/** Pending comments (oldest first) with their photo, for the admin queue. */
export async function listPendingGalleryComments() {
  return db.query.galleryComments.findMany({
    where: eq(schema.galleryComments.status, "pending"),
    with: {
      image: { columns: { id: true, path: true, altEn: true } },
    },
    orderBy: [schema.galleryComments.createdAt],
  });
}

/* ------------------------- Site search (issue #15) ----------------------- */

/** Escapes ILIKE wildcards so a user-typed `%`/`_` is matched literally. */
function toIlikePattern(term: string): string {
  return `%${term.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
}

/**
 * Published posts whose bilingual title/excerpt/slug loosely match `term`
 * (plain `ILIKE`, not the vector search used by the rules assistant — a
 * live-as-you-type search box can't afford an embedding call per keystroke).
 */
export async function searchPublishedPosts(term: string, limit = 5) {
  const pattern = toIlikePattern(term);
  return db.query.posts.findMany({
    where: and(
      eq(schema.posts.published, true),
      or(
        ilike(schema.posts.titleEn, pattern),
        ilike(schema.posts.titlePt, pattern),
        ilike(schema.posts.excerptEn, pattern),
        ilike(schema.posts.excerptPt, pattern),
        ilike(schema.posts.slug, pattern),
      ),
    ),
    orderBy: [desc(schema.posts.publishedAt), desc(schema.posts.createdAt)],
    limit,
  });
}

/**
 * Rule chunks whose heading/content loosely match `term` — reuses the
 * `rule_chunk` table populated for the RAG assistant (issue #13), but as a
 * plain keyword search rather than the semantic/embedding search in
 * `lib/ai/retrieval.ts`, which is too slow/costly to run on every keystroke.
 */
export async function searchRuleChunksByText(term: string, limit = 5) {
  const pattern = toIlikePattern(term);
  return db.query.ruleChunks.findMany({
    where: or(
      ilike(schema.ruleChunks.heading, pattern),
      ilike(schema.ruleChunks.content, pattern),
    ),
    limit,
  });
}
