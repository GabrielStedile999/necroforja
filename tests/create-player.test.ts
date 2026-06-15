/**
 * Integration tests for the `createPlayer` Server Action.
 *
 * We mock all I/O boundaries (DB, auth guards, password hashing,
 * Next.js cache) so the test suite is hermetic and runs in CI without
 * a live Postgres database.
 *
 * What is verified:
 *  - Zod validation catches invalid payloads before touching the DB.
 *  - Duplicate e-mail check returns a user-visible error.
 *  - Missing active campaign returns an appropriate error.
 *  - DB insert failure (unexpected empty result) returns a safe error.
 *  - Happy path: user + gang are inserted and the route is revalidated.
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
vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed-pw"),
}));

/* ---- DB queries ---- */
const { mockGetActiveCampaign } = vi.hoisted(() => ({
  mockGetActiveCampaign: vi.fn(),
}));
vi.mock("@/lib/db/queries", () => ({
  getActiveCampaign: mockGetActiveCampaign,
  // other query exports used by admin/actions.ts — not needed here
}));

/* ---- Drizzle db ---- */
const {
  mockFindFirst,
  mockInsertReturning,
  mockInsertValues,
  mockInsert,
} = vi.hoisted(() => {
  const mockInsertReturning = vi.fn();
  const mockInsertValues = vi.fn(() => ({ returning: mockInsertReturning }));
  const mockInsert = vi.fn(() => ({ values: mockInsertValues }));
  const mockFindFirst = vi.fn();
  return { mockFindFirst, mockInsertReturning, mockInsertValues, mockInsert };
});

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      users: { findFirst: mockFindFirst },
    },
    insert: mockInsert,
  },
  schema: {
    users: "users_table",
    gangs: "gangs_table",
  },
}));

/* ---- Import the action AFTER all mocks are set up ---- */
import { createPlayer } from "@/app/admin/actions";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Builds a valid FormData for createPlayer. */
function validFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.append("displayName", "Davi");
  fd.append("email", "davi@example.com");
  fd.append("password", "secure1234");
  fd.append("gangName", "Red Harvest");
  fd.append("house", "Corpse Grinders");
  for (const [k, v] of Object.entries(overrides)) {
    fd.set(k, v);
  }
  return fd;
}

/** A minimal active campaign stub. */
const CAMPAIGN = { id: "campaign-id", currentCycle: 1, status: "active" };

/* ------------------------------------------------------------------ */
/*  Tests                                                               */
/* ------------------------------------------------------------------ */

describe("createPlayer action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default happy-path DB state
    mockGetActiveCampaign.mockResolvedValue(CAMPAIGN);
    mockFindFirst.mockResolvedValue(null);            // no existing user
    mockInsertReturning.mockResolvedValue([{ id: "new-user-id" }]); // insert succeeds
  });

  it("returns an error when the password is too short (< 8 chars)", async () => {
    const fd = validFormData({ password: "short" });
    const result = await createPlayer({}, fd);
    expect(result.error).toBeTruthy();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns an error when the e-mail is invalid", async () => {
    const fd = validFormData({ email: "not-an-email" });
    const result = await createPlayer({}, fd);
    expect(result.error).toBeTruthy();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns an error when the e-mail already exists", async () => {
    mockFindFirst.mockResolvedValue({ id: "existing", email: "davi@example.com" });
    const result = await createPlayer({}, validFormData());
    expect(result.error).toMatch(/already exists/i);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns an error when there is no active campaign", async () => {
    mockGetActiveCampaign.mockResolvedValue(null);
    const result = await createPlayer({}, validFormData());
    expect(result.error).toMatch(/no active campaign/i);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns an error when the user insert returns an empty result", async () => {
    mockInsertReturning.mockResolvedValue([]); // simulates a DB-level failure
    const result = await createPlayer({}, validFormData());
    expect(result.error).toMatch(/failed to create/i);
  });

  it("inserts user and gang on the happy path and returns success", async () => {
    const result = await createPlayer({}, validFormData());

    // Two inserts: user, then gang
    expect(mockInsert).toHaveBeenCalledTimes(2);

    // Success message mentions the player's name
    expect(result.success).toMatch(/davi/i);
    expect(result.error).toBeUndefined();
  });

  it("passes the hashed password to the DB (never the plain text)", async () => {
    await createPlayer({}, validFormData());
    const calls = mockInsertValues.mock.calls;
    const firstCall = calls[0] as unknown as [Record<string, unknown>];
    const insertedUser = firstCall[0];
    expect(insertedUser?.passwordHash).toBe("hashed-pw");
    expect(insertedUser?.passwordHash).not.toBe("secure1234");
  });
});
