import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import {
	getGalleryRatingByVoter,
	getGalleryRatingSummary,
	getPublishedGalleryImageById,
} from "@/lib/db/queries";
import { getOrCreateVoterHash, readVoterHash } from "@/lib/gallery-visitor";
import { galleryRatingSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/ai/rate-limit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const idSchema = z.string().uuid();

type Params = { params: Promise<{ id: string }> };

export type GalleryRatingResponse = {
	avg: number | null;
	count: number;
	/** The current visitor's own vote (null when they never voted). */
	mine: number | null;
};

/**
 * Current aggregate + "my vote" for one photo (issue #52). Called when the
 * lightbox opens, so the interactive stars can highlight the visitor's own
 * rating; the grid itself relies on the ISR aggregates. Read-only: never
 * creates the identity cookie.
 */
export async function GET(_req: Request, { params }: Params) {
	const { id } = await params;
	if (!idSchema.safeParse(id).success) {
		return new NextResponse("Invalid image id.", { status: 400 });
	}

	try {
		const image = await getPublishedGalleryImageById(id);
		if (!image) return new NextResponse("Image not found.", { status: 404 });

		const voterHash = await readVoterHash();
		const [summary, mine] = await Promise.all([
			getGalleryRatingSummary(id),
			voterHash ? getGalleryRatingByVoter(id, voterHash) : Promise.resolve(null),
		]);

		return NextResponse.json<GalleryRatingResponse>({ ...summary, mine });
	} catch (error) {
		logger.error("gallery rating: GET failed", { imageId: id, error });
		return new NextResponse("Ratings are unavailable right now.", { status: 503 });
	}
}

/**
 * Casts (or changes) the visitor's 1–5 vote on a photo (issue #52).
 * Anonymous by design: the visitor is identified only by the HMAC of an
 * httpOnly cookie UUID — see src/lib/gallery-anon.ts. One row per
 * (image, voter): voting again upserts the new value.
 */
export async function POST(req: Request, { params }: Params) {
	const { id } = await params;
	if (!idSchema.safeParse(id).success) {
		return new NextResponse("Invalid image id.", { status: 400 });
	}

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return new NextResponse("Invalid JSON body.", { status: 400 });
	}
	const parsed = galleryRatingSchema.safeParse(body);
	if (!parsed.success) {
		return new NextResponse(
			parsed.error.issues[0]?.message ?? "Invalid rating.",
			{ status: 400 },
		);
	}

	try {
		const image = await getPublishedGalleryImageById(id);
		if (!image) return new NextResponse("Image not found.", { status: 404 });

		const voterHash = await getOrCreateVoterHash();

		// Anti-abuse (fail-open, same infra as the assistant/search): per-voter
		// burst + per-IP ceiling, so clearing the cookie doesn't grant a free-for-all.
		const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
		const [voterOk, ipOk] = await Promise.all([
			rateLimit(`gallery:rating:${voterHash}`, 20, 60),
			rateLimit(`gallery:rating:ip:${ip}`, 60, 60),
		]);
		if (!voterOk || !ipOk) {
			return new NextResponse("Too many votes in a short time. Please wait a moment.", {
				status: 429,
			});
		}

		await db
			.insert(schema.galleryRatings)
			.values({ imageId: id, voterHash, rating: parsed.data.rating })
			.onConflictDoUpdate({
				target: [schema.galleryRatings.imageId, schema.galleryRatings.voterHash],
				set: { rating: parsed.data.rating },
			});

		const summary = await getGalleryRatingSummary(id);
		return NextResponse.json<GalleryRatingResponse>({
			...summary,
			mine: parsed.data.rating,
		});
	} catch (error) {
		logger.error("gallery rating: POST failed", { imageId: id, error });
		return new NextResponse("Could not save your vote. Try again in a moment.", {
			status: 503,
		});
	}
}
