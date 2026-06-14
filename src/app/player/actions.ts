"use server";

import { and, eq } from "drizzle-orm";
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

/** Adiciona um fighter à gangue do jogador autenticado. */
export async function addFighter(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "Você ainda não tem uma gangue." };

  const parsed = fighterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;

  await db.insert(schema.fighters).values({
    gangId: gang.id,
    name: d.name,
    type: d.type,
    category: d.category,
    baseCost: d.baseCost,
    m: d.m, ws: d.ws, bs: d.bs, s: d.s, t: d.t, w: d.w,
    i: d.i, a: d.a, ld: d.ld, cl: d.cl, wil: d.wil, int: d.int,
  });

  await recalcGangScores(gang.id);
  revalidatePath("/player");
  return { success: `${d.name} recrutado.` };
}

/** Remove um fighter (apenas da própria gangue). */
export async function removeFighter(formData: FormData) {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return;

  const fighterId = String(formData.get("fighterId"));
  if (!(await fighterBelongsToGang(fighterId, gang.id))) return;

  await db.delete(schema.fighters).where(eq(schema.fighters.id, fighterId));
  await recalcGangScores(gang.id);
  revalidatePath("/player");
}

/** Equipa um item num fighter da própria gangue. */
export async function addEquipment(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "Você ainda não tem uma gangue." };

  const parsed = addEquipmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;

  if (!(await fighterBelongsToGang(d.fighterId, gang.id))) {
    return { error: "Fighter inválido." };
  }

  const [created] = await db
    .insert(schema.equipment)
    .values({ name: d.name, category: d.category, cost: d.cost })
    .returning();
  if (created) {
    await db.insert(schema.fighterEquipment).values({
      fighterId: d.fighterId,
      equipmentId: created.id,
      qty: 1,
    });
  }

  await recalcGangScores(gang.id);
  revalidatePath("/player");
  return { success: `${d.name} adicionado.` };
}

/** Remove um item equipado de um fighter da própria gangue. */
export async function removeEquipment(formData: FormData) {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return;

  const parsed = removeEquipmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { fighterId, equipmentId } = parsed.data;

  // Autorização: o fighter deve pertencer à gangue do usuário
  if (!(await fighterBelongsToGang(fighterId, gang.id))) return;

  // Remove o vínculo fighter ↔ equipment
  await db
    .delete(schema.fighterEquipment)
    .where(
      and(
        eq(schema.fighterEquipment.fighterId, fighterId),
        eq(schema.fighterEquipment.equipmentId, equipmentId),
      ),
    );

  // Remove o item em si (cada row é exclusiva de um fighter no modelo atual)
  await db
    .delete(schema.equipment)
    .where(eq(schema.equipment.id, equipmentId));

  await recalcGangScores(gang.id);
  revalidatePath("/player");
}

/* ------------------------------------------------------------------ */
/*  Stash                                                               */
/* ------------------------------------------------------------------ */

/** Ajusta os créditos do Stash da gangue (recompensas pós-batalha etc.). */
export async function setStashCredits(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "Você ainda não tem uma gangue." };

  const parsed = setStashCreditsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await db
    .update(schema.gangs)
    .set({ stashCredits: parsed.data.credits })
    .where(eq(schema.gangs.id, gang.id));

  await recalcGangScores(gang.id);
  revalidatePath("/player");
  return { success: "Créditos do Stash atualizados." };
}

/** Adiciona um item ao Stash (cria nova row de equipment + stash_item). */
export async function addStashItem(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "Você ainda não tem uma gangue." };

  const parsed = addStashItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;

  const [equip] = await db
    .insert(schema.equipment)
    .values({ name: d.name, category: d.category, cost: d.cost })
    .returning();

  if (equip) {
    await db.insert(schema.stashItems).values({
      gangId: gang.id,
      equipmentId: equip.id,
      qty: d.qty,
    });
  }

  await recalcGangScores(gang.id);
  revalidatePath("/player");
  return { success: `${d.name} adicionado ao Stash.` };
}

/** Remove um item do Stash (e o equipment associado). */
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

  await db
    .delete(schema.stashItems)
    .where(eq(schema.stashItems.id, stashItemId));
  await db
    .delete(schema.equipment)
    .where(eq(schema.equipment.id, stashRow.equipmentId));

  await recalcGangScores(gang.id);
  revalidatePath("/player");
}

/**
 * Move um item do Stash para um fighter (operação atômica).
 *
 * - qty > 1: decrementa qty no stash; cria novo equipment + fighter_equipment.
 * - qty = 1: deleta stash_item; reutiliza o equipment row no fighter_equipment.
 *
 * Em ambos os casos Wealth permanece constante (item sai do Stash e entra no
 * Rating), apenas a composição muda.
 */
export async function equipFromStash(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "Você ainda não tem uma gangue." };

  const parsed = equipFromStashSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { stashItemId, fighterId } = parsed.data;

  if (!(await stashItemBelongsToGang(stashItemId, gang.id))) {
    return { error: "Item inválido." };
  }
  if (!(await fighterBelongsToGang(fighterId, gang.id))) {
    return { error: "Fighter inválido." };
  }

  const stashRow = await db.query.stashItems.findFirst({
    where: eq(schema.stashItems.id, stashItemId),
    with: { equipment: true },
  });
  if (!stashRow || !stashRow.equipment) {
    return { error: "Item não encontrado." };
  }

  const itemName = stashRow.equipment.name;

  await db.transaction(async (tx) => {
    if (stashRow.qty > 1) {
      // Decrementa qty no stash; cria nova instância de equipment para o fighter
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
      // qty === 1: deleta stash_item, reutiliza a row de equipment no fighter
      await tx
        .delete(schema.stashItems)
        .where(eq(schema.stashItems.id, stashItemId));

      await tx.insert(schema.fighterEquipment).values({
        fighterId,
        equipmentId: stashRow.equipmentId,
        qty: 1,
      });
    }
  });

  await recalcGangScores(gang.id);
  revalidatePath("/player");
  return { success: `${itemName} equipado ao fighter.` };
}

/* ------------------------------------------------------------------ */
/*  Ciclo de vida do fighter                                            */
/* ------------------------------------------------------------------ */

/**
 * Altera o status de um fighter da própria gangue.
 * Ao marcar como "dead", o fighter sai do Rating (recalcGangScores).
 * Ao marcar como "captured", registra a gangue captora.
 */
export async function updateFighterStatus(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "Você ainda não tem uma gangue." };

  const parsed = updateFighterStatusSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { fighterId, status, capturedByGangId } = parsed.data;

  if (!(await fighterBelongsToGang(fighterId, gang.id))) {
    return { error: "Fighter inválido." };
  }

  await db
    .update(schema.fighters)
    .set({
      status,
      // Limpa o campo se não for mais "captured"
      capturedByGangId:
        status === "captured" ? (capturedByGangId ?? null) : null,
    })
    .where(eq(schema.fighters.id, fighterId));

  // Fighters mortos saem do Rating — recalcular
  await recalcGangScores(gang.id);
  revalidatePath("/player");
  return { success: "Status atualizado." };
}

/** Adiciona XP a um fighter (delta positivo; XP é acumulativo). */
export async function addFighterXp(
  _prev: PlayerState,
  formData: FormData,
): Promise<PlayerState> {
  const user = await requireUser();
  const gang = await getGangByOwnerId(user.id);
  if (!gang) return { error: "Você ainda não tem uma gangue." };

  const parsed = addFighterXpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { fighterId, xpDelta } = parsed.data;

  if (!(await fighterBelongsToGang(fighterId, gang.id))) {
    return { error: "Fighter inválido." };
  }

  // Incremento seguro: busca o valor atual e soma
  const current = await db.query.fighters.findFirst({
    where: eq(schema.fighters.id, fighterId),
    columns: { xp: true },
  });
  const newXp = (current?.xp ?? 0) + xpDelta;

  await db
    .update(schema.fighters)
    .set({ xp: newXp })
    .where(eq(schema.fighters.id, fighterId));

  revalidatePath("/player");
  return { success: `+${xpDelta} XP adicionado.` };
}
