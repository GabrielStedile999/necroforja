"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { formatRatingAvg } from "@/lib/gallery";
import type { GalleryRatingResponse } from "@/app/api/gallery/[id]/rating/route";

const STRINGS: Record<
	Locale,
	{
		group: string;
		rate: string;
		ratingAria: string;
		noVotes: string;
		yourVote: string;
		error: string;
	}
> = {
	en: {
		group: "Rate this photo from 1 to 5 stars",
		rate: "Rate {n} out of 5 stars",
		ratingAria: "Average rating {avg} out of 5, {count} vote(s)",
		noVotes: "NO VOTES YET",
		yourVote: "YOUR VOTE: {n}★",
		error: "Could not save your vote. Try again in a moment.",
	},
	"pt-BR": {
		group: "Avalie esta foto de 1 a 5 estrelas",
		rate: "Avaliar com {n} de 5 estrelas",
		ratingAria: "Avaliação média {avg} de 5, {count} voto(s)",
		noVotes: "SEM VOTOS AINDA",
		yourVote: "SEU VOTO: {n}★",
		error: "Não foi possível salvar seu voto. Tente de novo em instantes.",
	},
};

type RatingState = { avg: number | null; count: number; mine: number | null };

/**
 * Estrelas interativas do lightbox (issue #52). O visitante vota sem login:
 * a identidade anônima fica num cookie httpOnly criado pelo servidor no
 * primeiro voto (nada é exposto ao JS). Média/total iniciais chegam via ISR;
 * ao abrir, um GET busca o agregado fresco + "minha nota"; o clique faz
 * update otimista e o POST devolve o agregado real.
 *
 * A11y: grupo de botões navegável por teclado; o estado selecionado é
 * comunicado por aria-pressed e pelo glifo (★ vs ☆), não só por cor.
 */
export default function GalleryRating({
	imageId,
	initialAvg,
	initialCount,
}: {
	imageId: string;
	initialAvg: number | null;
	initialCount: number;
}) {
	const locale = useLocale() as Locale;
	const s = STRINGS[locale] ?? STRINGS.en;

	const [state, setState] = useState<RatingState>({
		avg: initialAvg,
		count: initialCount,
		mine: null,
	});
	const [hover, setHover] = useState<number | null>(null);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState(false);

	// Agregado fresco + "minha nota" ao abrir (o cookie é httpOnly — só o
	// servidor sabe se este visitante já votou).
	useEffect(() => {
		const controller = new AbortController();
		(async () => {
			try {
				const res = await fetch(`/api/gallery/${imageId}/rating`, {
					signal: controller.signal,
				});
				if (!res.ok) return;
				const data = (await res.json()) as GalleryRatingResponse;
				setState(data);
			} catch {
				// silencioso: os agregados do ISR continuam na tela
			}
		})();
		return () => controller.abort();
	}, [imageId]);

	async function vote(n: number) {
		if (pending) return;
		setPending(true);
		setError(false);

		// Update otimista da média local (o POST devolve o agregado real).
		const prev = state;
		const optimisticCount = prev.mine === null ? prev.count + 1 : prev.count;
		const optimisticSum =
			(prev.avg ?? 0) * prev.count - (prev.mine ?? 0) + n;
		setState({
			avg: optimisticCount > 0 ? optimisticSum / optimisticCount : n,
			count: optimisticCount,
			mine: n,
		});

		try {
			const res = await fetch(`/api/gallery/${imageId}/rating`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ rating: n }),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			setState((await res.json()) as GalleryRatingResponse);
		} catch {
			setState(prev);
			setError(true);
		} finally {
			setPending(false);
		}
	}

	const shown = hover ?? state.mine ?? 0;
	const avgText =
		state.count > 0 && state.avg !== null
			? `★ ${formatRatingAvg(state.avg)} · ${state.count}`
			: s.noVotes;

	return (
		<div className="flex flex-wrap items-center justify-center gap-3">
			<div
				role="group"
				aria-label={s.group}
				className="flex items-center gap-1"
				onMouseLeave={() => setHover(null)}
			>
				{[1, 2, 3, 4, 5].map((n) => (
					<button
						key={n}
						type="button"
						disabled={pending}
						onClick={() => vote(n)}
						onMouseEnter={() => setHover(n)}
						onFocus={() => setHover(n)}
						onBlur={() => setHover(null)}
						aria-label={s.rate.replace("{n}", String(n))}
						aria-pressed={state.mine === n}
						className="cursor-pointer appearance-none border-0 bg-transparent p-0.5 text-[22px] leading-none text-hazard transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-hazard disabled:cursor-wait"
					>
						<span aria-hidden="true">{n <= shown ? "★" : "☆"}</span>
					</button>
				))}
			</div>
			<span
				role="img"
				aria-label={
					state.count > 0 && state.avg !== null
						? s.ratingAria
								.replace("{avg}", formatRatingAvg(state.avg))
								.replace("{count}", String(state.count))
						: s.noVotes
				}
				className="font-mono text-[12px] tracking-[1px] text-[rgba(245,245,250,.7)]"
			>
				<span aria-hidden="true">{avgText}</span>
			</span>
			{state.mine !== null && (
				<span className="font-mono text-[11px] tracking-[1px] text-[rgba(0,229,255,.8)]">
					{s.yourVote.replace("{n}", String(state.mine))}
				</span>
			)}
			{error && (
				<span role="alert" className="font-mono text-[11px] text-blood">
					{s.error}
				</span>
			)}
		</div>
	);
}
