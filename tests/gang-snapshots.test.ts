/**
 * Per-cycle gang snapshots (issue #70) — snapshotCampaignGangs.
 * Verifies the cached-score read, the Sympathiser count, the UPSERT on
 * (gang, cycle) (idempotency: re-running refreshes, never duplicates) and
 * the dbc contract (joins the caller's transaction).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { txMock, dbMock } = vi.hoisted(() => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const build = () => {
    const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined);
    const insertValues = vi.fn(() => ({ onConflictDoUpdate }));
    const insert = vi.fn(() => ({ values: insertValues }));
    return { insert, insertValues, onConflictDoUpdate };
  };
  const txMock: any = {
    ...build(),
    query: {
      gangs: { findMany: vi.fn() },
      sympathiserControl: { findMany: vi.fn() },
    },
  };
  const dbMock: any = {
    ...build(),
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(txMock),
    ),
    query: {
      gangs: { findMany: vi.fn() },
      sympathiserControl: { findMany: vi.fn() },
    },
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { txMock, dbMock };
});

vi.mock("@/lib/db/queries", () => ({ getGangById: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    gangs: { id: "gangs.id", campaignId: "gangs.campaign_id" },
    sympathiserControl: { gangId: "sc.gang_id", isCurrent: "sc.is_current" },
    gangSnapshots: {
      gangId: "gs.gang_id",
      cycle: "gs.cycle",
    },
  },
}));

import { snapshotCampaignGangs } from "@/lib/db/mutations";

const GANGS = [
  { id: "gang-a", ratingCached: 1500, wealthCached: 1800, reputation: 5 },
  { id: "gang-b", ratingCached: 900, wealthCached: 950, reputation: 2 },
];

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.query.gangs.findMany.mockResolvedValue(GANGS);
  dbMock.query.sympathiserControl.findMany.mockResolvedValue([
    { gangId: "gang-a" },
    { gangId: "gang-a" },
    { gangId: null },
  ]);
  txMock.query.gangs.findMany.mockResolvedValue(GANGS);
  txMock.query.sympathiserControl.findMany.mockResolvedValue([]);
});

describe("snapshotCampaignGangs", () => {
  it("writes one row per gang with cached scores and Sympathiser counts", async () => {
    await snapshotCampaignGangs("camp-1", 3);

    expect(dbMock.insertValues).toHaveBeenCalledWith([
      {
        gangId: "gang-a",
        campaignId: "camp-1",
        cycle: 3,
        rating: 1500,
        wealth: 1800,
        reputation: 5,
        sympathiserCount: 2,
      },
      {
        gangId: "gang-b",
        campaignId: "camp-1",
        cycle: 3,
        rating: 900,
        wealth: 950,
        reputation: 2,
        sympathiserCount: 0,
      },
    ]);
  });

  it("UPSERTS on (gang, cycle) — re-running refreshes instead of duplicating", async () => {
    await snapshotCampaignGangs("camp-1", 3);

    const arg = dbMock.onConflictDoUpdate.mock.calls[0]![0];
    expect(arg.target).toEqual(["gs.gang_id", "gs.cycle"]);
    expect(Object.keys(arg.set)).toEqual(
      expect.arrayContaining([
        "rating",
        "wealth",
        "reputation",
        "sympathiserCount",
      ]),
    );
  });

  it("does nothing when the campaign has no gangs", async () => {
    dbMock.query.gangs.findMany.mockResolvedValue([]);
    await snapshotCampaignGangs("camp-1", 1);
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it("joins the caller's transaction handle (never the root client)", async () => {
    await snapshotCampaignGangs("camp-1", 2, txMock);
    expect(txMock.insert).toHaveBeenCalledTimes(1);
    expect(dbMock.insert).not.toHaveBeenCalled();
  });
});
