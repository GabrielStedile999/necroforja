/**
 * Gang CRUD tests (issue #64).
 *
 * Schema half: bounds for name/house/Reputation (1–20), transfer target
 * optional (empty string = release), delete requires a confirm name.
 *
 * Action half (I/O mocked): admin-only paths — update, transfer with the
 * one-gang-per-player rule, release, create-for-account and delete with
 * type-to-confirm.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  updateGangSchema,
  transferGangSchema,
  deleteGangSchema,
} from "@/lib/validation";

/* ---- next/cache ---- */
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/* ---- Auth guard (admin) ---- */
const { mockRequireAdmin } = vi.hoisted(() => ({ mockRequireAdmin: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: mockRequireAdmin,
  requireUser: vi.fn(),
}));

/* ---- Query helpers ---- */
const { mockGetActiveCampaign } = vi.hoisted(() => ({
  mockGetActiveCampaign: vi.fn(),
}));
vi.mock("@/lib/db/queries", () => ({
  getActiveCampaign: mockGetActiveCampaign,
}));

/* ---- recalc ---- */
const { mockRecalc } = vi.hoisted(() => ({ mockRecalc: vi.fn() }));
vi.mock("@/lib/db/mutations", () => ({ recalcGangScores: mockRecalc }));

/* ---- Drizzle db ---- */
const {
  txMock,
  dbMock,
  mockTransaction,
  mockGangFindFirst,
  mockUserFindFirst,
} = vi.hoisted(() => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const build = () => {
    const returning = vi.fn().mockResolvedValue([{ id: "gang-new" }]);
    const insertValues = vi.fn(() => ({ returning }));
    const insert = vi.fn(() => ({ values: insertValues }));
    const updateWhere = vi.fn().mockResolvedValue(undefined);
    const updateSet = vi.fn(() => ({ where: updateWhere }));
    const update = vi.fn(() => ({ set: updateSet }));
    const deleteWhere = vi.fn().mockResolvedValue(undefined);
    const del = vi.fn(() => ({ where: deleteWhere }));
    return { insert, insertValues, returning, update, updateSet, updateWhere, delete: del, deleteWhere };
  };
  const txMock: any = build();
  const mockGangFindFirst = vi.fn();
  const mockUserFindFirst = vi.fn();
  const mockTransaction = vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn(txMock),
  );
  const dbMock: any = {
    ...build(),
    transaction: mockTransaction,
    query: {
      gangs: { findFirst: mockGangFindFirst },
      users: { findFirst: mockUserFindFirst },
    },
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { txMock, dbMock, mockTransaction, mockGangFindFirst, mockUserFindFirst };
});
vi.mock("@/lib/db", () => ({
  db: dbMock,
  schema: {
    gangs: { id: "gangs.id", ownerUserId: "gangs.owner" },
    users: { id: "users.id" },
  },
}));

import {
  updateGang,
  transferGang,
  createGangForUser,
  deleteGang,
} from "@/app/admin/gangs/actions";

const UUID_G = "123e4567-e89b-12d3-a456-426614174000";
const UUID_U = "987fcdeb-51a2-43d7-b012-0987654321ab";

function form(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });
});

/* ------------------------------------------------------------------ */
/*  Schemas                                                             */
/* ------------------------------------------------------------------ */
describe("gang CRUD schemas", () => {
  it("reputation is bounded to 1–20", () => {
    const base = { gangId: UUID_G, name: "Iron Reapers", house: "Goliath" };
    expect(updateGangSchema.safeParse({ ...base, reputation: "1" }).success).toBe(true);
    expect(updateGangSchema.safeParse({ ...base, reputation: "20" }).success).toBe(true);
    expect(updateGangSchema.safeParse({ ...base, reputation: "0" }).success).toBe(false);
    expect(updateGangSchema.safeParse({ ...base, reputation: "21" }).success).toBe(false);
  });

  it("transfer target is optional — empty string means release", () => {
    const r = transferGangSchema.safeParse({ gangId: UUID_G, newOwnerUserId: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.newOwnerUserId).toBeUndefined();
    expect(
      transferGangSchema.safeParse({ gangId: UUID_G, newOwnerUserId: "nope" }).success,
    ).toBe(false);
  });

  it("delete requires a non-empty confirm name", () => {
    expect(deleteGangSchema.safeParse({ gangId: UUID_G, confirmName: "" }).success).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  Actions                                                             */
/* ------------------------------------------------------------------ */
describe("updateGang", () => {
  it("updates name/house/reputation", async () => {
    mockGangFindFirst.mockResolvedValue({ id: UUID_G });

    const res = await updateGang(
      {},
      form({ gangId: UUID_G, name: "Sump Rats", house: "Orlock", reputation: "5" }),
    );

    expect(res.success).toBe("Sump Rats updated.");
    const setArg = dbMock.updateSet.mock.calls[0]?.[0];
    expect(setArg).toEqual({ name: "Sump Rats", house: "Orlock", reputation: 5 });
  });

  it("errors when the gang does not exist", async () => {
    mockGangFindFirst.mockResolvedValue(null);

    const res = await updateGang(
      {},
      form({ gangId: UUID_G, name: "Sump Rats", house: "Orlock", reputation: "5" }),
    );

    expect(res.error).toBe("Gang not found.");
    expect(dbMock.update).not.toHaveBeenCalled();
  });
});

describe("transferGang", () => {
  it("rejects a target that already owns another gang (one gang per player)", async () => {
    mockGangFindFirst.mockResolvedValue({ id: UUID_G, name: "Iron Reapers" });
    mockUserFindFirst.mockResolvedValue({
      id: UUID_U,
      role: "player",
      displayName: "Kal",
      gangs: [{ id: "other-gang" }],
    });

    const res = await transferGang(
      {},
      form({ gangId: UUID_G, newOwnerUserId: UUID_U }),
    );

    expect(res.error).toBe("Kal already owns a gang.");
    expect(dbMock.update).not.toHaveBeenCalled();
  });

  it("rejects an unknown or non-player target", async () => {
    mockGangFindFirst.mockResolvedValue({ id: UUID_G, name: "Iron Reapers" });
    mockUserFindFirst.mockResolvedValue(null);

    const res = await transferGang(
      {},
      form({ gangId: UUID_G, newOwnerUserId: UUID_U }),
    );

    expect(res.error).toBe("Target account not found (must be a player).");
  });

  it("transfers to a player without a gang", async () => {
    mockGangFindFirst.mockResolvedValue({ id: UUID_G, name: "Iron Reapers" });
    mockUserFindFirst.mockResolvedValue({
      id: UUID_U,
      role: "player",
      displayName: "Kal",
      gangs: [],
    });

    const res = await transferGang(
      {},
      form({ gangId: UUID_G, newOwnerUserId: UUID_U }),
    );

    expect(res.success).toBe("Iron Reapers transferred to Kal.");
    expect(dbMock.updateSet).toHaveBeenCalledWith({ ownerUserId: UUID_U });
  });

  it("releases the gang when no target is chosen", async () => {
    mockGangFindFirst.mockResolvedValue({ id: UUID_G, name: "Iron Reapers" });

    const res = await transferGang({}, form({ gangId: UUID_G, newOwnerUserId: "" }));

    expect(res.success).toBe("Iron Reapers released (no owner).");
    expect(dbMock.updateSet).toHaveBeenCalledWith({ ownerUserId: null });
    expect(mockUserFindFirst).not.toHaveBeenCalled();
  });
});

describe("createGangForUser", () => {
  it("creates the gang in a transaction and seeds the cached scores", async () => {
    mockUserFindFirst.mockResolvedValue({
      id: UUID_U,
      role: "player",
      displayName: "Kal",
      gangs: [],
    });
    mockGetActiveCampaign.mockResolvedValue({ id: "camp-1" });

    const res = await createGangForUser(
      {},
      form({ userId: UUID_U, name: "Sump Rats", house: "Orlock" }),
    );

    expect(res.success).toBe("Sump Rats created for Kal.");
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(txMock.insert).toHaveBeenCalledTimes(1);
    expect(mockRecalc).toHaveBeenCalledWith("gang-new", txMock);
  });

  it("rejects an account that already owns a gang", async () => {
    mockUserFindFirst.mockResolvedValue({
      id: UUID_U,
      role: "player",
      displayName: "Kal",
      gangs: [{ id: "other" }],
    });

    const res = await createGangForUser(
      {},
      form({ userId: UUID_U, name: "Sump Rats", house: "Orlock" }),
    );

    expect(res.error).toBe("Kal already owns a gang.");
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("requires an active campaign", async () => {
    mockUserFindFirst.mockResolvedValue({
      id: UUID_U,
      role: "player",
      displayName: "Kal",
      gangs: [],
    });
    mockGetActiveCampaign.mockResolvedValue(null);

    const res = await createGangForUser(
      {},
      form({ userId: UUID_U, name: "Sump Rats", house: "Orlock" }),
    );

    expect(res.error).toBe("No active campaign found.");
  });
});

describe("deleteGang", () => {
  it("refuses when the typed name does not match exactly", async () => {
    mockGangFindFirst.mockResolvedValue({ id: UUID_G, name: "Iron Reapers" });

    const res = await deleteGang(
      {},
      form({ gangId: UUID_G, confirmName: "iron reapers" }),
    );

    expect(res.error).toMatch(/does not match/);
    expect(dbMock.delete).not.toHaveBeenCalled();
  });

  it("deletes when the typed name matches", async () => {
    mockGangFindFirst.mockResolvedValue({ id: UUID_G, name: "Iron Reapers" });

    const res = await deleteGang(
      {},
      form({ gangId: UUID_G, confirmName: "Iron Reapers" }),
    );

    expect(res.success).toMatch(/Iron Reapers deleted/);
    expect(dbMock.delete).toHaveBeenCalledTimes(1);
  });
});
