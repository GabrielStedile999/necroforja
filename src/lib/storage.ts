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

/** Bucket for the photo gallery (issues #6/#24 — public read). */
export const GALLERY_BUCKET = "gallery";

/** Bucket for large static media (trailer video etc. — public read). */
export const MEDIA_BUCKET = "media";

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

/**
 * Public URL of a media object with a graceful fallback when the Supabase
 * envs are absent (build sandboxes, forks without storage configured).
 */
export function mediaUrlOr(path: string, fallback: string): string {
	const url = process.env.SUPABASE_URL;
	if (!url) return fallback;
	return `${url.replace(/\/+$/, "")}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

/**
 * Creates a signed upload URL so the browser can PUT the file straight to
 * Supabase Storage (issue #24) — the file never flows through a Server
 * Action, dodging the serverless body-size limit.
 *
 * The token is single-use and scoped to `bucket/path`; it expires in ~2h.
 */
export async function createSignedUploadUrl(
	bucket: string,
	path: string,
): Promise<{ signedUrl: string; token: string }> {
	const { url, serviceKey } = supabaseEnv();

	const res = await fetch(`${url}/storage/v1/object/upload/sign/${bucket}/${path}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${serviceKey}`,
			apikey: serviceKey,
			"Content-Type": "application/json",
		},
		// x-upsert via signed URL não é permitido — o path é único por upload.
		body: JSON.stringify({}),
	});

	if (!res.ok) {
		const detail = await res.text().catch(() => "");
		throw new Error(`Signed upload URL failed (${res.status}): ${detail.slice(0, 200)}`);
	}

	const data = (await res.json()) as { url?: string; token?: string };
	if (!data.url || !data.token) {
		throw new Error("Signed upload URL response missing url/token.");
	}
	return { signedUrl: `${url}/storage/v1${data.url}`, token: data.token };
}

/**
 * Confirms an object exists in a *public* bucket and returns its size/type
 * (HEAD on the public URL — no auth needed). Used after a signed upload to
 * verify what the client claims before persisting metadata.
 */
export async function statPublicObject(
	bucket: string,
	path: string,
): Promise<{ bytes: number; mime: string } | null> {
	const res = await fetch(storagePublicUrl(bucket, path), { method: "HEAD" });
	if (!res.ok) return null;
	return {
		bytes: Number(res.headers.get("content-length") ?? 0),
		mime: res.headers.get("content-type") ?? "application/octet-stream",
	};
}

/** Removes an object from a bucket (used when a gallery image is deleted). */
export async function deleteFromBucket(bucket: string, path: string): Promise<void> {
	const { url, serviceKey } = supabaseEnv();
	const res = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
	});
	// 404 é tolerado: a linha do banco é a fonte de verdade e o objeto já não existe.
	if (!res.ok && res.status !== 404) {
		const detail = await res.text().catch(() => "");
		throw new Error(`Storage delete failed (${res.status}): ${detail.slice(0, 200)}`);
	}
}
