/**
 * Scenario catalogue with preset rewards (issue #87) — Cinderak Burning
 * p.77–101.
 *
 * Pure half: the catalogue carries names + numeric reward parameters only;
 * diceBounds turns a dice label into validation bounds; every 2D6-table
 * scenario name resolves to a catalogue id.
 *
 * Action half (I/O mocked): applyScenarioRewards validates each rolled
 * value against its dice label, is ONE-SHOT per challenge (conditional
 * UPDATE on rewards_applied_at IS NULL), emits legs through
 * applyBattleEvent inside the same transaction (a failed leg rolls
 * everything back), gates the Assassin's conditional lines by role and
 * refuses declined challenges. createChallenge stores the catalogue id
 * when the scenario name matches.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SCENARIOS,
  getScenario,
  getScenarioByName,
  diceBounds,
} from "@/lib/data/scenarios";
import { scenarioForRoll } from "@/lib/campaign-rules";

/* ---- next/cache + auth ---- */
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: "admin-1", role: "admin" }),
  requireUser: vi.fn(),
}));

/* ---- queries / mutations ---- */
const { mockGetActiveCampaign, mockApplyBattleEvent } = vi.hoisted(() => ({
  mockGetActiveCampaign: vi.fn(),
  mockApplyBattleEvent: vi.fn(),
}));
vi.mock("@/lib/db/queries", () => ({
  getActiveCampaign: mockGetActiveCampaign,
  getLatestCampaign: vi.fn(),
}));
vi.mock("@/lib/db/mutations", () => ({
  setSympathiserController: vi.fn(),
  clearSympathiserController: vi.fn(),
  advanceCampaignCycle: vi.fn(),
  applyDowntimeEffects: vi.fn(),
  applyBattleEvent: mockApplyBattleEvent,
  snapshotCampaignGangs: vi.fn(),
  grantFreshRecruitment: vi.fn(),
  recalcGangScores: vi.fn(),
}));

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
    return { update, updateSet, updateWhere, updateReturning, insert, insertValues };
  };
  const txMock: any = { ...build(), query: {} };
  const dbMock: any = {
    ...build(),
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(txMock),
    ),
    query: { challenges: { findFirst: vi.fn() }, campaigns: { findFirst: vi.fn() }, gangs: { findFirst: vi.fn() } },
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { dbMock, txMock };
});
vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    challenges: {
      id: "challenge.id",
      rewardsAppliedAt: "challenge.rewards_applied_at",
    },
    campaigns: { id: "campaign.id", status: "campaign.status" },
    gangs: { id: "gang.id" },
    sympathisers: { id: "symp.id" },
    triumphs: { id: "triumph.id" },
  },
}));

import {
  applyScenarioRewards,
  createChallenge,
} from "@/app/admin/campaign/actions";

const UUID_CH = "123e4567-e89b-12d3-a456-426614174000";
const GANG_A = "123e4567-e89b-12d3-a456-426614174001"; // challenger/attacker
const GANG_B = "123e4567-e89b-12d3-a456-426614174002"; // challenged/defender

const CHALLENGE = {
  id: UUID_CH,
  resolved: true,
  outcome: "challenger_win",
  scenarioId: "gunk-war",
  challengerGangId: GANG_A,
  challengedGangId: GANG_B,
};

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  fd.set("challengeId", UUID_CH);
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  dbMock.query.challenges.findFirst.mockResolvedValue({ ...CHALLENGE });
  txMock.updateReturning.mockReset().mockResolvedValue([{ id: UUID_CH }]);
  mockApplyBattleEvent.mockResolvedValue({ ok: true });
});

/* ------------------------------------------------------------------ */
/*  Pure — catalogue & dice                                            */
/* ------------------------------------------------------------------ */
describe("scenario catalogue (names + numbers only)", () => {
  it("carries the 12 Cinderak narrative scenarios with parseable dice labels", () => {
    expect(SCENARIOS).toHaveLength(12);
    for (const s of SCENARIOS) {
      for (const label of [
        s.rewards.creditsWinner,
        s.rewards.creditsLoser,
        s.rewards.creditsDraw,
        s.rewards.repWinner,
      ]) {
        if (label !== null) {
          expect(diceBounds(label), `${s.id}: ${label}`).not.toBeNull();
        }
      }
      expect(s.rewards.xpEach).toBe(1);
    }
  });

  it("every 2D6-table scenario name resolves to a catalogue id", () => {
    for (const phase of ["great_darkness", "spark_of_rebellion"] as const) {
      for (const roll of [4, 5, 6, 7, 8, 9]) {
        const name = scenarioForRoll(roll, phase);
        expect(getScenarioByName(name)?.id, `${phase} roll ${roll}: ${name}`).toBeTruthy();
      }
    }
    // "choose" table results are not scenarios
    expect(getScenarioByName(scenarioForRoll(2, "great_darkness"))).toBeUndefined();
  });

  it("diceBounds parses the labels the catalogue uses", () => {
    expect(diceBounds("D3")).toEqual({ min: 1, max: 3, step: 1 });
    expect(diceBounds("D3+1")).toEqual({ min: 2, max: 4, step: 1 });
    expect(diceBounds("D3x5")).toEqual({ min: 5, max: 15, step: 5 });
    expect(diceBounds("D6x5")).toEqual({ min: 5, max: 30, step: 5 });
    expect(diceBounds("2D6x10")).toEqual({ min: 20, max: 120, step: 10 });
    expect(diceBounds("3D6x10")).toEqual({ min: 30, max: 180, step: 10 });
    expect(diceBounds("banana")).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/*  applyScenarioRewards                                               */
/* ------------------------------------------------------------------ */
describe("applyScenarioRewards", () => {
  it("emits winner/loser/rep legs through applyBattleEvent in one transaction", async () => {
    // Gunk War: winner 2D6x10, loser D3x10, rep D3
    const res = await applyScenarioRewards(
      {},
      form({ creditsWinner: "70", creditsLoser: "20", repWinner: "2" }),
    );

    expect(res.success).toContain("3 reward lines");
    expect(dbMock.transaction).toHaveBeenCalledTimes(1);
    expect(mockApplyBattleEvent).toHaveBeenCalledTimes(3);
    expect(mockApplyBattleEvent).toHaveBeenCalledWith(
      expect.objectContaining({ gangId: GANG_A, kind: "credits_gained", amount: 70 }),
      txMock,
    );
    expect(mockApplyBattleEvent).toHaveBeenCalledWith(
      expect.objectContaining({ gangId: GANG_B, kind: "credits_gained", amount: 20 }),
      txMock,
    );
    expect(mockApplyBattleEvent).toHaveBeenCalledWith(
      expect.objectContaining({ gangId: GANG_A, kind: "reputation_change", amount: 2 }),
      txMock,
    );
  });

  it("bottled-out flags add the fixed Reputation loss", async () => {
    const res = await applyScenarioRewards(
      {},
      form({
        creditsWinner: "70",
        creditsLoser: "20",
        repWinner: "2",
        bottledChallenged: "on",
      }),
    );

    expect(res.success).toContain("4 reward lines");
    expect(mockApplyBattleEvent).toHaveBeenCalledWith(
      expect.objectContaining({ gangId: GANG_B, kind: "reputation_change", amount: -1 }),
      txMock,
    );
  });

  it("validates each rolled value against its dice label", async () => {
    // 75 is not a 2D6x10 result (step 10)
    const bad = await applyScenarioRewards(
      {},
      form({ creditsWinner: "75", creditsLoser: "20", repWinner: "2" }),
    );
    expect(bad.error).toContain("2D6x10");
    expect(dbMock.transaction).not.toHaveBeenCalled();

    const missing = await applyScenarioRewards(
      {},
      form({ creditsLoser: "20", repWinner: "2" }),
    );
    expect(missing.error).toContain("Enter the rolled");
  });

  it("is ONE-SHOT per challenge: a lost guard writes nothing", async () => {
    txMock.updateReturning.mockResolvedValueOnce([]);

    const res = await applyScenarioRewards(
      {},
      form({ creditsWinner: "70", creditsLoser: "20", repWinner: "2" }),
    );

    expect(res.error).toContain("already applied");
    expect(mockApplyBattleEvent).not.toHaveBeenCalled();
  });

  it("a failed event leg rolls the whole application back", async () => {
    mockApplyBattleEvent
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, error: "Gang did not take part in this challenge." });

    const res = await applyScenarioRewards(
      {},
      form({ creditsWinner: "70", creditsLoser: "20", repWinner: "2" }),
    );

    expect(res.error).toContain("did not take part");
  });

  it("a draw applies the per-gang draw line (and refuses scenarios without one)", async () => {
    dbMock.query.challenges.findFirst.mockResolvedValue({
      ...CHALLENGE,
      outcome: "draw",
      scenarioId: "they-come-from-below", // draw D6x10
    });

    const res = await applyScenarioRewards(
      {},
      form({ creditsDrawChallenger: "30", creditsDrawChallenged: "60" }),
    );
    expect(res.success).toContain("2 reward lines");

    dbMock.query.challenges.findFirst.mockResolvedValue({
      ...CHALLENGE,
      outcome: "draw",
      scenarioId: "gunk-war", // no draw line
    });
    const none = await applyScenarioRewards({}, form({}));
    expect(none.error).toContain("no standard draw reward");
  });

  it("gates the Assassin's conditional lines by role (challenger = attacker)", async () => {
    // Defender (challenged) wins: NO winner credits, rep D3+1 applies.
    dbMock.query.challenges.findFirst.mockResolvedValue({
      ...CHALLENGE,
      outcome: "challenged_win",
      scenarioId: "assassin-in-the-spire",
    });
    const res = await applyScenarioRewards(
      {},
      form({ creditsLoser: "40", repWinner: "3" }),
    );
    expect(res.success).toContain("2 reward lines");
    expect(mockApplyBattleEvent).toHaveBeenCalledWith(
      expect.objectContaining({ gangId: GANG_B, kind: "reputation_change", amount: 3 }),
      txMock,
    );

    // Attacker (challenger) wins: 3D6x10 credits apply, no rep line.
    vi.clearAllMocks();
    txMock.updateReturning.mockResolvedValue([{ id: UUID_CH }]);
    mockApplyBattleEvent.mockResolvedValue({ ok: true });
    dbMock.query.challenges.findFirst.mockResolvedValue({
      ...CHALLENGE,
      outcome: "challenger_win",
      scenarioId: "assassin-in-the-spire",
    });
    const res2 = await applyScenarioRewards(
      {},
      form({ creditsWinner: "90", creditsLoser: "40" }),
    );
    expect(res2.success).toContain("2 reward lines");
    expect(mockApplyBattleEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ kind: "reputation_change" }),
      txMock,
    );
  });

  it("refuses declined challenges and rows without a catalogue scenario", async () => {
    dbMock.query.challenges.findFirst.mockResolvedValue({
      ...CHALLENGE,
      outcome: "declined",
    });
    expect((await applyScenarioRewards({}, form({}))).error).toContain(
      "no battle",
    );

    dbMock.query.challenges.findFirst.mockResolvedValue({
      ...CHALLENGE,
      scenarioId: null,
    });
    expect((await applyScenarioRewards({}, form({}))).error).toContain(
      "no catalogue scenario",
    );
  });
});

/* ------------------------------------------------------------------ */
/*  createChallenge stores the catalogue id                            */
/* ------------------------------------------------------------------ */
describe("createChallenge → scenarioId", () => {
  beforeEach(() => {
    mockGetActiveCampaign.mockResolvedValue({
      id: "123e4567-e89b-12d3-a456-426614174009",
      currentCycle: 2,
      phase: "great_darkness",
    });
  });

  const challengeForm = (scenario: string) => {
    const fd = new FormData();
    fd.set("challengerGangId", GANG_A);
    fd.set("challengedGangId", GANG_B);
    fd.set("sympathiserId", "water-guild");
    fd.set("scenario", scenario);
    return fd;
  };

  it("a catalogue name (typed or rolled) carries its id; free text stays null", async () => {
    await createChallenge({}, challengeForm("Gunk War"));
    expect(dbMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ scenario: "Gunk War", scenarioId: "gunk-war" }),
    );

    await createChallenge({}, challengeForm("Custom Brawl"));
    expect(dbMock.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ scenario: "Custom Brawl", scenarioId: null }),
    );
  });

  it("sanity: the catalogue lookup behind the rolled path works", () => {
    expect(getScenario("gunk-war")?.name).toBe("Gunk War");
  });
});
