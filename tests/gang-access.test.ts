/**
 * Arbitrator mode authorisation tests (issue #65).
 *
 * resolveGangForWrite is the single choke point deciding WHICH gang a
 * roster mutation may touch: the admin addresses any gang explicitly via
 * gangId; a player always resolves to their own gang, and a tampered
 * hidden gangId pointing at another gang is rejected. The action-level
 * test proves the helper is actually wired into the player actions.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

/* ---- next/cache ---- */
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/* ---- Auth guard (role switches per test) ---- */
const { mockRequireUser } = vi.hoisted(() => ({ mockRequireUser: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({
  requireUser: mockRequireUser,
  requireAdmin: vi.fn(),
}));

/* ---- Query helpers ---- */
const { mockGetGangById, mockGetGangByOwnerId, mockFighterBelongsToGang } =
  vi.hoisted(() => ({
    mockGetGangById: vi.fn(),
    mockGetGangByOwnerId: vi.fn(),
    mockFighterBelongsToGang: vi.fn(),
  }));
vi.mock("@/lib/db/queries", () => ({
  getGangById: mockGetGangById,
  getGangByOwnerId: mockGetGangByOwnerId,
  fighterBelongsToGang: mockFighterBelongsToGang,
  stashItemBelongsToGang: vi.fn(),
  countFighterWeapons: vi.fn().mockResolvedValue(0),
  getCatalogItemById: vi.fn().mockResolvedValue(null),
}));

/* ---- recalc ---- */
const { mockRecalc } = vi.hoisted(() => ({ mockRecalc: vi.fn() }));
vi.mock("@/lib/db/mutations", () => ({ recalcGangScores: mockRecalc }));

/* ---- Drizzle db ---- */
const { txMock, dbMock, mockTransaction } = vi.hoisted(() => {
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const updateSet = vi.fn(() => ({ where: updateWhere }));
  const update = vi.fn(() => ({ set: updateSet }));
  const txMock = { update, updateSet, updateWhere };
  const mockTransaction = vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn(txMock),
  );
  const dbMock = { transaction: mockTransaction, update: vi.fn() };
  return { txMock, dbMock, mockTransaction };
});
vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: { fighters: { id: "fighters.id", xp: "fighters.xp" } },
}));

import { resolveGangForWrite, gangIdFromForm } from "@/lib/auth/gang-access";
import { updateFighterStatus } from "@/app/player/actions";

const OWN_GANG = { id: "gang-own", name: "Iron Reapers" };
const OTHER_GANG = { id: "gang-other", name: "Sump Rats" };
const UUID_F = "123e4567-e89b-12d3-a456-426614174000";

function form(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

/* ------------------------------------------------------------------ */
/*  resolveGangForWrite                                                 */
/* ------------------------------------------------------------------ */
describe("resolveGangForWrite", () => {
  it("admin resolves ANY gang addressed by gangId", async () => {
    mockRequireUser.mockResolvedValue({ id: "admin-1", role: "admin" });
    mockGetGangById.mockResolvedValue(OTHER_GANG);

    const r = await resolveGangForWrite("gang-other");

    expect(r).toEqual({ gang: OTHER_GANG, isAdmin: true });
    expect(mockGetGangById).toHaveBeenCalledWith("gang-other");
    expect(mockGetGangByOwnerId).not.toHaveBeenCalled();
  });

  it("admin without a gangId gets an explicit error (owns no gang)", async () => {
    mockRequireUser.mockResolvedValue({ id: "admin-1", role: "admin" });

    const r = await resolveGangForWrite(undefined);

    expect("error" in r).toBe(true);
    expect(mockGetGangById).not.toHaveBeenCalled();
  });

  it("admin addressing an unknown gang gets 'Gang not found.'", async () => {
    mockRequireUser.mockResolvedValue({ id: "admin-1", role: "admin" });
    mockGetGangById.mockResolvedValue(null);

    const r = await resolveGangForWrite("nope");

    expect(r).toEqual({ error: "Gang not found." });
  });

  it("player always resolves to their own gang", async () => {
    mockRequireUser.mockResolvedValue({ id: "user-1", role: "player" });
    mockGetGangByOwnerId.mockResolvedValue(OWN_GANG);

    const r = await resolveGangForWrite(undefined);

    expect(r).toEqual({ gang: OWN_GANG, isAdmin: false });
    expect(mockGetGangById).not.toHaveBeenCalled();
  });

  it("player sending their OWN gangId is accepted (shared forms)", async () => {
    mockRequireUser.mockResolvedValue({ id: "user-1", role: "player" });
    mockGetGangByOwnerId.mockResolvedValue(OWN_GANG);

    const r = await resolveGangForWrite("gang-own");

    expect(r).toEqual({ gang: OWN_GANG, isAdmin: false });
  });

  it("player sending ANOTHER gang's id is rejected", async () => {
    mockRequireUser.mockResolvedValue({ id: "user-1", role: "player" });
    mockGetGangByOwnerId.mockResolvedValue(OWN_GANG);

    const r = await resolveGangForWrite("gang-other");

    expect(r).toEqual({ error: "Invalid gang." });
    // never even looks the other gang up
    expect(mockGetGangById).not.toHaveBeenCalled();
  });
});

describe("gangIdFromForm", () => {
  it("reads a non-empty gangId and ignores an absent/empty one", () => {
    expect(gangIdFromForm(form({ gangId: "gang-1" }))).toBe("gang-1");
    expect(gangIdFromForm(form({}))).toBeUndefined();
    expect(gangIdFromForm(form({ gangId: "" }))).toBeUndefined();
  });
});

/* ------------------------------------------------------------------ */
/*  Wired into the actions                                              */
/* ------------------------------------------------------------------ */
describe("player actions in Arbitrator mode", () => {
  it("admin edits a fighter of any gang via the hidden gangId", async () => {
    mockRequireUser.mockResolvedValue({ id: "admin-1", role: "admin" });
    mockGetGangById.mockResolvedValue(OTHER_GANG);
    mockFighterBelongsToGang.mockResolvedValue(true);

    const res = await updateFighterStatus(
      {},
      form({ gangId: "gang-other", fighterId: UUID_F, status: "injured" }),
    );

    expect(res.success).toBeTruthy();
    // ownership was checked against the gang resolved for the ADMIN
    expect(mockFighterBelongsToGang).toHaveBeenCalledWith(
      UUID_F,
      OTHER_GANG.id,
    );
    expect(mockRecalc).toHaveBeenCalledWith(OTHER_GANG.id, txMock);
  });

  it("player tampering the hidden gangId cannot write to another gang", async () => {
    mockRequireUser.mockResolvedValue({ id: "user-1", role: "player" });
    mockGetGangByOwnerId.mockResolvedValue(OWN_GANG);

    const res = await updateFighterStatus(
      {},
      form({ gangId: "gang-other", fighterId: UUID_F, status: "injured" }),
    );

    expect(res.error).toBe("Invalid gang.");
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
