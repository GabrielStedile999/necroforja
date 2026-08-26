/**
 * Gang allegiances (issue #82).
 *
 * setGangAllegiance: a player declares ONCE (Unaligned → side, any time);
 * switching a declared side is Arbitrator-only; every change appends an
 * allegiance_change row stamped with the campaign cycle, atomically with
 * the gang update.
 *
 * resolveChallenge: the winner's allegiance is SNAPSHOTTED on the
 * challenge row at resolution time — later re-declarations never rewrite
 * the civil-war score. Draw/declined stamp null.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

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

/* ---- queries / mutations ---- */
const { mockGetActiveCampaign } = vi.hoisted(() => ({
  mockGetActiveCampaign: vi.fn(),
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
  debitStashCredits: vi.fn(),
  recalcGangScores: vi.fn(),
  setSympathiserController: vi.fn(),
  clearSympathiserController: vi.fn(),
  advanceCampaignCycle: vi.fn(),
  applyDowntimeEffects: vi.fn(),
  applyBattleEvent: vi.fn(),
  snapshotCampaignGangs: vi.fn(),
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
    const updateSet = vi.fn(() => ({
      where: vi.fn().mockResolvedValue(undefined),
    }));
    const update = vi.fn(() => ({ set: updateSet }));
    const insertValues = vi.fn().mockResolvedValue(undefined);
    const insert = vi.fn(() => ({ values: insertValues }));
    return { update, updateSet, insert, insertValues };
  };
  const txMock: any = {
    ...build(),
    query: {
      gangs: { findFirst: vi.fn() },
    },
  };
  const dbMock: any = {
    ...build(),
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(txMock),
    ),
    query: {
      gangs: { findFirst: vi.fn() },
      campaigns: { findFirst: vi.fn() },
      challenges: { findFirst: vi.fn() },
    },
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { dbMock, txMock };
});
vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    gangs: { id: "gang.id", campaignId: "gang.campaign_id", allegiance: "gang.allegiance" },
    campaigns: { id: "campaign.id" },
    challenges: { id: "challenge.id" },
    allegianceChanges: { gangId: "ac.gang_id" },
  },
}));

import { setGangAllegiance } from "@/app/player/actions";
import { resolveChallenge } from "@/app/admin/campaign/actions";

const GANG_A = "123e4567-e89b-12d3-a456-426614174001";
const GANG_B = "123e4567-e89b-12d3-a456-426614174002";
const CHALLENGE = "123e4567-e89b-12d3-a456-426614174010";

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.query.gangs.findFirst.mockResolvedValue({ campaignId: "camp-1" });
  dbMock.query.campaigns.findFirst.mockResolvedValue({ currentCycle: 4 });
});

/* ------------------------------------------------------------------ */
/*  setGangAllegiance                                                  */
/* ------------------------------------------------------------------ */
describe("setGangAllegiance", () => {
  it("a player declares a side while Unaligned — update + cycle-stamped log, atomically", async () => {
    mockResolveGangForWrite.mockResolvedValue({
      gang: { id: GANG_A, name: "Sump Rats", allegiance: "unaligned" },
      isAdmin: false,
    });

    const res = await setGangAllegiance(
      {},
      form({ gangId: GANG_A, allegiance: "rebellion" }),
    );

    expect(res.success).toContain("Rebellion");
    expect(dbMock.transaction).toHaveBeenCalledTimes(1);
    expect(txMock.updateSet).toHaveBeenCalledWith({ allegiance: "rebellion" });
    expect(txMock.insertValues).toHaveBeenCalledWith({
      gangId: GANG_A,
      allegiance: "rebellion",
      cycle: 4,
    });
  });

  it("a declared side is FINAL for players", async () => {
    mockResolveGangForWrite.mockResolvedValue({
      gang: { id: GANG_A, name: "Sump Rats", allegiance: "imperial_house" },
      isAdmin: false,
    });

    const res = await setGangAllegiance(
      {},
      form({ gangId: GANG_A, allegiance: "rebellion" }),
    );

    expect(res.error).toContain("final");
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });

  it("the Arbitrator can switch any side (correction)", async () => {
    mockResolveGangForWrite.mockResolvedValue({
      gang: { id: GANG_A, name: "Sump Rats", allegiance: "imperial_house" },
      isAdmin: true,
    });

    const res = await setGangAllegiance(
      {},
      form({ gangId: GANG_A, allegiance: "unaligned" }),
    );

    expect(res.success).toContain("Unaligned");
    expect(txMock.updateSet).toHaveBeenCalledWith({ allegiance: "unaligned" });
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ allegiance: "unaligned" }),
    );
  });

  it("re-declaring the same side is a no-op error", async () => {
    mockResolveGangForWrite.mockResolvedValue({
      gang: { id: GANG_A, name: "Sump Rats", allegiance: "rebellion" },
      isAdmin: true,
    });

    const res = await setGangAllegiance(
      {},
      form({ gangId: GANG_A, allegiance: "rebellion" }),
    );

    expect(res.error).toContain("already");
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });

  it("rejects an unknown allegiance at validation", async () => {
    mockResolveGangForWrite.mockResolvedValue({
      gang: { id: GANG_A, name: "Sump Rats", allegiance: "unaligned" },
      isAdmin: false,
    });

    const res = await setGangAllegiance(
      {},
      form({ gangId: GANG_A, allegiance: "chaos" }),
    );

    expect(res.error).toBeTruthy();
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  resolveChallenge — winner-allegiance snapshot                      */
/* ------------------------------------------------------------------ */
describe("resolveChallenge snapshots the winner's allegiance", () => {
  beforeEach(() => {
    mockGetActiveCampaign.mockResolvedValue({
      id: "camp-1",
      currentCycle: 2,
    });
    dbMock.query.challenges.findFirst.mockResolvedValue({
      id: CHALLENGE,
      challengerGangId: GANG_A,
      challengedGangId: GANG_B,
      sympathiserId: null,
      resolved: false,
    });
  });

  it("stamps the winner's CURRENT allegiance at resolution time", async () => {
    txMock.query.gangs.findFirst.mockResolvedValue({
      allegiance: "rebellion",
    });

    const res = await resolveChallenge(
      {},
      form({ challengeId: CHALLENGE, outcome: "challenger_win" }),
    );

    expect(res.success).toBe("Challenge resolved.");
    expect(txMock.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        resolved: true,
        winnerAllegiance: "rebellion",
      }),
    );
  });

  it("a draw stamps null (no winner, no side scores)", async () => {
    const res = await resolveChallenge(
      {},
      form({ challengeId: CHALLENGE, outcome: "draw" }),
    );

    expect(res.success).toBe("Challenge resolved.");
    expect(txMock.query.gangs.findFirst).not.toHaveBeenCalled();
    expect(txMock.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ winnerAllegiance: null }),
    );
  });

  it("a missing winner row degrades to null instead of failing", async () => {
    txMock.query.gangs.findFirst.mockResolvedValue(undefined);

    const res = await resolveChallenge(
      {},
      form({ challengeId: CHALLENGE, outcome: "challenged_win" }),
    );

    expect(res.success).toBe("Challenge resolved.");
    expect(txMock.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ winnerAllegiance: null }),
    );
  });
});
