/**
 * Three-weapon cap tests ("Equipping a Fighter", Core Rulebook 2023, p.83).
 *
 * A fighter can carry at most MAX_WEAPONS_PER_FIGHTER weapons. The cap is
 * enforced on BOTH paths that put equipment on a fighter: addEquipment
 * (new item) and equipFromStash (moving a stashed weapon). Non-weapon
 * categories are never blocked by the cap.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_WEAPONS_PER_FIGHTER } from "@/lib/campaign-rules";

/* ---- next/cache ---- */
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/* ---- Auth guard ---- */
vi.mock("@/lib/auth/guards", () => ({
  requireUser: vi.fn().mockResolvedValue({ id: "user-1" }),
}));

/* ---- Query helpers ---- */
const {
  mockGetGangByOwnerId,
  mockFighterBelongsToGang,
  mockStashItemBelongsToGang,
  mockCountFighterWeapons,
} = vi.hoisted(() => ({
  mockGetGangByOwnerId: vi.fn(),
  mockFighterBelongsToGang: vi.fn(),
  mockStashItemBelongsToGang: vi.fn(),
  mockCountFighterWeapons: vi.fn(),
}));
vi.mock("@/lib/db/queries", () => ({
  getGangByOwnerId: mockGetGangByOwnerId,
  getGangById: vi.fn(),
  fighterBelongsToGang: mockFighterBelongsToGang,
  stashItemBelongsToGang: mockStashItemBelongsToGang,
  countFighterWeapons: mockCountFighterWeapons,
}));

/* ---- recalc ---- */
const { mockRecalc } = vi.hoisted(() => ({ mockRecalc: vi.fn() }));
vi.mock("@/lib/db/mutations", () => ({ recalcGangScores: mockRecalc }));

/* ---- Drizzle db ---- */
const { txMock, dbMock, mockTransaction, mockStashFindFirst } = vi.hoisted(
  () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const build = () => {
      const returning = vi.fn().mockResolvedValue([{ id: "row-1" }]);
      const insertValues = vi.fn(() => {
        const chain: any = { returning };
        chain.then = (resolve: (v: unknown) => void) => resolve(undefined);
        return chain;
      });
      const insert = vi.fn(() => ({ values: insertValues }));
      const updateWhere = vi.fn().mockResolvedValue(undefined);
      const updateSet = vi.fn(() => ({ where: updateWhere }));
      const update = vi.fn(() => ({ set: updateSet }));
      const deleteWhere = vi.fn().mockResolvedValue(undefined);
      const del = vi.fn(() => ({ where: deleteWhere }));
      return { insert, insertValues, returning, update, updateSet, updateWhere, delete: del, deleteWhere };
    };
    const txMock: any = build();
    const mockStashFindFirst = vi.fn();
    const mockTransaction = vi.fn(
      async (fn: (tx: unknown) => Promise<unknown>) => fn(txMock),
    );
    const dbMock: any = {
      ...build(),
      transaction: mockTransaction,
      query: { stashItems: { findFirst: mockStashFindFirst } },
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */
    return { txMock, dbMock, mockTransaction, mockStashFindFirst };
  },
);
vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    fighters: { id: "fighters.id" },
    equipment: { id: "equipment.id" },
    fighterEquipment: { fighterId: "fe.fighter_id", equipmentId: "fe.equipment_id" },
    stashItems: { id: "stash.id" },
  },
}));

import { addEquipment, equipFromStash } from "@/app/player/actions";

const GANG = { id: "gang-1", name: "Iron Reapers" };
const UUID_F = "123e4567-e89b-12d3-a456-426614174000";
const UUID_S = "987fcdeb-51a2-43d7-b012-0987654321ab";

function form(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetGangByOwnerId.mockResolvedValue(GANG);
  mockFighterBelongsToGang.mockResolvedValue(true);
  mockStashItemBelongsToGang.mockResolvedValue(true);
  txMock.returning.mockResolvedValue([{ id: "row-1" }]);
});

describe("weapon cap — addEquipment", () => {
  const weapon = { fighterId: UUID_F, name: "Boltgun", category: "weapon", cost: "55" };

  it(`blocks the ${MAX_WEAPONS_PER_FIGHTER + 1}th weapon with the rule reference`, async () => {
    mockCountFighterWeapons.mockResolvedValue(MAX_WEAPONS_PER_FIGHTER);

    const res = await addEquipment({}, form(weapon));

    expect(res.error).toBe(
      `A fighter can carry a maximum of ${MAX_WEAPONS_PER_FIGHTER} weapons (Core Rulebook, p.83).`,
    );
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("allows a weapon below the cap", async () => {
    mockCountFighterWeapons.mockResolvedValue(MAX_WEAPONS_PER_FIGHTER - 1);

    const res = await addEquipment({}, form(weapon));

    expect(res.success).toBeTruthy();
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  it("never blocks non-weapon categories (cap is weapons-only)", async () => {
    mockCountFighterWeapons.mockResolvedValue(99);

    const res = await addEquipment(
      {},
      form({ ...weapon, category: "wargear" }),
    );

    expect(res.success).toBeTruthy();
    // the cap query is not even consulted for non-weapons
    expect(mockCountFighterWeapons).not.toHaveBeenCalled();
  });
});

describe("weapon cap — equipFromStash", () => {
  const payload = { stashItemId: UUID_S, fighterId: UUID_F };

  it("blocks moving a stashed weapon onto a fighter at the cap", async () => {
    mockCountFighterWeapons.mockResolvedValue(MAX_WEAPONS_PER_FIGHTER);
    mockStashFindFirst.mockResolvedValue({
      qty: 1,
      equipmentId: "eq-1",
      equipment: { id: "eq-1", name: "Lasgun", category: "weapon", cost: 15 },
    });

    const res = await equipFromStash({}, form(payload));

    expect(res.error).toBe(
      `A fighter can carry a maximum of ${MAX_WEAPONS_PER_FIGHTER} weapons (Core Rulebook, p.83).`,
    );
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("allows moving non-weapon items regardless of the weapon count", async () => {
    mockCountFighterWeapons.mockResolvedValue(99);
    mockStashFindFirst.mockResolvedValue({
      qty: 1,
      equipmentId: "eq-2",
      equipment: { id: "eq-2", name: "Respirator", category: "wargear", cost: 15 },
    });

    const res = await equipFromStash({}, form(payload));

    expect(res.success).toBeTruthy();
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });
});
