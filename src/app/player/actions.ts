"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import {
  getGangByOwnerId,
  fighterBelongsToGang,
  stashItemBelongsToGang,
} from "@/lib/db/queries";
import {
  fighterSchema,
  addEquipmentSchema,
  removeEquipmentSchema,
  setStashCreditsSchema,
  addStashItemSchema,
  removeStashItemSchema,
  equipFromStashSchema,
  updateFighterStatusSchema,
  addFighterXpSchema,
} from "@/lib/validation";
import { recalcGangScores } from "@/lib/db/mutations";

export type PlayerState = { error?: string; success?: string };

/** Adds a fighter to the authenticated player's gang. */
export async function addFighter(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "You don't have a gang yet." };

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
  return { success: `${d.name} recruited.` };
}

/** Removes a fighter (from the player's own gang only). */
export async function removeFighter(formData: FormData) {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return;

  const fighterId = String(formData.get("fighterId"));
  if (!(await fighterBelongsToGang(fighterId, gang.id))) return;

  // Atomic (issue #62): delete + score recalc commit together.
  await db.transaction(async (tx) => {
    await tx.delete(schema.fighters).where(eq(schema.fighters.id, fighterId));
    await recalcGangScores(gang.id, tx);
  });
  revalidatePath("/player");
}

/** Equips an item on a fighter belonging to the player's own gang. */
export async function addEquipment(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "You don't have a gang yet." };

  const parsed = addEquipmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const d = parsed.data;

  if (!(await fighterBelongsToGang(d.fighterId, gang.id))) {
    return { error: "Invalid fighter." };
  }

  // Atomic (issue #62): a failure after the equipment insert can no longer
  // leave an orphan row without its fighter link (or stale cached scores).
  await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(schema.equipment)
      .values({ name: d.name, category: d.category, cost: d.cost })
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
  return { success: `${d.name} added.` };
}

/** Removes an equipped item from a fighter in the player's own gang. */
export async function removeEquipment(formData: FormData) {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return;

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
}

/* ------------------------------------------------------------------ */
/*  Stash                                                               */
/* ------------------------------------------------------------------ */

/** Adjusts the gang's Stash credits (post-battle rewards, etc.). */
export async function setStashCredits(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "You don't have a gang yet." };

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
  return { success: "Stash credits updated." };
}

/** Adds an item to the Stash (creates a new equipment row + stash_item). */
export async function addStashItem(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "You don't have a gang yet." };

  const parsed = addStashItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const d = parsed.data;

  // Atomic (issue #62): equipment + stash link + recalc commit together.
  await db.transaction(async (tx) => {
    const [equip] = await tx
      .insert(schema.equipment)
      .values({ name: d.name, category: d.category, cost: d.cost })
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
  return { success: `${d.name} added to Stash.` };
}

/** Removes an item from the Stash (and the associated equipment). */
export async function removeStashItem(formData: FormData) {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return;

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
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "You don't have a gang yet." };

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
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "You don't have a gang yet." };

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
  return { success: "Status updated." };
}

/** Adds XP to a fighter (positive delta; XP is cumulative). */
export async function addFighterXp(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "You don't have a gang yet." };

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
  return { success: `+${xpDelta} XP added.` };
}
