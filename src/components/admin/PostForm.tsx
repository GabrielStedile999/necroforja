"use client";

import { useActionState } from "react";
import { savePost, type ReportsActionState } from "@/app/admin/reports/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { POST_TYPES, POST_TYPE_KEYS } from "@/components/reports/postTypes";

/** Valores iniciais do form (edição) — subset serializável da row `post`. */
export type PostFormValues = {
	id: string;
	slug: string;
	type: string;
	titleEn: string;
	titlePt: string;
	excerptEn: string;
	excerptPt: string;
	bodyEn: string;
	bodyPt: string;
	coverImage: string;
	coverAlt: string;
	published: boolean;
};

const textareaClass =
	"w-full rounded-sm border border-rivet bg-transparent px-3 py-2 font-mono text-sm text-ink placeholder:text-muted focus:outline-none";

/**
 * Editor markdown simples do jornal (issue #5): campos bilíngues (EN/PT),
 * tipo de post, capa e publicação — server action com validação zod.
 */
export function PostForm({ post }: { post?: PostFormValues }) {
	const [state, formAction, pending] = useActionState<ReportsActionState, FormData>(
		savePost,
		{},
	);

	return (
		<form action={formAction} className="flex flex-col gap-4">
			{post && <input type="hidden" name="postId" value={post.id} />}

			<div className="grid gap-4 sm:grid-cols-3">
				<div>
					<Label htmlFor="type">Type</Label>
					<select
						id="type"
						name="type"
						defaultValue={post?.type ?? "session_report"}
						className="w-full rounded-sm border border-rivet bg-[#0f0d14] px-3 py-2 text-sm text-ink focus:outline-none"
					>
						{POST_TYPE_KEYS.map((key) => (
							<option key={key} value={key}>
								{POST_TYPES[key].labels.en}
							</option>
						))}
					</select>
				</div>
				<div className="sm:col-span-2">
					<Label htmlFor="slug">Slug (optional — derived from the English title)</Label>
					<Input
						id="slug"
						name="slug"
						defaultValue={post?.slug ?? ""}
						placeholder="week-1-mission-report"
						pattern="[a-z0-9]+(-[a-z0-9]+)*"
					/>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="titleEn">Title (EN)</Label>
					<Input id="titleEn" name="titleEn" defaultValue={post?.titleEn ?? ""} required />
				</div>
				<div>
					<Label htmlFor="titlePt">Título (PT-BR)</Label>
					<Input id="titlePt" name="titlePt" defaultValue={post?.titlePt ?? ""} required />
				</div>
				<div>
					<Label htmlFor="excerptEn">Excerpt (EN)</Label>
					<textarea
						id="excerptEn"
						name="excerptEn"
						rows={2}
						maxLength={300}
						defaultValue={post?.excerptEn ?? ""}
						className={textareaClass}
					/>
				</div>
				<div>
					<Label htmlFor="excerptPt">Resumo (PT-BR)</Label>
					<textarea
						id="excerptPt"
						name="excerptPt"
						rows={2}
						maxLength={300}
						defaultValue={post?.excerptPt ?? ""}
						className={textareaClass}
					/>
				</div>
				<div>
					<Label htmlFor="bodyEn">Body — Markdown (EN)</Label>
					<textarea
						id="bodyEn"
						name="bodyEn"
						rows={16}
						required
						defaultValue={post?.bodyEn ?? ""}
						className={textareaClass}
					/>
				</div>
				<div>
					<Label htmlFor="bodyPt">Corpo — Markdown (PT-BR)</Label>
					<textarea
						id="bodyPt"
						name="bodyPt"
						rows={16}
						required
						defaultValue={post?.bodyPt ?? ""}
						className={textareaClass}
					/>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="coverImage">Cover image URL (Storage or /path)</Label>
					<Input
						id="coverImage"
						name="coverImage"
						defaultValue={post?.coverImage ?? ""}
						placeholder="https://<project>.supabase.co/storage/v1/object/public/reports/…"
					/>
				</div>
				<div>
					<Label htmlFor="coverAlt">Cover alt text</Label>
					<Input id="coverAlt" name="coverAlt" defaultValue={post?.coverAlt ?? ""} />
				</div>
			</div>

			<label className="flex items-center gap-2 text-sm text-ink">
				<input
					type="checkbox"
					name="published"
					defaultChecked={post?.published ?? false}
					className="h-4 w-4 accent-[#ff2d6f]"
				/>
				Published (visible at /reports)
			</label>

			{state.error && (
				<p className="rounded-sm border border-blood/40 bg-blood/15 px-3 py-2 text-sm text-blood">
					{state.error}
				</p>
			)}
			{state.success && (
				<p className="rounded-sm border border-toxic/40 bg-toxic/10 px-3 py-2 text-sm text-toxic">
					{state.success}
				</p>
			)}

			<div>
				<Button type="submit" disabled={pending}>
					{pending ? "Saving..." : post ? "Save changes" : "Create post"}
				</Button>
			</div>
		</form>
	);
}
