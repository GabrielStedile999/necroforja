"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { rateLimit } from "@/lib/ai/rate-limit";
import { buildGalleryObjectPath } from "@/lib/gallery";
import {
	galleryConfirmSchema,
	galleryUpdateSchema,
	galleryUploadRequestSchema,
	parseTagList,
} from "@/lib/validation";
import {
	GALLERY_BUCKET,
	createSignedUploadUrl,
	deleteFromBucket,
	statPublicObject,
} from "@/lib/storage";
import { logger } from "@/lib/logger";

/** Revalida as rotas afetadas pela galeria. */
function revalidateGallery() {
	revalidatePath("/gallery");
	revalidatePath("/admin/gallery");
}

export type SignedUploadResult =
	| { ok: true; path: string; signedUrl: string; token: string }
	| { ok: false; error: string };

/**
 * Passo 1 do upload (issue #24): valida MIME/tamanho, monta o path
 * (`<categoria>/<slug>-<rand>.<ext>`) e devolve uma signed upload URL.
 * O arquivo vai direto do browser para o Supabase Storage — não passa
 * pela Server Action (evita o limite de body dos serverless functions).
 */
export async function requestGalleryUpload(input: {
	filename: string;
	mime: string;
	bytes: number;
	category: string;
}): Promise<SignedUploadResult> {
	const user = await requireAdmin();

	// Rate limit por admin: 30 uploads/minuto é folgado para uso real.
	if (!(await rateLimit(`gallery:upload:${user.id}`, 30, 60))) {
		return { ok: false, error: "Too many uploads — wait a minute and retry." };
	}

	const parsed = galleryUploadRequestSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid file." };
	}
	const { filename, mime, category } = parsed.data;

	const path = buildGalleryObjectPath(category, filename, mime);
	try {
		const { signedUrl, token } = await createSignedUploadUrl(GALLERY_BUCKET, path);
		return { ok: true, path, signedUrl, token };
	} catch (error) {
		logger.error("gallery: signed upload URL failed", { path, error });
		return { ok: false, error: "Could not start the upload. Check the Supabase env vars." };
	}
}

export type GalleryActionState = { error?: string; success?: string };

/**
 * Passo 2 do upload: confirma que o objeto existe no bucket (HEAD na URL
 * pública — nunca confia no cliente) e grava a linha de metadados.
 */
export async function confirmGalleryUpload(input: {
	path: string;
	category: string;
	altEn: string;
	altPt: string;
	captionEn: string;
	captionPt: string;
	tags: string[];
	width: number;
	height: number;
}): Promise<GalleryActionState> {
	const user = await requireAdmin();

	const parsed = galleryConfirmSchema.safeParse(input);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid metadata." };
	}
	const data = parsed.data;

	const stat = await statPublicObject(GALLERY_BUCKET, data.path);
	if (!stat) {
		return { error: "Upload not found in storage — try uploading again." };
	}

	await db.insert(schema.galleryImages).values({
		path: data.path,
		category: data.category,
		tags: data.tags,
		altEn: data.altEn,
		altPt: data.altPt,
		captionEn: data.captionEn,
		captionPt: data.captionPt,
		width: data.width,
		height: data.height,
		mime: stat.mime,
		bytes: stat.bytes,
		uploadedByUserId: user.id,
	});

	revalidateGallery();
	return { success: `Image published (${data.path}).` };
}

/** Edita metadados (alt/legendas/categoria/tags/visibilidade). */
export async function updateGalleryImage(
	_prev: GalleryActionState,
	formData: FormData,
): Promise<GalleryActionState> {
	await requireAdmin();

	const parsed = galleryUpdateSchema.safeParse({
		id: String(formData.get("id") ?? ""),
		category: String(formData.get("category") ?? ""),
		altEn: String(formData.get("altEn") ?? ""),
		altPt: String(formData.get("altPt") ?? ""),
		captionEn: String(formData.get("captionEn") ?? ""),
		captionPt: String(formData.get("captionPt") ?? ""),
		tags: parseTagList(String(formData.get("tags") ?? "")),
		published: formData.get("published") === "on",
	});
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
	}
	const { id, ...values } = parsed.data;

	await db.update(schema.galleryImages).set(values).where(eq(schema.galleryImages.id, id));

	revalidateGallery();
	return { success: "Image updated." };
}

/** Remove a imagem: objeto no bucket + linha no banco (ação destrutiva). */
export async function deleteGalleryImage(formData: FormData): Promise<void> {
	await requireAdmin();
	const id = String(formData.get("id") ?? "");

	const row = await db.query.galleryImages.findFirst({
		where: eq(schema.galleryImages.id, id),
		columns: { path: true },
	});
	if (!row) return;

	try {
		await deleteFromBucket(GALLERY_BUCKET, row.path);
	} catch (error) {
		// Loga mas segue: preferimos um objeto órfão no bucket a uma linha
		// fantasma apontando para um objeto que o admin tentou apagar.
		logger.error("gallery: storage delete failed", { path: row.path, error });
	}
	await db.delete(schema.galleryImages).where(eq(schema.galleryImages.id, id));

	revalidateGallery();
}
