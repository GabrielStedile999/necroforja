import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/* ------------------------------------------------------------------ */
/*  In-memory fallback (single-instance / development)                 */
/* ------------------------------------------------------------------ */

/** Per-key hit timestamps. One store per Node.js process. */
const _hits = new Map<string, number[]>();

/**
 * Sliding-window rate limiter backed by a simple Map.
 * Exported separately so tests can exercise the logic without Upstash.
 *
 * @returns `true` when the request is allowed, `false` when blocked.
 */
export function inMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const recent = (_hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    _hits.set(key, recent);
    return false;
  }
  recent.push(now);
  _hits.set(key, recent);
  return true;
}

/* ------------------------------------------------------------------ */
/*  Upstash Ratelimit (durable across serverless cold starts)          */
/* ------------------------------------------------------------------ */

/** Singleton — created once and reused in the same Node.js instance. */
let _upstash: Ratelimit | null = null;

/**
 * Returns an Upstash Ratelimit instance when the required env vars are set,
 * or `null` to signal that the in-memory fallback should be used.
 *
 * Uses `||` (not `??`) so an empty string in `.env` is treated as absent.
 */
function getUpstashRatelimit(limit: number, windowSec: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
  if (!url || !token) return null;

  if (!_upstash) {
    _upstash = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: "necroforja:rl",
      analytics: true,
    });
  }

  return _upstash;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Rate-limits `key` to `limit` requests per `windowSec`-second window.
 *
 * - **Upstash** (production): when `UPSTASH_REDIS_REST_URL` +
 *   `UPSTASH_REDIS_REST_TOKEN` are set — counts across all serverless
 *   instances, survives cold starts.
 * - **In-memory** (dev / single-instance fallback): per-process Map;
 *   resets on cold start — fine for low-volume development.
 *
 * @returns `true` when the request is allowed, `false` when blocked.
 */
export async function rateLimit(
  key: string,
  limit = 20,
  windowSec = 60,
): Promise<boolean> {
  const rl = getUpstashRatelimit(limit, windowSec);

  if (rl) {
    const { success } = await rl.limit(key);
    return success;
  }

  return inMemoryRateLimit(key, limit, windowSec * 1_000);
}
