/**
 * Campaign lifecycle tests (issue #66).
 *
 * Rules half: phaseForCycle/nextCycleState generalised by totalCycles (the
 * single Downtime cycle sits in the middle — 7 keeps the official 3/1/3).
 *
 * Schema half: name/dates/totalCycles bounds (3–14, default 7).
 *
 * Action half (I/O mocked): one active campaign at a time, phase derived on
 * creation, totalCycles cannot shrink below the current cycle, and editing
 * re-derives the phase for the current cycle.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  phaseForCycle,
  nextCycleState,
  downtimeCycle,
} from "@/lib/campaign-rules";
import { createCampaignSchema, updateCampaignSchema } from "@/lib/validation";

/* ---- next/cache ---- */
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/* ---- Auth guard ---- */
vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: "admin-1", role: "admin" }),
  requireUser: vi.fn(),
}));

/* ---- Query helpers ---- */
const { mockGetActiveCampaign, mockGetLatestCampaign } = vi.hoisted(() => ({
  mockGetActiveCampaign: vi.fn(),
  mockGetLatestCampaign: vi.fn(),
}));
vi.mock("@/lib/db/queries", () => ({
  getActiveCampaign: mockGetActiveCampaign,
  getLatestCampaign: mockGetLatestCampaign,
}));

/* ---- mutation helpers ---- */
const { mockApplyDowntime } = vi.hoisted(() => ({ mockApplyDowntime: vi.fn() }));
vi.mock("@/lib/db/mutations", () => ({
  setSympathiserController: vi.fn(),
  clearSympathiserController: vi.fn(),
  advanceCampaignCycle: vi.fn(),
  applyDowntimeEffects: mockApplyDowntime,
}));

/* ---- Drizzle db ---- */
const { dbMock, mockCampaignFindFirst } = vi.hoisted(() => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const insertValues = vi.fn().mockResolvedValue(undefined);
  const insert = vi.fn(() => ({ values: insertValues }));
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const updateSet = vi.fn(() => ({ where: updateWhere }));
  const update = vi.fn(() => ({ set: updateSet }));
  const mockCampaignFindFirst = vi.fn();
  const dbMock: any = {
    insert,
    insertValues,
    update,
    updateSet,
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(dbMock)),
    query: { campaigns: { findFirst: mockCampaignFindFirst }, challenges: { findFirst: vi.fn() }, gangs: { findFirst: vi.fn() } },
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { dbMock, mockCampaignFindFirst };
});
vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    campaigns: { id: "campaigns.id", status: "campaigns.status" },
    challenges: { id: "challenges.id" },
    gangs: { id: "gangs.id" },
    sympathisers: { id: "sympathisers.id", enabled: "sympathisers.enabled" },
    triumphs: { id: "triumphs.id" },
  },
}));

import {
  createCampaign,
  updateCampaign,
  setCampaignCycle,
} from "@/app/admin/campaign/actions";

const UUID_C = "123e4567-e89b-12d3-a456-426614174000";

function form(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

/* ------------------------------------------------------------------ */
/*  Generalised campaign rules                                          */
/* ------------------------------------------------------------------ */
describe("campaign rules generalised by totalCycles", () => {
  it("keeps the official 7-cycle shape (3 GD / 1 DT / 3 Spark)", () => {
    expect(downtimeCycle(7)).toBe(4);
    expect(phaseForCycle(3, 7)).toBe("great_darkness");
    expect(phaseForCycle(4, 7)).toBe("downtime");
    expect(phaseForCycle(5, 7)).toBe("spark_of_rebellion");
    // default parameter preserves the pre-#66 behaviour
    expect(phaseForCycle(4)).toBe("downtime");
  });

  it("places the single Downtime cycle in the middle for other lengths", () => {
    expect(downtimeCycle(3)).toBe(2); // 1 GD / 1 DT / 1 Spark
    expect(phaseForCycle(1, 3)).toBe("great_darkness");
    expect(phaseForCycle(2, 3)).toBe("downtime");
    expect(phaseForCycle(3, 3)).toBe("spark_of_rebellion");
    expect(downtimeCycle(10)).toBe(5); // 4 GD / 1 DT / 5 Spark
    expect(phaseForCycle(5, 10)).toBe("downtime");
  });

  it("nextCycleState caps at the configured length", () => {
    const r = nextCycleState(5, 5);
    expect(r.cycle).toBe(5);
    expect(r.finished).toBe(true);
    expect(nextCycleState(2, 5)).toEqual({
      cycle: 3,
      phase: "downtime",
      finished: false,
    });
  });
});

/* ------------------------------------------------------------------ */
/*  Schemas                                                             */
/* ------------------------------------------------------------------ */
describe("campaign schemas", () => {
  it("totalCycles is bounded to 3–14 and defaults to 7", () => {
    const base = { name: "Cinderak II" };
    const r = createCampaignSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.totalCycles).toBe(7);
    expect(createCampaignSchema.safeParse({ ...base, totalCycles: "2" }).success).toBe(false);
    expect(createCampaignSchema.safeParse({ ...base, totalCycles: "15" }).success).toBe(false);
  });

  it("dates must be YYYY-MM-DD; empty means not set", () => {
    const base = { name: "Cinderak II" };
    const ok = createCampaignSchema.safeParse({ ...base, startDate: "2026-08-10", endDate: "" });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data.startDate).toBe("2026-08-10");
      expect(ok.data.endDate).toBeUndefined();
    }
    expect(createCampaignSchema.safeParse({ ...base, startDate: "10/08/2026" }).success).toBe(false);
  });

  it("updateCampaignSchema requires the campaign id", () => {
    expect(
      updateCampaignSchema.safeParse({ name: "Cinderak II", campaignId: "nope" }).success,
    ).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  Actions                                                             */
/* ------------------------------------------------------------------ */
describe("createCampaign", () => {
  it("rejects while another campaign is active", async () => {
    mockGetActiveCampaign.mockResolvedValue({ id: UUID_C, name: "Cinderak Burning" });

    const res = await createCampaign({}, form({ name: "Cinderak II" }));

    expect(res.error).toMatch(/still active/);
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it("creates cycle 1 as great_darkness with the chosen length", async () => {
    mockGetActiveCampaign.mockResolvedValue(null);

    const res = await createCampaign(
      {},
      form({ name: "Cinderak II", totalCycles: "5" }),
    );

    expect(res.success).toMatch(/cycle 1 of 5/);
    const values = dbMock.insertValues.mock.calls[0]?.[0];
    expect(values).toMatchObject({
      name: "Cinderak II",
      currentCycle: 1,
      totalCycles: 5,
      phase: "great_darkness",
      status: "active",
    });
  });
});

describe("setCampaignCycle", () => {
  const base = {
    id: UUID_C,
    name: "Cinderak Burning",
    status: "active",
    totalCycles: 7,
  };

  it("rejects a cycle above the campaign length", async () => {
    mockCampaignFindFirst.mockResolvedValue({ ...base, currentCycle: 3, phase: "great_darkness" });

    const res = await setCampaignCycle(
      {},
      form({ campaignId: UUID_C, cycle: "9" }),
    );

    expect(res.error).toMatch(/cannot exceed the campaign length \(7\)/);
    expect(dbMock.update).not.toHaveBeenCalled();
  });

  it("rewinds and re-derives the phase (regret button)", async () => {
    mockCampaignFindFirst.mockResolvedValue({ ...base, currentCycle: 5, phase: "spark_of_rebellion" });

    const res = await setCampaignCycle(
      {},
      form({ campaignId: UUID_C, cycle: "2" }),
    );

    expect(res.success).toMatch(/cycle 2/);
    const setArg = dbMock.updateSet.mock.calls[0]?.[0];
    expect(setArg).toEqual({ currentCycle: 2, phase: "great_darkness" });
    expect(mockApplyDowntime).not.toHaveBeenCalled();
  });

  it("applies Downtime effects when landing ON the Downtime cycle", async () => {
    mockCampaignFindFirst.mockResolvedValue({ ...base, currentCycle: 2, phase: "great_darkness" });

    const res = await setCampaignCycle(
      {},
      form({ campaignId: UUID_C, cycle: "4" }),
    );

    expect(res.success).toMatch(/downtime/);
    expect(mockApplyDowntime).toHaveBeenCalledTimes(1);
  });

  it("rejects when the campaign is closed", async () => {
    mockCampaignFindFirst.mockResolvedValue({ ...base, status: "finished", currentCycle: 7, phase: "spark_of_rebellion" });

    const res = await setCampaignCycle(
      {},
      form({ campaignId: UUID_C, cycle: "3" }),
    );

    expect(res.error).toBe("The campaign is closed.");
  });
});

describe("updateCampaign", () => {
  it("rejects shrinking totalCycles below the current cycle", async () => {
    mockCampaignFindFirst.mockResolvedValue({
      id: UUID_C,
      name: "Cinderak Burning",
      currentCycle: 5,
      totalCycles: 7,
    });

    const res = await updateCampaign(
      {},
      form({ campaignId: UUID_C, name: "Cinderak Burning", totalCycles: "4" }),
    );

    expect(res.error).toMatch(/cannot be below the current cycle \(5\)/);
    expect(dbMock.update).not.toHaveBeenCalled();
  });

  it("re-derives the phase for the current cycle when the length changes", async () => {
    mockCampaignFindFirst.mockResolvedValue({
      id: UUID_C,
      name: "Cinderak Burning",
      currentCycle: 4,
      totalCycles: 7,
    });

    // 4 was Downtime in a 7-cycle campaign; in 12 cycles Downtime is 6, so
    // cycle 4 becomes Great Darkness again.
    const res = await updateCampaign(
      {},
      form({ campaignId: UUID_C, name: "Cinderak Burning", totalCycles: "12" }),
    );

    expect(res.success).toBeTruthy();
    const setArg = dbMock.updateSet.mock.calls[0]?.[0];
    expect(setArg).toMatchObject({ totalCycles: 12, phase: "great_darkness" });
  });
});
