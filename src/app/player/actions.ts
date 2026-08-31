"use server";

import { and, eq, gt, gte, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema, type DbOrTx } from "@/lib/db";
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
import {
  MAX_WEAPONS_PER_FIGHTER,
  captiveReturnPayment,
} from "@/lib/campaign-rules";
import { fighterTotalCost } from "@/lib/scoring";
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
  purchaseEquipmentSchema,
  buyAdvancementSchema,
  addInjurySchema,
  removeInjurySchema,
  setGangAllegianceSchema,
  medicalEscortSchema,
  clearRecoveryBoonSchema,
  homeSupportRecruitSchema,
  sellCaptiveSchema,
  ransomCaptiveSchema,
  releaseCaptiveSchema,
} from "@/lib/validation";
import {
  getSympathiser,
  getSympathiserBoons,
  HOME_SUPPORT_RECRUIT,
} from "@/lib/data/sympathisers";
import { ALLEGIANCE_LABEL } from "@/lib/data/allegiances";
import {
  STAT_ADVANCEMENTS,
  SKILL_ADVANCEMENTS,
  STAT_BOUNDS,
  STAT_LABEL,
  REPEAT_STAT_SURCHARGE,
  FAST_LEARNER_CATEGORIES,
  storageDelta,
  clampStat,
  getInjuryPreset,
  PROMOTIONS,
  type StatKey,
} from "@/lib/data/advancements";
import { recalcGangScores, debitStashCredits } from "@/lib/db/mutations";
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

/**
 * Trading Post purchase (issue #68): buying a catalogue item DEBITS the
 * gang's Stash credits in the same transaction that creates the item.
 * The debit is a conditional UPDATE (`stash_credits >= total`) — two
 * concurrent purchases can never overdraw; the loser fails cleanly with
 * the amounts. Values are the catalogue row's snapshot (issue #67), so
 * the price paid is always the official one, never the client's.
 *
 * Wealth stays constant on both paths (credits become an item of equal
 * value); Rating rises only when buying onto a fighter — recalc runs
 * in-transaction. The old zero-cost add remains as the Arbitrator's grant.
 */
export async function purchaseEquipment(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = purchaseEquipmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { catalogItemId, destination, qty } = parsed.data;
  const toStash = destination === "stash";

  const item = await getCatalogItemById(catalogItemId);
  if (!item || !item.enabled) {
    return { error: "Catalogue item not found (or disabled)." };
  }
  const total = item.cost * qty;

  if (!toStash) {
    if (!(await fighterBelongsToGang(destination, gang.id))) {
      return { error: "Invalid fighter." };
    }
    // Weapon cap — "Equipping a Fighter", Core Rulebook 2023, p.83.
    if (
      item.category === "weapon" &&
      (await countFighterWeapons(destination)) >= MAX_WEAPONS_PER_FIGHTER
    ) {
      return {
        error: `A fighter can carry a maximum of ${MAX_WEAPONS_PER_FIGHTER} weapons (Core Rulebook, p.83).`,
      };
    }
  }

  let result: PlayerState = { error: "Purchase failed." };
  await db.transaction(async (tx) => {
    // Conditional debit FIRST: 0 rows updated = insufficient credits, and
    // nothing else in this transaction has happened yet.
    const paid = await debitStashCredits(gang.id, total, tx);
    if (!paid) {
      const row = await tx.query.gangs.findFirst({
        where: eq(schema.gangs.id, gang.id),
        columns: { stashCredits: true },
      });
      result = {
        error: `Insufficient credits: you need ${total}c but the Stash has ${row?.stashCredits ?? 0}c.`,
      };
      return;
    }

    const [created] = await tx
      .insert(schema.equipment)
      .values({
        name: item.name,
        category: item.category,
        cost: item.cost,
        catalogId: item.id,
      })
      .returning();
    if (!created) throw new Error("Failed to create the purchased item.");

    if (toStash) {
      await tx.insert(schema.stashItems).values({
        gangId: gang.id,
        equipmentId: created.id,
        qty,
      });
    } else {
      await tx.insert(schema.fighterEquipment).values({
        fighterId: destination,
        equipmentId: created.id,
        qty: 1,
      });
    }

    await recalcGangScores(gang.id, tx);
    result = {
      success: `${item.name}${qty > 1 ? ` ×${qty}` : ""} purchased for ${total}c.`,
    };
  });

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return result;
}

/**
 * Recruits a fighter PAYING their base cost from the Stash (issue #68) —
 * same conditional debit as purchaseEquipment, in one transaction with the
 * fighter insert: a failure rolls back both. The free add (addFighter)
 * remains as the Arbitrator's grant.
 */
export async function recruitFighter(
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

  let result: PlayerState = { error: "Recruitment failed." };
  await db.transaction(async (tx) => {
    const paid = await debitStashCredits(gang.id, d.baseCost, tx);
    if (!paid) {
      const row = await tx.query.gangs.findFirst({
        where: eq(schema.gangs.id, gang.id),
        columns: { stashCredits: true },
      });
      result = {
        error: `Insufficient credits: recruiting ${d.name} costs ${d.baseCost}c but the Stash has ${row?.stashCredits ?? 0}c.`,
      };
      return;
    }

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
    result = { success: `${d.name} recruited for ${d.baseCost}c.` };
  });

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return result;
}

/**
 * Adds a fighter WITHOUT payment — the Arbitrator's grant (issue #68).
 * Players recruit through recruitFighter, which debits the Stash.
 */
export async function addFighter(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  if (!resolved.isAdmin) {
    return {
      error: "Free recruiting is Arbitrator-only — players recruit paying from the Stash.",
    };
  }
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
  // Zero-cost adds bypass the economy (issue #68) — Arbitrator grant only;
  // players buy through purchaseEquipment (atomic Stash debit).
  if (!resolved.isAdmin) {
    return { error: "Free adds are Arbitrator-only — use the purchase flow." };
  }
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
  // Hand-editing credits reopens the economy (issue #68) — Arbitrator only
  // (battle rewards will credit the Stash in issue #69).
  if (!resolved.isAdmin) {
    return { error: "Setting credits directly is Arbitrator-only." };
  }
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
  // Zero-cost adds bypass the economy (issue #68) — Arbitrator grant only.
  if (!resolved.isAdmin) {
    return { error: "Free adds are Arbitrator-only — use the purchase flow." };
  }
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

/* ------------------------ Allegiances (issue #82) ------------------------ */

/**
 * Declares or changes a gang's civil-war side (issue #82 — Cinderak
 * Burning p.61–63). Rules: a PLAYER declares once — Unaligned may pick a
 * side at any time ("Take a Side"), but switching sides afterwards is an
 * ARBITRATOR-only correction (history is war). Every change appends an
 * allegiance_change row with the current cycle, and the current state
 * lives on the gang row — same current-vs-trail split as battle_event.
 */
export async function setGangAllegiance(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const { gang, isAdmin } = resolved;

  const parsed = setGangAllegianceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const target = parsed.data.allegiance;
  const current = gang.allegiance ?? "unaligned";

  if (target === current) {
    return { error: `${gang.name} is already ${ALLEGIANCE_LABEL[current]}.` };
  }
  if (!isAdmin && current !== "unaligned") {
    return {
      error:
        "A declared side is final — ask the Arbitrator to correct an allegiance.",
    };
  }

  // The log row records the campaign cycle of the declaration.
  const gangRow = await db.query.gangs.findFirst({
    where: eq(schema.gangs.id, gang.id),
    columns: { campaignId: true },
  });
  if (!gangRow) return { error: "Gang not found." };
  const campaign = await db.query.campaigns.findFirst({
    where: eq(schema.campaigns.id, gangRow.campaignId),
    columns: { currentCycle: true },
  });

  // Atomic (issue #62 pattern): the state change and its history row
  // commit together.
  await db.transaction(async (tx) => {
    await tx
      .update(schema.gangs)
      .set({ allegiance: target })
      .where(eq(schema.gangs.id, gang.id));
    await tx.insert(schema.allegianceChanges).values({
      gangId: gang.id,
      allegiance: target,
      cycle: campaign?.currentCycle ?? 1,
    });
  });

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  revalidatePath("/admin/campaign");
  revalidatePath("/dashboard");
  return {
    success:
      target === "unaligned"
        ? `${gang.name} is now Unaligned.`
        : `${gang.name} now stands with the ${ALLEGIANCE_LABEL[target]}.`,
  };
}

/* -------------- Advancements & lasting injuries (issue #71) -------------- */

/** Control-flow error: the stat guard failed AFTER the XP debit — throwing
 *  rolls the whole transaction back (debit included). */
class AdvancementCapError extends Error {}

/** Control-flow error: the guarded category change of a promotion matched
 *  no row (concurrent promotion) — throwing rolls the XP debit back. */
class PromotionConflictError extends Error {}

/**
 * Buys ONE advancement with XP (issue #71): +1 to a characteristic
 * (respecting the p.73 bounds) or a recorded skill. Server-authoritative
 * costs from src/lib/data/advancements.ts, including the +2 XP repeat
 * surcharge per prior advancement of the SAME stat (Juves and Prospects
 * are exempt — p.149). One transaction:
 *   conditional XP debit (`xp >= cost` — concurrent buys can never
 *   double-spend, the Trading Post pattern) → guarded stat bump
 *   (bound-checked in the WHERE; failure throws to roll the debit back)
 *   → advancement row → recalcGangScores (cost joins the Rating).
 * Dead fighters cannot advance.
 */
export async function buyAdvancement(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = buyAdvancementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const d = parsed.data;

  let result: PlayerState = { error: "Advancement failed." };
  try {
    await db.transaction(async (tx) => {
      const fighter = await tx.query.fighters.findFirst({
        where: and(
          eq(schema.fighters.id, d.fighterId),
          eq(schema.fighters.gangId, gang.id),
        ),
      });
      if (!fighter) {
        result = { error: "Invalid fighter." };
        return;
      }
      if (fighter.status === "dead") {
        result = { error: "Dead fighters cannot advance." };
        return;
      }

      let xpCost: number;
      let creditIncrease: number;
      let statKey: StatKey | null = null;
      let skillName: string | null = null;
      let successLabel: string;

      if (d.kind === "stat_increase") {
        statKey = d.statKey;
        const cfg = STAT_ADVANCEMENTS[statKey];
        const label = STAT_LABEL[statKey];

        const current = fighter[statKey];
        if (current == null) {
          result = {
            error: `Set ${label} on the fighter card before advancing it.`,
          };
          return;
        }
        const delta = storageDelta(statKey, 1);
        const next = current + delta;
        const { min, max } = STAT_BOUNDS[statKey];
        if (next < min || next > max) {
          result = { error: `${label} is already at its maximum.` };
          return;
        }

        // Repeat surcharge: +2 XP per PRIOR advancement of the same stat
        // (p.149); Juves/Prospects always pay the base cost.
        const prior = await tx.query.fighterAdvancements.findMany({
          where: and(
            eq(schema.fighterAdvancements.fighterId, d.fighterId),
            eq(schema.fighterAdvancements.statKey, statKey),
          ),
          columns: { id: true },
        });
        const fastLearner = (
          FAST_LEARNER_CATEGORIES as readonly string[]
        ).includes(fighter.category);
        xpCost =
          cfg.xpCost + (fastLearner ? 0 : prior.length * REPEAT_STAT_SURCHARGE);
        creditIncrease = cfg.creditIncrease;
        successLabel = `${label} improved`;
      } else if (d.kind === "promotion") {
        // issue #84 — promotions ride the advancement machinery. The label
        // lands in skillName (display), the category change (when the
        // promotion has one) is guarded below.
        const cfg = PROMOTIONS[d.promotion];
        if (fighter.category !== cfg.fromCategory) {
          result = {
            error: `"${cfg.label}" applies to a ${cfg.fromCategory} — ${fighter.name} is a ${fighter.category}.`,
          };
          return;
        }
        if (d.promotion === "ganger_to_specialist") {
          // One-way: a Ganger with a promotion row is already a Specialist
          // (a specialist_to_champion row would have changed the category).
          const prior = await tx.query.fighterAdvancements.findFirst({
            where: and(
              eq(schema.fighterAdvancements.fighterId, d.fighterId),
              eq(schema.fighterAdvancements.kind, "promotion"),
            ),
            columns: { id: true },
          });
          if (prior) {
            result = { error: `${fighter.name} is already a Specialist.` };
            return;
          }
        }
        xpCost = cfg.xpCost;
        creditIncrease = cfg.creditIncrease;
        skillName = cfg.label;
        successLabel = `Promoted (${cfg.label})`;
      } else {
        const cfg = SKILL_ADVANCEMENTS[d.skillTier];
        xpCost = cfg.xpCost;
        creditIncrease = cfg.creditIncrease;
        skillName = d.skillName;
        successLabel = `Skill "${d.skillName}" recorded`;
      }

      // Conditional XP debit FIRST — nothing else has been written yet, so
      // an insufficient balance returns cleanly, no rollback needed.
      const paid = await tx
        .update(schema.fighters)
        .set({ xp: sql`${schema.fighters.xp} - ${xpCost}` })
        .where(
          and(
            eq(schema.fighters.id, d.fighterId),
            gte(schema.fighters.xp, xpCost),
          ),
        )
        .returning({ id: schema.fighters.id });
      if (paid.length === 0) {
        result = {
          error: `Insufficient XP: this advancement costs ${xpCost} XP but ${fighter.name} has ${fighter.xp}.`,
        };
        return;
      }

      if (statKey) {
        // Guarded bump: the bound lives in the WHERE, so two concurrent
        // buys cannot push a stat past its cap. Failure AFTER the debit
        // throws — the transaction rolls the XP back.
        const delta = storageDelta(statKey, 1);
        const col = schema.fighters[statKey];
        const { min, max } = STAT_BOUNDS[statKey];
        const rows = await tx
          .update(schema.fighters)
          .set({ [statKey]: sql`${col} + ${delta}` })
          .where(
            and(
              eq(schema.fighters.id, d.fighterId),
              delta > 0 ? lt(col, max) : gt(col, min),
            ),
          )
          .returning({ id: schema.fighters.id });
        if (rows.length === 0) throw new AdvancementCapError();
      }

      if (d.kind === "promotion") {
        const toCategory = PROMOTIONS[d.promotion].toCategory;
        if (toCategory) {
          // Guarded category change: the source category lives in the
          // WHERE, so two concurrent promotions cannot both land. Failure
          // AFTER the debit throws — the transaction rolls the XP back.
          const rows = await tx
            .update(schema.fighters)
            .set({ category: toCategory })
            .where(
              and(
                eq(schema.fighters.id, d.fighterId),
                eq(
                  schema.fighters.category,
                  PROMOTIONS[d.promotion].fromCategory,
                ),
              ),
            )
            .returning({ id: schema.fighters.id });
          if (rows.length === 0) throw new PromotionConflictError();
        }
      }

      await tx.insert(schema.fighterAdvancements).values({
        fighterId: d.fighterId,
        kind: d.kind,
        statKey,
        skillName,
        xpCost,
        creditIncrease,
      });

      await recalcGangScores(gang.id, tx);
      result = {
        success: `${successLabel} — ${xpCost} XP spent, cost +${creditIncrease}c.`,
      };
    });
  } catch (e) {
    if (e instanceof AdvancementCapError) {
      result = { error: "That characteristic is already at its maximum." };
    } else if (e instanceof PromotionConflictError) {
      result = {
        error: "The fighter's category changed meanwhile — reload and try again.",
      };
    } else {
      throw e;
    }
  }

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return result;
}

/**
 * Records a lasting injury (issue #71): a preset from the config (name +
 * numeric effects, server-authoritative) or a custom entry (optional
 * single-stat penalty of 1). The stat change is clamped to the p.73 bounds
 * and the row stores the delta ACTUALLY applied, so removing the injury
 * reverts exactly. Injuries never change the fighter's cost (p.126).
 * Dual-stat presets record one row per effect (same name).
 */
export async function addInjury(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = addInjurySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const d = parsed.data;

  const preset = d.preset ? getInjuryPreset(d.preset) : null;
  if (d.preset && !preset) return { error: "Unknown injury preset." };

  const name = preset ? preset.name : d.name!;
  const effects: { stat: StatKey; improvement: number }[] = preset
    ? preset.effects
    : d.statKey
      ? [{ stat: d.statKey, improvement: -1 }]
      : [];

  let result: PlayerState = { error: "Failed to record the injury." };
  await db.transaction(async (tx) => {
    const fighter = await tx.query.fighters.findFirst({
      where: and(
        eq(schema.fighters.id, d.fighterId),
        eq(schema.fighters.gangId, gang.id),
      ),
    });
    if (!fighter) {
      result = { error: "Invalid fighter." };
      return;
    }

    if (effects.length === 0) {
      await tx.insert(schema.fighterInjuries).values({
        fighterId: d.fighterId,
        name,
        statKey: null,
        statDelta: null,
        notes: d.notes,
      });
    } else {
      for (const effect of effects) {
        const current = fighter[effect.stat];
        let applied: number | null = null;
        if (current != null) {
          const target = clampStat(
            effect.stat,
            current + storageDelta(effect.stat, effect.improvement),
          );
          applied = target - current;
          if (applied !== 0) {
            await tx
              .update(schema.fighters)
              .set({ [effect.stat]: target })
              .where(eq(schema.fighters.id, d.fighterId));
            // keep the local copy coherent for a second effect on the
            // same stat within one preset
            fighter[effect.stat] = target;
          }
        }
        await tx.insert(schema.fighterInjuries).values({
          fighterId: d.fighterId,
          name,
          statKey: effect.stat,
          statDelta: applied,
          notes: d.notes,
        });
      }
    }

    await recalcGangScores(gang.id, tx);
    result = { success: `Lasting injury "${name}" recorded.` };
  });

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return result;
}

/**
 * Removes a lasting injury — an ARBITRATOR-ONLY correction (players record
 * injuries; taking one back rewrites history). Reverts exactly the stat
 * delta the row applied (clamped storage kept it truthful) and deletes the
 * row in the same transaction.
 */
export async function removeInjury(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  if (!resolved.isAdmin) {
    return { error: "Only the Arbitrator can remove a lasting injury." };
  }
  const gang = resolved.gang;

  const parsed = removeInjurySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { fighterId, injuryId } = parsed.data;

  let result: PlayerState = { error: "Failed to remove the injury." };
  await db.transaction(async (tx) => {
    const fighter = await tx.query.fighters.findFirst({
      where: and(
        eq(schema.fighters.id, fighterId),
        eq(schema.fighters.gangId, gang.id),
      ),
    });
    if (!fighter) {
      result = { error: "Invalid fighter." };
      return;
    }
    const injury = await tx.query.fighterInjuries.findFirst({
      where: and(
        eq(schema.fighterInjuries.id, injuryId),
        eq(schema.fighterInjuries.fighterId, fighterId),
      ),
    });
    if (!injury) {
      result = { error: "Injury not found." };
      return;
    }

    if (injury.statKey && injury.statDelta) {
      const stat = injury.statKey as StatKey;
      const current = fighter[stat];
      if (current != null) {
        await tx
          .update(schema.fighters)
          .set({ [stat]: clampStat(stat, current - injury.statDelta) })
          .where(eq(schema.fighters.id, fighterId));
      }
    }

    await tx
      .delete(schema.fighterInjuries)
      .where(eq(schema.fighterInjuries.id, injuryId));

    await recalcGangScores(gang.id, tx);
    result = { success: `Injury "${injury.name}" removed.` };
  });

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return result;
}

/* ---------------------- Medical Escort (issue #84) ---------------------- */

/**
 * Medical Escort — post-battle action (Core Rulebook 2023, p.145): pay the
 * 2D6x10 credits rolled at the table to send a badly injured fighter for
 * treatment, and record the D6 outcome (the app never rolls). One
 * transaction:
 *   conditional Stash debit (debitStashCredits — an insufficient Stash
 *   refuses cleanly; what happens to the unpaid fighter is the table's
 *   call, the app writes nothing) → outcome (died → dead; stabilised →
 *   in_recovery, with the rolled lasting injury recorded via the existing
 *   #71 injury flow; full recovery → in_recovery, no lasting injury)
 *   → recalcGangScores (credits move Wealth; a death moves the Rating).
 * Only a fighter currently injured / in recovery can be escorted — set the
 * status first if the card is stale.
 */
export async function medicalEscort(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = medicalEscortSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const d = parsed.data;

  let result: PlayerState = { error: "Medical Escort failed." };
  await db.transaction(async (tx) => {
    const fighter = await tx.query.fighters.findFirst({
      where: and(
        eq(schema.fighters.id, d.fighterId),
        eq(schema.fighters.gangId, gang.id),
      ),
      columns: { id: true, name: true, status: true },
    });
    if (!fighter) {
      result = { error: "Invalid fighter." };
      return;
    }
    if (fighter.status !== "injured" && fighter.status !== "in_recovery") {
      result = {
        error: `Medical Escort applies to an injured fighter — set ${fighter.name}'s status first.`,
      };
      return;
    }

    // Conditional debit FIRST (the Trading Post pattern): nothing has been
    // written yet, so an insufficient Stash returns cleanly.
    const paid = await debitStashCredits(gang.id, d.cost, tx);
    if (!paid) {
      result = {
        error: `Insufficient Stash credits: the escort costs ${d.cost}c.`,
      };
      return;
    }

    if (d.outcome === "died") {
      await tx
        .update(schema.fighters)
        .set({ status: "dead", capturedByGangId: null })
        .where(eq(schema.fighters.id, d.fighterId));
    } else {
      await tx
        .update(schema.fighters)
        .set({ status: "in_recovery" })
        .where(eq(schema.fighters.id, d.fighterId));
    }

    await recalcGangScores(gang.id, tx);
    result = {
      success:
        d.outcome === "died"
          ? `${fighter.name} did not survive the treatment — ${d.cost}c spent.`
          : d.outcome === "stabilised"
            ? `${fighter.name} stabilised (in recovery) — ${d.cost}c spent. Record the lasting injury rolled at the table.`
            : `${fighter.name} will make a full recovery — ${d.cost}c spent, no lasting injury.`,
    };
  });

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return result;
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

/* ---------------------- Sympathiser Boons (issue #85) ---------------------- */

/**
 * Water Guild roster boon (issue #85; Cinderak Burning p.65–76): a gang
 * controlling a Sympathiser with the clear-recovery boon may clear one
 * fighter's Recovery per pre-battle sequence. The app gates on CURRENT
 * control and the fighter's status; "once per pre-battle sequence" has no
 * battle entity to bind to, so frequency is policed at the table (the
 * status flip is visible to everyone). Player or Arbitrator.
 */
export async function clearRecoveryBoon(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = clearRecoveryBoonSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { fighterId } = parsed.data;

  // Gate: the gang must CURRENTLY control a Sympathiser carrying the boon.
  const controls = await db.query.sympathiserControl.findMany({
    where: and(
      eq(schema.sympathiserControl.gangId, gang.id),
      eq(schema.sympathiserControl.isCurrent, true),
    ),
    columns: { sympathiserId: true },
  });
  const source = controls.find(
    (c) => getSympathiserBoons(c.sympathiserId)?.rosterEffect === "clear_recovery",
  );
  if (!source) {
    return {
      error: "This boon needs control of a Sympathiser that grants it (Water Guild).",
    };
  }

  let result: PlayerState = { error: "Failed to clear the recovery." };
  await db.transaction(async (tx) => {
    const fighter = await tx.query.fighters.findFirst({
      where: and(
        eq(schema.fighters.id, fighterId),
        eq(schema.fighters.gangId, gang.id),
      ),
      columns: { id: true, name: true, status: true },
    });
    if (!fighter) {
      result = { error: "Invalid fighter." };
      return;
    }

    // Status lives in the WHERE: a double submit finds no row the second
    // time and fails cleanly instead of "clearing" an active fighter.
    const rows = await tx
      .update(schema.fighters)
      .set({ status: "active" })
      .where(
        and(
          eq(schema.fighters.id, fighterId),
          eq(schema.fighters.status, "in_recovery"),
        ),
      )
      .returning({ id: schema.fighters.id });
    if (rows.length === 0) {
      result = { error: `${fighter.name} is not in recovery.` };
      return;
    }

    await recalcGangScores(gang.id, tx);
    const sympName = getSympathiser(source.sympathiserId)?.name ?? "Sympathiser";
    result = {
      success: `${fighter.name} is battle-ready — recovery cleared (${sympName.replace(" Sympathisers", "")} boon).`,
    };
  });

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return result;
}

/** Control-flow error: the Home Support guard row lost the (gang, cycle)
 *  race AFTER the fighter insert — throwing rolls the fighter back. */
class HomeSupportGuardError extends Error {}

/**
 * Home Support free Ganger (issue #85; Cinderak Burning p.65): every gang
 * has its own Home Support Sympathisers (never contestable). In the Spark
 * of Rebellion phase, a table roll of 2D6 ≥ 10 lets the gang add a Ganger
 * for no credits — equipment is still paid as normal. The app records the
 * confirmed roll: ONE recruit per gang per cycle, guarded by the UNIQUE
 * (gang, cycle) row inserted in the same transaction as the fighter (a
 * lost race rolls the fighter back). The recruit is born with an empty
 * profile — the player fills the card via the normal edit flow.
 */
export async function homeSupportRecruit(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  const gang = resolved.gang;

  const parsed = homeSupportRecruitSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { name } = parsed.data;

  const gangRow = await db.query.gangs.findFirst({
    where: eq(schema.gangs.id, gang.id),
    columns: { campaignId: true },
  });
  if (!gangRow) return { error: "Gang not found." };
  const campaign = await db.query.campaigns.findFirst({
    where: eq(schema.campaigns.id, gangRow.campaignId),
    columns: { currentCycle: true, phase: true, status: true },
  });
  if (!campaign || campaign.status !== "active") {
    return { error: "No active campaign." };
  }
  if (campaign.phase !== "spark_of_rebellion") {
    return {
      error: `Home Support recruiting (${HOME_SUPPORT_RECRUIT.dice} ≥ ${HOME_SUPPORT_RECRUIT.threshold}) happens in the Spark of Rebellion phase.`,
    };
  }

  let result: PlayerState = { error: "Recruiting failed." };
  try {
    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(schema.fighters)
        .values({
          gangId: gang.id,
          name,
          type: "Ganger",
          category: "ganger",
          baseCost: 0,
        })
        .returning({ id: schema.fighters.id });
      const fighterId = inserted[0]!.id;

      // One recruit per gang per cycle: the guard row's UNIQUE decides —
      // a conflict here rolls the fighter insert back.
      const guard = await tx
        .insert(schema.homeSupportRecruits)
        .values({
          gangId: gang.id,
          cycle: campaign.currentCycle,
          fighterId,
        })
        .onConflictDoNothing()
        .returning({ id: schema.homeSupportRecruits.id });
      if (guard.length === 0) throw new HomeSupportGuardError();

      await recalcGangScores(gang.id, tx);
      result = {
        success: `${name} joins for free (Home Support, cycle ${campaign.currentCycle}). Fill in the card — equipment is paid as normal.`,
      };
    });
  } catch (e) {
    if (e instanceof HomeSupportGuardError) {
      result = {
        error: "Home Support already recruited a fighter this cycle.",
      };
    } else {
      throw e;
    }
  }

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  return result;
}

/* ------------------------ Captive flow (issue #86) ------------------------ */

/** Control-flow error: the guarded captive write matched no row AFTER an
 *  earlier write — throwing rolls the transaction back. */
class CaptiveRaceError extends Error {}

/**
 * Loads and validates a held captive inside the caller's transaction: the
 * fighter must exist, be CAPTURED, be held BY the captor gang and belong
 * to ANOTHER gang. Returns null with an error message otherwise.
 */
async function loadHeldCaptive(
  tx: DbOrTx,
  captorGangId: string,
  fighterId: string,
) {
  const fighter = await tx.query.fighters.findFirst({
    where: eq(schema.fighters.id, fighterId),
    columns: {
      id: true,
      name: true,
      gangId: true,
      status: true,
      baseCost: true,
      capturedByGangId: true,
    },
    with: {
      equipment: { with: { equipment: { columns: { cost: true } } } },
      advancements: { columns: { creditIncrease: true } },
    },
  });
  if (!fighter) return { error: "Fighter not found." as const };
  if (
    fighter.status !== "captured" ||
    fighter.capturedByGangId !== captorGangId ||
    fighter.gangId === captorGangId
  ) {
    return { error: "This fighter is not a captive held by this gang." as const };
  }
  return { fighter };
}

/**
 * Sells a held captive to the Guilders (issue #86; Core Rulebook 2023,
 * p.144) — ARBITRATOR-ONLY and destructive: the fighter is deleted from
 * the owner's roster, equipment goes with them (nothing enters any Stash),
 * and the captor is credited. The default price is half the captive's
 * total Cost rounded UP to 5s (`captiveReturnPayment` — equipment and
 * advancements included); the amount is Arbitrator-editable up to the FULL
 * value (bounty-style agreements, Slave Guild boon), clamped server-side.
 * Type-to-confirm (the exact fighter name) like deleteGang (#64). One
 * transaction: guarded DELETE (status in the WHERE — a concurrent
 * resolution loses cleanly) → captor credit → audit row (name snapshot) →
 * recalc BOTH gangs.
 */
export async function sellCaptive(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  if (!resolved.isAdmin) {
    return { error: "Only the Arbitrator can resolve captives." };
  }
  const gang = resolved.gang;

  const parsed = sellCaptiveSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const d = parsed.data;

  let result: PlayerState = { error: "Sale failed." };
  await db.transaction(async (tx) => {
    const loaded = await loadHeldCaptive(tx, gang.id, d.fighterId);
    if ("error" in loaded) {
      result = { error: loaded.error };
      return;
    }
    const { fighter } = loaded;

    if (d.confirmName.trim() !== fighter.name) {
      result = {
        error: "Name does not match — type the captive's name exactly to confirm.",
      };
      return;
    }

    const value = fighterTotalCost({
      baseCost: fighter.baseCost,
      equipment: fighter.equipment.map((fe) => ({ cost: fe.equipment.cost })),
      advancements: fighter.advancements,
    });
    const half = captiveReturnPayment(value);
    if (d.amount > value) {
      result = {
        error: `Amount exceeds ${fighter.name}'s full value (${value}c).`,
      };
      return;
    }

    // Guarded, irreversible removal: the status lives in the WHERE, so a
    // concurrent ransom/release/sale can never double-resolve.
    const removed = await tx
      .delete(schema.fighters)
      .where(
        and(
          eq(schema.fighters.id, d.fighterId),
          eq(schema.fighters.status, "captured"),
        ),
      )
      .returning({ id: schema.fighters.id });
    if (removed.length === 0) {
      result = { error: "The captive was already resolved." };
      return;
    }

    if (d.amount > 0) {
      await tx
        .update(schema.gangs)
        .set({
          stashCredits: sql`${schema.gangs.stashCredits} + ${d.amount}`,
        })
        .where(eq(schema.gangs.id, gang.id));
    }

    await tx.insert(schema.captiveEvents).values({
      captorGangId: gang.id,
      ownerGangId: fighter.gangId,
      fighterId: null, // the row is gone; the snapshot below is the record
      fighterName: fighter.name,
      kind: "sold",
      amount: d.amount,
      notes: `value ${value}c, half ${half}c`,
    });

    await recalcGangScores(gang.id, tx);
    await recalcGangScores(fighter.gangId, tx);
    result = {
      success: `${fighter.name} sold to the Guilders for ${d.amount}c (value ${value}c, half ${half}c). The fighter is gone for good.`,
    };
  });

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  revalidatePath("/");
  revalidatePath("/dashboard");
  return result;
}

/**
 * Ransoms a held captive back to their gang (issue #86; the credit leg of
 * a p.143 trade) — ARBITRATOR-ONLY. The agreed amount moves CONDITIONALLY
 * from the payer (either side: a classic ransom has the owner pay the
 * captor; free-form trades may flow the other way) — an insufficient
 * Stash refuses cleanly before anything is written. Then the fighter
 * returns (status guarded in the WHERE; a lost race rolls the debit back),
 * the audit row lands and BOTH gangs recalc — one transaction. Item or
 * territory legs stay at the table.
 */
export async function ransomCaptive(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  if (!resolved.isAdmin) {
    return { error: "Only the Arbitrator can resolve captives." };
  }
  const gang = resolved.gang;

  const parsed = ransomCaptiveSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const d = parsed.data;

  let result: PlayerState = { error: "Ransom failed." };
  try {
    await db.transaction(async (tx) => {
      const loaded = await loadHeldCaptive(tx, gang.id, d.fighterId);
      if ("error" in loaded) {
        result = { error: loaded.error };
        return;
      }
      const { fighter } = loaded;

      const payerGangId = d.payer === "owner" ? fighter.gangId : gang.id;
      const receiverGangId = d.payer === "owner" ? gang.id : fighter.gangId;

      // Conditional debit FIRST (the Trading Post pattern): nothing has
      // been written yet, so an empty Stash returns cleanly.
      const paid = await debitStashCredits(payerGangId, d.amount, tx);
      if (!paid) {
        result = {
          error: `Insufficient Stash credits: the ${d.payer === "owner" ? "captive's gang" : "captor"} cannot pay ${d.amount}c.`,
        };
        return;
      }

      await tx
        .update(schema.gangs)
        .set({
          stashCredits: sql`${schema.gangs.stashCredits} + ${d.amount}`,
        })
        .where(eq(schema.gangs.id, receiverGangId));

      // The return is guarded on the status: losing this race AFTER the
      // debit throws, rolling the whole transfer back.
      const returned = await tx
        .update(schema.fighters)
        .set({ status: "active", capturedByGangId: null })
        .where(
          and(
            eq(schema.fighters.id, d.fighterId),
            eq(schema.fighters.status, "captured"),
          ),
        )
        .returning({ id: schema.fighters.id });
      if (returned.length === 0) throw new CaptiveRaceError();

      await tx.insert(schema.captiveEvents).values({
        captorGangId: gang.id,
        ownerGangId: fighter.gangId,
        fighterId: fighter.id,
        fighterName: fighter.name,
        kind: "ransomed",
        // positive = the owner paid the captor; negative = the reverse
        amount: d.payer === "owner" ? d.amount : -d.amount,
      });

      await recalcGangScores(gang.id, tx);
      await recalcGangScores(fighter.gangId, tx);
      result = {
        success: `${fighter.name} ransomed back — ${d.amount}c from the ${d.payer === "owner" ? "captive's gang to the captor" : "captor to the captive's gang"}.`,
      };
    });
  } catch (e) {
    if (e instanceof CaptiveRaceError) {
      result = { error: "The captive was already resolved." };
    } else {
      throw e;
    }
  }

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  revalidatePath("/");
  revalidatePath("/dashboard");
  return result;
}

/**
 * Releases a held captive for free (issue #86) — ARBITRATOR-ONLY: covers
 * failed trades and goodwill. Guarded return + audit row + both recalcs
 * in one transaction.
 */
export async function releaseCaptive(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const resolved = await resolveGangForWrite(gangIdFromForm(formData));
  if ("error" in resolved) return { error: resolved.error };
  if (!resolved.isAdmin) {
    return { error: "Only the Arbitrator can resolve captives." };
  }
  const gang = resolved.gang;

  const parsed = releaseCaptiveSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const d = parsed.data;

  let result: PlayerState = { error: "Release failed." };
  await db.transaction(async (tx) => {
    const loaded = await loadHeldCaptive(tx, gang.id, d.fighterId);
    if ("error" in loaded) {
      result = { error: loaded.error };
      return;
    }
    const { fighter } = loaded;

    const returned = await tx
      .update(schema.fighters)
      .set({ status: "active", capturedByGangId: null })
      .where(
        and(
          eq(schema.fighters.id, d.fighterId),
          eq(schema.fighters.status, "captured"),
        ),
      )
      .returning({ id: schema.fighters.id });
    if (returned.length === 0) {
      result = { error: "The captive was already resolved." };
      return;
    }

    await tx.insert(schema.captiveEvents).values({
      captorGangId: gang.id,
      ownerGangId: fighter.gangId,
      fighterId: fighter.id,
      fighterName: fighter.name,
      kind: "released",
      amount: 0,
    });

    await recalcGangScores(gang.id, tx);
    await recalcGangScores(fighter.gangId, tx);
    result = { success: `${fighter.name} released back to their gang.` };
  });

  revalidatePath("/player");
  revalidatePath(`/admin/gangs/${gang.id}`);
  revalidatePath("/");
  revalidatePath("/dashboard");
  return result;
}
