/**
 * Anonymous visitor identity for gallery interactions (issue #52) — server
 * part. Reads/creates the `ncf_anon` httpOnly cookie and derives the voter
 * hash (see src/lib/gallery-anon.ts for the crypto and the privacy rationale).
 *
 * Only usable from Route Handlers / Server Actions (cookie writes need a
 * response scope in Next).
 */
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import {
	ANON_COOKIE,
	ANON_COOKIE_MAX_AGE,
	hashAnonId,
} from "@/lib/gallery-anon";

/**
 * HMAC secret. AUTH_SECRET is already mandatory for the app to boot auth,
 * so in practice this is always set; the fallback only keeps unit-less local
 * experiments from crashing. `||` treats an empty string as absent.
 */
function anonSecret(): string {
	return process.env.AUTH_SECRET || "necroforja-dev-anon-secret";
}

/**
 * Voter hash for the current visitor, or `null` when the cookie was never
 * set. Never creates the cookie — use on read-only paths (GET) so merely
 * looking at a photo doesn't hand the visitor an identifier.
 */
export async function readVoterHash(): Promise<string | null> {
	const store = await cookies();
	const anonId = store.get(ANON_COOKIE)?.value;
	return anonId ? hashAnonId(anonId, anonSecret()) : null;
}

/**
 * Voter hash for the current visitor, creating the identity cookie on first
 * interaction (vote/comment). httpOnly + sameSite lax: not readable by JS,
 * not sent on cross-site POSTs.
 */
export async function getOrCreateVoterHash(): Promise<string> {
	const store = await cookies();
	let anonId = store.get(ANON_COOKIE)?.value;
	if (!anonId) {
		anonId = randomUUID();
		store.set(ANON_COOKIE, anonId, {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: ANON_COOKIE_MAX_AGE,
		});
	}
	return hashAnonId(anonId, anonSecret());
}
