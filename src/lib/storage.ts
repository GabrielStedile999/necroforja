/**
 * Supabase Storage helpers (issues #5/#24) — plain REST via fetch, no SDK.
 *
 * Server-only: uses the service role key. Required env:
 * - SUPABASE_URL               (e.g. https://<project>.supabase.co)
 * - SUPABASE_SERVICE_ROLE_KEY  (Project Settings → API — NEVER expose to client)
 *
 * Envs are read lazily (at call time, not import time) so builds and pages
 * that never upload don't require them.
 */

/** Bucket for campaign journal images (public read). */
export const REPORTS_BUCKET = "reports";

function supabaseEnv(): { url: string; serviceKey: string } {
	const url = process.env.SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !serviceKey) {
		throw new Error(
			"SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. See .env.example.",
		);
	}
	return { url: url.replace(/\/+$/, ""), serviceKey };
}

/** Public URL of an object in a public bucket. */
export function storagePublicUrl(bucket: string, path: string): string {
	const { url } = supabaseEnv();
	return `${url}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Uploads a file to a bucket (upsert). Returns the public URL.
 * Caller is responsible for validating MIME type and size first.
 */
export async function uploadToBucket(
	bucket: string,
	path: string,
	file: File,
): Promise<string> {
	const { url, serviceKey } = supabaseEnv();

	const res = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
		method: "POST",
		headers: {
			// Ambos os headers: a service_role legada (JWT) usa Authorization;
			// as chaves novas (sb_secret_...) exigem o header apikey.
			Authorization: `Bearer ${serviceKey}`,
			apikey: serviceKey,
			"Content-Type": file.type,
			"x-upsert": "true",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
		body: file,
	});

	if (!res.ok) {
		const detail = await res.text().catch(() => "");
		throw new Error(`Storage upload failed (${res.status}): ${detail.slice(0, 200)}`);
	}
	return storagePublicUrl(bucket, path);
}
