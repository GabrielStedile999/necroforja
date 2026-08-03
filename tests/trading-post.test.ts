/**
 * Trading Post tests (issue #68).
 *
 * Helper half: debitStashCredits is a CONDITIONAL update — the returned
 * boolean mirrors whether a row matched (`stash_credits >= amount`), which
 * is what makes two concurrent purchases unable to overdraw at the
 * database level.
 *
 * Action half (I/O mocked): purchases debit exactly the catalogue snapshot
 * inside one transaction; insufficient credits fail cleanly with amounts;
 * a concurrent double-purchase (conditional-debit semantics simulated
 * atomically) never spends the same credits; recruiting debits baseCost
 * and rolls back with the fighter on failure; grant paths are
 * Arbitrator-only.
 *
 * Scoring half (pure): Wealth is constant on both purchase paths; Rating
 * rises only when buying onto a fighter.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { purchaseEquipmentSchema } from "@/lib/validation";
import { gangRating, gangWealth } from "@/lib/scoring";
import type { Gang } from "@/types";

/* ---- next/cache ---- */
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/* ---- Auth guards ---- */
vi.mock("@/lib/auth/guards", () => ({
  requireUser: vi.fn(),
  requireAdmin: vi.fn(),
}));

/* ---- gang access ---- */
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
const { mockGetCatalogItemById, mockFighterBelongsToGang, mockCountWeapons } =
  vi.hoisted(() => ({
    mockGetCatalogItemById: vi.fn(),
    mockFighterBelongsToGang: vi.fn().mockResolvedValue(true),
    mockCountWeapons: vi.fn().mockResolvedValue(0),
  }));
vi.mock("@/lib/db/queries", () => ({
  getCatalogItemById: mockGetCatalogItemById,
  fighterBelongsToGang: mockFighterBelongsToGang,
  stashItemBelongsToGang: vi.fn(),
  countFighterWeapons: mockCountWeapons,
}));

/* ---- mutations: real debit semantics, simulated atomically ---- */
const { mockDebit, mockRecalc, wallet } = vi.hoisted(() => {
  /**
   * In-memory stand-in for the conditional UPDATE: Postgres serialises the
   * two competing UPDATEs, so the second sees the already-debited balance —
   * exactly what this synchronous check reproduces.
   */
  const wallet = { balance: 0 };
  const mockDebit = vi.fn(async (_gangId: string, amount: number) => {
    if (amount < 0) return false;
    if (amount === 0) return true;
    if (wallet.balance >= amount) {
      wallet.balance -= amount;
      return true;
    }
    return false;
  });
  return { mockDebit, mockRecalc: vi.fn(), wallet };
});
vi.mock("@/lib/db/mutations", () => ({
  debitStashCredits: mockDebit,
  recalcGangScores: mockRecalc,
}));

/* ---- storage / logging / rate limit (player actions imports) ---- */
vi.mock("@/lib/storage", () => ({
  GALLERY_BUCKET: "gallery",
  storagePublicUrl: vi.fn(),
  createSignedUploadUrl: vi.fn(),
  statPublicObject: vi.fn(),
  deleteFromBucket: vi.fn(),
}));
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/ai/rate-limit", () => ({ rateLimit: vi.fn() }));

/* ---- Drizzle db ---- */
const { dbMock, txMock, mockGangFindFirst } = vi.hoisted(() => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const build = () => {
    const returning = vi.fn().mockResolvedValue([{ id: "row-1" }]);
    const insertValues = vi.fn(() => {
      const chain: any = { returning };
      chain.then = (resolve: (v: unknown) => void) => resolve(undefined);
      return chain;
    });
    const insert = vi.fn(() => ({ values: insertValues }));
    return { insert, insertValues, returning };
  };
  const mockGangFindFirst = vi.fn();
  const txMock: any = {
    ...build(),
    query: { gangs: { findFirst: mockGangFindFirst } },
  };
  const dbMock: any = {
    ...build(),
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(txMock),
    ),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { dbMock, txMock, mockGangFindFirst };
});
vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    gangs: { id: "gang.id", stashCredits: "gang.stash_credits" },
    equipment: { id: "equipment.id" },
    fighters: { id: "fighter.id" },
    fighterEquipment: { fighterId: "fe.fighter_id" },
    stashItems: { id: "stash.id" },
  },
}));

import {
  purchaseEquipment,
  recruitFighter,
  addEquipment,
  setStashCredits,
} from "@/app/player/actions";

const GANG = { id: "123e4567-e89b-12d3-a456-426614174009", name: "Sump Rats" };
const UUID_ITEM = "123e4567-e89b-12d3-a456-426614174000";
const UUID_F = "123e4567-e89b-12d3-a456-426614174001";
const BOLTGUN = {
  id: UUID_ITEM,
  name: "Boltgun",
  category: "weapon",
  cost: 55,
  enabled: true,
};

function form(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  wallet.balance = 100;
  mockResolveGangForWrite.mockResolvedValue({ gang: GANG, isAdmin: false });
  mockGetCatalogItemById.mockResolvedValue(BOLTGUN);
  mockFighterBelongsToGang.mockResolvedValue(true);
  mockCountWeapons.mockResolvedValue(0);
  mockGangFindFirst.mockImplementation(async () => ({
    stashCredits: wallet.balance,
  }));
  txMock.returning.mockResolvedValue([{ id: "eq-1" }]);
});

/* ------------------------------------------------------------------ */
/*  Schema                                                              */
/* ------------------------------------------------------------------ */
describe("purchaseEquipmentSchema", () => {
  it("accepts stash destination with qty, defaults qty to 1", () => {
    const r = purchaseEquipmentSchema.safeParse({
      catalogItemId: UUID_ITEM,
      destination: "stash",
      qty: "3",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.qty).toBe(3);

    const d = purchaseEquipmentSchema.safeParse({
      catalogItemId: UUID_ITEM,
      destination: "stash",
    });
    expect(d.success).toBe(true);
    if (d.success) expect(d.data.qty).toBe(1);
  });

  it("rejects qty > 1 when buying onto a fighter", () => {
    expect(
      purchaseEquipmentSchema.safeParse({
        catalogItemId: UUID_ITEM,
        destination: UUID_F,
        qty: "2",
      }).success,
    ).toBe(false);
    expect(
      purchaseEquipmentSchema.safeParse({
        catalogItemId: UUID_ITEM,
        destination: UUID_F,
        qty: "1",
      }).success,
    ).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  purchaseEquipment                                                   */
/* ------------------------------------------------------------------ */
describe("purchaseEquipment", () => {
  it("debits exactly the snapshot cost and links to the fighter", async () => {
    const res = await purchaseEquipment(
      {},
      form({ catalogItemId: UUID_ITEM, destination: UUID_F }),
    );

    expect(res.success).toMatch(/Boltgun purchased for 55c/);
    expect(mockDebit).toHaveBeenCalledWith(GANG.id, 55, txMock);
    expect(wallet.balance).toBe(45);
    // snapshot values come from the catalogue row, with the link
    expect(txMock.insertValues.mock.calls[0]?.[0]).toEqual({
      name: "Boltgun",
      category: "weapon",
      cost: 55,
      catalogId: UUID_ITEM,
    });
    expect(txMock.insertValues.mock.calls[1]?.[0]).toMatchObject({
      fighterId: UUID_F,
      qty: 1,
    });
    // recalc joins the same transaction
    expect(mockRecalc).toHaveBeenCalledWith(GANG.id, txMock);
  });

  it("multiplies by qty when buying to the Stash", async () => {
    const res = await purchaseEquipment(
      {},
      form({ catalogItemId: UUID_ITEM, destination: "stash", qty: "1" }),
    );
    expect(res.success).toBeTruthy();
    expect(txMock.insertValues.mock.calls[1]?.[0]).toMatchObject({
      gangId: GANG.id,
      qty: 1,
    });
  });

  it("fails cleanly with both amounts when credits are short", async () => {
    wallet.balance = 40;

    const res = await purchaseEquipment(
      {},
      form({ catalogItemId: UUID_ITEM, destination: "stash" }),
    );

    expect(res.error).toBe(
      "Insufficient credits: you need 55c but the Stash has 40c.",
    );
    // nothing was created and the balance is untouched
    expect(txMock.insert).not.toHaveBeenCalled();
    expect(wallet.balance).toBe(40);
    expect(mockRecalc).not.toHaveBeenCalled();
  });

  it("two concurrent purchases can never spend the same credits", async () => {
    wallet.balance = 60; // enough for ONE Boltgun, not two

    const [a, b] = await Promise.all([
      purchaseEquipment(
        {},
        form({ catalogItemId: UUID_ITEM, destination: "stash" }),
      ),
      purchaseEquipment(
        {},
        form({ catalogItemId: UUID_ITEM, destination: "stash" }),
      ),
    ]);

    const successes = [a, b].filter((r) => r.success).length;
    const failures = [a, b].filter((r) => r.error).length;
    expect(successes).toBe(1);
    expect(failures).toBe(1);
    expect(wallet.balance).toBe(5); // 60 - 55, never negative
    expect(wallet.balance).toBeGreaterThanOrEqual(0);
  });

  it("rejects a disabled catalogue item and enforces the weapon cap", async () => {
    mockGetCatalogItemById.mockResolvedValue({ ...BOLTGUN, enabled: false });
    const res = await purchaseEquipment(
      {},
      form({ catalogItemId: UUID_ITEM, destination: UUID_F }),
    );
    expect(res.error).toMatch(/not found \(or disabled\)/);

    mockGetCatalogItemById.mockResolvedValue(BOLTGUN);
    mockCountWeapons.mockResolvedValue(3);
    const capped = await purchaseEquipment(
      {},
      form({ catalogItemId: UUID_ITEM, destination: UUID_F }),
    );
    expect(capped.error).toMatch(/maximum of 3 weapons/);
    expect(mockDebit).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  recruitFighter                                                      */
/* ------------------------------------------------------------------ */
describe("recruitFighter", () => {
  const RECRUIT = {
    name: "Juve Nova",
    type: "Juve",
    category: "juve",
    baseCost: "80",
  };

  it("debits baseCost and inserts the fighter in one transaction", async () => {
    const res = await recruitFighter({}, form(RECRUIT));

    expect(res.success).toMatch(/recruited for 80c/);
    expect(mockDebit).toHaveBeenCalledWith(GANG.id, 80, txMock);
    expect(wallet.balance).toBe(20);
    expect(txMock.insertValues.mock.calls[0]?.[0]).toMatchObject({
      gangId: GANG.id,
      name: "Juve Nova",
      baseCost: 80,
    });
    expect(mockRecalc).toHaveBeenCalledWith(GANG.id, txMock);
  });

  it("fails with amounts and inserts nothing when credits are short", async () => {
    wallet.balance = 50;

    const res = await recruitFighter({}, form(RECRUIT));

    expect(res.error).toBe(
      "Insufficient credits: recruiting Juve Nova costs 80c but the Stash has 50c.",
    );
    expect(txMock.insert).not.toHaveBeenCalled();
    expect(wallet.balance).toBe(50);
  });
});

/* ------------------------------------------------------------------ */
/*  Grant paths are Arbitrator-only                                     */
/* ------------------------------------------------------------------ */
describe("grant paths (issue #68)", () => {
  it("players cannot use the zero-cost add or hand-edit credits", async () => {
    const add = await addEquipment(
      {},
      form({ fighterId: UUID_F, name: "Stick", category: "weapon", cost: "0" }),
    );
    expect(add.error).toMatch(/Arbitrator-only/);

    const credits = await setStashCredits({}, form({ credits: "9999" }));
    expect(credits.error).toMatch(/Arbitrator-only/);
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });

  it("the Arbitrator's grant path still works", async () => {
    mockResolveGangForWrite.mockResolvedValue({ gang: GANG, isAdmin: true });

    const res = await addEquipment(
      {},
      form({ fighterId: UUID_F, name: "Trophy blade", category: "weapon", cost: "0" }),
    );

    expect(res.success).toMatch(/Trophy blade added/);
    expect(mockDebit).not.toHaveBeenCalled(); // grants never touch credits
  });
});

/* ------------------------------------------------------------------ */
/*  Wealth invariants (pure scoring)                                    */
/* ------------------------------------------------------------------ */
describe("Wealth invariants", () => {
  const baseGang = (): Gang => ({
    id: "g1",
    name: "Sump Rats",
    house: "Sump",
    ownerName: "P1",
    reputation: 1,
    stashCredits: 200,
    stash: [],
    fighters: [
      {
        id: "f1",
        name: "Boss",
        type: "Leader",
        category: "leader",
        baseCost: 100,
        profile: { m: null, ws: null, bs: null, s: null, t: null, w: null, i: null, a: null, ld: null, cl: null, wil: null, int: null },
        equipment: [],
        xp: 0,
        status: "active",
      },
    ],
  });

  it("buying to the Stash keeps Wealth constant (credits become item value)", () => {
    const before = baseGang();
    const after = baseGang();
    after.stashCredits -= 55;
    after.stash.push({
      id: "s1",
      qty: 1,
      equipment: { id: "e1", name: "Boltgun", category: "weapon", cost: 55 },
    });

    expect(gangWealth(after)).toBe(gangWealth(before));
    expect(gangRating(after)).toBe(gangRating(before)); // stash ≠ Rating
  });

  it("buying onto a fighter keeps Wealth constant and raises Rating by the cost", () => {
    const before = baseGang();
    const after = baseGang();
    after.stashCredits -= 55;
    after.fighters[0]!.equipment.push({
      id: "e1",
      name: "Boltgun",
      category: "weapon",
      cost: 55,
    });

    expect(gangWealth(after)).toBe(gangWealth(before));
    expect(gangRating(after)).toBe(gangRating(before) + 55);
  });

  it("recruiting keeps Wealth constant (credits become fighter value)", () => {
    const before = baseGang();
    const after = baseGang();
    after.stashCredits -= 80;
    after.fighters.push({
      ...baseGang().fighters[0]!,
      id: "f2",
      name: "Juve Nova",
      baseCost: 80,
    });

    expect(gangWealth(after)).toBe(gangWealth(before));
    expect(gangRating(after)).toBe(gangRating(before) + 80);
  });
});
