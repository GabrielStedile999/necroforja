"use client";

import { useRef, useState } from "react";
import {
	confirmGalleryUpload,
	requestGalleryUpload,
} from "@/app/admin/gallery/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
	GALLERY_CATEGORIES,
	GALLERY_IMAGE_MAX_BYTES,
	parseTagList,
} from "@/lib/validation";

type ItemStatus = { name: string; state: "uploading" | "done" | "error"; detail?: string };

/** Lê as dimensões intrínsecas da imagem no browser (para o next/image). */
async function readImageSize(file: File): Promise<{ width: number; height: number }> {
	const url = URL.createObjectURL(file);
	try {
		return await new Promise((resolve, reject) => {
			const img = new window.Image();
			img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
			img.onerror = () => reject(new Error("Could not read image dimensions."));
			img.src = url;
		});
	} finally {
		URL.revokeObjectURL(url);
	}
}

/**
 * Upload da galeria (issues #6/#24) — fluxo em 3 passos por arquivo:
 *  1. Server Action valida e devolve uma signed upload URL;
 *  2. o browser faz PUT do arquivo direto no Supabase Storage;
 *  3. Server Action confirma o objeto e grava os metadados no banco.
 */
export function GalleryUploadForm() {
	const formRef = useRef<HTMLFormElement>(null);
	const [items, setItems] = useState<ItemStatus[]>([]);
	const [pending, setPending] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (pending) return;

		const form = e.currentTarget;
		const fd = new FormData(form);
		const files = (fd.getAll("files") as File[]).filter((f) => f && f.size > 0);
		const category = String(fd.get("category") ?? "misc");
		const altEn = String(fd.get("altEn") ?? "").trim();
		const altPt = String(fd.get("altPt") ?? "").trim();
		const captionEn = String(fd.get("captionEn") ?? "").trim();
		const captionPt = String(fd.get("captionPt") ?? "").trim();
		const authorName = String(fd.get("authorName") ?? "").trim();
		const tags = parseTagList(String(fd.get("tags") ?? ""));

		setFormError(null);
		if (files.length === 0) return setFormError("Choose at least one image.");
		if (altEn.length < 3) return setFormError("English alt text is required.");

		setPending(true);
		setItems(files.map((f) => ({ name: f.name, state: "uploading" })));

		let failed = 0;
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (!file) continue;
			const fail = (detail: string) => {
				failed++;
				setItems((prev) =>
					prev.map((it, idx) => (idx === i ? { ...it, state: "error", detail } : it)),
				);
			};

			try {
				if (file.size > GALLERY_IMAGE_MAX_BYTES) {
					fail("File too large (max 10 MB).");
					continue;
				}

				const { width, height } = await readImageSize(file);

				// 1) signed URL
				const req = await requestGalleryUpload({
					filename: file.name,
					mime: file.type,
					bytes: file.size,
					category,
				});
				if (!req.ok) {
					fail(req.error);
					continue;
				}

				// 2) PUT direto no storage
				const put = await fetch(req.signedUrl, {
					method: "PUT",
					headers: {
						"Content-Type": file.type,
						"Cache-Control": "public, max-age=31536000, immutable",
					},
					body: file,
				});
				if (!put.ok) {
					fail(`Storage rejected the upload (${put.status}).`);
					continue;
				}

				// 3) confirma + metadados
				const confirmed = await confirmGalleryUpload({
					path: req.path,
					category,
					altEn,
					altPt,
					captionEn,
					captionPt,
					authorName,
					tags,
					width,
					height,
				});
				if (confirmed.error) {
					fail(confirmed.error);
					continue;
				}

				setItems((prev) =>
					prev.map((it, idx) => (idx === i ? { ...it, state: "done" } : it)),
				);
			} catch (error) {
				fail(error instanceof Error ? error.message : "Unexpected upload error.");
			}
		}

		setPending(false);
		if (failed === 0) formRef.current?.reset();
	}

	return (
		<form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="files">Images (PNG/JPEG/WebP/GIF, max 10 MB each)</Label>
					<Input
						id="files"
						name="files"
						type="file"
						accept="image/png,image/jpeg,image/webp,image/gif"
						multiple
						required
					/>
				</div>
				<div>
					<Label htmlFor="category">Album</Label>
					<select
						id="category"
						name="category"
						defaultValue="battle"
						className="w-full border border-rivet bg-panel px-3 py-2 text-sm text-ink"
					>
						{GALLERY_CATEGORIES.map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
				</div>
				<div>
					<Label htmlFor="altEn">Alt text (EN) — describes the photo</Label>
					<Input id="altEn" name="altEn" placeholder="Goliath gang ambushes an Escher convoy" required />
				</div>
				<div>
					<Label htmlFor="altPt">Alt text (PT, optional)</Label>
					<Input id="altPt" name="altPt" placeholder="Gangue Goliath embosca um comboio Escher" />
				</div>
				<div>
					<Label htmlFor="captionEn">Caption (EN, optional)</Label>
					<Input id="captionEn" name="captionEn" placeholder="Week 3 — Cinderak docks" />
				</div>
				<div>
					<Label htmlFor="captionPt">Caption (PT, optional)</Label>
					<Input id="captionPt" name="captionPt" placeholder="Semana 3 — docas de Cinderak" />
				</div>
				<div>
					<Label htmlFor="authorName">Author / painted by (optional)</Label>
					<Input id="authorName" name="authorName" maxLength={60} placeholder="Gabriel Stedile" />
				</div>
				<div>
					<Label htmlFor="tags">Tags (comma-separated, optional)</Label>
					<Input id="tags" name="tags" placeholder="goliath, escher, week-3" />
				</div>
			</div>

			<p className="m-0 text-xs text-muted">
				Files upload straight to Supabase Storage under{" "}
				<code className="font-mono">gallery/&lt;album&gt;/…</code>; alt/caption/tags apply to
				every file in this batch (you can edit each image afterwards).
			</p>

			{formError && (
				<p className="rounded-sm border border-blood/40 bg-blood/15 px-3 py-2 text-sm text-blood">
					{formError}
				</p>
			)}

			{items.length > 0 && (
				<ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
					{items.map((it, idx) => (
						<li key={`${it.name}-${idx}`} className="flex items-center gap-2">
							<span
								className={
									it.state === "done"
										? "text-toxic"
										: it.state === "error"
											? "text-blood"
											: "text-muted"
								}
							>
								{it.state === "done" ? "✓" : it.state === "error" ? "✕" : "…"}
							</span>
							<span className="truncate">{it.name}</span>
							{it.detail && <span className="text-xs text-blood">{it.detail}</span>}
						</li>
					))}
				</ul>
			)}

			<div>
				<Button type="submit" variant="outline" disabled={pending}>
					{pending ? "Uploading…" : "Upload to gallery"}
				</Button>
			</div>
		</form>
	);
}
