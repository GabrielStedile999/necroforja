/**
 * Edit fighter tests (issue #63).
 *
 * Schema half: updateFighterSchema accepts the full field set + fighterId,
 * and normalises empty characteristic inputs to `undefined` (so an
 * untouched field on the edit form leaves the stored value unchanged).
 *
 * Action half (I/O mocked, same approach as transactional-hardening):
 * ownership is enforced before writing, the update + recalc run in one
 * transaction, and validation failures never reach the database.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  updateFighterSchema,
  fighterSchema,
  fighterAvatarRequestSchema,
  fighterAvatarConfirmSchema,
  FIGHTER_AVATAR_MAX_BYTES,
} from "@/lib/validation";

/* ---- next/cache ---- */
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/* ---- Auth guard ---- */
vi.mock("@/lib/auth/guards", () => ({
  requireUser: vi.fn().mockResolvedValue({ id: "user-1" }),
}));

/* ---- Query helpers ---- */
const { mockGetGangByOwnerId, mockFighterBelongsToGang } = vi.hoisted(() => ({
  mockGetGangByOwnerId: vi.fn(),
  mockFighterBelongsToGang: vi.fn(),
}));
vi.mock("@/lib/db/queries", () => ({
  getGangByOwnerId: mockGetGangByOwnerId,
  getGangById: vi.fn(),
  fighterBelongsToGang: mockFighterBelongsToGang,
  stashItemBelongsToGang: vi.fn(),
  countFighterWeapons: vi.fn().mockResolvedValue(0),
}));

/* ---- recalcGangScores ---- */
const { mockRecalc } = vi.hoisted(() => ({ mockRecalc: vi.fn() }));
vi.mock("@/lib/db/mutations", () => ({
  recalcGangScores: mockRecalc,
}));

/* ---- Drizzle db ---- */
const { txMock, dbMock, mockTransaction } = vi.hoisted(() => {
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const updateSet = vi.fn((_values: Record<string, unknown>) => ({
    where: updateWhere,
  }));
  const update = vi.fn(() => ({ set: updateSet }));
  const txMock = { update, updateSet, updateWhere };
  const mockTransaction = vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn(txMock),
  );
  const dbMock = {
    transaction: mockTransaction,
    update: vi.fn(),
  };
  return { txMock, dbMock, mockTransaction };
});

vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: { fighters: { id: "fighters.id" } },
}));

/* ---- Import the action AFTER all mocks ---- */
import { updateFighter } from "@/app/player/actions";

const GANG = { id: "gang-1", name: "Iron Reapers" };
const UUID_F = "123e4567-e89b-12d3-a456-426614174000";

const VALID = {
  fighterId: UUID_F,
  name: "Grix",
  type: "Gunner",
  category: "ganger",
  baseCost: "55",
};

function form(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetGangByOwnerId.mockResolvedValue(GANG);
  mockFighterBelongsToGang.mockResolvedValue(true);
});

/* ------------------------------------------------------------------ */
/*  Schema                                                              */
/* ------------------------------------------------------------------ */
describe("updateFighterSchema", () => {
  it("accepts the full field set and coerces numbers", () => {
    const r = updateFighterSchema.safeParse({
      ...VALID,
      m: "5",
      ws: "4",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.fighterId).toBe(UUID_F);
      expect(r.data.baseCost).toBe(55);
      expect(r.data.m).toBe(5);
      expect(r.data.ws).toBe(4);
    }
  });

  it('normalises empty characteristic inputs ("") to undefined', () => {
    const r = updateFighterSchema.safeParse({ ...VALID, m: "", ld: "" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.m).toBeUndefined();
      expect(r.data.ld).toBeUndefined();
    }
  });

  it("rejects an invalid fighterId", () => {
    expect(
      updateFighterSchema.safeParse({ ...VALID, fighterId: "nope" }).success,
    ).toBe(false);
  });

  it("rejects characteristics above their Fighter Card bounds", () => {
    expect(updateFighterSchema.safeParse({ ...VALID, m: "21" }).success).toBe(
      false,
    );
  });

  it("target-roll stats accept only 1–6", () => {
    for (const ok of ["1", "6"]) {
      expect(
        updateFighterSchema.safeParse({ ...VALID, bs: ok, wil: ok }).success,
      ).toBe(true);
    }
    for (const bad of ["0", "7", "13", "-", "+", "3+"]) {
      expect(
        updateFighterSchema.safeParse({ ...VALID, ws: bad }).success,
      ).toBe(false);
    }
  });

  it("fighterSchema keeps the same empty-input normalisation (shared statField)", () => {
    const r = fighterSchema.safeParse({
      name: "Grix",
      type: "Gunner",
      category: "ganger",
      baseCost: "55",
      m: "",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.m).toBeUndefined();
  });
});

/* ------------------------------------------------------------------ */
/*  Portrait schemas (issue #63)                                        */
/* ------------------------------------------------------------------ */
describe("fighter portrait validation", () => {
  it("accepts JPEG/PNG/WebP up to 2 MB", () => {
    for (const mime of ["image/jpeg", "image/png", "image/webp"]) {
      expect(
        fighterAvatarRequestSchema.safeParse({
          fighterId: UUID_F,
          mime,
          bytes: FIGHTER_AVATAR_MAX_BYTES,
        }).success,
      ).toBe(true);
    }
  });

  it("rejects GIF/SVG and oversized files", () => {
    expect(
      fighterAvatarRequestSchema.safeParse({
        fighterId: UUID_F,
        mime: "image/gif",
        bytes: 1000,
      }).success,
    ).toBe(false);
    expect(
      fighterAvatarRequestSchema.safeParse({
        fighterId: UUID_F,
        mime: "image/svg+xml",
        bytes: 1000,
      }).success,
    ).toBe(false);
    expect(
      fighterAvatarRequestSchema.safeParse({
        fighterId: UUID_F,
        mime: "image/jpeg",
        bytes: FIGHTER_AVATAR_MAX_BYTES + 1,
      }).success,
    ).toBe(false);
  });

  it("confirm path must live under fighter/ with an image extension", () => {
    expect(
      fighterAvatarConfirmSchema.safeParse({
        fighterId: UUID_F,
        path: `fighter/${UUID_F}-a1b2c3d4.webp`,
      }).success,
    ).toBe(true);
    for (const bad of [
      "battle/foo.webp", // gallery category, not a portrait
      `fighter/${UUID_F}-a1b2c3d4.svg`, // extension not allowed
      `fighter/../secret.webp`, // traversal
    ]) {
      expect(
        fighterAvatarConfirmSchema.safeParse({ fighterId: UUID_F, path: bad })
          .success,
      ).toBe(false);
    }
  });
});

/* ------------------------------------------------------------------ */
/*  Action                                                              */
/* ------------------------------------------------------------------ */
describe("updateFighter (action)", () => {
  it("updates through a single transaction and recalcs in the same tx", async () => {
    const res = await updateFighter({}, form({ ...VALID, m: "5" }));

    expect(res.success).toBe("Grix updated.");
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(txMock.update).toHaveBeenCalledTimes(1);
    expect(dbMock.update).not.toHaveBeenCalled();
    expect(mockRecalc).toHaveBeenCalledWith(GANG.id, txMock);

    // empty/absent stats arrive as undefined → drizzle leaves them unchanged
    const setArg = txMock.updateSet.mock.calls[0]![0];
    expect(setArg.name).toBe("Grix");
    expect(setArg.baseCost).toBe(55);
    expect(setArg.m).toBe(5);
    expect(setArg.ws).toBeUndefined();
  });

  it("rejects a fighter that belongs to another gang", async () => {
    mockFighterBelongsToGang.mockResolvedValue(false);

    const res = await updateFighter({}, form(VALID));

    expect(res.error).toBe("Invalid fighter.");
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("returns a validation error without touching the database", async () => {
    const res = await updateFighter({}, form({ ...VALID, baseCost: "-10" }));

    expect(res.error).toBeTruthy();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("errors when the user has no gang", async () => {
    mockGetGangByOwnerId.mockResolvedValue(null);

    const res = await updateFighter({}, form(VALID));

    expect(res.error).toBe("You don't have a gang yet.");
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
