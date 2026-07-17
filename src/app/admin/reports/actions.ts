"use server";

import { eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import {
	postSchema,
	REPORT_IMAGE_MAX_BYTES,
	REPORT_IMAGE_MIME_TYPES,
} from "@/lib/validation";
import { slugify } from "@/lib/reports";
import { uploadToBucket, REPORTS_BUCKET } from "@/lib/storage";
import { logger } from "@/lib/logger";

export type ReportsActionState = { error?: string; success?: string; url?: string };

/** Revalida as rotas públicas afetadas por um post. */
function revalidateReports(slug?: string) {
	revalidatePath("/reports");
	if (slug) revalidatePath(`/reports/${slug}`);
	revalidatePath("/admin/reports");
	revalidatePath("/sitemap.xml");
}

/** Cria ou atualiza um post do jornal (issue #5). */
export async function savePost(
	_prev: ReportsActionState,
	formData: FormData,
): Promise<ReportsActionState> {
	const user = await requireAdmin();

	const postId = String(formData.get("postId") ?? "");
	const raw = Object.fromEntries(formData);
	// checkbox: ausente = false; presente ("on") = true
	const parsed = postSchema.safeParse({ ...raw, published: formData.get("published") === "on" });
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
	}
	const data = parsed.data;
	const slug = data.slug ?? slugify(data.titleEn);
	if (slug.length < 3) return { error: "Could not derive a slug from the English title." };

	// Slug único (excluindo o próprio post em edição)
	const clash = await db.query.posts.findFirst({
		where: postId
			? and(eq(schema.posts.slug, slug), ne(schema.posts.id, postId))
			: eq(schema.posts.slug, slug),
		columns: { id: true },
	});
	if (clash) return { error: `Slug "${slug}" is already in use.` };

	const values = {
		slug,
		type: data.type,
		titleEn: data.titleEn,
		titlePt: data.titlePt,
		excerptEn: data.excerptEn,
		excerptPt: data.excerptPt,
		bodyEn: data.bodyEn,
		bodyPt: data.bodyPt,
		coverImage: data.coverImage || null,
		coverAlt: data.coverAlt || null,
		published: data.published,
		updatedAt: new Date(),
	};

	if (postId) {
		const existing = await db.query.posts.findFirst({
			where: eq(schema.posts.id, postId),
			columns: { publishedAt: true, slug: true },
		});
		if (!existing) return { error: "Post not found." };

		await db
			.update(schema.posts)
			.set({
				...values,
				// primeira publicação define publishedAt; despublicar preserva
				publishedAt:
					data.published && !existing.publishedAt ? new Date() : existing.publishedAt,
			})
			.where(eq(schema.posts.id, postId));

		revalidateReports(existing.slug);
		revalidateReports(slug);
		return { success: `Post "${data.titleEn}" updated.` };
	}

	await db.insert(schema.posts).values({
		...values,
		publishedAt: data.published ? new Date() : null,
		authorUserId: user.id,
	});

	revalidateReports(slug);
	return { success: `Post "${data.titleEn}" created (${slug}).` };
}

/** Remove um post (ação destrutiva — só admin). */
export async function deletePost(formData: FormData) {
	await requireAdmin();
	const postId = String(formData.get("postId"));
	const post = await db.query.posts.findFirst({
		where: eq(schema.posts.id, postId),
		columns: { slug: true },
	});
	await db.delete(schema.posts).where(eq(schema.posts.id, postId));
	revalidateReports(post?.slug);
}

/**
 * Upload de imagem para o bucket público `reports` no Supabase Storage
 * (issues #5/#24). Retorna a URL pública para colar na capa ou no corpo.
 */
export async function uploadReportImage(
	_prev: ReportsActionState,
	formData: FormData,
): Promise<ReportsActionState> {
	await requireAdmin();

	const file = formData.get("file");
	if (!(file instanceof File) || file.size === 0) {
		return { error: "Choose an image file." };
	}
	if (!(REPORT_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
		return { error: `Unsupported type (${file.type}). Use PNG, JPEG, WebP or GIF.` };
	}
	if (file.size > REPORT_IMAGE_MAX_BYTES) {
		return { error: "File too large (max 5 MB)." };
	}

	// Nome customizado opcional; senão deriva do nome original.
	const requested = String(formData.get("filename") ?? "").trim();
	const original = file.name.replace(/\.[^.]+$/, "");
	const ext = (file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? ".png").toLowerCase();
	const base = slugify(requested || original) || "image";
	const path = `${base}${ext}`;

	try {
		const url = await uploadToBucket(REPORTS_BUCKET, path, file);
		return { success: `Image uploaded as ${path}.`, url };
	} catch (error) {
		logger.error("reports: image upload failed", { path, error });
		return {
			error:
				error instanceof Error ? error.message : "Upload failed. Check the Supabase env vars.",
		};
	}
}
