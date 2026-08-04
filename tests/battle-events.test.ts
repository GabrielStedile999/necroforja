/**
 * Battle aftermath log (issue #69).
 *
 * Part 1 — battleEventSchema: the discriminated union states each kind's
 * exact fields, so invalid combinations (credits with a fighter, XP without
 * an amount, a status kind with an amount) fail validation.
 *
 * Part 2 — applyBattleEvent: challenge/participant/fighter guards, one
 * effect per kind, compensating (negative) amounts behind conditional
 * UPDATEs, the append-only insert and the in-transaction score recalc.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { battleEventSchema } from "@/lib/validation";

const { mockGetGangById } = vi.hoisted(() => ({ mockGetGangById: vi.fn() }));
vi.mock("@/lib/db/queries", () => ({ getGangById: mockGetGangById }));

const { txMock, dbMock, mockTransaction } = vi.hoisted(() => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const build = () => {
    const insertValues = vi.fn().mockResolvedValue(undefined);
    const insert = vi.fn(() => ({ values: insertValues }));
    // where() must be awaitable AND chain .returning() (guarded updates).
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
  const txMock: any = {
    ...build(),
    query: {
      challenges: { findFirst: vi.fn() },
      fighters: { findFirst: vi.fn() },
      gangs: { findMany: vi.fn(), findFirst: vi.fn() },
    },
  };
  const mockTransaction = vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn(txMock),
  );
  const dbMock: any = {
    ...build(),
    transaction: mockTransaction,
    query: {
      challenges: { findFirst: vi.fn() },
      fighters: { findFirst: vi.fn() },
      gangs: { findMany: vi.fn(), findFirst: vi.fn() },
    },
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { txMock, dbMock, mockTransaction };
});

vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    gangs: {
      id: "gangs.id",
      stashCredits: "gangs.stash_credits",
      reputation: "gangs.reputation",
    },
    fighters: {
      id: "fighters.id",
      gangId: "fighters.gang_id",
      xp: "fighters.xp",
      status: "fighters.status",
    },
    challenges: { id: "challenges.id" },
    battleEvents: { challengeId: "be.challenge_id" },
  },
}));

import { applyBattleEvent } from "@/lib/db/mutations";

const CHALLENGE_ID = "11111111-1111-4111-8111-111111111111";
const GANG_A = "22222222-2222-4222-8222-222222222222";
const GANG_B = "33333333-3333-4333-8333-333333333333";
const FIGHTER = "44444444-4444-4444-8444-444444444444";

const base = { challengeId: CHALLENGE_ID, gangId: GANG_A };

/* ------------------------------------------------------------------ */
/*  Part 1 — battleEventSchema (kind-specific shapes)                   */
/* ------------------------------------------------------------------ */
describe("battleEventSchema", () => {
  it("accepts credits_gained with a positive amount (form strings coerced)", () => {
    const parsed = battleEventSchema.safeParse({
      ...base,
      kind: "credits_gained",
      amount: "120",
      fighterId: "", // hidden/absent form field
      notes: "",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.amount).toBe(120);
      expect(parsed.data.notes).toBe("");
    }
  });

  it("accepts a NEGATIVE credits amount (compensating event)", () => {
    const parsed = battleEventSchema.safeParse({
      ...base,
      kind: "credits_gained",
      amount: "-50",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects credits_gained with a fighterId (invalid combination)", () => {
    const parsed = battleEventSchema.safeParse({
      ...base,
      kind: "credits_gained",
      amount: "120",
      fighterId: FIGHTER,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects amount 0 (a no-op event is a mistake)", () => {
    const parsed = battleEventSchema.safeParse({
      ...base,
      kind: "credits_gained",
      amount: "0",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects xp_gained without an amount", () => {
    const parsed = battleEventSchema.safeParse({
      ...base,
      kind: "xp_gained",
      fighterId: FIGHTER,
      amount: "",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects xp_gained without a fighter", () => {
    const parsed = battleEventSchema.safeParse({
      ...base,
      kind: "xp_gained",
      amount: "3",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts xp_gained with fighter and amount (negative allowed)", () => {
    for (const amount of ["3", "-2"]) {
      const parsed = battleEventSchema.safeParse({
        ...base,
        kind: "xp_gained",
        fighterId: FIGHTER,
        amount,
      });
      expect(parsed.success).toBe(true);
    }
  });

  it("rejects a status kind carrying an amount", () => {
    for (const kind of ["fighter_injured", "fighter_dead", "fighter_captured"]) {
      const parsed = battleEventSchema.safeParse({
        ...base,
        kind,
        fighterId: FIGHTER,
        amount: "5",
      });
      expect(parsed.success).toBe(false);
    }
  });

  it("accepts status kinds with fighter only", () => {
    for (const kind of ["fighter_injured", "fighter_dead", "fighter_captured"]) {
      const parsed = battleEventSchema.safeParse({
        ...base,
        kind,
        fighterId: FIGHTER,
        amount: "",
      });
      expect(parsed.success).toBe(true);
    }
  });

  it("bounds reputation_change to ±20 and rejects a fighterId", () => {
    expect(
      battleEventSchema.safeParse({
        ...base,
        kind: "reputation_change",
        amount: "-2",
      }).success,
    ).toBe(true);
    expect(
      battleEventSchema.safeParse({
        ...base,
        kind: "reputation_change",
        amount: "25",
      }).success,
    ).toBe(false);
    expect(
      battleEventSchema.safeParse({
        ...base,
        kind: "reputation_change",
        amount: "2",
        fighterId: FIGHTER,
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown kind", () => {
    const parsed = battleEventSchema.safeParse({
      ...base,
      kind: "loot_gained",
      amount: "10",
    });
    expect(parsed.success).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  Part 2 — applyBattleEvent                                          */
/* ------------------------------------------------------------------ */

const RESOLVED_CHALLENGE = {
  id: CHALLENGE_ID,
  resolved: true,
  challengerGangId: GANG_A,
  challengedGangId: GANG_B,
};

const GANG = {
  id: GANG_A,
  stashCredits: 100,
  stash: [],
  fighters: [],
  reputation: 5,
};

function parse(input: Record<string, unknown>) {
  const parsed = battleEventSchema.safeParse(input);
  if (!parsed.success) throw new Error("test input must be valid");
  return parsed.data;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetGangById.mockResolvedValue(GANG);
  txMock.query.challenges.findFirst.mockResolvedValue(RESOLVED_CHALLENGE);
  txMock.query.fighters.findFirst.mockResolvedValue({ id: FIGHTER });
});

describe("applyBattleEvent — guards", () => {
  it("fails when the challenge does not exist", async () => {
    txMock.query.challenges.findFirst.mockResolvedValue(undefined);
    const res = await applyBattleEvent(
      parse({ ...base, kind: "credits_gained", amount: "10" }),
    );
    expect(res).toEqual({ ok: false, error: "Challenge not found." });
    expect(txMock.update).not.toHaveBeenCalled();
    expect(txMock.insert).not.toHaveBeenCalled();
  });

  it("fails on an UNRESOLVED challenge (aftermath needs a played battle)", async () => {
    txMock.query.challenges.findFirst.mockResolvedValue({
      ...RESOLVED_CHALLENGE,
      resolved: false,
    });
    const res = await applyBattleEvent(
      parse({ ...base, kind: "credits_gained", amount: "10" }),
    );
    expect(res.ok).toBe(false);
    expect(txMock.insert).not.toHaveBeenCalled();
  });

  it("fails when the gang did not take part in the challenge", async () => {
    txMock.query.challenges.findFirst.mockResolvedValue({
      ...RESOLVED_CHALLENGE,
      challengerGangId: GANG_B,
      challengedGangId: null,
    });
    const res = await applyBattleEvent(
      parse({ ...base, kind: "credits_gained", amount: "10" }),
    );
    expect(res.ok).toBe(false);
    expect(txMock.insert).not.toHaveBeenCalled();
  });

  it("fails when the fighter does not belong to the event's gang", async () => {
    txMock.query.fighters.findFirst.mockResolvedValue(undefined);
    const res = await applyBattleEvent(
      parse({ ...base, kind: "xp_gained", fighterId: FIGHTER, amount: "3" }),
    );
    expect(res.ok).toBe(false);
    expect(txMock.update).not.toHaveBeenCalled();
    expect(txMock.insert).not.toHaveBeenCalled();
  });
});

describe("applyBattleEvent — effects", () => {
  it("credits_gained (+): increments the Stash, logs the event, recalcs", async () => {
    const res = await applyBattleEvent(
      parse({ ...base, kind: "credits_gained", amount: "120", notes: "reward" }),
    );
    expect(res).toEqual({ ok: true });
    // stash increment + recalc write, both through the tx
    expect(txMock.update).toHaveBeenCalledTimes(2);
    expect(txMock.insert).toHaveBeenCalledTimes(1);
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        challengeId: CHALLENGE_ID,
        gangId: GANG_A,
        kind: "credits_gained",
        fighterId: null,
        amount: 120,
        notes: "reward",
      }),
    );
    expect(mockGetGangById).toHaveBeenCalledWith(GANG_A, txMock);
    expect(dbMock.update).not.toHaveBeenCalled();
  });

  it("credits_gained (−): the conditional debit blocks an overdraft", async () => {
    txMock.updateReturning.mockResolvedValueOnce([]); // stash < 999
    const res = await applyBattleEvent(
      parse({ ...base, kind: "credits_gained", amount: "-999" }),
    );
    expect(res.ok).toBe(false);
    // nothing logged, no recalc — the guarded write was the only attempt
    expect(txMock.insert).not.toHaveBeenCalled();
    expect(mockGetGangById).not.toHaveBeenCalled();
  });

  it("credits_gained (−): succeeds when the Stash covers it", async () => {
    txMock.updateReturning.mockResolvedValueOnce([{ id: GANG_A }]);
    const res = await applyBattleEvent(
      parse({ ...base, kind: "credits_gained", amount: "-50" }),
    );
    expect(res).toEqual({ ok: true });
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ amount: -50 }),
    );
  });

  it("xp_gained (+): applies the delta and logs", async () => {
    txMock.updateReturning.mockResolvedValueOnce([{ id: FIGHTER }]);
    const res = await applyBattleEvent(
      parse({ ...base, kind: "xp_gained", fighterId: FIGHTER, amount: "3" }),
    );
    expect(res).toEqual({ ok: true });
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "xp_gained", fighterId: FIGHTER, amount: 3 }),
    );
  });

  it("xp_gained (−): the conditional update blocks XP below zero", async () => {
    txMock.updateReturning.mockResolvedValueOnce([]); // xp < 99
    const res = await applyBattleEvent(
      parse({ ...base, kind: "xp_gained", fighterId: FIGHTER, amount: "-99" }),
    );
    expect(res.ok).toBe(false);
    expect(txMock.insert).not.toHaveBeenCalled();
  });

  it("fighter_dead: sets the status and recalcs (Rating drops)", async () => {
    const res = await applyBattleEvent(
      parse({ ...base, kind: "fighter_dead", fighterId: FIGHTER }),
    );
    expect(res).toEqual({ ok: true });
    expect(txMock.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "dead", capturedByGangId: null }),
    );
    expect(mockGetGangById).toHaveBeenCalledWith(GANG_A, txMock);
  });

  it("fighter_captured: records the OTHER participant as captor", async () => {
    const res = await applyBattleEvent(
      parse({ ...base, kind: "fighter_captured", fighterId: FIGHTER }),
    );
    expect(res).toEqual({ ok: true });
    expect(txMock.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "captured", capturedByGangId: GANG_B }),
    );
  });

  it("fighter_captured: captor is null when the challenge had no defender", async () => {
    txMock.query.challenges.findFirst.mockResolvedValue({
      ...RESOLVED_CHALLENGE,
      challengedGangId: null,
    });
    const res = await applyBattleEvent(
      parse({ ...base, kind: "fighter_captured", fighterId: FIGHTER }),
    );
    expect(res).toEqual({ ok: true });
    expect(txMock.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "captured", capturedByGangId: null }),
    );
  });

  it("fighter_injured: fighter goes into recovery (Downtime clears it)", async () => {
    const res = await applyBattleEvent(
      parse({ ...base, kind: "fighter_injured", fighterId: FIGHTER }),
    );
    expect(res).toEqual({ ok: true });
    expect(txMock.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "in_recovery" }),
    );
  });

  it("reputation_change: applies the ± delta and logs", async () => {
    const res = await applyBattleEvent(
      parse({ ...base, kind: "reputation_change", amount: "-2" }),
    );
    expect(res).toEqual({ ok: true });
    // reputation update + recalc
    expect(txMock.update).toHaveBeenCalledTimes(2);
    expect(txMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "reputation_change", amount: -2 }),
    );
  });
});

describe("applyBattleEvent — transaction contract", () => {
  it("opens its own transaction when called without a handle", async () => {
    await applyBattleEvent(
      parse({ ...base, kind: "credits_gained", amount: "10" }),
    );
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(dbMock.update).not.toHaveBeenCalled();
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it("joins the caller's transaction when one is given", async () => {
    await applyBattleEvent(
      parse({ ...base, kind: "credits_gained", amount: "10" }),
      txMock,
    );
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(txMock.insert).toHaveBeenCalledTimes(1);
  });
});
