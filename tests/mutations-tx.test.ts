/**
 * Transaction behaviour of the mutation helpers (issue #62).
 *
 * Verifies the `dbc` contract added to lib/db/mutations.ts:
 *  - setSympathiserController opens its OWN transaction when called without
 *    a tx handle, and joins the caller's transaction when given one.
 *  - applyDowntimeEffects runs its status resets and every recalc through a
 *    single transaction.
 *  - recalcGangScores reads and writes through the handle it receives.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetGangById } = vi.hoisted(() => ({ mockGetGangById: vi.fn() }));
vi.mock("@/lib/db/queries", () => ({ getGangById: mockGetGangById }));

const { txMock, dbMock, mockTransaction } = vi.hoisted(() => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const build = () => {
    const insertValues = vi.fn().mockResolvedValue(undefined);
    const insert = vi.fn(() => ({ values: insertValues }));
    const updateWhere = vi.fn().mockResolvedValue(undefined);
    const updateSet = vi.fn(() => ({ where: updateWhere }));
    const update = vi.fn(() => ({ set: updateSet }));
    return { insert, insertValues, update, updateSet, updateWhere };
  };
  const txMock: any = {
    ...build(),
    query: { gangs: { findMany: vi.fn() } },
  };
  const mockTransaction = vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn(txMock),
  );
  const dbMock: any = {
    ...build(),
    transaction: mockTransaction,
    query: { gangs: { findMany: vi.fn() } },
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { txMock, dbMock, mockTransaction };
});

vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    gangs: { id: "gangs.id", campaignId: "gangs.campaign_id" },
    fighters: { gangId: "fighters.gang_id", status: "fighters.status" },
    sympathiserControl: {
      sympathiserId: "sc.sympathiser_id",
      isCurrent: "sc.is_current",
    },
    campaigns: { id: "campaigns.id" },
  },
}));

import {
  recalcGangScores,
  setSympathiserController,
  applyDowntimeEffects,
} from "@/lib/db/mutations";

const GANG = {
  id: "gang-1",
  stashCredits: 0,
  stash: [],
  fighters: [],
  reputation: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetGangById.mockResolvedValue(GANG);
});

describe("setSympathiserController", () => {
  it("opens its own transaction when called without a tx", async () => {
    await setSympathiserController("water-guild", "gang-1", 2);

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    // close + insert both went through the tx, never the root client
    expect(txMock.update).toHaveBeenCalledTimes(1);
    expect(txMock.insert).toHaveBeenCalledTimes(1);
    expect(dbMock.update).not.toHaveBeenCalled();
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it("joins the caller's transaction when one is given", async () => {
    await setSympathiserController("water-guild", "gang-1", 2, txMock);

    // no nested transaction is opened
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(txMock.update).toHaveBeenCalledTimes(1);
    expect(txMock.insert).toHaveBeenCalledTimes(1);
  });
});

describe("recalcGangScores", () => {
  it("reads and writes through the handle it receives", async () => {
    await recalcGangScores("gang-1", txMock);

    expect(mockGetGangById).toHaveBeenCalledWith("gang-1", txMock);
    expect(txMock.update).toHaveBeenCalledTimes(1);
    expect(dbMock.update).not.toHaveBeenCalled();
  });

  it("defaults to the root client when no handle is given", async () => {
    await recalcGangScores("gang-1");

    expect(mockGetGangById).toHaveBeenCalledWith("gang-1", dbMock);
    expect(dbMock.update).toHaveBeenCalledTimes(1);
  });
});

describe("applyDowntimeEffects", () => {
  it("runs status resets and every recalc inside one transaction", async () => {
    txMock.query.gangs.findMany.mockResolvedValue([
      { id: "gang-1" },
      { id: "gang-2" },
    ]);

    await applyDowntimeEffects("camp-1");

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    // 2 status resets + 2 recalc writes (one per gang), all through the tx
    expect(txMock.update).toHaveBeenCalledTimes(4);
    expect(dbMock.update).not.toHaveBeenCalled();
    expect(mockGetGangById).toHaveBeenNthCalledWith(1, "gang-1", txMock);
    expect(mockGetGangById).toHaveBeenNthCalledWith(2, "gang-2", txMock);
  });

  it("does nothing when the campaign has no gangs", async () => {
    txMock.query.gangs.findMany.mockResolvedValue([]);

    await applyDowntimeEffects("camp-1");

    expect(txMock.update).not.toHaveBeenCalled();
  });
});
