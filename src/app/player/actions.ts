"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import {
  resolveGangForWrite,
  gangIdFromForm,
} from "@/lib/auth/gang-access";
import {
  fighterBelongsToGang,
  stashItemBelongsToGang,
  countFighterWeapons,
  getCatalogItemById,
} from "@/lib/db/queries";
import { MAX_WEAPONS_PER_FIGHTER } from "@/lib/campaign-rules";
import {
  fighterSchema,
  updateFighterSchema,
  addEquipmentSchema,
  removeEquipmentSchema,
  setStashCreditsSchema,
  addStashItemSchema,
  removeStashItemSchema,
  equipFromStashSchema,
  updateFighterStatusSchema,
  addFighterXpSchema,
  fighterAvatarRequestSchema,
  fighterAvatarConfirmSchema,
  FIGHTER_AVATAR_MAX_BYTES,
} from "@/lib/validation";
import { recalcGangScores } from "@/lib/db/mutations";
import {
  GALLERY_BUCKET,
  createSignedUploadUrl,
  statPublicObject,
  deleteFromBucket,
} from "@/lib/storage";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/ai/rate-limit";
import { randomUUID } from "node:crypto";

export type PlayerState = { error?: string; success?: string };

/** Adds a fighter to the authenticated player's gang. */
export async function addFighter(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = fighterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const d = parsed.data;

  // Atomic (issue #62): insert + score recalc commit together.
  await db.transaction(async (tx) => {
    await tx.insert(schema.fighters).values({
      gangId: gang.id,
      name: d.name,
      type: d.type,
      category: d.category,
      baseCost: d.baseCost,
      m: d.m, ws: d.ws, bs: d.bs, s: d.s, t: d.t, w: d.w,
      i: d.i, a: d.a, ld: d.ld, cl: d.cl, wil: d.wil, int: d.int,
    });

    await recalcGangScores(gang.id, tx);
  });

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return { success: `${d.name} recruited.` };
}

/**
 * Full edit of an existing fighter in the player's own gang (issue #63).
 * XP, status and equipment are managed by their dedicated actions and are
 * not touched here. Characteristic fields left empty on the form arrive as
 * `undefined` and keep their stored value (drizzle skips undefined columns).
 */
export async function updateFighter(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = updateFighterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { fighterId, ...d } = parsed.data;

  if (!(await fighterBelongsToGang(fighterId, gang.id))) {
    return { error: "Invalid fighter." };
  }

  // Atomic (issue #62 pattern): update + score recalc commit together
  // (baseCost changes Rating/Wealth).
  await db.transaction(async (tx) => {
    await tx
      .update(schema.fighters)
      .set({
        name: d.name,
        type: d.type,
        category: d.category,
        baseCost: d.baseCost,
        m: d.m, ws: d.ws, bs: d.bs, s: d.s, t: d.t, w: d.w,
        i: d.i, a: d.a, ld: d.ld, cl: d.cl, wil: d.wil, int: d.int,
      })
      .where(eq(schema.fighters.id, fighterId));

    await recalcGangScores(gang.id, tx);
  });

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return { success: `${d.name} updated.` };
}

/** Removes a fighter (from the player's own gang only). */
export async function removeFighter(formData: FormData) {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return;
  const gang = resolved.gang;

  const fighterId = String(formData.get("fighterId"));
  if (!(await fighterBelongsToGang(fighterId, gang.id))) return;

  // Atomic (issue #62): delete + score recalc commit together.
  await db.transaction(async (tx) => {
    await tx.delete(schema.fighters).where(eq(schema.fighters.id, fighterId));
    await recalcGangScores(gang.id, tx);
  });
  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
}

/** Equips an item on a fighter belonging to the player's own gang. */
/**
 * Resolves what an acquisition writes to the `equipment` table (issue #67).
 * A catalogue pick is SERVER-AUTHORITATIVE: name/category/cost come from the
 * catalogue row (never from the client), and the owned item keeps a link to
 * it (`catalogId`). The values are copied — a snapshot — so later catalogue
 * rebalancing never rewrites gear already acquired. Free-text entries
 * (custom gear) pass through unchanged with no link.
 */
async function resolveEquipmentValues(d: {
  catalogId?: string;
  name: string;
  category: "weapon" | "wargear" | "skill" | "armour" | "upgrade";
  cost: number;
}): Promise<
  | { error: string }
  | {
      name: string;
      category: "weapon" | "wargear" | "skill" | "armour" | "upgrade";
      cost: number;
      catalogId: string | null;
    }
> {
  if (!d.catalogId) {
    return { name: d.name, category: d.category, cost: d.cost, catalogId: null };
  }
  const item = await getCatalogItemById(d.catalogId);
  if (!item || !item.enabled) {
    return { error: "Catalogue item not found (or disabled)." };
  }
  return {
    name: item.name,
    category: item.category,
    cost: item.cost,
    catalogId: item.id,
  };
}

export async function addEquipment(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = addEquipmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const d = parsed.data;

  if (!(await fighterBelongsToGang(d.fighterId, gang.id))) {
    return { error: "Invalid fighter." };
  }

  // Catalogue pick → server-authoritative snapshot (issue #67).
  const values = await resolveEquipmentValues(d);
  if ("error" in values) return { error: values.error };

  // Weapon cap — "Equipping a Fighter", Core Rulebook 2023, p.83.
  if (
    values.category === "weapon" &&
    (await countFighterWeapons(d.fighterId)) >= MAX_WEAPONS_PER_FIGHTER
  ) {
    return {
      error: `A fighter can carry a maximum of ${MAX_WEAPONS_PER_FIGHTER} weapons (Core Rulebook, p.83).`,
    };
  }

  // Atomic (issue #62): a failure after the equipment insert can no longer
  // leave an orphan row without its fighter link (or stale cached scores).
  await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(schema.equipment)
      .values(values)
      .returning();
    if (created) {
      await tx.insert(schema.fighterEquipment).values({
        fighterId: d.fighterId,
        equipmentId: created.id,
        qty: 1,
      });
    }

    await recalcGangScores(gang.id, tx);
  });

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return { success: `${values.name} added.` };
}

/** Removes an equipped item from a fighter in the player's own gang. */
export async function removeEquipment(formData: FormData) {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return;
  const gang = resolved.gang;

  const parsed = removeEquipmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { fighterId, equipmentId } = parsed.data;

  // Authorisation: the fighter must belong to the user's gang
  if (!(await fighterBelongsToGang(fighterId, gang.id))) return;

  // Atomic (issue #62): unlink + delete + recalc commit together — a failure
  // in between can no longer leave an unlinked equipment row behind.
  await db.transaction(async (tx) => {
    // Remove the fighter ↔ equipment link
    await tx
      .delete(schema.fighterEquipment)
      .where(
        and(
          eq(schema.fighterEquipment.fighterId, fighterId),
          eq(schema.fighterEquipment.equipmentId, equipmentId),
        ),
      );

    // Remove the item itself (each row is exclusive to one fighter in the current model)
    await tx
      .delete(schema.equipment)
      .where(eq(schema.equipment.id, equipmentId));

    await recalcGangScores(gang.id, tx);
  });
  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
}

/* ------------------------------------------------------------------ */
/*  Stash                                                               */
/* ------------------------------------------------------------------ */

/** Adjusts the gang's Stash credits (post-battle rewards, etc.). */
export async function setStashCredits(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = setStashCreditsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  // Atomic (issue #62): credits update + Wealth recalc commit together.
  await db.transaction(async (tx) => {
    await tx
      .update(schema.gangs)
      .set({ stashCredits: parsed.data.credits })
      .where(eq(schema.gangs.id, gang.id));

    await recalcGangScores(gang.id, tx);
  });
  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return { success: "Stash credits updated." };
}

/** Adds an item to the Stash (creates a new equipment row + stash_item). */
export async function addStashItem(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = addStashItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const d = parsed.data;

  // Catalogue pick → server-authoritative snapshot (issue #67).
  const values = await resolveEquipmentValues(d);
  if ("error" in values) return { error: values.error };

  // Atomic (issue #62): equipment + stash link + recalc commit together.
  await db.transaction(async (tx) => {
    const [equip] = await tx
      .insert(schema.equipment)
      .values(values)
      .returning();

    if (equip) {
      await tx.insert(schema.stashItems).values({
        gangId: gang.id,
        equipmentId: equip.id,
        qty: d.qty,
      });
    }

    await recalcGangScores(gang.id, tx);
  });

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return { success: `${values.name} added to Stash.` };
}

/** Removes an item from the Stash (and the associated equipment). */
export async function removeStashItem(formData: FormData) {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return;
  const gang = resolved.gang;

  const parsed = removeStashItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { stashItemId } = parsed.data;

  if (!(await stashItemBelongsToGang(stashItemId, gang.id))) return;

  const stashRow = await db.query.stashItems.findFirst({
    where: eq(schema.stashItems.id, stashItemId),
    columns: { equipmentId: true },
  });
  if (!stashRow) return;

  // Atomic (issue #62): both deletes + recalc commit together — no orphan
  // equipment row if the process dies between the two.
  await db.transaction(async (tx) => {
    await tx
      .delete(schema.stashItems)
      .where(eq(schema.stashItems.id, stashItemId));
    await tx
      .delete(schema.equipment)
      .where(eq(schema.equipment.id, stashRow.equipmentId));

    await recalcGangScores(gang.id, tx);
  });
  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
}

/**
 * Moves an item from the Stash to a fighter (atomic operation).
 *
 * - qty > 1: decrements qty in stash; creates new equipment + fighter_equipment.
 * - qty = 1: deletes stash_item; reuses the equipment row in fighter_equipment.
 *
 * In both cases Wealth remains constant (item leaves the Stash and enters the
 * Rating); only the composition changes.
 */
export async function equipFromStash(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = equipFromStashSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { stashItemId, fighterId } = parsed.data;

  if (!(await stashItemBelongsToGang(stashItemId, gang.id))) {
    return { error: "Invalid item." };
  }
  if (!(await fighterBelongsToGang(fighterId, gang.id))) {
    return { error: "Invalid fighter." };
  }

  const stashRow = await db.query.stashItems.findFirst({
    where: eq(schema.stashItems.id, stashItemId),
    with: { equipment: true },
  });
  if (!stashRow || !stashRow.equipment) {
    return { error: "Item not found." };
  }

  // Weapon cap also applies when equipping FROM the Stash (CRB 2023, p.83).
  if (
    stashRow.equipment.category === "weapon" &&
    (await countFighterWeapons(fighterId)) >= MAX_WEAPONS_PER_FIGHTER
  ) {
    return {
      error: `A fighter can carry a maximum of ${MAX_WEAPONS_PER_FIGHTER} weapons (Core Rulebook, p.83).`,
    };
  }

  const itemName = stashRow.equipment.name;

  await db.transaction(async (tx) => {
    if (stashRow.qty > 1) {
      // Decrement qty in stash; create a new equipment instance for the fighter
      await tx
        .update(schema.stashItems)
        .set({ qty: stashRow.qty - 1 })
        .where(eq(schema.stashItems.id, stashItemId));

      const [newEquip] = await tx
        .insert(schema.equipment)
        .values({
          name: stashRow.equipment.name,
          category: stashRow.equipment.category,
          cost: stashRow.equipment.cost,
        })
        .returning();

      if (newEquip) {
        await tx.insert(schema.fighterEquipment).values({
          fighterId,
          equipmentId: newEquip.id,
          qty: 1,
        });
      }
    } else {
      // qty === 1: delete stash_item, reuse the equipment row in the fighter
      await tx
        .delete(schema.stashItems)
        .where(eq(schema.stashItems.id, stashItemId));

      await tx.insert(schema.fighterEquipment).values({
        fighterId,
        equipmentId: stashRow.equipmentId,
        qty: 1,
      });
    }

    // Recalc joins the same transaction (issue #62) so cached scores can
    // never go stale between the move and the recalculation.
    await recalcGangScores(gang.id, tx);
  });

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return { success: `${itemName} equipped to fighter.` };
}

/* ------------------------------------------------------------------ */
/*  Fighter lifecycle                                                    */
/* ------------------------------------------------------------------ */

/**
 * Changes the status of a fighter in the player's own gang.
 * When marked as "dead", the fighter is removed from the Rating (recalcGangScores).
 * When marked as "captured", registers the capturing gang.
 */
export async function updateFighterStatus(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = updateFighterStatusSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { fighterId, status, capturedByGangId } = parsed.data;

  if (!(await fighterBelongsToGang(fighterId, gang.id))) {
    return { error: "Invalid fighter." };
  }

  // Atomic (issue #62): status change + Rating recalc commit together.
  await db.transaction(async (tx) => {
    await tx
      .update(schema.fighters)
      .set({
        status,
        // Clear the field if no longer "captured"
        capturedByGangId:
          status === "captured" ? (capturedByGangId ?? null) : null,
      })
      .where(eq(schema.fighters.id, fighterId));

    // Dead fighters leave the Rating — recalculate
    await recalcGangScores(gang.id, tx);
  });
  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return { success: "Status updated." };
}

/** Adds XP to a fighter (positive delta; XP is cumulative). */
export async function addFighterXp(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = addFighterXpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { fighterId, xpDelta } = parsed.data;

  if (!(await fighterBelongsToGang(fighterId, gang.id))) {
    return { error: "Invalid fighter." };
  }

  // Atomic increment (issue #62): the delta is applied in SQL, so two
  // concurrent submissions both land — no read-then-write race losing XP.
  await db
    .update(schema.fighters)
    .set({ xp: sql`${schema.fighters.xp} + ${xpDelta}` })
    .where(eq(schema.fighters.id, fighterId));

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return { success: `+${xpDelta} XP added.` };
}

/* ------------------------------------------------------------------ */
/*  Fighter portrait (issue #63)                                        */
/* ------------------------------------------------------------------ */

export type AvatarUploadResult =
  | { ok: true; path: string; signedUrl: string; token: string }
  | { ok: false; error: string };

/**
 * Step 1 of the portrait upload: authorises (owner or Arbitrator mode),
 * validates the file claim (JPEG/PNG/WebP, ≤2 MB) and returns a signed URL
 * so the browser PUTs the image straight to the public gallery bucket
 * under the `fighter/` prefix — the file never flows through the action.
 */
export async function requestFighterAvatarUpload(input: {
  gangId?: string;
  fighterId: string;
  mime: string;
  bytes: number;
}): Promise<AvatarUploadResult> {
  const resolved = await resolveGangForWrite(input.gangId || undefined);
  if ("error" in resolved) return { ok: false, error: resolved.error };
  const gang = resolved.gang;

  // 10 portraits/min per gang is generous for real table use.
  if (!(await rateLimit(`avatar:upload:${gang.id}`, 10, 60))) {
    return { ok: false, error: "Too many uploads — wait a minute and retry." };
  }

  const parsed = fighterAvatarRequestSchema.safeParse({
    fighterId: input.fighterId,
    mime: input.mime,
    bytes: input.bytes,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid file.",
    };
  }

  if (!(await fighterBelongsToGang(parsed.data.fighterId, gang.id))) {
    return { ok: false, error: "Invalid fighter." };
  }

  const ext = parsed.data.mime === "image/png"
    ? "png"
    : parsed.data.mime === "image/webp"
      ? "webp"
      : "jpg";
  // Unique per upload (signed URLs cannot upsert); the previous object is
  // deleted on confirm, so no orphan accumulates on replacement.
  const path = `fighter/${parsed.data.fighterId}-${randomUUID().slice(0, 8)}.${ext}`;

  try {
    const { signedUrl, token } = await createSignedUploadUrl(
      GALLERY_BUCKET,
      path,
    );
    return { ok: true, path, signedUrl, token };
  } catch (error) {
    logger.error("avatar: signed upload URL failed", { path, error });
    return {
      ok: false,
      error: "Could not start the upload. Check the Supabase env vars.",
    };
  }
}

/**
 * Step 2: confirms the object really exists with the promised size/type
 * (HEAD on the public URL — never trusts the client), stores the path on
 * the fighter row and removes the previous portrait object, if any.
 */
export async function confirmFighterAvatar(input: {
  gangId?: string;
  fighterId: string;
  path: string;
}): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(input.gangId || undefined);
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = fighterAvatarConfirmSchema.safeParse({
    fighterId: input.fighterId,
    path: input.path,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { fighterId, path } = parsed.data;

  if (!(await fighterBelongsToGang(fighterId, gang.id))) {
    return { error: "Invalid fighter." };
  }
  // The path must belong to THIS fighter (prefix carries the id).
  if (!path.startsWith(`fighter/${fighterId}-`)) {
    return { error: "Portrait path does not match the fighter." };
  }

  const stat = await statPublicObject(GALLERY_BUCKET, path);
  if (!stat) return { error: "Upload not found in storage." };
  if (stat.bytes > FIGHTER_AVATAR_MAX_BYTES) {
    await deleteFromBucket(GALLERY_BUCKET, path).catch(() => {});
    return { error: "File too large (max 2 MB)." };
  }

  const current = await db.query.fighters.findFirst({
    where: eq(schema.fighters.id, fighterId),
    columns: { avatarPath: true },
  });

  await db
    .update(schema.fighters)
    .set({ avatarPath: path })
    .where(eq(schema.fighters.id, fighterId));

  // Best-effort cleanup of the replaced object (DB row is the source of truth).
  if (current?.avatarPath && current.avatarPath !== path) {
    await deleteFromBucket(GALLERY_BUCKET, current.avatarPath).catch(() => {});
  }

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return { success: "Portrait updated." };
}

/** Removes a fighter's portrait (falls back to the site crest in the UI). */
export async function removeFighterAvatar(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const fighterId = String(formData.get("fighterId"));
  if (!(await fighterBelongsToGang(fighterId, gang.id))) {
    return { error: "Invalid fighter." };
  }

  const current = await db.query.fighters.findFirst({
    where: eq(schema.fighters.id, fighterId),
    columns: { avatarPath: true },
  });

  await db
    .update(schema.fighters)
    .set({ avatarPath: null })
    .where(eq(schema.fighters.id, fighterId));

  if (current?.avatarPath) {
    await deleteFromBucket(GALLERY_BUCKET, current.avatarPath).catch(() => {});
  }

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return { success: "Portrait removed." };
}
