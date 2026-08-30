/**
 * Complete Downtime (issue #83) — Cinderak Burning, p.61, steps A–E.
 *
 * Rules half (pure): captor compensation = half the captive's value rounded
 * UP to 5s; Juve → Ganger / Prospect → Champion at 5+ Advancements (4 or
 * fewer untouched; other categories never promoted).
 *
 * Mutation half (I/O mocked): applyDowntimeEffects values the captive
 * BEFORE releasing, credits the captor, resets statuses, promotes, logs
 * every effect and recalculates every touched gang — all through ONE
 * transaction handle. grantFreshRecruitment is one-shot per campaign via a
 * conditional UPDATE (`fresh_recruitment_at is null`) and writes nothing
 * when the claim fails.
 *
 * Action half: grantFreshRecruitment (server action) refuses before
 * Downtime and relays the mutation's outcome.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  captiveReturnPayment,
  downtimePromotion,
  DOWNTIME_PROMOTION_ADVANCEMENTS,
  FRESH_RECRUITMENT_CREDITS,
} from "@/lib/campaign-rules";

/* ---- next/cache + auth ---- */
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: "admin-1", role: "admin" }),
  requireUser: vi.fn(),
}));

/* ---- queries (mutations import getGangById; the action imports campaigns) ---- */
const { mockGetGangById, mockGetActiveCampaign } = vi.hoisted(() => ({
  mockGetGangById: vi.fn(),
  mockGetActiveCampaign: vi.fn(),
}));
vi.mock("@/lib/db/queries", () => ({
  getGangById: mockGetGangById,
  getActiveCampaign: mockGetActiveCampaign,
  getLatestCampaign: vi.fn(),
}));

/* ---- Drizzle db ---- */
const { txMock, dbMock, mockTransaction } = vi.hoisted(() => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const build = () => {
    const insertValues = vi.fn().mockResolvedValue(undefined);
    const insert = vi.fn(() => ({ values: insertValues }));
    // where() is awaitable (plain updates) AND chains .returning()
    const updateReturning = vi.fn().mockResolvedValue([]);
    const updateWhere = vi.fn(() => {
      const chain: any = { returning: updateReturning };
      chain.then = (resolve: (v: unknown) => void) => resolve(undefined);
      return chain;
    });
    const updateSet = vi.fn(() => ({ where: updateWhere }));
    const update = vi.fn(() => ({ set: updateSet }));
    return { insert, insertValues, update, updateSet, updateWhere, updateReturning };
  };
  const queries = () => ({
    gangs: { findMany: vi.fn() },
    campaigns: { findFirst: vi.fn() },
    fighters: { findMany: vi.fn() },
  });
  const txMock: any = { ...build(), query: queries() };
  const mockTransaction = vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn(txMock),
  );
  const dbMock: any = { ...build(), transaction: mockTransaction, query: queries() };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { txMock, dbMock, mockTransaction };
});
vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    gangs: {
      id: "gangs.id",
      campaignId: "gangs.campaign_id",
      isActive: "gangs.is_active",
      stashCredits: "gangs.stash_credits",
    },
    fighters: {
      id: "fighters.id",
      name: "fighters.name",
      gangId: "fighters.gang_id",
      status: "fighters.status",
      category: "fighters.category",
    },
    campaigns: {
      id: "campaigns.id",
      currentCycle: "campaigns.current_cycle",
      freshRecruitmentAt: "campaigns.fresh_recruitment_at",
    },
    downtimeEvents: {},
  },
}));

import {
  applyDowntimeEffects,
  grantFreshRecruitment,
} from "@/lib/db/mutations";
import { grantFreshRecruitment as grantFreshRecruitmentAction } from "@/app/admin/campaign/actions";

const CAMPAIGN = "123e4567-e89b-12d3-a456-426614174000";
const GANG_A = "gang-a";
const GANG_B = "gang-b";

/** A "gang" as getGangById returns it — enough for recalcGangScores. */
const domainGang = { id: GANG_A, stashCredits: 0, stash: [], fighters: [], reputation: 1 };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetGangById.mockResolvedValue(domainGang);
  txMock.query.campaigns.findFirst.mockResolvedValue({ currentCycle: 4 });
  txMock.query.gangs.findMany.mockResolvedValue([{ id: GANG_A }, { id: GANG_B }]);
  txMock.query.fighters.findMany.mockResolvedValue([]);
  txMock.updateReturning.mockResolvedValue([]);
});

/* ------------------------------------------------------------------ */
/*  Pure rules                                                          */
/* ------------------------------------------------------------------ */
describe("captiveReturnPayment — half the value, rounded up to 5s", () => {
  it("rounds up to the nearest 5 credits", () => {
    expect(captiveReturnPayment(130)).toBe(65);
    expect(captiveReturnPayment(135)).toBe(70); // 67.5 → 70
    expect(captiveReturnPayment(137)).toBe(70); // 68.5 → 70
    expect(captiveReturnPayment(141)).toBe(75); // 70.5 → 75
    expect(captiveReturnPayment(1)).toBe(5);
  });

  it("pays nothing for a worthless or invalid value", () => {
    expect(captiveReturnPayment(0)).toBe(0);
    expect(captiveReturnPayment(-40)).toBe(0);
    expect(captiveReturnPayment(Number.NaN)).toBe(0);
  });
});

describe("downtimePromotion — 5+ Advancements", () => {
  it("promotes Juve → Ganger and Prospect → Champion at exactly the threshold", () => {
    expect(DOWNTIME_PROMOTION_ADVANCEMENTS).toBe(5);
    expect(downtimePromotion("juve", 5)).toBe("ganger");
    expect(downtimePromotion("prospect", 5)).toBe("champion");
    expect(downtimePromotion("juve", 9)).toBe("ganger");
  });

  it("leaves 4 or fewer untouched, and never promotes other categories", () => {
    expect(downtimePromotion("juve", 4)).toBeNull();
    expect(downtimePromotion("prospect", 0)).toBeNull();
    expect(downtimePromotion("ganger", 12)).toBeNull();
    expect(downtimePromotion("leader", 12)).toBeNull();
    expect(downtimePromotion("champion", 12)).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/*  applyDowntimeEffects                                                */
/* ------------------------------------------------------------------ */
describe("applyDowntimeEffects", () => {
  it("pays the captor half the captive's value (rounded to 5s), releases the captive and logs both sides", async () => {
    // A: nobody in recovery. B: one captive of gang A, held by gang B.
    txMock.updateReturning
      .mockResolvedValueOnce([]) // recovery reset → no rows
      .mockResolvedValueOnce([{ id: GANG_B }]); // captor credit landed
    txMock.query.fighters.findMany
      .mockResolvedValueOnce([
        {
          id: "f-1",
          name: "Ratchet",
          gangId: GANG_A,
          baseCost: 100,
          capturedByGangId: GANG_B,
          // 100 + 25 + 10 = 135 → half 67.5 → 70
          equipment: [{ equipment: { cost: 25 } }],
          advancements: [{ creditIncrease: 10 }],
        },
      ])
      .mockResolvedValueOnce([]); // no promotion candidates

    const summary = await applyDowntimeEffects(CAMPAIGN);

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(summary.returned).toEqual([
      {
        fighterId: "f-1",
        fighterName: "Ratchet",
        gangId: GANG_A,
        captorGangId: GANG_B,
        paid: 70,
      },
    ]);
    // captor Stash credit + captive reset, both through the tx
    expect(txMock.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ stashCredits: expect.anything() }),
    );
    expect(txMock.updateSet).toHaveBeenCalledWith({
      status: "active",
      capturedByGangId: null,
    });
    expect(dbMock.update).not.toHaveBeenCalled();
    // log: captive_returned on the owner, captor_paid on the captor
    expect(txMock.insertValues).toHaveBeenCalledWith([
      expect.objectContaining({ kind: "captive_returned", gangId: GANG_A, fighterId: "f-1", amount: 70 }),
      expect.objectContaining({ kind: "captor_paid", gangId: GANG_B, fighterId: "f-1", amount: 70 }),
    ]);
    // both gangs recalculated through the tx
    expect(mockGetGangById).toHaveBeenCalledWith(GANG_A, txMock);
    expect(mockGetGangById).toHaveBeenCalledWith(GANG_B, txMock);
  });

  it("releases a captive with no captor on record without paying anyone", async () => {
    txMock.query.fighters.findMany
      .mockResolvedValueOnce([
        {
          id: "f-2",
          name: "Nobody",
          gangId: GANG_A,
          baseCost: 80,
          capturedByGangId: null,
          equipment: [],
          advancements: [],
        },
      ])
      .mockResolvedValueOnce([]);

    const summary = await applyDowntimeEffects(CAMPAIGN);

    expect(summary.returned[0]).toMatchObject({ captorGangId: null, paid: 0 });
    expect(txMock.updateSet).not.toHaveBeenCalledWith(
      expect.objectContaining({ stashCredits: expect.anything() }),
    );
    expect(txMock.insertValues).toHaveBeenCalledWith([
      expect.objectContaining({ kind: "captive_returned", amount: 0 }),
    ]);
  });

  it("promotes Juves/Prospects with 5+ advancements and leaves 4 untouched", async () => {
    txMock.query.fighters.findMany
      .mockResolvedValueOnce([]) // no captives
      .mockResolvedValueOnce([
        { id: "j-5", name: "Sprog", gangId: GANG_A, category: "juve", advancements: new Array(5).fill({ id: "x" }) },
        { id: "j-4", name: "Runt", gangId: GANG_A, category: "juve", advancements: new Array(4).fill({ id: "x" }) },
        { id: "p-6", name: "Aspirant", gangId: GANG_B, category: "prospect", advancements: new Array(6).fill({ id: "x" }) },
      ]);

    const summary = await applyDowntimeEffects(CAMPAIGN);

    expect(summary.promoted).toEqual([
      { fighterId: "j-5", fighterName: "Sprog", gangId: GANG_A, from: "juve", to: "ganger" },
      { fighterId: "p-6", fighterName: "Aspirant", gangId: GANG_B, from: "prospect", to: "champion" },
    ]);
    expect(txMock.updateSet).toHaveBeenCalledWith({ category: "ganger" });
    expect(txMock.updateSet).toHaveBeenCalledWith({ category: "champion" });
    // exactly two category writes — "Runt" (4) is never touched
    const categoryWrites = txMock.updateSet.mock.calls.filter(
      (c: unknown[]) => (c[0] as { category?: string }).category !== undefined,
    );
    expect(categoryWrites).toHaveLength(2);
    expect(txMock.insertValues).toHaveBeenCalledWith([
      expect.objectContaining({ kind: "fighter_promoted", fighterId: "j-5", notes: "juve → ganger" }),
      expect.objectContaining({ kind: "fighter_promoted", fighterId: "p-6", notes: "prospect → champion" }),
    ]);
  });

  it("logs recovered fighters and writes no log row when nothing happened", async () => {
    txMock.updateReturning.mockResolvedValueOnce([
      { id: "f-9", name: "Patch", gangId: GANG_B },
    ]);

    const summary = await applyDowntimeEffects(CAMPAIGN);
    expect(summary.recovered).toEqual([
      { fighterId: "f-9", fighterName: "Patch", gangId: GANG_B },
    ]);
    expect(txMock.insertValues).toHaveBeenCalledWith([
      expect.objectContaining({ kind: "fighter_recovered", fighterId: "f-9", gangId: GANG_B, cycle: 4 }),
    ]);

    vi.clearAllMocks();
    txMock.query.campaigns.findFirst.mockResolvedValue({ currentCycle: 4 });
    txMock.query.gangs.findMany.mockResolvedValue([{ id: GANG_A }]);
    txMock.query.fighters.findMany.mockResolvedValue([]);
    txMock.updateReturning.mockResolvedValue([]);
    mockGetGangById.mockResolvedValue(domainGang);

    await applyDowntimeEffects(CAMPAIGN);
    expect(txMock.insert).not.toHaveBeenCalled();
  });

  it("joins the caller's transaction when one is given", async () => {
    await applyDowntimeEffects(CAMPAIGN, txMock);
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(txMock.query.campaigns.findFirst).toHaveBeenCalledTimes(1);
  });
});

/* ------------------------------------------------------------------ */
/*  grantFreshRecruitment (mutation)                                    */
/* ------------------------------------------------------------------ */
describe("grantFreshRecruitment (mutation)", () => {
  it("credits every active gang once, logs and recalculates in one transaction", async () => {
    txMock.updateReturning.mockResolvedValueOnce([{ currentCycle: 4 }]); // claim won

    const res = await grantFreshRecruitment(CAMPAIGN);

    expect(res).toEqual({ ok: true, gangs: 2, credits: FRESH_RECRUITMENT_CREDITS });
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    // claim → credit → (log) → recalc ×2
    expect(txMock.updateSet).toHaveBeenNthCalledWith(1, { freshRecruitmentAt: expect.anything() });
    expect(txMock.updateSet).toHaveBeenNthCalledWith(2, { stashCredits: expect.anything() });
    expect(txMock.insertValues).toHaveBeenCalledWith([
      { campaignId: CAMPAIGN, cycle: 4, gangId: GANG_A, kind: "fresh_recruitment", amount: 250 },
      { campaignId: CAMPAIGN, cycle: 4, gangId: GANG_B, kind: "fresh_recruitment", amount: 250 },
    ]);
    expect(mockGetGangById).toHaveBeenCalledWith(GANG_A, txMock);
    expect(mockGetGangById).toHaveBeenCalledWith(GANG_B, txMock);
    expect(dbMock.update).not.toHaveBeenCalled();
  });

  it("is one-shot: a lost claim (already granted) writes nothing else", async () => {
    txMock.updateReturning.mockResolvedValueOnce([]); // fresh_recruitment_at already set

    const res = await grantFreshRecruitment(CAMPAIGN);

    expect(res).toEqual({ ok: false, error: expect.stringContaining("already") });
    expect(txMock.update).toHaveBeenCalledTimes(1); // the claim only
    expect(txMock.insert).not.toHaveBeenCalled();
    expect(mockGetGangById).not.toHaveBeenCalled();
  });

  it("refuses before writing when there is no active gang", async () => {
    txMock.query.gangs.findMany.mockResolvedValue([]);

    const res = await grantFreshRecruitment(CAMPAIGN);

    expect(res).toEqual({ ok: false, error: expect.stringContaining("No active gangs") });
    expect(txMock.update).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  grantFreshRecruitment (server action)                               */
/* ------------------------------------------------------------------ */
describe("grantFreshRecruitment (action)", () => {
  const form = (campaignId: string) => {
    const fd = new FormData();
    fd.set("campaignId", campaignId);
    return fd;
  };

  it("refuses during the Great Darkness (Downtime not reached)", async () => {
    mockGetActiveCampaign.mockResolvedValue({ id: CAMPAIGN, phase: "great_darkness" });

    const res = await grantFreshRecruitmentAction({}, form(CAMPAIGN));

    expect(res.error).toContain("Downtime");
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("refuses a campaign id that is not the active campaign", async () => {
    mockGetActiveCampaign.mockResolvedValue({ id: "other", phase: "downtime" });

    const res = await grantFreshRecruitmentAction({}, form(CAMPAIGN));

    expect(res.error).toBe("No active campaign.");
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("relays the grant and reports the gangs paid", async () => {
    mockGetActiveCampaign.mockResolvedValue({ id: CAMPAIGN, phase: "downtime" });
    txMock.updateReturning.mockResolvedValueOnce([{ currentCycle: 4 }]);

    const res = await grantFreshRecruitmentAction({}, form(CAMPAIGN));

    expect(res.success).toContain("250c credited to 2 active gangs");
  });

  it("relays the one-shot refusal", async () => {
    mockGetActiveCampaign.mockResolvedValue({ id: CAMPAIGN, phase: "spark_of_rebellion" });
    txMock.updateReturning.mockResolvedValueOnce([]);

    const res = await grantFreshRecruitmentAction({}, form(CAMPAIGN));

    expect(res.error).toContain("already granted");
  });
});
