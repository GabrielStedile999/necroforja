/**
 * Sympathiser Boons (issue #85) — Cinderak Burning p.65–76.
 *
 * Pure half: the SYMPATHISER_BOONS config carries dice labels and flags
 * for every catalogue entry (never rule prose — summaries live in the
 * private DB) and sympathiserIncomeDice stacks base + Spark income.
 *
 * Action half (I/O mocked): collectSympathiserIncome is Arbitrator-only,
 * Spark-phase-only, gated on CURRENT control, and ONE-SHOT per (gang,
 * sympathiser, cycle) — the ledger insert goes first with
 * onConflictDoNothing, so a conflict writes nothing. clearRecoveryBoon
 * needs control of a Sympathiser granting it and a fighter actually in
 * recovery (status guarded in the WHERE). homeSupportRecruit is Spark-only
 * and one per (gang, cycle) — a lost guard race rolls the fighter back.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SYMPATHISERS,
  SYMPATHISER_BOONS,
  sympathiserIncomeDice,
  DEEP_POCKETS_DICE,
  HOME_SUPPORT_RECRUIT,
} from "@/lib/data/sympathisers";

/* ---- next/cache + auth ---- */
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
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

/* ---- queries / mutations ---- */
const { mockGetActiveCampaign, mockRecalc } = vi.hoisted(() => ({
  mockGetActiveCampaign: vi.fn(),
  mockRecalc: vi.fn(),
}));
vi.mock("@/lib/db/queries", () => ({
  getActiveCampaign: mockGetActiveCampaign,
  getLatestCampaign: vi.fn(),
  getCatalogItemById: vi.fn(),
  fighterBelongsToGang: vi.fn(),
  stashItemBelongsToGang: vi.fn(),
  countFighterWeapons: vi.fn(),
}));
vi.mock("@/lib/db/mutations", () => ({
  recalcGangScores: mockRecalc,
  debitStashCredits: vi.fn(),
  setSympathiserController: vi.fn(),
  clearSympathiserController: vi.fn(),
  advanceCampaignCycle: vi.fn(),
  applyDowntimeEffects: vi.fn(),
  applyBattleEvent: vi.fn(),
  snapshotCampaignGangs: vi.fn(),
  grantFreshRecruitment: vi.fn(),
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
const { dbMock, txMock } = vi.hoisted(() => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const build = () => {
    const updateReturning = vi.fn().mockResolvedValue([]);
    const updateWhere = vi.fn(() => {
      const chain: any = { returning: updateReturning };
      chain.then = (resolve: (v: unknown) => void) => resolve(undefined);
      return chain;
    });
    const updateSet = vi.fn(() => ({ where: updateWhere }));
    const update = vi.fn(() => ({ set: updateSet }));
    const insertReturning = vi.fn().mockResolvedValue([]);
    const insertValues = vi.fn(() => {
      const chain: any = {
        onConflictDoNothing: () => ({ returning: insertReturning }),
        returning: insertReturning,
      };
      chain.then = (resolve: (v: unknown) => void) => resolve(undefined);
      return chain;
    });
    const insert = vi.fn(() => ({ values: insertValues }));
    return { update, updateSet, updateWhere, updateReturning, insert, insertValues, insertReturning };
  };
  const queries = () => ({
    gangs: { findFirst: vi.fn() },
    campaigns: { findFirst: vi.fn() },
    fighters: { findFirst: vi.fn() },
    sympathiserControl: { findFirst: vi.fn(), findMany: vi.fn() },
  });
  const txMock: any = { ...build(), query: queries() };
  const dbMock: any = {
    ...build(),
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(txMock),
    ),
    query: queries(),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { dbMock, txMock };
});
vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    gangs: {
      id: "gang.id",
      campaignId: "gang.campaign_id",
      stashCredits: "gang.stash_credits",
      isActive: "gang.is_active",
    },
    fighters: {
      id: "fighter.id",
      gangId: "fighter.gang_id",
      status: "fighter.status",
    },
    campaigns: { id: "campaign.id" },
    sympathiserControl: {
      sympathiserId: "sc.sympathiser_id",
      gangId: "sc.gang_id",
      isCurrent: "sc.is_current",
    },
    sympathiserIncome: { id: "si.id" },
    homeSupportRecruits: { id: "hsr.id" },
  },
}));

import { collectSympathiserIncome } from "@/app/admin/campaign/actions";
import {
  clearRecoveryBoon,
  homeSupportRecruit,
} from "@/app/player/actions";

const CAMPAIGN = "123e4567-e89b-12d3-a456-426614174000";
const GANG = { id: "123e4567-e89b-12d3-a456-426614174009", name: "Sump Rats" };
const UUID_F = "123e4567-e89b-12d3-a456-426614174001";

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockResolveGangForWrite.mockResolvedValue({ gang: GANG, isAdmin: false });
  mockGetActiveCampaign.mockResolvedValue({
    id: CAMPAIGN,
    phase: "spark_of_rebellion",
    currentCycle: 5,
  });
  dbMock.query.gangs.findFirst.mockResolvedValue({
    id: GANG.id,
    name: GANG.name,
    isActive: true,
    campaignId: CAMPAIGN,
  });
  dbMock.query.campaigns.findFirst.mockResolvedValue({
    currentCycle: 5,
    phase: "spark_of_rebellion",
    status: "active",
  });
  dbMock.query.sympathiserControl.findFirst.mockResolvedValue({ id: "ctl-1" });
  dbMock.query.sympathiserControl.findMany.mockResolvedValue([]);
  txMock.query.fighters.findFirst.mockResolvedValue(undefined);
  txMock.updateReturning.mockResolvedValue([]);
  txMock.insertReturning.mockResolvedValue([]);
});

/* ------------------------------------------------------------------ */
/*  Pure — boon config                                                 */
/* ------------------------------------------------------------------ */
describe("sympathiser boon config (p.65–76 — numbers only)", () => {
  it("covers every Sympathiser in the catalogue", () => {
    for (const s of SYMPATHISERS) {
      expect(SYMPATHISER_BOONS[s.id], s.id).toBeDefined();
    }
    expect(Object.keys(SYMPATHISER_BOONS)).toHaveLength(SYMPATHISERS.length);
  });

  it("carries no rule prose — only dice labels and flags", () => {
    for (const [id, cfg] of Object.entries(SYMPATHISER_BOONS)) {
      for (const label of [cfg.baseIncome, cfg.sparkIncome]) {
        if (label !== null) {
          expect(label, id).toMatch(/^\d?D\d(x\d+)?$/i);
        }
      }
    }
  });

  it("stacks base + Spark income and returns nothing outside the phase", () => {
    expect(sympathiserIncomeDice("water-guild", "spark_of_rebellion")).toEqual([
      "2D6x10",
    ]);
    expect(sympathiserIncomeDice("water-guild", "great_darkness")).toEqual([]);
    // Guild of Coin pays always AND extra in Spark
    expect(
      sympathiserIncomeDice("guild-of-coin", "spark_of_rebellion"),
    ).toEqual(["D6x10", "2D6x10"]);
    expect(sympathiserIncomeDice("guild-of-coin", "great_darkness")).toEqual([
      "D6x10",
    ]);
    // Venators pay in XP, not credits — nothing to collect
    expect(sympathiserIncomeDice("venator", "spark_of_rebellion")).toEqual([]);
    expect(sympathiserIncomeDice("unknown", "spark_of_rebellion")).toEqual([]);
  });

  it("keeps the Water Guild roster effect and the fixed side constants", () => {
    expect(SYMPATHISER_BOONS["water-guild"]!.rosterEffect).toBe(
      "clear_recovery",
    );
    expect(DEEP_POCKETS_DICE).toBe("D6x10");
    expect(HOME_SUPPORT_RECRUIT).toEqual({ dice: "2D6", threshold: 10 });
  });
});

/* ------------------------------------------------------------------ */
/*  collectSympathiserIncome                                           */
/* ------------------------------------------------------------------ */
describe("collectSympathiserIncome", () => {
  const collect = (fields: Record<string, string> = {}) =>
    collectSympathiserIncome(
      {},
      form({
        gangId: GANG.id,
        sympathiserId: "water-guild",
        amount: "70",
        ...fields,
      }),
    );

  it("credits the Stash once the guard row lands, atomically with the recalc", async () => {
    txMock.insertReturning.mockResolvedValueOnce([{ id: "row-1" }]);

    const res = await collect();

    expect(res.success).toContain("70c");
    expect(dbMock.transaction).toHaveBeenCalledTimes(1);
    expect(txMock.insertValues).toHaveBeenCalledWith({
      campaignId: CAMPAIGN,
      gangId: GANG.id,
      sympathiserId: "water-guild",
      cycle: 5,
      amount: 70,
    });
    expect(txMock.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ stashCredits: expect.anything() }),
    );
    expect(mockRecalc).toHaveBeenCalledWith(GANG.id, txMock);
  });

  it("is ONE-SHOT per (gang, sympathiser, cycle): a lost guard writes nothing", async () => {
    txMock.insertReturning.mockResolvedValueOnce([]); // unique conflict

    const res = await collect();

    expect(res.error).toContain("already collected");
    expect(txMock.update).not.toHaveBeenCalled();
    expect(mockRecalc).not.toHaveBeenCalled();
  });

  it("refuses outside the Spark of Rebellion phase", async () => {
    mockGetActiveCampaign.mockResolvedValue({
      id: CAMPAIGN,
      phase: "great_darkness",
      currentCycle: 2,
    });

    const res = await collect();

    expect(res.error).toContain("Spark of Rebellion");
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });

  it("refuses a gang that does not control the Sympathiser", async () => {
    dbMock.query.sympathiserControl.findFirst.mockResolvedValue(undefined);

    const res = await collect();

    expect(res.error).toContain("does not control");
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });

  it("refuses a Sympathiser with no credit income (paid at the table)", async () => {
    const res = await collect({ sympathiserId: "venator" });

    expect(res.error).toContain("no credit income");
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });

  it("validates the rolled amount (multiple of 10, within bounds)", async () => {
    expect((await collect({ amount: "45" })).error).toBeTruthy();
    expect((await collect({ amount: "400" })).error).toBeTruthy();
    expect((await collect({ amount: "0" })).error).toBeTruthy();
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  clearRecoveryBoon (Water Guild)                                    */
/* ------------------------------------------------------------------ */
describe("clearRecoveryBoon", () => {
  const clear = () =>
    clearRecoveryBoon({}, form({ gangId: GANG.id, fighterId: UUID_F }));

  it("clears a recovery when the gang controls a Sympathiser granting it", async () => {
    dbMock.query.sympathiserControl.findMany.mockResolvedValue([
      { sympathiserId: "water-guild" },
    ]);
    txMock.query.fighters.findFirst.mockResolvedValue({
      id: UUID_F,
      name: "Patch",
      status: "in_recovery",
    });
    txMock.updateReturning.mockResolvedValueOnce([{ id: UUID_F }]);

    const res = await clear();

    expect(res.success).toContain("Patch");
    expect(res.success).toContain("Water Guild");
    expect(txMock.updateSet).toHaveBeenCalledWith({ status: "active" });
    expect(mockRecalc).toHaveBeenCalledWith(GANG.id, txMock);
  });

  it("refuses without control of a clear-recovery Sympathiser", async () => {
    dbMock.query.sympathiserControl.findMany.mockResolvedValue([
      { sympathiserId: "guild-of-coin" }, // income boon, not recovery
    ]);

    const res = await clear();

    expect(res.error).toContain("Water Guild");
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });

  it("the status lives in the WHERE: a double submit fails cleanly", async () => {
    dbMock.query.sympathiserControl.findMany.mockResolvedValue([
      { sympathiserId: "water-guild" },
    ]);
    txMock.query.fighters.findFirst.mockResolvedValue({
      id: UUID_F,
      name: "Patch",
      status: "active", // already cleared by the first submit
    });
    txMock.updateReturning.mockResolvedValueOnce([]);

    const res = await clear();

    expect(res.error).toContain("not in recovery");
    expect(mockRecalc).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  homeSupportRecruit                                                 */
/* ------------------------------------------------------------------ */
describe("homeSupportRecruit", () => {
  const recruit = () =>
    homeSupportRecruit({}, form({ gangId: GANG.id, name: "Vex" }));

  it("adds a free Ganger once per cycle in the Spark phase", async () => {
    txMock.insertReturning
      .mockResolvedValueOnce([{ id: UUID_F }]) // fighter insert
      .mockResolvedValueOnce([{ id: "guard-1" }]); // guard row landed

    const res = await recruit();

    expect(res.success).toContain("Vex");
    expect(txMock.insertValues).toHaveBeenNthCalledWith(1, {
      gangId: GANG.id,
      name: "Vex",
      type: "Ganger",
      category: "ganger",
      baseCost: 0,
    });
    expect(txMock.insertValues).toHaveBeenNthCalledWith(2, {
      gangId: GANG.id,
      cycle: 5,
      fighterId: UUID_F,
    });
    expect(mockRecalc).toHaveBeenCalledWith(GANG.id, txMock);
  });

  it("a lost (gang, cycle) guard race rolls the fighter back", async () => {
    txMock.insertReturning
      .mockResolvedValueOnce([{ id: UUID_F }]) // fighter insert
      .mockResolvedValueOnce([]); // guard conflict

    const res = await recruit();

    expect(res.error).toContain("already recruited");
    expect(mockRecalc).not.toHaveBeenCalled();
  });

  it("refuses outside the Spark of Rebellion phase", async () => {
    dbMock.query.campaigns.findFirst.mockResolvedValue({
      currentCycle: 2,
      phase: "great_darkness",
      status: "active",
    });

    const res = await recruit();

    expect(res.error).toContain("Spark of Rebellion");
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });

  it("refuses without an active campaign", async () => {
    dbMock.query.campaigns.findFirst.mockResolvedValue({
      currentCycle: 5,
      phase: "spark_of_rebellion",
      status: "finished",
    });

    const res = await recruit();

    expect(res.error).toContain("No active campaign");
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });
});
