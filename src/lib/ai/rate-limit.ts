/**
 * Simple in-memory rate limiting (sliding window per key).
 * Sufficient for the low volume of this campaign on a single instance.
 * For multi-instance production (serverless), replace with Upstash Ratelimit.
 */
const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
