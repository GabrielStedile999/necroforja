/**
 * Medical Escort & fighter promotions (issue #84).
 *
 * Pure half: the PROMOTIONS config carries the official numbers (p.149 —
 * Specialist → Champion 12 XP +40c; Ganger → Specialist table-rolled, 0 XP
 * +20c) and their category semantics (Specialist stays category ganger).
 *
 * Action half (I/O mocked): promotions ride buyAdvancement — conditional
 * XP debit, guarded category change (a lost race rolls the debit back),
 * one-way Ganger → Specialist; medicalEscort debits the rolled 2D6x10 cost
 * conditionally and applies the rolled outcome atomically (died → dead;
 * stabilised / full recovery → in_recovery). The app never rolls dice.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PROMOTIONS } from "@/lib/data/advancements";

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

/* ---- Query helpers / mutations ---- */
const { mockRecalc, mockDebitStash } = vi.hoisted(() => ({
  mockRecalc: vi.fn(),
  mockDebitStash: vi.fn(),
}));
vi.mock("@/lib/db/queries", () => ({
  getCatalogItemById: vi.fn(),
  fighterBelongsToGang: vi.fn(),
  stashItemBelongsToGang: vi.fn(),
  countFighterWeapons: vi.fn(),
}));
vi.mock("@/lib/db/mutations", () => ({
  debitStashCredits: mockDebitStash,
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
const { dbMock, txMock } = vi.hoisted(() => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const build = () => {
    const updateReturning = vi.fn();
    const updateWhere = vi.fn(() => {
      const chain: any = { returning: updateReturning };
      chain.then = (resolve: (v: unknown) => void) => resolve(undefined);
      return chain;
    });
    const updateSet = vi.fn(() => ({ where: updateWhere }));
    const update = vi.fn(() => ({ set: updateSet }));
    const insertValues = vi.fn().mockResolvedValue(undefined);
    const insert = vi.fn(() => ({ values: insertValues }));
    return { update, updateSet, updateWhere, updateReturning, insert, insertValues };
  };
  const txMock: any = {
    ...build(),
    query: {
      fighters: { findFirst: vi.fn() },
      fighterAdvancements: { findMany: vi.fn(), findFirst: vi.fn() },
    },
  };
  const dbMock: any = {
    ...build(),
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(txMock),
    ),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { dbMock, txMock };
});
vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    gangs: { id: "gang.id" },
    fighters: {
      id: "fighter.id",
      gangId: "fighter.gang_id",
      xp: "fighter.xp",
      category: "fighter.category",
      status: "fighter.status",
      m: "fighter.m", ws: "fighter.ws", bs: "fighter.bs", s: "fighter.s",
      t: "fighter.t", w: "fighter.w", i: "fighter.i", a: "fighter.a",
      ld: "fighter.ld", cl: "fighter.cl", wil: "fighter.wil", int: "fighter.int",
    },
    fighterAdvancements: {
      fighterId: "fa.fighter_id",
      statKey: "fa.stat_key",
      kind: "fa.kind",
    },
  },
}));

import { buyAdvancement, medicalEscort } from "@/app/player/actions";

const GANG = { id: "123e4567-e89b-12d3-a456-426614174009", name: "Sump Rats" };
const UUID_F = "123e4567-e89b-12d3-a456-426614174001";

const FIGHTER = {
  id: UUID_F,
  name: "Grix",
  category: "ganger",
  status: "active",
  xp: 20,
  m: 5, ws: 4, bs: 4, s: 3, t: 3, w: 1, i: 4, a: 1,
  ld: 6, cl: 6, wil: 6, int: 6,
};

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  fd.set("gangId", GANG.id);
  fd.set("fighterId", UUID_F);
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockResolveGangForWrite.mockResolvedValue({ gang: GANG, isAdmin: false });
  txMock.query.fighters.findFirst.mockResolvedValue({ ...FIGHTER });
  txMock.query.fighterAdvancements.findMany.mockResolvedValue([]);
  txMock.query.fighterAdvancements.findFirst.mockResolvedValue(undefined);
  txMock.updateReturning.mockResolvedValue([{ id: UUID_F }]);
  mockDebitStash.mockResolvedValue(true);
});

/* ------------------------------------------------------------------ */
/*  Pure — promotion config                                            */
/* ------------------------------------------------------------------ */
describe("promotion config (p.149)", () => {
  it("carries the official numbers and category semantics", () => {
    expect(PROMOTIONS.specialist_to_champion).toMatchObject({
      xpCost: 12,
      creditIncrease: 40,
      fromCategory: "ganger",
      toCategory: "champion",
    });
    // Specialist is a Ganger flag in the book: no category change, 0 XP
    // (the 2D6 table roll happens at the table), +20c.
    expect(PROMOTIONS.ganger_to_specialist).toMatchObject({
      xpCost: 0,
      creditIncrease: 20,
      fromCategory: "ganger",
      toCategory: null,
    });
  });
});

/* ------------------------------------------------------------------ */
/*  buyAdvancement — promotions                                        */
/* ------------------------------------------------------------------ */
describe("buyAdvancement — promotions", () => {
  it("Specialist → Champion: debits 12 XP, changes the category (guarded) and records +40c", async () => {
    const res = await buyAdvancement(
      {},
      form({ kind: "promotion", promotion: "specialist_to_champion" }),
    );

    expect(res.success).toContain("Specialist → Champion");
    expect(res.success).toContain("12 XP");
    // XP debit + guarded category change, both through the tx
    expect(txMock.update).toHaveBeenCalledTimes(2);
    expect(txMock.updateSet).toHaveBeenNthCalledWith(2, {
      category: "champion",
    });
    expect(txMock.insertValues).toHaveBeenCalledWith({
      fighterId: UUID_F,
      kind: "promotion",
      statKey: null,
      skillName: "Specialist → Champion",
      xpCost: 12,
      creditIncrease: 40,
    });
    expect(mockRecalc).toHaveBeenCalledWith(GANG.id, txMock);
  });

  it("Ganger → Specialist: 0 XP, category untouched, +20c recorded", async () => {
    const res = await buyAdvancement(
      {},
      form({ kind: "promotion", promotion: "ganger_to_specialist" }),
    );

    expect(res.success).toContain("Ganger → Specialist");
    // only the (zero) XP debit — no category write
    expect(txMock.update).toHaveBeenCalledTimes(1);
    expect(txMock.updateSet).not.toHaveBeenCalledWith(
      expect.objectContaining({ category: expect.anything() }),
    );
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "promotion",
        skillName: "Ganger → Specialist",
        xpCost: 0,
        creditIncrease: 20,
      }),
    );
  });

  it("Ganger → Specialist is one-way: a prior promotion row refuses a repeat", async () => {
    txMock.query.fighterAdvancements.findFirst.mockResolvedValue({ id: "x" });

    const res = await buyAdvancement(
      {},
      form({ kind: "promotion", promotion: "ganger_to_specialist" }),
    );

    expect(res.error).toContain("already a Specialist");
    expect(txMock.update).not.toHaveBeenCalled();
    expect(txMock.insert).not.toHaveBeenCalled();
  });

  it("refuses the wrong source category BEFORE any write", async () => {
    txMock.query.fighters.findFirst.mockResolvedValue({
      ...FIGHTER,
      category: "juve",
    });

    const res = await buyAdvancement(
      {},
      form({ kind: "promotion", promotion: "specialist_to_champion" }),
    );

    expect(res.error).toContain("applies to a ganger");
    expect(txMock.update).not.toHaveBeenCalled();
  });

  it("insufficient XP fails cleanly (conditional debit matched no row)", async () => {
    txMock.query.fighters.findFirst.mockResolvedValue({ ...FIGHTER, xp: 5 });
    txMock.updateReturning.mockResolvedValueOnce([]); // debit missed

    const res = await buyAdvancement(
      {},
      form({ kind: "promotion", promotion: "specialist_to_champion" }),
    );

    expect(res.error).toContain("Insufficient XP");
    expect(txMock.insert).not.toHaveBeenCalled();
  });

  it("a lost category race AFTER the debit rolls the transaction back", async () => {
    txMock.updateReturning
      .mockResolvedValueOnce([{ id: UUID_F }]) // XP debit landed
      .mockResolvedValueOnce([]); // category no longer matches

    const res = await buyAdvancement(
      {},
      form({ kind: "promotion", promotion: "specialist_to_champion" }),
    );

    expect(res.error).toContain("category changed");
    expect(txMock.insert).not.toHaveBeenCalled();
  });

  it("ACCEPTANCE (#83 risk): a promoted fighter (category ganger) pays the repeat surcharge", async () => {
    // e.g. a Juve promoted during Downtime — the fast-learner exemption
    // ended with the category change.
    txMock.query.fighterAdvancements.findMany.mockResolvedValue([
      { id: "prior-1" },
    ]);

    const res = await buyAdvancement(
      {},
      form({ kind: "stat_increase", statKey: "wil" }),
    );

    // base 3 XP + one prior × 2 XP surcharge
    expect(res.success).toContain("5 XP spent");
  });
});

/* ------------------------------------------------------------------ */
/*  medicalEscort                                                      */
/* ------------------------------------------------------------------ */
describe("medicalEscort", () => {
  beforeEach(() => {
    txMock.query.fighters.findFirst.mockResolvedValue({
      ...FIGHTER,
      status: "injured",
    });
  });

  it("debits the rolled cost conditionally and applies 'died' atomically", async () => {
    const res = await medicalEscort(
      {},
      form({ cost: "70", outcome: "died" }),
    );

    expect(mockDebitStash).toHaveBeenCalledWith(GANG.id, 70, txMock);
    expect(txMock.updateSet).toHaveBeenCalledWith({
      status: "dead",
      capturedByGangId: null,
    });
    expect(mockRecalc).toHaveBeenCalledWith(GANG.id, txMock);
    expect(res.success).toContain("did not survive");
    expect(res.success).toContain("70c");
  });

  it("'stabilised' puts the fighter in recovery and points at the injury flow", async () => {
    const res = await medicalEscort(
      {},
      form({ cost: "40", outcome: "stabilised" }),
    );

    expect(txMock.updateSet).toHaveBeenCalledWith({ status: "in_recovery" });
    expect(res.success).toContain("lasting injury");
  });

  it("'full_recovery' puts the fighter in recovery with no lasting injury", async () => {
    const res = await medicalEscort(
      {},
      form({ cost: "120", outcome: "full_recovery" }),
    );

    expect(txMock.updateSet).toHaveBeenCalledWith({ status: "in_recovery" });
    expect(res.success).toContain("full recovery");
  });

  it("an insufficient Stash refuses cleanly — the fighter is untouched", async () => {
    mockDebitStash.mockResolvedValue(false);

    const res = await medicalEscort(
      {},
      form({ cost: "110", outcome: "died" }),
    );

    expect(res.error).toContain("110c");
    expect(txMock.update).not.toHaveBeenCalled();
    expect(mockRecalc).not.toHaveBeenCalled();
  });

  it("only an injured / in-recovery fighter can be escorted", async () => {
    txMock.query.fighters.findFirst.mockResolvedValue({
      ...FIGHTER,
      status: "active",
    });

    const res = await medicalEscort(
      {},
      form({ cost: "50", outcome: "stabilised" }),
    );

    expect(res.error).toContain("status");
    expect(mockDebitStash).not.toHaveBeenCalled();
  });

  it("rejects a cost that is not a multiple of 10 in 10–120, and unknown outcomes", async () => {
    const bad1 = await medicalEscort({}, form({ cost: "45", outcome: "died" }));
    expect(bad1.error).toBeTruthy();

    const bad2 = await medicalEscort({}, form({ cost: "130", outcome: "died" }));
    expect(bad2.error).toBeTruthy();

    const bad3 = await medicalEscort(
      {},
      form({ cost: "50", outcome: "revived" }),
    );
    expect(bad3.error).toBeTruthy();

    expect(mockDebitStash).not.toHaveBeenCalled();
  });

  it("rejects a fighter from another gang", async () => {
    txMock.query.fighters.findFirst.mockResolvedValue(undefined);

    const res = await medicalEscort(
      {},
      form({ cost: "60", outcome: "died" }),
    );

    expect(res.error).toBe("Invalid fighter.");
    expect(mockDebitStash).not.toHaveBeenCalled();
  });
});
