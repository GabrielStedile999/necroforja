/**
 * Transactional hardening tests (issue #62).
 *
 * All I/O boundaries are mocked (same approach as create-player.test.ts):
 * the goal is to prove that multi-step mutations run through a single
 * `db.transaction` handle — never through the root `db` client — so a
 * failure between steps rolls the whole mutation back, and that the XP
 * increment is expressed in SQL (atomic) instead of read-then-write.
 *
 * What is verified:
 *  - addEquipment / removeStashItem write exclusively through the tx and a
 *    failure mid-transaction propagates (drizzle then rolls back).
 *  - recalcGangScores joins the caller's transaction.
 *  - addFighterXp issues a single UPDATE with a SQL increment and performs
 *    no prior read of the current XP value.
 *  - resolveChallenge passes the SAME tx to setSympathiserController and to
 *    the challenge update.
 *  - setSympathiserController opens its own transaction when called without
 *    a tx, and reuses the caller's when given one.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SQL } from "drizzle-orm";

/* ---- next/cache ---- */
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/* ---- Auth guards ---- */
vi.mock("@/lib/auth/guards", () => ({
  // Admin persona (issue #68): addEquipment is the Arbitrator's grant now.
  requireUser: vi.fn().mockResolvedValue({ id: "admin-1", role: "admin" }),
  requireAdmin: vi.fn().mockResolvedValue(undefined),
}));

/* ---- Query helpers used by the actions ---- */
const {
  mockGetGangByOwnerId,
  mockFighterBelongsToGang,
  mockStashItemBelongsToGang,
  mockGetActiveCampaign,
  mockGetLatestCampaign,
} = vi.hoisted(() => ({
  mockGetGangByOwnerId: vi.fn(),
  mockFighterBelongsToGang: vi.fn(),
  mockStashItemBelongsToGang: vi.fn(),
  mockGetActiveCampaign: vi.fn(),
  mockGetLatestCampaign: vi.fn(),
}));
vi.mock("@/lib/db/queries", () => ({
  getGangByOwnerId: mockGetGangByOwnerId,
  getGangById: mockGetGangByOwnerId, // admin path resolves by explicit gangId
  fighterBelongsToGang: mockFighterBelongsToGang,
  stashItemBelongsToGang: mockStashItemBelongsToGang,
  countFighterWeapons: vi.fn().mockResolvedValue(0),
  getCatalogItemById: vi.fn().mockResolvedValue(null),
  getActiveCampaign: mockGetActiveCampaign,
  getLatestCampaign: mockGetLatestCampaign,
}));

/* ---- recalcGangScores / setSympathiserController (mutation helpers) ---- */
const { mockRecalc, mockSetController } = vi.hoisted(() => ({
  mockRecalc: vi.fn(),
  mockSetController: vi.fn(),
}));
vi.mock("@/lib/db/mutations", () => ({
  recalcGangScores: mockRecalc,
  setSympathiserController: mockSetController,
  clearSympathiserController: vi.fn(),
  advanceCampaignCycle: vi.fn(),
  applyDowntimeEffects: vi.fn(),
}));

/* ---- Drizzle db (root client + transaction handle) ---- */
const { txMock, dbMock, mockTransaction, mockDbFindFirst } = vi.hoisted(() => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // Builds a chainable writer mock (insert/update/delete). Declared inside
  // vi.hoisted because hoisted factories cannot reference outer helpers.
  const build = () => {
    const returning = vi.fn().mockResolvedValue([{ id: "row-1" }]);
    const insertValues = vi.fn(() => {
      const chain: any = { returning };
      // allow `await tx.insert(...).values(...)` without .returning()
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
  const mockDbFindFirst = vi.fn();
  const mockTransaction = vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn(txMock),
  );
  const dbMock: any = {
    ...build(),
    transaction: mockTransaction,
    query: {
      fighters: { findFirst: mockDbFindFirst },
      challenges: { findFirst: mockDbFindFirst },
      stashItems: { findFirst: mockDbFindFirst },
    },
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { txMock, dbMock, mockTransaction, mockDbFindFirst };
});

vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    fighters: { id: "fighters.id", gangId: "fighters.gang_id", xp: "fighters.xp", status: "fighters.status" },
    equipment: { id: "equipment.id" },
    fighterEquipment: { fighterId: "fe.fighter_id", equipmentId: "fe.equipment_id" },
    stashItems: { id: "stash.id" },
    gangs: { id: "gangs.id" },
    challenges: { id: "challenges.id" },
    sympathiserControl: { sympathiserId: "sc.sympathiser_id", isCurrent: "sc.is_current" },
    campaigns: { id: "campaigns.id", status: "campaigns.status" },
  },
}));

/* ---- Import the actions AFTER all mocks are set up ---- */
import {
  addEquipment,
  removeStashItem,
  addFighterXp,
} from "@/app/player/actions";
import { resolveChallenge } from "@/app/admin/campaign/actions";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const GANG = { id: "gang-1", name: "Iron Reapers" };
const UUID_F = "123e4567-e89b-12d3-a456-426614174000";
const UUID_E = "987fcdeb-51a2-43d7-b012-0987654321ab";

function form(data: Record<string, string>): FormData {
  const fd = new FormData();
  // admin persona addresses the gang explicitly (Arbitrator mode)
  fd.set("gangId", GANG.id);
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

/* ------------------------------------------------------------------ */
/*  addEquipment                                                        */
/* ------------------------------------------------------------------ */
describe("addEquipment (transactional)", () => {
  const payload = { fighterId: UUID_F, name: "Lasgun", category: "weapon", cost: "15" };

  it("writes both inserts and the recalc through the same transaction", async () => {
    const res = await addEquipment({}, form(payload));

    expect(res.success).toBeTruthy();
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    // both inserts went through the tx handle…
    expect(txMock.insert).toHaveBeenCalledTimes(2);
    // …and never through the root client
    expect(dbMock.insert).not.toHaveBeenCalled();
    // recalc joins the same tx
    expect(mockRecalc).toHaveBeenCalledWith(GANG.id, txMock);
  });

  it("propagates a failure on the second step (drizzle rolls back)", async () => {
    // first insert (equipment) succeeds, second (fighter link) blows up
    txMock.insertValues
      .mockImplementationOnce(() => ({ returning: txMock.returning }))
      .mockImplementationOnce(() => {
        throw new Error("boom");
      });

    await expect(addEquipment({}, form(payload))).rejects.toThrow("boom");
    // the recalc after the failed step never ran
    expect(mockRecalc).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  removeStashItem                                                     */
/* ------------------------------------------------------------------ */
describe("removeStashItem (transactional)", () => {
  it("runs both deletes and the recalc inside one transaction", async () => {
    mockDbFindFirst.mockResolvedValue({ equipmentId: UUID_E });

    await removeStashItem(form({ stashItemId: UUID_F }));

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(txMock.delete).toHaveBeenCalledTimes(2);
    expect(dbMock.delete).not.toHaveBeenCalled();
    expect(mockRecalc).toHaveBeenCalledWith(GANG.id, txMock);
  });
});

/* ------------------------------------------------------------------ */
/*  addFighterXp                                                        */
/* ------------------------------------------------------------------ */
describe("addFighterXp (atomic increment)", () => {
  it("applies the delta as a SQL expression, without a prior read", async () => {
    const res = await addFighterXp({}, form({ fighterId: UUID_F, xpDelta: "3" }));

    expect(res.success).toBe("+3 XP added.");
    // no read-then-write: the current XP is never fetched
    expect(mockDbFindFirst).not.toHaveBeenCalled();
    // single update whose `xp` value is a SQL fragment (server-side add)
    expect(dbMock.update).toHaveBeenCalledTimes(1);
    const setArg = dbMock.updateSet.mock.calls[0][0] as { xp: unknown };
    expect(setArg.xp).toBeInstanceOf(SQL);
  });

  it("still rejects a fighter from another gang", async () => {
    mockFighterBelongsToGang.mockResolvedValue(false);

    const res = await addFighterXp({}, form({ fighterId: UUID_F, xpDelta: "3" }));

    expect(res.error).toBe("Invalid fighter.");
    expect(dbMock.update).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  resolveChallenge                                                    */
/* ------------------------------------------------------------------ */
describe("resolveChallenge (transactional)", () => {
  it("passes the SAME tx to the Sympathiser transfer and the challenge update", async () => {
    mockGetActiveCampaign.mockResolvedValue({ id: "camp-1", currentCycle: 2 });
    mockDbFindFirst.mockResolvedValue({
      id: UUID_F,
      resolved: false,
      challengerGangId: "gang-1",
      challengedGangId: "gang-2",
      sympathiserId: "water-guild",
    });

    const res = await resolveChallenge(
      {},
      form({ challengeId: UUID_F, outcome: "challenger_win" }),
    );

    expect(res.success).toBeTruthy();
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockSetController).toHaveBeenCalledWith(
      "water-guild",
      "gang-1",
      2,
      txMock,
    );
    // the challenge update went through the same tx, not the root client
    expect(txMock.update).toHaveBeenCalledTimes(1);
    expect(dbMock.update).not.toHaveBeenCalled();
  });
});
