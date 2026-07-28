"use client";

import Image from "next/image";
import { useActionState } from "react";
import {
	deleteGalleryImage,
	updateGalleryImage,
	type GalleryActionState,
} from "@/app/admin/gallery/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { GALLERY_CATEGORIES } from "@/lib/validation";

export type GalleryAdminItem = {
	id: string;
	url: string;
	path: string;
	category: string;
	tags: string[];
	altEn: string;
	altPt: string;
	captionEn: string;
	captionPt: string;
	authorName: string;
	width: number;
	height: number;
	published: boolean;
	createdAt: string;
};

function EditRow({ item }: { item: GalleryAdminItem }) {
	const [state, formAction, pending] = useActionState<GalleryActionState, FormData>(
		updateGalleryImage,
		{},
	);

	return (
		<div className="flex flex-col gap-4 border border-rivet bg-panel p-4 sm:flex-row">
			<a href={item.url} target="_blank" rel="noreferrer" className="shrink-0">
				<Image
					src={item.url}
					alt={item.altEn}
					width={160}
					height={Math.round((160 / item.width) * item.height) || 160}
					className="h-auto w-40 border border-rivet object-cover"
				/>
			</a>

			<form action={formAction} className="grid flex-1 gap-3 sm:grid-cols-2">
				<input type="hidden" name="id" value={item.id} />
				<div className="sm:col-span-2 flex flex-wrap items-center gap-3 text-xs text-muted">
					<code className="font-mono">{item.path}</code>
					<span>
						{item.width}×{item.height} · {item.createdAt}
					</span>
				</div>
				<div>
					<Label htmlFor={`altEn-${item.id}`}>Alt (EN)</Label>
					<Input id={`altEn-${item.id}`} name="altEn" defaultValue={item.altEn} required />
				</div>
				<div>
					<Label htmlFor={`altPt-${item.id}`}>Alt (PT)</Label>
					<Input id={`altPt-${item.id}`} name="altPt" defaultValue={item.altPt} />
				</div>
				<div>
					<Label htmlFor={`captionEn-${item.id}`}>Caption (EN)</Label>
					<Input id={`captionEn-${item.id}`} name="captionEn" defaultValue={item.captionEn} />
				</div>
				<div>
					<Label htmlFor={`captionPt-${item.id}`}>Caption (PT)</Label>
					<Input id={`captionPt-${item.id}`} name="captionPt" defaultValue={item.captionPt} />
				</div>
				<div>
					<Label htmlFor={`authorName-${item.id}`}>Author / painted by</Label>
					<Input
						id={`authorName-${item.id}`}
						name="authorName"
						maxLength={60}
						defaultValue={item.authorName}
					/>
				</div>
				<div>
					<Label htmlFor={`category-${item.id}`}>Album</Label>
					<select
						id={`category-${item.id}`}
						name="category"
						defaultValue={item.category}
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
					<Label htmlFor={`tags-${item.id}`}>Tags</Label>
					<Input id={`tags-${item.id}`} name="tags" defaultValue={item.tags.join(", ")} />
				</div>
				<label className="flex items-center gap-2 text-sm text-ink">
					<input type="checkbox" name="published" defaultChecked={item.published} />
					Published
				</label>

				{state.error && <p className="m-0 text-sm text-blood sm:col-span-2">{state.error}</p>}
				{state.success && (
					<p className="m-0 text-sm text-toxic sm:col-span-2">{state.success}</p>
				)}

				<div className="flex items-center gap-2 sm:col-span-2">
					<Button type="submit" variant="outline" pending={pending}>
						{pending ? "Saving…" : "Save"}
					</Button>
					<Button
						type="submit"
						variant="outline"
						formAction={deleteGalleryImage}
						className="border-blood/60 text-blood"
						onClick={(e) => {
							if (!confirm(`Delete ${item.path}? This also removes the file from storage.`)) {
								e.preventDefault();
							}
						}}
					>
						Delete
					</Button>
				</div>
			</form>
		</div>
	);
}

/** Painel de gestão da galeria — edição de metadados e remoção. */
export function GalleryAdminList({ items }: { items: GalleryAdminItem[] }) {
	if (items.length === 0) {
		return <p className="m-0 text-sm text-muted">No images uploaded yet.</p>;
	}
	return (
		<div className="flex flex-col gap-4">
			{items.map((item) => (
				<EditRow key={item.id} item={item} />
			))}
		</div>
	);
}
