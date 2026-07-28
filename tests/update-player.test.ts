/**
 * Integration tests for the `updatePlayer` Server Action (issue #57).
 *
 * Same hermetic approach as tests/create-player.test.ts: all I/O
 * boundaries (DB, auth guard, password hashing, Next.js cache) are
 * mocked, so the suite runs in CI without a live Postgres.
 *
 * What is verified:
 *  - Zod validation (invalid e-mail / short password) blocks before the DB.
 *  - Empty password is allowed and keeps the current hash untouched.
 *  - Non-existent target and non-player targets are refused.
 *  - E-mail uniqueness is enforced (excluding the player itself).
 *  - Happy paths with and without password change.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

/* ---- Upstash stubs (not installed in test env) ---- */
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow() { return null; }
    limit() { return Promise.resolve({ success: true }); }
  },
}));
vi.mock("@upstash/redis", () => ({ Redis: class {} }));

/* ---- next/cache ---- */
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/* ---- Auth guard ---- */
vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: vi.fn().mockResolvedValue(undefined),
}));

/* ---- Password hashing ---- */
const { mockHashPassword } = vi.hoisted(() => ({
  mockHashPassword: vi.fn().mockResolvedValue("hashed-pw"),
}));
vi.mock("@/lib/auth/password", () => ({
  hashPassword: mockHashPassword,
}));

/* ---- DB queries (used by other actions in the same module) ---- */
vi.mock("@/lib/db/queries", () => ({
  getActiveCampaign: vi.fn(),
}));

/* ---- Drizzle db ---- */
const { mockFindFirst, mockUpdate, mockUpdateSet, mockUpdateWhere } = vi.hoisted(() => {
  const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
  const mockUpdateSet = vi.fn(() => ({ where: mockUpdateWhere }));
  const mockUpdate = vi.fn(() => ({ set: mockUpdateSet }));
  const mockFindFirst = vi.fn();
  return { mockFindFirst, mockUpdate, mockUpdateSet, mockUpdateWhere };
});

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      users: { findFirst: mockFindFirst },
    },
    update: mockUpdate,
    insert: vi.fn(),
  },
  schema: {
    users: "users_table",
    gangs: "gangs_table",
  },
}));

/* ---- Import the action AFTER all mocks are set up ---- */
import { updatePlayer } from "@/app/admin/actions";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const USER_ID = "3f8e9d2a-1b4c-4d5e-8f6a-7b8c9d0e1f2a";

const TARGET = {
  id: USER_ID,
  email: "davi@player.necroforja",
  displayName: "Davi",
  role: "player",
};

/** Builds a valid FormData for updatePlayer (empty password by default). */
function validFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.append("userId", USER_ID);
  fd.append("displayName", "Davi");
  fd.append("email", "davi@player.necroforja");
  fd.append("password", "");
  for (const [k, v] of Object.entries(overrides)) {
    fd.set(k, v);
  }
  return fd;
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("updatePlayer action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHashPassword.mockResolvedValue("hashed-pw");
    mockFindFirst.mockResolvedValue(TARGET); // default: target found
  });

  it("returns an error when the e-mail is invalid", async () => {
    const result = await updatePlayer({}, validFormData({ email: "not-an-email" }));
    expect(result.error).toBeTruthy();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns an error when a non-empty password is too short", async () => {
    const result = await updatePlayer({}, validFormData({ password: "short" }));
    expect(result.error).toBeTruthy();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns an error when the target does not exist", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await updatePlayer({}, validFormData());
    expect(result.error).toMatch(/not found/i);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("refuses to edit non-player accounts (admin protection)", async () => {
    mockFindFirst.mockResolvedValue({ ...TARGET, role: "admin" });
    const result = await updatePlayer({}, validFormData());
    expect(result.error).toMatch(/only player accounts/i);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns an error when the new e-mail is already taken", async () => {
    mockFindFirst
      .mockResolvedValueOnce(TARGET) // target lookup
      .mockResolvedValueOnce({ id: "other-user" }); // e-mail conflict
    const result = await updatePlayer(
      {},
      validFormData({ email: "taken@player.necroforja" }),
    );
    expect(result.error).toMatch(/already exists/i);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("keeps the same e-mail without running the uniqueness check", async () => {
    const result = await updatePlayer({}, validFormData());
    expect(result.success).toBeTruthy();
    expect(mockFindFirst).toHaveBeenCalledTimes(1); // only the target lookup
  });

  it("empty password keeps the current hash (no passwordHash in update)", async () => {
    const result = await updatePlayer({}, validFormData());
    expect(result.success).toBeTruthy();
    expect(mockHashPassword).not.toHaveBeenCalled();
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.not.objectContaining({ passwordHash: expect.anything() }),
    );
  });

  it("updates name, e-mail and password hash on the full happy path", async () => {
    mockFindFirst
      .mockResolvedValueOnce(TARGET)
      .mockResolvedValueOnce(null); // new e-mail is free
    const result = await updatePlayer(
      {},
      validFormData({
        displayName: "Davi Renamed",
        email: "davi@player.necroforja",
        password: "new-secret-123",
      }),
    );
    expect(result.success).toBeTruthy();
    expect(mockHashPassword).toHaveBeenCalledWith("new-secret-123");
    expect(mockUpdateSet).toHaveBeenCalledWith({
      displayName: "Davi Renamed",
      email: "davi@player.necroforja",
      passwordHash: "hashed-pw",
    });
    expect(mockUpdateWhere).toHaveBeenCalled();
  });
});
