/**
 * Unit tests for the in-memory rate limiter.
 *
 * We test `inMemoryRateLimit` directly (exported from rate-limit.ts) because:
 *  - It contains all the business logic (sliding window, key isolation).
 *  - The Upstash branch requires live credentials and is not testable in CI.
 *  - Fake timers let us verify time-based expiry without waiting.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Import the exported in-memory helper.
// We bypass @upstash/* by mocking the module so the static import doesn't
// require the packages to be installed in the test environment.
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow() { return null; }
    limit() { return Promise.resolve({ success: true }); }
  },
}));
vi.mock("@upstash/redis", () => ({
  Redis: class {},
}));

import { inMemoryRateLimit } from "@/lib/ai/rate-limit";

describe("inMemoryRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first request", () => {
    expect(inMemoryRateLimit("user-a", 3, 60_000)).toBe(true);
  });

  it("allows requests up to the limit", () => {
    const key = "user-limit-test";
    expect(inMemoryRateLimit(key, 3, 60_000)).toBe(true);
    expect(inMemoryRateLimit(key, 3, 60_000)).toBe(true);
    expect(inMemoryRateLimit(key, 3, 60_000)).toBe(true);
  });

  it("blocks the request that exceeds the limit", () => {
    const key = "user-exceed";
    inMemoryRateLimit(key, 2, 60_000);
    inMemoryRateLimit(key, 2, 60_000);
    // Third request should be blocked
    expect(inMemoryRateLimit(key, 2, 60_000)).toBe(false);
  });

  it("continues to block while within the window", () => {
    const key = "user-still-blocked";
    inMemoryRateLimit(key, 1, 60_000);
    expect(inMemoryRateLimit(key, 1, 60_000)).toBe(false);
    // 30 s later — still within the 60 s window
    vi.advanceTimersByTime(30_000);
    expect(inMemoryRateLimit(key, 1, 60_000)).toBe(false);
  });

  it("allows again after the window expires (sliding reset)", () => {
    const key = "user-reset";
    inMemoryRateLimit(key, 1, 60_000); // fills the limit
    expect(inMemoryRateLimit(key, 1, 60_000)).toBe(false); // blocked

    // Advance past the window
    vi.advanceTimersByTime(60_001);

    // Old hit has expired → should be allowed again
    expect(inMemoryRateLimit(key, 1, 60_000)).toBe(true);
  });

  it("partial window expiry: only expired hits are removed", () => {
    const key = "user-partial";
    // Hit 1 at t=0
    inMemoryRateLimit(key, 2, 60_000);
    // Advance 30 s
    vi.advanceTimersByTime(30_000);
    // Hit 2 at t=30 s
    inMemoryRateLimit(key, 2, 60_000);
    // Limit reached: blocked at t=30 s
    expect(inMemoryRateLimit(key, 2, 60_000)).toBe(false);

    // Advance another 31 s → t=61 s. Hit 1 (t=0) has expired; Hit 2 (t=30) is still valid.
    vi.advanceTimersByTime(31_000);
    // One slot freed → allowed
    expect(inMemoryRateLimit(key, 2, 60_000)).toBe(true);
  });

  it("different keys are tracked independently", () => {
    const keyA = "user-iso-a";
    const keyB = "user-iso-b";

    // Fill up keyA
    inMemoryRateLimit(keyA, 1, 60_000);
    expect(inMemoryRateLimit(keyA, 1, 60_000)).toBe(false); // blocked

    // keyB should be unaffected
    expect(inMemoryRateLimit(keyB, 1, 60_000)).toBe(true);
  });

  it("limit=1 blocks immediately after the first request", () => {
    const key = "user-limit-1";
    expect(inMemoryRateLimit(key, 1, 60_000)).toBe(true);
    expect(inMemoryRateLimit(key, 1, 60_000)).toBe(false);
  });

  it("short window (100 ms) resets quickly", () => {
    const key = "user-short-window";
    inMemoryRateLimit(key, 1, 100);
    expect(inMemoryRateLimit(key, 1, 100)).toBe(false); // blocked

    vi.advanceTimersByTime(101);
    expect(inMemoryRateLimit(key, 1, 100)).toBe(true); // allowed again
  });
});
