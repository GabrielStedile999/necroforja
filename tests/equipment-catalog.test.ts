/**
 * Equipment catalogue tests (issue #67).
 *
 * Seed half: structural integrity of the official data transcribed from the
 * Core Rulebook 2023 — unique names, valid categories, sane costs, weapons
 * carrying a profile — plus spot-checks of printed values (including the
 * Maul's unusual AP "+1", verified against the printed page).
 *
 * Schema half: profile cells accept the book's symbols and normalise empty
 * inputs, costs are bounded.
 *
 * Action half (I/O mocked): admin CRUD guards (duplicate names, not-found),
 * idempotent seeding, and the acquisition snapshot — a catalogue pick uses
 * the CATALOGUE row's values server-side, never the client's.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  EQUIPMENT_CATALOG_SEED,
  type CatalogSeedItem,
} from "@/lib/data/equipment-catalog";
import {
  catalogItemSchema,
  updateCatalogItemSchema,
  toggleCatalogItemSchema,
  addEquipmentSchema,
} from "@/lib/validation";

/* ---- next/cache ---- */
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/* ---- Auth guards ---- */
vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: "admin-1", role: "admin" }),
  requireUser: vi.fn(),
}));

/* ---- gang access (player actions) ---- */
const { mockResolveGangForWrite } = vi.hoisted(() => ({
  mockResolveGangForWrite: vi.fn(),
}));
vi.mock("@/lib/auth/gang-access", () => ({
  resolveGangForWrite: mockResolveGangForWrite,
  gangIdFromForm: (fd: FormData) => {
    const v = fd.get("gangId");
    return typeof v === "string" && v.length > 0 ? v : undefined;
  },
}));

/* ---- Query helpers ---- */
const { mockGetCatalogItemById, mockFighterBelongsToGang } = vi.hoisted(() => ({
  mockGetCatalogItemById: vi.fn(),
  mockFighterBelongsToGang: vi.fn().mockResolvedValue(true),
}));
vi.mock("@/lib/db/queries", () => ({
  getCatalogItemById: mockGetCatalogItemById,
  fighterBelongsToGang: mockFighterBelongsToGang,
  stashItemBelongsToGang: vi.fn(),
  countFighterWeapons: vi.fn().mockResolvedValue(0),
  listCatalogItems: vi.fn(),
  listEnabledCatalogItems: vi.fn(),
}));

/* ---- mutations ---- */
vi.mock("@/lib/db/mutations", () => ({ recalcGangScores: vi.fn() }));

/* ---- storage / logging / rate limit (player actions imports) ---- */
vi.mock("@/lib/storage", () => ({
  GALLERY_BUCKET: "gallery",
  storagePublicUrl: vi.fn(),
  createSignedUploadUrl: vi.fn(),
  deleteStorageObject: vi.fn(),
}));
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/ai/rate-limit", () => ({ rateLimit: vi.fn() }));

/* ---- Drizzle db ---- */
const { dbMock, mockCatalogFindFirst, mockCatalogFindMany } = vi.hoisted(() => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const insertReturning = vi.fn().mockResolvedValue([{ id: "eq-1" }]);
  const insertValues = vi.fn(() => ({ returning: insertReturning }));
  const insert = vi.fn(() => ({ values: insertValues }));
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const updateSet = vi.fn(() => ({ where: updateWhere }));
  const update = vi.fn(() => ({ set: updateSet }));
  const deleteWhere = vi.fn().mockResolvedValue(undefined);
  const del = vi.fn(() => ({ where: deleteWhere }));
  const mockCatalogFindFirst = vi.fn();
  const mockCatalogFindMany = vi.fn();
  const dbMock: any = {
    insert,
    insertValues,
    insertReturning,
    update,
    updateSet,
    delete: del,
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(dbMock),
    ),
    query: {
      equipmentCatalog: {
        findFirst: mockCatalogFindFirst,
        findMany: mockCatalogFindMany,
      },
    },
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { dbMock, mockCatalogFindFirst, mockCatalogFindMany };
});
vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    equipment: { id: "equipment.id" },
    equipmentCatalog: {
      id: "equipment_catalog.id",
      name: "equipment_catalog.name",
      enabled: "equipment_catalog.enabled",
    },
    fighterEquipment: { fighterId: "fighter_equipment.fighter_id" },
    stashItems: { id: "stash_item.id" },
  },
}));

import {
  createCatalogItem,
  updateCatalogItem,
  seedOfficialCatalog,
} from "@/app/admin/catalog/actions";
import { addEquipment } from "@/app/player/actions";

const UUID_ITEM = "123e4567-e89b-12d3-a456-426614174000";
const UUID_FIGHTER = "123e4567-e89b-12d3-a456-426614174001";

function form(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

function seedByName(name: string): CatalogSeedItem {
  const item = EQUIPMENT_CATALOG_SEED.find((i) => i.name === name);
  if (!item) throw new Error(`Seed item not found: ${name}`);
  return item;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFighterBelongsToGang.mockResolvedValue(true);
  dbMock.insertReturning.mockResolvedValue([{ id: "eq-1" }]);
});

/* ------------------------------------------------------------------ */
/*  Official seed data                                                  */
/* ------------------------------------------------------------------ */
describe("EQUIPMENT_CATALOG_SEED integrity", () => {
  it("has unique names", () => {
    const names = EQUIPMENT_CATALOG_SEED.map((i) => i.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("only uses valid categories/subcategories and sane costs", () => {
    const categories = new Set(["weapon", "wargear", "armour", "upgrade"]);
    const subcategories = new Set([
      "basic",
      "pistol",
      "special",
      "heavy",
      "close_combat",
      "grenade",
    ]);
    for (const item of EQUIPMENT_CATALOG_SEED) {
      expect(categories.has(item.category), item.name).toBe(true);
      expect(Number.isInteger(item.cost), item.name).toBe(true);
      expect(item.cost, item.name).toBeGreaterThanOrEqual(0);
      expect(item.cost, item.name).toBeLessThanOrEqual(500);
      if (item.category === "weapon") {
        expect(item.subcategory, item.name).toBeDefined();
        expect(subcategories.has(item.subcategory!), item.name).toBe(true);
      }
    }
  });

  it("every weapon carries a full printed profile", () => {
    for (const item of EQUIPMENT_CATALOG_SEED) {
      if (item.category !== "weapon") continue;
      // all 8 cells present (the book uses "-" for empty, never blank)
      for (const cell of [
        item.rangeShort,
        item.rangeLong,
        item.accShort,
        item.accLong,
        item.strength,
        item.ap,
        item.damage,
        item.ammo,
      ]) {
        expect(cell, item.name).toBeTruthy();
      }
      expect(item.traits, item.name).toBeTruthy();
    }
  });

  it("matches printed Trading Post values (spot checks)", () => {
    expect(seedByName("Lasgun")).toMatchObject({
      cost: 15,
      rangeShort: '18"',
      rangeLong: '24"',
      accShort: "+1",
      strength: "3",
      ammo: "2+",
    });
    expect(seedByName("Boltgun")).toMatchObject({
      cost: 55,
      strength: "4",
      ap: "-1",
      damage: "2",
      ammo: "6+",
    });
    expect(seedByName("Meltagun")).toMatchObject({
      cost: 135,
      strength: "8",
      ap: "-4",
      damage: "3",
    });
    expect(seedByName("Heavy stubber")).toMatchObject({
      cost: 130,
      rangeShort: '20"',
      rangeLong: '40"',
    });
    expect(seedByName("Frag grenade")).toMatchObject({
      cost: 30,
      rangeLong: "Sx3",
      strength: "3",
    });
    expect(seedByName("Power sword")).toMatchObject({
      cost: 50,
      strength: "S+1",
      ap: "-2",
    });
    expect(seedByName("Mesh armour")).toMatchObject({ cost: 15 });
    expect(seedByName("Flak armour")).toMatchObject({ cost: 10 });
    expect(seedByName("Respirator")).toMatchObject({ cost: 15 });
    expect(seedByName("Suspensor harness")).toMatchObject({ cost: 40 });
  });

  it('keeps the Maul\'s unusual AP "+1" exactly as printed (p.270)', () => {
    expect(seedByName("Maul (club)").ap).toBe("+1");
  });
});

/* ------------------------------------------------------------------ */
/*  Schemas                                                             */
/* ------------------------------------------------------------------ */
describe("catalogue schemas", () => {
  it("accepts the book's profile symbols and normalises empty cells", () => {
    const r = catalogItemSchema.safeParse({
      name: "Test blaster",
      category: "weapon",
      subcategory: "basic",
      cost: "50",
      rangeShort: "Sx2",
      rangeLong: 'T″',
      accShort: "",
      strength: "S+1",
      ap: "+1",
      damage: "*",
      ammo: "4+",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.cost).toBe(50);
      expect(r.data.accShort).toBeUndefined(); // "" → not set
      expect(r.data.strength).toBe("S+1");
      expect(r.data.traits).toBe(""); // defaulted
    }
  });

  it("bounds the cost and rejects the skill category", () => {
    const base = { name: "Thing", category: "wargear", cost: "10" };
    expect(catalogItemSchema.safeParse(base).success).toBe(true);
    expect(
      catalogItemSchema.safeParse({ ...base, cost: "-5" }).success,
    ).toBe(false);
    expect(
      catalogItemSchema.safeParse({ ...base, cost: "10000" }).success,
    ).toBe(false);
    expect(
      catalogItemSchema.safeParse({ ...base, category: "skill" }).success,
    ).toBe(false);
  });

  it("update requires the item id; toggle takes the current state", () => {
    expect(
      updateCatalogItemSchema.safeParse({
        name: "Thing",
        category: "wargear",
        cost: "10",
        catalogItemId: "nope",
      }).success,
    ).toBe(false);
    expect(
      toggleCatalogItemSchema.safeParse({
        catalogItemId: UUID_ITEM,
        enabled: "true",
      }).success,
    ).toBe(true);
  });

  it("addEquipmentSchema treats an empty catalogId as a custom item", () => {
    const r = addEquipmentSchema.safeParse({
      fighterId: UUID_FIGHTER,
      name: "Rusty pipe",
      category: "weapon",
      cost: "5",
      catalogId: "",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.catalogId).toBeUndefined();
  });
});

/* ------------------------------------------------------------------ */
/*  Admin actions                                                       */
/* ------------------------------------------------------------------ */
describe("createCatalogItem", () => {
  it("rejects a duplicate name", async () => {
    mockCatalogFindFirst.mockResolvedValue({ id: UUID_ITEM });

    const res = await createCatalogItem(
      {},
      form({ name: "Lasgun", category: "weapon", cost: "15" }),
    );

    expect(res.error).toMatch(/already exists/);
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it("inserts a new item", async () => {
    mockCatalogFindFirst.mockResolvedValue(undefined);

    const res = await createCatalogItem(
      {},
      form({
        name: "House-rule blade",
        category: "weapon",
        subcategory: "close_combat",
        cost: "20",
        strength: "S+1",
      }),
    );

    expect(res.success).toMatch(/added to the catalogue/);
    const values = dbMock.insertValues.mock.calls[0]?.[0];
    expect(values).toMatchObject({
      name: "House-rule blade",
      category: "weapon",
      cost: 20,
      strength: "S+1",
    });
  });
});

describe("updateCatalogItem", () => {
  it("rejects renaming onto another item's name", async () => {
    mockCatalogFindFirst
      .mockResolvedValueOnce({ id: UUID_ITEM }) // the edited item exists
      .mockResolvedValueOnce({ id: "another-id" }); // name owned by another row

    const res = await updateCatalogItem(
      {},
      form({
        catalogItemId: UUID_ITEM,
        name: "Boltgun",
        category: "weapon",
        cost: "55",
      }),
    );

    expect(res.error).toMatch(/already exists/);
    expect(dbMock.update).not.toHaveBeenCalled();
  });

  it("clears emptied profile cells with explicit nulls (rebalance)", async () => {
    mockCatalogFindFirst
      .mockResolvedValueOnce({ id: UUID_ITEM })
      .mockResolvedValueOnce({ id: UUID_ITEM }); // same row owns the name

    const res = await updateCatalogItem(
      {},
      form({
        catalogItemId: UUID_ITEM,
        name: "Lasgun",
        category: "weapon",
        subcategory: "basic",
        cost: "20", // rebalanced from 15
        strength: "3",
        ap: "", // emptied → must persist as null, not be skipped
      }),
    );

    expect(res.success).toMatch(/updated/);
    const setArg = dbMock.updateSet.mock.calls[0]?.[0];
    expect(setArg).toMatchObject({ cost: 20, strength: "3", ap: null });
  });
});

describe("seedOfficialCatalog", () => {
  it("only inserts items missing from the table (idempotent)", async () => {
    // everything except the Lasgun is already present
    mockCatalogFindMany.mockResolvedValue(
      EQUIPMENT_CATALOG_SEED.filter((i) => i.name !== "Lasgun").map((i) => ({
        name: i.name,
      })),
    );

    const res = await seedOfficialCatalog({}, form({}));

    expect(res.success).toMatch(/1 official item/);
    const values = dbMock.insertValues.mock.calls[0]?.[0];
    expect(values).toHaveLength(1);
    expect(values[0]).toMatchObject({ name: "Lasgun", cost: 15 });
  });

  it("is a no-op when the catalogue is fully seeded", async () => {
    mockCatalogFindMany.mockResolvedValue(
      EQUIPMENT_CATALOG_SEED.map((i) => ({ name: i.name })),
    );

    const res = await seedOfficialCatalog({}, form({}));

    expect(res.success).toMatch(/nothing to add/);
    expect(dbMock.insert).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  Acquisition snapshot (player action)                                */
/* ------------------------------------------------------------------ */
describe("addEquipment with a catalogue pick", () => {
  const gang = { id: "123e4567-e89b-12d3-a456-426614174009", name: "Sump Rats" };

  beforeEach(() => {
    mockResolveGangForWrite.mockResolvedValue({ gang });
  });

  it("uses the CATALOGUE row's values, ignoring whatever the client typed", async () => {
    mockGetCatalogItemById.mockResolvedValue({
      id: UUID_ITEM,
      name: "Boltgun",
      category: "weapon",
      cost: 55,
      enabled: true,
    });

    const res = await addEquipment(
      {},
      form({
        fighterId: UUID_FIGHTER,
        // hostile client: tries to buy a Boltgun for 1 credit under a fake name
        name: "Totally a stick",
        category: "wargear",
        cost: "1",
        catalogId: UUID_ITEM,
      }),
    );

    expect(res.success).toMatch(/Boltgun added/);
    const values = dbMock.insertValues.mock.calls[0]?.[0];
    expect(values).toEqual({
      name: "Boltgun",
      category: "weapon",
      cost: 55,
      catalogId: UUID_ITEM,
    });
  });

  it("rejects a disabled catalogue item", async () => {
    mockGetCatalogItemById.mockResolvedValue({
      id: UUID_ITEM,
      name: "Boltgun",
      category: "weapon",
      cost: 55,
      enabled: false,
    });

    const res = await addEquipment(
      {},
      form({
        fighterId: UUID_FIGHTER,
        name: "Boltgun",
        category: "weapon",
        cost: "55",
        catalogId: UUID_ITEM,
      }),
    );

    expect(res.error).toMatch(/not found \(or disabled\)/);
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it("keeps the free-text path for custom gear (no catalogue link)", async () => {
    const res = await addEquipment(
      {},
      form({
        fighterId: UUID_FIGHTER,
        name: "Rusty pipe",
        category: "weapon",
        cost: "5",
      }),
    );

    expect(res.success).toMatch(/Rusty pipe added/);
    expect(mockGetCatalogItemById).not.toHaveBeenCalled();
    const values = dbMock.insertValues.mock.calls[0]?.[0];
    expect(values).toEqual({
      name: "Rusty pipe",
      category: "weapon",
      cost: 5,
      catalogId: null,
    });
  });
});
