import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import {
	getPublishedGalleryImageById,
	listApprovedGalleryComments,
} from "@/lib/db/queries";
import { getOrCreateVoterHash } from "@/lib/gallery-visitor";
import { galleryCommentSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/ai/rate-limit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const idSchema = z.string().uuid();

/** Page size for the public comment list (keyset pagination on created_at). */
const COMMENTS_PAGE_SIZE = 30;

type Params = { params: Promise<{ id: string }> };

export type GalleryCommentItem = {
	id: string;
	authorName: string;
	body: string;
	createdAt: string;
};

export type GalleryCommentsResponse = {
	comments: GalleryCommentItem[];
	/** Cursor for the next page (pass as ?before=), or null when done. */
	nextBefore: string | null;
};

/**
 * Approved comments for a photo, newest first (issue #52). Loaded on demand
 * when the visitor opens the comments panel in the lightbox — nothing enters
 * the ISR payload or the initial /gallery bundle.
 */
export async function GET(req: Request, { params }: Params) {
	const { id } = await params;
	if (!idSchema.safeParse(id).success) {
		return new NextResponse("Invalid image id.", { status: 400 });
	}

	const beforeRaw = new URL(req.url).searchParams.get("before");
	const before = beforeRaw ? new Date(beforeRaw) : undefined;
	if (before && Number.isNaN(before.getTime())) {
		return new NextResponse("Invalid cursor.", { status: 400 });
	}

	try {
		const image = await getPublishedGalleryImageById(id);
		if (!image) return new NextResponse("Image not found.", { status: 404 });

		const rows = await listApprovedGalleryComments(id, COMMENTS_PAGE_SIZE, before);
		const comments: GalleryCommentItem[] = rows.map((r) => ({
			id: r.id,
			authorName: r.authorName,
			body: r.body,
			createdAt: r.createdAt.toISOString(),
		}));

		return NextResponse.json<GalleryCommentsResponse>({
			comments,
			nextBefore:
				rows.length === COMMENTS_PAGE_SIZE
					? (comments[comments.length - 1]?.createdAt ?? null)
					: null,
		});
	} catch (error) {
		logger.error("gallery comments: GET failed", { imageId: id, error });
		return new NextResponse("Comments are unavailable right now.", { status: 503 });
	}
}

/**
 * Submits an anonymous comment (issue #52). Every comment is born `pending`
 * and only shows up publicly after an admin approves it in /admin/gallery.
 * Spam defence: honeypot field (fake success — no hint to the bot), fail-open
 * rate limits per voter (burst + daily) and per IP, plain-text-only storage.
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

	// Honeypot: real users never see/fill this field; bots fill everything.
	// Answer with the same shape as a success so the bot learns nothing.
	const honeypot = (body as { website?: unknown } | null)?.website;
	if (typeof honeypot === "string" && honeypot.trim() !== "") {
		return NextResponse.json({ ok: true, status: "pending" });
	}

	const parsed = galleryCommentSchema.safeParse(body);
	if (!parsed.success) {
		return new NextResponse(
			parsed.error.issues[0]?.message ?? "Invalid comment.",
			{ status: 400 },
		);
	}

	try {
		const image = await getPublishedGalleryImageById(id);
		if (!image) return new NextResponse("Image not found.", { status: 404 });

		const voterHash = await getOrCreateVoterHash();

		const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
		const [burstOk, dailyOk, ipOk] = await Promise.all([
			rateLimit(`gallery:comment:${voterHash}`, 5, 60),
			rateLimit(`gallery:comment:day:${voterHash}`, 20, 24 * 60 * 60),
			rateLimit(`gallery:comment:ip:${ip}`, 15, 60),
		]);
		if (!burstOk || !dailyOk || !ipOk) {
			return new NextResponse(
				"Too many comments in a short time. Please wait a moment.",
				{ status: 429 },
			);
		}

		await db.insert(schema.galleryComments).values({
			imageId: id,
			authorName: parsed.data.authorName,
			body: parsed.data.body,
			voterHash,
			// status defaults to "pending" — pre-moderation is the whole point.
		});

		return NextResponse.json({ ok: true, status: "pending" });
	} catch (error) {
		logger.error("gallery comments: POST failed", { imageId: id, error });
		return new NextResponse("Could not send your comment. Try again in a moment.", {
			status: 503,
		});
	}
}
