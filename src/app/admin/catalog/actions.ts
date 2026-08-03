"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { EQUIPMENT_CATALOG_SEED } from "@/lib/data/equipment-catalog";
import {
  catalogItemSchema,
  updateCatalogItemSchema,
  toggleCatalogItemSchema,
  deleteCatalogItemSchema,
  keywordRuleSchema,
  updateKeywordRuleSchema,
  deleteKeywordRuleSchema,
  importKeywordRulesSchema,
} from "@/lib/validation";

export type CatalogAdminState = { error?: string; success?: string };

/** Paths that render catalogue data (admin screen + equipment pickers). */
function revalidateCatalogViews() {
  revalidatePath("/admin/catalog");
  revalidatePath("/admin");
  revalidatePath("/player");
}

/**
 * Creates a custom catalogue item (issue #67) — for house rules, balance
 * experiments or official items not covered by the seed.
 */
export async function createCatalogItem(
  _prev: CatalogAdminState,
  formData: FormData,
): Promise<CatalogAdminState> {
  await requireAdmin();

  const parsed = catalogItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const data = parsed.data;

  const clash = await db.query.equipmentCatalog.findFirst({
    where: eq(schema.equipmentCatalog.name, data.name),
    columns: { id: true },
  });
  if (clash) return { error: `"${data.name}" already exists in the catalogue.` };

  await db.insert(schema.equipmentCatalog).values(data);

  revalidateCatalogViews();
  return { success: `${data.name} added to the catalogue.` };
}

/**
 * Edits any field of a catalogue item (fix a transcription, rebalance a
 * cost…). Owned copies are SNAPSHOTS — gear a fighter already carries keeps
 * its acquisition name/cost; only future acquisitions see the change.
 */
export async function updateCatalogItem(
  _prev: CatalogAdminState,
  formData: FormData,
): Promise<CatalogAdminState> {
  await requireAdmin();

  const parsed = updateCatalogItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { catalogItemId, ...data } = parsed.data;

  const item = await db.query.equipmentCatalog.findFirst({
    where: eq(schema.equipmentCatalog.id, catalogItemId),
    columns: { id: true },
  });
  if (!item) return { error: "Catalogue item not found." };

  const clash = await db.query.equipmentCatalog.findFirst({
    where: eq(schema.equipmentCatalog.name, data.name),
    columns: { id: true },
  });
  if (clash && clash.id !== catalogItemId) {
    return { error: `"${data.name}" already exists in the catalogue.` };
  }

  await db
    .update(schema.equipmentCatalog)
    .set({
      ...data,
      // profileCell normalises "" to undefined, but undefined makes drizzle
      // SKIP the column — an explicit null is needed to CLEAR a cell.
      subcategory: data.subcategory ?? null,
      rangeShort: data.rangeShort ?? null,
      rangeLong: data.rangeLong ?? null,
      accShort: data.accShort ?? null,
      accLong: data.accLong ?? null,
      strength: data.strength ?? null,
      ap: data.ap ?? null,
      damage: data.damage ?? null,
      ammo: data.ammo ?? null,
    })
    .where(eq(schema.equipmentCatalog.id, catalogItemId));

  revalidateCatalogViews();
  return { success: `${data.name} updated.` };
}

/**
 * Enables/disables a catalogue item. Disabled items leave the pick lists
 * but stay linked to gear acquired while they were live.
 */
export async function toggleCatalogItem(formData: FormData) {
  await requireAdmin();

  const parsed = toggleCatalogItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { catalogItemId, enabled } = parsed.data;

  await db
    .update(schema.equipmentCatalog)
    .set({ enabled: enabled !== "true" })
    .where(eq(schema.equipmentCatalog.id, catalogItemId));

  revalidateCatalogViews();
}

/**
 * Deletes a catalogue item. Owned copies survive with their snapshot
 * (equipment.catalog_id → null at the database level). Prefer disabling —
 * deletion is for entries created by mistake.
 */
export async function deleteCatalogItem(
  _prev: CatalogAdminState,
  formData: FormData,
): Promise<CatalogAdminState> {
  await requireAdmin();

  const parsed = deleteCatalogItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { catalogItemId } = parsed.data;

  const item = await db.query.equipmentCatalog.findFirst({
    where: eq(schema.equipmentCatalog.id, catalogItemId),
    columns: { id: true, name: true },
  });
  if (!item) return { error: "Catalogue item not found." };

  await db
    .delete(schema.equipmentCatalog)
    .where(eq(schema.equipmentCatalog.id, catalogItemId));

  revalidateCatalogViews();
  return { success: `${item.name} deleted (owned copies keep their data).` };
}

/**
 * Seeds the official Trading Post catalogue (Core Rulebook 2023) from
 * src/lib/data/equipment-catalog.ts. IDEMPOTENT: only names not yet in the
 * table are inserted — existing rows (including Arbitrator edits) are never
 * touched, so the button is safe to press again after adding custom items.
 */
export async function seedOfficialCatalog(
  _prev: CatalogAdminState,
  _formData: FormData,
): Promise<CatalogAdminState> {
  await requireAdmin();

  const names = EQUIPMENT_CATALOG_SEED.map((i) => i.name);
  const existing = await db.query.equipmentCatalog.findMany({
    where: inArray(schema.equipmentCatalog.name, names),
    columns: { name: true },
  });
  const present = new Set(existing.map((r) => r.name));
  const missing = EQUIPMENT_CATALOG_SEED.filter((i) => !present.has(i.name));

  if (missing.length === 0) {
    return { success: "Official catalogue already seeded — nothing to add." };
  }

  await db.insert(schema.equipmentCatalog).values(
    missing.map((i) => ({
      name: i.name,
      category: i.category,
      subcategory: i.subcategory ?? null,
      cost: i.cost,
      rangeShort: i.rangeShort ?? null,
      rangeLong: i.rangeLong ?? null,
      accShort: i.accShort ?? null,
      accLong: i.accLong ?? null,
      strength: i.strength ?? null,
      ap: i.ap ?? null,
      damage: i.damage ?? null,
      ammo: i.ammo ?? null,
      traits: i.traits ?? "",
      effect: i.effect ?? "",
    })),
  );

  revalidateCatalogViews();
  return {
    success: `${missing.length} official item(s) added to the catalogue.`,
  };
}

/* ------------------- Keyword rules (issue #67 follow-up) ------------------- */
/*
 * IP strategy for the public repository: keyword summaries are REWRITTEN in
 * our own wording (function preserved, no book prose) and live ONLY in the
 * private keyword_rule table — the repo ships no rule content. These actions
 * are how the content gets in: manual CRUD or a JSON paste-import from a
 * private (gitignored) file.
 */

export async function createKeywordRule(
  _prev: CatalogAdminState,
  formData: FormData,
): Promise<CatalogAdminState> {
  await requireAdmin();

  const parsed = keywordRuleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const data = parsed.data;

  const clash = await db.query.keywordRules.findFirst({
    where: eq(schema.keywordRules.keyword, data.keyword),
    columns: { id: true },
  });
  if (clash) return { error: `"${data.keyword}" already has a rule.` };

  await db.insert(schema.keywordRules).values(data);

  revalidateCatalogViews();
  return { success: `Keyword "${data.keyword}" added.` };
}

export async function updateKeywordRule(
  _prev: CatalogAdminState,
  formData: FormData,
): Promise<CatalogAdminState> {
  await requireAdmin();

  const parsed = updateKeywordRuleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { keywordRuleId, ...data } = parsed.data;

  const rule = await db.query.keywordRules.findFirst({
    where: eq(schema.keywordRules.id, keywordRuleId),
    columns: { id: true },
  });
  if (!rule) return { error: "Keyword rule not found." };

  const clash = await db.query.keywordRules.findFirst({
    where: eq(schema.keywordRules.keyword, data.keyword),
    columns: { id: true },
  });
  if (clash && clash.id !== keywordRuleId) {
    return { error: `"${data.keyword}" already has a rule.` };
  }

  await db
    .update(schema.keywordRules)
    .set({
      ...data,
      book: data.book ?? null,
      page: data.page ?? null,
      updatedAt: new Date(),
    })
    .where(eq(schema.keywordRules.id, keywordRuleId));

  revalidateCatalogViews();
  return { success: `Keyword "${data.keyword}" updated.` };
}

export async function deleteKeywordRule(
  _prev: CatalogAdminState,
  formData: FormData,
): Promise<CatalogAdminState> {
  await requireAdmin();

  const parsed = deleteKeywordRuleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const { keywordRuleId } = parsed.data;

  const rule = await db.query.keywordRules.findFirst({
    where: eq(schema.keywordRules.id, keywordRuleId),
    columns: { id: true, keyword: true },
  });
  if (!rule) return { error: "Keyword rule not found." };

  await db
    .delete(schema.keywordRules)
    .where(eq(schema.keywordRules.id, keywordRuleId));

  revalidateCatalogViews();
  return { success: `Keyword "${rule.keyword}" deleted.` };
}

/**
 * Bulk paste-import of keyword rules from a JSON array
 * ([{keyword, summary, book?, page?}, …], the private gitignored file).
 * UPSERT by keyword: existing entries are updated, new ones inserted — safe
 * to re-import after editing the source file.
 */
export async function importKeywordRules(
  _prev: CatalogAdminState,
  formData: FormData,
): Promise<CatalogAdminState> {
  await requireAdmin();

  const parsed = importKeywordRulesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(parsed.data.payload);
  } catch {
    return { error: "Invalid JSON — paste the full array, including [ ]." };
  }
  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: "Expected a non-empty JSON array of keyword rules." };
  }

  const rules: import("@/lib/validation").KeywordRuleInput[] = [];
  for (const [index, entry] of raw.entries()) {
    const item = keywordRuleSchema.safeParse(entry);
    if (!item.success) {
      return {
        error: `Entry ${index + 1}: ${item.error.issues[0]?.message ?? "invalid"}`,
      };
    }
    rules.push(item.data);
  }

  // Atomic upsert-by-keyword: all entries land together or none do.
  await db.transaction(async (tx) => {
    for (const rule of rules) {
      await tx
        .insert(schema.keywordRules)
        .values(rule)
        .onConflictDoUpdate({
          target: schema.keywordRules.keyword,
          set: {
            summary: rule.summary,
            book: rule.book ?? null,
            page: rule.page ?? null,
            updatedAt: new Date(),
          },
        });
    }
  });

  revalidateCatalogViews();
  return { success: `${rules.length} keyword rule(s) imported/updated.` };
}
