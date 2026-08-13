/**
 * Fighter advancements & lasting injuries (issue #71).
 *
 * Pure half: config helpers (stored-value deltas, p.73 clamps) and scoring —
 * fighters WITHOUT advancements keep byte-identical totals (the Rating
 * regression guard), advancements raise cost/Rating by creditIncrease.
 *
 * Action half (I/O mocked): buyAdvancement debits XP conditionally
 * (concurrent buys cannot double-spend), respects stat caps, charges the
 * repeat surcharge (Juves/Prospects exempt) and refuses dead fighters;
 * addInjury applies clamped penalties and stores the APPLIED delta;
 * removeInjury is Arbitrator-only and reverts exactly.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  storageDelta,
  clampStat,
  STAT_ADVANCEMENTS,
  SKILL_ADVANCEMENTS,
} from "@/lib/data/advancements";
import { fighterTotalCost, gangRating } from "@/lib/scoring";
import type { Fighter, Gang } from "@/types";

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
const { mockRecalc } = vi.hoisted(() => ({ mockRecalc: vi.fn() }));
vi.mock("@/lib/db/queries", () => ({
  getCatalogItemById: vi.fn(),
  fighterBelongsToGang: vi.fn(),
  stashItemBelongsToGang: vi.fn(),
  countFighterWeapons: vi.fn(),
}));
vi.mock("@/lib/db/mutations", () => ({
  debitStashCredits: vi.fn(),
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
    const deleteWhere = vi.fn().mockResolvedValue(undefined);
    const del = vi.fn(() => ({ where: deleteWhere }));
    return { update, updateSet, updateWhere, updateReturning, insert, insertValues, delete: del, deleteWhere };
  };
  const txMock: any = {
    ...build(),
    query: {
      fighters: { findFirst: vi.fn() },
      fighterAdvancements: { findMany: vi.fn() },
      fighterInjuries: { findFirst: vi.fn() },
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
      m: "fighter.m", ws: "fighter.ws", bs: "fighter.bs", s: "fighter.s",
      t: "fighter.t", w: "fighter.w", i: "fighter.i", a: "fighter.a",
      ld: "fighter.ld", cl: "fighter.cl", wil: "fighter.wil", int: "fighter.int",
    },
    fighterAdvancements: {
      fighterId: "fa.fighter_id",
      statKey: "fa.stat_key",
    },
    fighterInjuries: { id: "fi.id", fighterId: "fi.fighter_id" },
  },
}));

import { buyAdvancement, addInjury, removeInjury } from "@/app/player/actions";

const GANG = { id: "123e4567-e89b-12d3-a456-426614174009", name: "Sump Rats" };
const UUID_F = "123e4567-e89b-12d3-a456-426614174001";
const UUID_INJ = "123e4567-e89b-12d3-a456-426614174002";

const FIGHTER = {
  id: UUID_F,
  name: "Grix",
  category: "ganger",
  status: "active",
  xp: 10,
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

/* ------------------------------------------------------------------ */
/*  Pure — config helpers                                              */
/* ------------------------------------------------------------------ */
describe("advancement config helpers", () => {
  it("storageDelta: roll stats improve DOWNWARDS, flat stats upwards", () => {
    expect(storageDelta("ws", 1)).toBe(-1);
    expect(storageDelta("ld", -1)).toBe(1); // penalty worsens the target roll
    expect(storageDelta("s", 1)).toBe(1);
    expect(storageDelta("m", -1)).toBe(-1);
  });

  it("clampStat honours the p.73 bounds", () => {
    expect(clampStat("ws", 1)).toBe(2); // best is 2+
    expect(clampStat("ws", 7)).toBe(6); // app storage worst
    expect(clampStat("m", 9)).toBe(8); // M caps at 8"
    expect(clampStat("s", 0)).toBe(1); // floor 1
    expect(clampStat("ld", 2)).toBe(3); // psychology improves to 3+ at best
  });

  it("carries the official XP costs and credit increases (p.149)", () => {
    expect(STAT_ADVANCEMENTS.wil).toEqual({ xpCost: 3, creditIncrease: 5 });
    expect(STAT_ADVANCEMENTS.ws).toEqual({ xpCost: 6, creditIncrease: 20 });
    expect(STAT_ADVANCEMENTS.t).toEqual({ xpCost: 8, creditIncrease: 30 });
    expect(STAT_ADVANCEMENTS.a).toEqual({ xpCost: 12, creditIncrease: 45 });
    expect(SKILL_ADVANCEMENTS.primary_random.xpCost).toBe(6);
    expect(SKILL_ADVANCEMENTS.any_random.creditIncrease).toBe(50);
  });
});

/* ------------------------------------------------------------------ */
/*  Pure — scoring                                                     */
/* ------------------------------------------------------------------ */
const baseFighter = (over: Partial<Fighter> = {}): Fighter => ({
  id: "f1",
  name: "Grix",
  type: "Ganger",
  category: "ganger",
  baseCost: 50,
  profile: {
    m: null, ws: null, bs: null, s: null, t: null, w: null,
    i: null, a: null, ld: null, cl: null, wil: null, int: null,
  },
  equipment: [{ id: "e1", name: "Knife", category: "weapon", cost: 15 }],
  xp: 0,
  status: "active",
  ...over,
});

const gangWith = (fighters: Fighter[]): Gang => ({
  id: "g1",
  name: "Sump Rats",
  house: "Orlock",
  ownerName: "Kal",
  fighters,
  stashCredits: 0,
  stash: [],
  reputation: 1,
});

describe("scoring with advancements", () => {
  it("REGRESSION GUARD: no advancements → totals identical to pre-#71", () => {
    const f = baseFighter();
    expect(fighterTotalCost(f)).toBe(65); // baseCost 50 + knife 15, nothing else
    expect(gangRating(gangWith([f]))).toBe(65);
  });

  it("advancements raise fighter cost and gang Rating by creditIncrease", () => {
    const f = baseFighter({
      advancements: [
        { id: "a1", kind: "stat_increase", statKey: "ws", skillName: null, xpCost: 6, creditIncrease: 20 },
        { id: "a2", kind: "skill", statKey: null, skillName: "Fearsome", xpCost: 9, creditIncrease: 20 },
      ],
    });
    expect(fighterTotalCost(f)).toBe(105); // 65 + 20 + 20
    expect(gangRating(gangWith([f]))).toBe(105);
  });

  it("a dead fighter's advancements never re-enter the Rating", () => {
    const f = baseFighter({
      status: "dead",
      advancements: [
        { id: "a1", kind: "stat_increase", statKey: "t", skillName: null, xpCost: 8, creditIncrease: 30 },
      ],
    });
    expect(gangRating(gangWith([f]))).toBe(0);
  });
});

/* ------------------------------------------------------------------ */
/*  buyAdvancement                                                     */
/* ------------------------------------------------------------------ */
beforeEach(() => {
  vi.clearAllMocks();
  mockResolveGangForWrite.mockResolvedValue({ gang: GANG, isAdmin: false });
  txMock.query.fighters.findFirst.mockResolvedValue({ ...FIGHTER });
  txMock.query.fighterAdvancements.findMany.mockResolvedValue([]);
  txMock.query.fighterInjuries.findFirst.mockResolvedValue(undefined);
  txMock.updateReturning.mockResolvedValue([{ id: UUID_F }]);
});

describe("buyAdvancement — stat increases", () => {
  it("debits XP, bumps the stat, records the row and recalcs", async () => {
    const res = await buyAdvancement(
      {},
      form({ kind: "stat_increase", statKey: "ws" }),
    );
    expect(res.success).toContain("WS improved");
    // XP debit + guarded stat bump, both through the tx
    expect(txMock.update).toHaveBeenCalledTimes(2);
    expect(txMock.insertValues).toHaveBeenCalledWith({
      fighterId: UUID_F,
      kind: "stat_increase",
      statKey: "ws",
      skillName: null,
      xpCost: 6,
      creditIncrease: 20,
    });
    expect(mockRecalc).toHaveBeenCalledWith(GANG.id, txMock);
  });

  it("insufficient XP fails cleanly (conditional debit matched no row)", async () => {
    txMock.updateReturning.mockResolvedValueOnce([]); // debit misses
    const res = await buyAdvancement(
      {},
      form({ kind: "stat_increase", statKey: "ws" }),
    );
    expect(res.error).toContain("Insufficient XP");
    expect(txMock.insert).not.toHaveBeenCalled();
    expect(mockRecalc).not.toHaveBeenCalled();
  });

  it("dead fighters cannot advance", async () => {
    txMock.query.fighters.findFirst.mockResolvedValue({
      ...FIGHTER,
      status: "dead",
    });
    const res = await buyAdvancement(
      {},
      form({ kind: "stat_increase", statKey: "ws" }),
    );
    expect(res.error).toBe("Dead fighters cannot advance.");
    expect(txMock.update).not.toHaveBeenCalled();
  });

  it("a stat at its maximum is refused BEFORE any write", async () => {
    txMock.query.fighters.findFirst.mockResolvedValue({ ...FIGHTER, ws: 2 });
    const res = await buyAdvancement(
      {},
      form({ kind: "stat_increase", statKey: "ws" }),
    );
    expect(res.error).toContain("maximum");
    expect(txMock.update).not.toHaveBeenCalled();
  });

  it("an unset stat is refused with guidance", async () => {
    txMock.query.fighters.findFirst.mockResolvedValue({ ...FIGHTER, s: null });
    const res = await buyAdvancement(
      {},
      form({ kind: "stat_increase", statKey: "s" }),
    );
    expect(res.error).toContain("Set S on the fighter card");
    expect(txMock.update).not.toHaveBeenCalled();
  });

  it("charges +2 XP per prior advancement of the SAME stat (p.149)", async () => {
    txMock.query.fighterAdvancements.findMany.mockResolvedValue([
      { id: "p1" },
      { id: "p2" },
    ]);
    await buyAdvancement({}, form({ kind: "stat_increase", statKey: "ws" }));
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ xpCost: 10 }), // 6 + 2×2
    );
  });

  it("Juves are fast learners: no repeat surcharge", async () => {
    txMock.query.fighters.findFirst.mockResolvedValue({
      ...FIGHTER,
      category: "juve",
    });
    txMock.query.fighterAdvancements.findMany.mockResolvedValue([
      { id: "p1" },
      { id: "p2" },
    ]);
    await buyAdvancement({}, form({ kind: "stat_increase", statKey: "ws" }));
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ xpCost: 6 }),
    );
  });

  it("a lost cap race AFTER the debit rolls back (guarded bump missed)", async () => {
    txMock.updateReturning
      .mockResolvedValueOnce([{ id: UUID_F }]) // debit lands
      .mockResolvedValueOnce([]); // stat guard misses (concurrent bump)
    const res = await buyAdvancement(
      {},
      form({ kind: "stat_increase", statKey: "ws" }),
    );
    expect(res.error).toContain("maximum");
    // the advancement row was never recorded — the throw aborts the tx
    expect(txMock.insert).not.toHaveBeenCalled();
  });

  it("rejects a fighter from another gang", async () => {
    txMock.query.fighters.findFirst.mockResolvedValue(undefined);
    const res = await buyAdvancement(
      {},
      form({ kind: "stat_increase", statKey: "ws" }),
    );
    expect(res.error).toBe("Invalid fighter.");
  });
});

describe("buyAdvancement — skills", () => {
  it("records the skill at the tier's configured cost, no stat touched", async () => {
    const res = await buyAdvancement(
      {},
      form({ kind: "skill", skillTier: "secondary_chosen", skillName: "Overseer" }),
    );
    expect(res.success).toContain('Skill "Overseer" recorded');
    expect(txMock.update).toHaveBeenCalledTimes(1); // XP debit only
    expect(txMock.insertValues).toHaveBeenCalledWith({
      fighterId: UUID_F,
      kind: "skill",
      statKey: null,
      skillName: "Overseer",
      xpCost: 12,
      creditIncrease: 35,
    });
  });

  it("rejects an unknown skill tier at validation", async () => {
    const res = await buyAdvancement(
      {},
      form({ kind: "skill", skillTier: "tertiary", skillName: "Overseer" }),
    );
    expect(res.error).toBeTruthy();
    expect(txMock.update).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/*  addInjury / removeInjury                                           */
/* ------------------------------------------------------------------ */
describe("addInjury", () => {
  it("preset applies the clamped penalty and stores the APPLIED delta", async () => {
    const res = await addInjury({}, form({ preset: "eye-injury" }));
    expect(res.success).toContain("Eye Injury");
    // bs 4 → stored 5 (BS −1 in book terms)
    expect(txMock.updateSet).toHaveBeenCalledWith({ bs: 5 });
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Eye Injury", statKey: "bs", statDelta: 1 }),
    );
    expect(mockRecalc).toHaveBeenCalledWith(GANG.id, txMock);
  });

  it("NEVER pushes a stat past its bound — applied delta clamps to 0", async () => {
    txMock.query.fighters.findFirst.mockResolvedValue({ ...FIGHTER, bs: 6 });
    await addInjury({}, form({ preset: "eye-injury" }));
    expect(txMock.update).not.toHaveBeenCalled(); // nothing to apply
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ statKey: "bs", statDelta: 0 }),
    );
  });

  it("a dual-stat preset records one row per effect", async () => {
    await addInjury({}, form({ preset: "humiliated" }));
    expect(txMock.insertValues).toHaveBeenCalledTimes(2);
    expect(txMock.insertValues).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ name: "Humiliated", statKey: "ld" }),
    );
    expect(txMock.insertValues).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ name: "Humiliated", statKey: "cl" }),
    );
  });

  it("custom injury with a stat applies a −1 penalty (flat stat goes down)", async () => {
    await addInjury(
      {},
      form({ preset: "", name: "Crushed Fingers", statKey: "s" }),
    );
    expect(txMock.updateSet).toHaveBeenCalledWith({ s: 2 }); // 3 → 2
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Crushed Fingers", statKey: "s", statDelta: -1 }),
    );
  });

  it("custom injury without a stat records name only", async () => {
    await addInjury({}, form({ preset: "", name: "Shaken Nerves" }));
    expect(txMock.update).not.toHaveBeenCalled();
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Shaken Nerves", statKey: null, statDelta: null }),
    );
  });

  it("rejects an unknown preset", async () => {
    const res = await addInjury({}, form({ preset: "phantom-limb" }));
    expect(res.error).toBe("Unknown injury preset.");
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });
});

describe("removeInjury", () => {
  const INJURY = {
    id: UUID_INJ,
    fighterId: UUID_F,
    name: "Eye Injury",
    statKey: "bs",
    statDelta: 1,
  };

  it("is Arbitrator-only", async () => {
    mockResolveGangForWrite.mockResolvedValue({ gang: GANG, isAdmin: false });
    const res = await removeInjury({}, form({ injuryId: UUID_INJ }));
    expect(res.error).toContain("Only the Arbitrator");
    expect(dbMock.transaction).not.toHaveBeenCalled();
  });

  it("reverts exactly the applied delta and deletes the row", async () => {
    mockResolveGangForWrite.mockResolvedValue({ gang: GANG, isAdmin: true });
    txMock.query.fighters.findFirst.mockResolvedValue({ ...FIGHTER, bs: 5 });
    txMock.query.fighterInjuries.findFirst.mockResolvedValue(INJURY);

    const res = await removeInjury({}, form({ injuryId: UUID_INJ }));
    expect(res.success).toContain("Eye Injury");
    expect(txMock.updateSet).toHaveBeenCalledWith({ bs: 4 }); // 5 − applied(+1)
    expect(txMock.delete).toHaveBeenCalledTimes(1);
    expect(mockRecalc).toHaveBeenCalledWith(GANG.id, txMock);
  });

  it("an injury with no stat effect just deletes", async () => {
    mockResolveGangForWrite.mockResolvedValue({ gang: GANG, isAdmin: true });
    txMock.query.fighterInjuries.findFirst.mockResolvedValue({
      ...INJURY,
      statKey: null,
      statDelta: null,
    });
    await removeInjury({}, form({ injuryId: UUID_INJ }));
    expect(txMock.update).not.toHaveBeenCalled();
    expect(txMock.delete).toHaveBeenCalledTimes(1);
  });
});
