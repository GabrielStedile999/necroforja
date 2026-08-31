/**
 * Full captive flow (issue #86) — Core Rulebook 2023, p.142–144.
 *
 * All three resolutions are ARBITRATOR-ONLY and transactional, recalc BOTH
 * gangs, and leave an append-only captive_event row (name snapshotted —
 * selling deletes the fighter). sellCaptive prices the captive
 * server-side (equipment + advancements), defaults to half rounded up to
 * 5s and clamps overrides at the FULL value; the DELETE is guarded on the
 * captured status (type-to-confirm like deleteGang). ransomCaptive moves
 * the agreed credits conditionally from either payer (insufficient funds
 * fail cleanly, a lost return race rolls the debit back). releaseCaptive
 * returns the fighter for free.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { captiveReturnPayment } from "@/lib/campaign-rules";

/* ---- next/cache + auth ---- */
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: vi.fn(),
  requireUser: vi.fn(),
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
const { mockRecalc, mockDebitStash } = vi.hoisted(() => ({
  mockRecalc: vi.fn(),
  mockDebitStash: vi.fn(),
}));
vi.mock("@/lib/db/queries", () => ({
  getActiveCampaign: vi.fn(),
  getLatestCampaign: vi.fn(),
  getCatalogItemById: vi.fn(),
  fighterBelongsToGang: vi.fn(),
  stashItemBelongsToGang: vi.fn(),
  countFighterWeapons: vi.fn(),
}));
vi.mock("@/lib/db/mutations", () => ({
  recalcGangScores: mockRecalc,
  debitStashCredits: mockDebitStash,
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
    const insertValues = vi.fn().mockResolvedValue(undefined);
    const insert = vi.fn(() => ({ values: insertValues }));
    const deleteReturning = vi.fn().mockResolvedValue([]);
    const deleteWhere = vi.fn(() => ({ returning: deleteReturning }));
    const del = vi.fn(() => ({ where: deleteWhere }));
    return {
      update, updateSet, updateWhere, updateReturning,
      insert, insertValues,
      delete: del, deleteWhere, deleteReturning,
    };
  };
  const txMock: any = {
    ...build(),
    query: { fighters: { findFirst: vi.fn() } },
  };
  const dbMock: any = {
    ...build(),
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(txMock),
    ),
    query: { fighters: { findFirst: vi.fn() } },
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { dbMock, txMock };
});
vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    gangs: { id: "gang.id", stashCredits: "gang.stash_credits" },
    fighters: {
      id: "fighter.id",
      gangId: "fighter.gang_id",
      status: "fighter.status",
    },
    captiveEvents: { id: "ce.id" },
  },
}));

import {
  sellCaptive,
  ransomCaptive,
  releaseCaptive,
} from "@/app/player/actions";

const CAPTOR = { id: "123e4567-e89b-12d3-a456-426614174001", name: "Sump Rats" };
const OWNER_GANG = "123e4567-e89b-12d3-a456-426614174002";
const UUID_F = "123e4567-e89b-12d3-a456-426614174009";

/** A captive of the OWNER gang, held by the CAPTOR: value 100+25+10 = 135. */
const CAPTIVE = {
  id: UUID_F,
  name: "Ratchet",
  gangId: OWNER_GANG,
  status: "captured",
  baseCost: 100,
  capturedByGangId: CAPTOR.id,
  equipment: [{ equipment: { cost: 25 } }],
  advancements: [{ creditIncrease: 10 }],
};

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  fd.set("gangId", CAPTOR.id);
  fd.set("fighterId", UUID_F);
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockResolveGangForWrite.mockResolvedValue({ gang: CAPTOR, isAdmin: true });
  txMock.query.fighters.findFirst.mockResolvedValue({ ...CAPTIVE });
  // mockReset drops leftover mockResolvedValueOnce queues between tests
  txMock.updateReturning.mockReset().mockResolvedValue([{ id: UUID_F }]);
  txMock.deleteReturning.mockReset().mockResolvedValue([{ id: UUID_F }]);
  mockDebitStash.mockResolvedValue(true);
});

/* ------------------------------------------------------------------ */
/*  Authorisation                                                      */
/* ------------------------------------------------------------------ */
describe("captive resolutions are Arbitrator-only", () => {
  it("players cannot sell, ransom or release", async () => {
    mockResolveGangForWrite.mockResolvedValue({ gang: CAPTOR, isAdmin: false });

    for (const run of [
      () => sellCaptive({}, form({ amount: "70", confirmName: "Ratchet" })),
      () => ransomCaptive({}, form({ amount: "50", payer: "owner" })),
      () => releaseCaptive({}, form({})),
    ]) {
      const res = await run();
      expect(res.error).toContain("Arbitrator");
    }
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  sellCaptive                                                        */
/* ------------------------------------------------------------------ */
describe("sellCaptive", () => {
  it("credits the captor, deletes the fighter (guarded) and logs the snapshot", async () => {
    // value 135 → book price = half rounded up to 5s = 70
    expect(captiveReturnPayment(135)).toBe(70);

    const res = await sellCaptive(
      {},
      form({ amount: "70", confirmName: "Ratchet" }),
    );

    expect(res.success).toContain("70c");
    expect(txMock.delete).toHaveBeenCalledTimes(1);
    expect(txMock.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ stashCredits: expect.anything() }),
    );
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        captorGangId: CAPTOR.id,
        ownerGangId: OWNER_GANG,
        fighterId: null,
        fighterName: "Ratchet",
        kind: "sold",
        amount: 70,
      }),
    );
    // BOTH gangs recalculated through the tx
    expect(mockRecalc).toHaveBeenCalledWith(CAPTOR.id, txMock);
    expect(mockRecalc).toHaveBeenCalledWith(OWNER_GANG, txMock);
  });

  it("requires the exact name to confirm (destructive)", async () => {
    const res = await sellCaptive(
      {},
      form({ amount: "70", confirmName: "ratchet " }),
    );

    expect(res.error).toContain("exactly");
    expect(txMock.delete).not.toHaveBeenCalled();
  });

  it("clamps the override at the fighter's FULL value", async () => {
    const res = await sellCaptive(
      {},
      form({ amount: "140", confirmName: "Ratchet" }),
    );

    expect(res.error).toContain("full value (135c)");
    expect(txMock.delete).not.toHaveBeenCalled();

    // full value itself is allowed (bounty / Slave Guild boon)
    const ok = await sellCaptive(
      {},
      form({ amount: "135", confirmName: "Ratchet" }),
    );
    expect(ok.success).toContain("135c");
  });

  it("refuses a fighter that is not a captive held by this gang", async () => {
    txMock.query.fighters.findFirst.mockResolvedValue({
      ...CAPTIVE,
      capturedByGangId: OWNER_GANG, // held by someone else
    });

    const res = await sellCaptive(
      {},
      form({ amount: "70", confirmName: "Ratchet" }),
    );

    expect(res.error).toContain("not a captive held by this gang");
    expect(txMock.delete).not.toHaveBeenCalled();
  });

  it("a lost status race writes nothing (guarded DELETE missed)", async () => {
    txMock.deleteReturning.mockResolvedValue([]);

    const res = await sellCaptive(
      {},
      form({ amount: "70", confirmName: "Ratchet" }),
    );

    expect(res.error).toContain("already resolved");
    expect(txMock.update).not.toHaveBeenCalled();
    expect(txMock.insert).not.toHaveBeenCalled();
    expect(mockRecalc).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  ransomCaptive                                                      */
/* ------------------------------------------------------------------ */
describe("ransomCaptive", () => {
  it("owner pays the captor: conditional debit, credit, guarded return, positive log", async () => {
    const res = await ransomCaptive({}, form({ amount: "50", payer: "owner" }));

    expect(res.success).toContain("50c");
    expect(mockDebitStash).toHaveBeenCalledWith(OWNER_GANG, 50, txMock);
    expect(txMock.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ stashCredits: expect.anything() }),
    );
    expect(txMock.updateSet).toHaveBeenCalledWith({
      status: "active",
      capturedByGangId: null,
    });
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "ransomed", amount: 50 }),
    );
    expect(mockRecalc).toHaveBeenCalledWith(CAPTOR.id, txMock);
    expect(mockRecalc).toHaveBeenCalledWith(OWNER_GANG, txMock);
  });

  it("reverse trade: the captor pays and the log goes negative", async () => {
    const res = await ransomCaptive({}, form({ amount: "30", payer: "captor" }));

    expect(res.success).toBeTruthy();
    expect(mockDebitStash).toHaveBeenCalledWith(CAPTOR.id, 30, txMock);
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "ransomed", amount: -30 }),
    );
  });

  it("an insufficient Stash refuses cleanly — nothing is written", async () => {
    mockDebitStash.mockResolvedValue(false);

    const res = await ransomCaptive({}, form({ amount: "500", payer: "owner" }));

    expect(res.error).toContain("500c");
    expect(txMock.update).not.toHaveBeenCalled();
    expect(txMock.insert).not.toHaveBeenCalled();
    expect(mockRecalc).not.toHaveBeenCalled();
  });

  it("a lost return race AFTER the debit rolls the transfer back", async () => {
    // the receiver credit never calls .returning(); the only consumer is
    // the guarded return — make it miss
    txMock.updateReturning.mockResolvedValueOnce([]);

    const res = await ransomCaptive({}, form({ amount: "50", payer: "owner" }));

    expect(res.error).toContain("already resolved");
    expect(mockRecalc).not.toHaveBeenCalled();
  });

  it("validates the amount (at least 5 credits)", async () => {
    const res = await ransomCaptive({}, form({ amount: "0", payer: "owner" }));
    expect(res.error).toBeTruthy();
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  releaseCaptive                                                     */
/* ------------------------------------------------------------------ */
describe("releaseCaptive", () => {
  it("returns the fighter for free and logs amount 0", async () => {
    const res = await releaseCaptive({}, form({}));

    expect(res.success).toContain("released");
    expect(txMock.updateSet).toHaveBeenCalledWith({
      status: "active",
      capturedByGangId: null,
    });
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "released", amount: 0 }),
    );
    expect(mockRecalc).toHaveBeenCalledWith(CAPTOR.id, txMock);
    expect(mockRecalc).toHaveBeenCalledWith(OWNER_GANG, txMock);
  });

  it("a lost status race fails cleanly", async () => {
    txMock.updateReturning.mockResolvedValue([]);

    const res = await releaseCaptive({}, form({}));

    expect(res.error).toContain("already resolved");
    expect(txMock.insert).not.toHaveBeenCalled();
  });
});
