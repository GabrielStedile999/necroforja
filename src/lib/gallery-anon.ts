/**
 * Anonymous visitor identity for gallery interactions (issue #52) — pure part.
 *
 * The visitor gets a random UUID in an httpOnly cookie (see
 * src/lib/gallery-visitor.ts); the database only ever stores
 * `voter_hash = HMAC-SHA256(uuid, AUTH_SECRET)`. No IP address or raw
 * identifier is persisted (privacy/LGPD), and leaking the table alone is not
 * enough to correlate votes back to a browser without the server secret.
 *
 * Kept free of next/headers imports so unit tests can exercise the hashing
 * without a request scope (same split as lib/gallery.ts vs the admin actions).
 */
import { createHmac } from "node:crypto";

/** Cookie that carries the visitor's random UUID (httpOnly, 1 year). */
export const ANON_COOKIE = "ncf_anon";

/** Cookie lifetime: 1 year — long enough to keep "1 vote per visitor" honest. */
export const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Derives the stored voter hash from the cookie UUID.
 * Deterministic per (anonId, secret): the same visitor always maps to the
 * same hash (upsert key), but the hash cannot be reversed to the cookie value.
 */
export function hashAnonId(anonId: string, secret: string): string {
  return createHmac("sha256", secret).update(anonId).digest("hex");
}
