"use client";

import Image from "next/image";
import { useActionState } from "react";
import {
	moderateGalleryComment,
	type GalleryActionState,
} from "@/app/admin/gallery/actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export type PendingCommentItem = {
	id: string;
	authorName: string;
	body: string;
	createdAt: string;
	image: { url: string; alt: string };
};

function ModerationRow({ item }: { item: PendingCommentItem }) {
	const [state, formAction, pending] = useActionState<GalleryActionState, FormData>(
		moderateGalleryComment,
		{},
	);

	return (
		<div className="flex flex-col gap-3 border border-rivet bg-panel p-4 sm:flex-row">
			<Image
				src={item.image.url}
				alt={item.image.alt}
				width={96}
				height={96}
				className="h-24 w-24 shrink-0 border border-rivet object-cover"
			/>

			<div className="flex flex-1 flex-col gap-2">
				<p className="m-0 text-xs text-muted">
					<strong className="text-ink">{item.authorName}</strong> · {item.createdAt}
				</p>
				{/* Texto puro — o React escapa por padrão; nunca renderizar HTML aqui. */}
				<p className="m-0 whitespace-pre-wrap text-sm text-ink">{item.body}</p>

				{state.error && <p className="m-0 text-sm text-blood">{state.error}</p>}
				{state.success && <p className="m-0 text-sm text-toxic">{state.success}</p>}

				<form action={formAction} className="flex flex-wrap items-center gap-2">
					<input type="hidden" name="id" value={item.id} />
					<Button
						type="submit"
						name="decision"
						value="approve"
						variant="outline"
						disabled={pending}
						className="border-toxic/60 text-toxic"
					>
						Approve
					</Button>
					<Button
						type="submit"
						name="decision"
						value="reject"
						variant="outline"
						disabled={pending}
					>
						Reject
					</Button>
					<Button
						type="submit"
						name="decision"
						value="delete"
						variant="outline"
						disabled={pending}
						className="border-blood/60 text-blood"
					>
						Delete
					</Button>
					{/* issue #60 — um único spinner para a fileira (os três botões
					    compartilham o mesmo pending; spinner dentro de cada um
					    triplicaria o indicador). */}
					{pending && <Spinner size="sm" label="Processing…" />}
				</form>
			</div>
		</div>
	);
}

/**
 * Fila de moderação de comentários da galeria (issue #52) — comentários
 * anônimos nascem pendentes e só aparecem ao público depois do Approve.
 * Reject mantém a linha como rastro de abuso; Delete remove de vez.
 */
export function GalleryCommentModeration({ items }: { items: PendingCommentItem[] }) {
	if (items.length === 0) {
		return <p className="m-0 text-sm text-muted">No comments waiting for moderation.</p>;
	}
	return (
		<div className="flex flex-col gap-4">
			{items.map((item) => (
				<ModerationRow key={item.id} item={item} />
			))}
		</div>
	);
}
