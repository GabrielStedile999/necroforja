"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import type {
	GalleryCommentItem,
	GalleryCommentsResponse,
} from "@/app/api/gallery/[id]/comments/route";

const STRINGS: Record<
	Locale,
	{
		title: string;
		empty: string;
		loadError: string;
		name: string;
		comment: string;
		send: string;
		sending: string;
		sent: string;
		sendError: string;
		loadMore: string;
		charsLeft: string;
	}
> = {
	en: {
		title: "// COMMENTS",
		empty: "No comments yet — be the first.",
		loadError: "Comments are unavailable right now.",
		name: "Name",
		comment: "Comment",
		send: "SEND",
		sending: "SENDING…",
		sent: "Sent — it will show up after moderation.",
		sendError: "Could not send your comment. Try again in a moment.",
		loadMore: "LOAD MORE",
		charsLeft: "{n} characters left",
	},
	"pt-BR": {
		title: "// COMENTÁRIOS",
		empty: "Nenhum comentário ainda — seja o primeiro.",
		loadError: "Os comentários estão indisponíveis no momento.",
		name: "Nome",
		comment: "Comentário",
		send: "ENVIAR",
		sending: "ENVIANDO…",
		sent: "Enviado — aparece depois da moderação.",
		sendError: "Não foi possível enviar seu comentário. Tente de novo em instantes.",
		loadMore: "CARREGAR MAIS",
		charsLeft: "{n} caracteres restantes",
	},
};

const BODY_MAX = 800;

/**
 * Seção de comentários do lightbox (issue #52) — chunk dinâmico carregado só
 * quando o visitante abre o painel; a lista vem sob demanda da API (nada no
 * payload ISR). Comentário enviado nasce `pending` e só aparece publicamente
 * após aprovação no admin — o form deixa isso claro no feedback.
 *
 * Segurança: corpo sempre texto puro (escape default do React — nunca HTML),
 * honeypot invisível contra bots e rate-limit no servidor.
 */
export default function GalleryComments({ imageId }: { imageId: string }) {
	const locale = useLocale() as Locale;
	const s = STRINGS[locale] ?? STRINGS.en;

	const [comments, setComments] = useState<GalleryCommentItem[] | null>(null);
	const [nextBefore, setNextBefore] = useState<string | null>(null);
	const [loadError, setLoadError] = useState(false);

	const [name, setName] = useState("");
	const [body, setBody] = useState("");
	const [website, setWebsite] = useState(""); // honeypot — humanos nunca veem
	const [sending, setSending] = useState(false);
	const [feedback, setFeedback] = useState<"sent" | "error" | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		(async () => {
			try {
				const res = await fetch(`/api/gallery/${imageId}/comments`, {
					signal: controller.signal,
				});
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const data = (await res.json()) as GalleryCommentsResponse;
				setComments(data.comments);
				setNextBefore(data.nextBefore);
			} catch {
				if (!controller.signal.aborted) setLoadError(true);
			}
		})();
		return () => controller.abort();
	}, [imageId]);

	async function loadMore() {
		if (!nextBefore) return;
		try {
			const res = await fetch(
				`/api/gallery/${imageId}/comments?before=${encodeURIComponent(nextBefore)}`,
			);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = (await res.json()) as GalleryCommentsResponse;
			setComments((prev) => [...(prev ?? []), ...data.comments]);
			setNextBefore(data.nextBefore);
		} catch {
			setLoadError(true);
		}
	}

	async function submit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (sending) return;
		setSending(true);
		setFeedback(null);
		try {
			const res = await fetch(`/api/gallery/${imageId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ authorName: name, body, website }),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			setFeedback("sent");
			setBody("");
		} catch {
			setFeedback("error");
		} finally {
			setSending(false);
		}
	}

	return (
		<section
			aria-label={s.title}
			className="w-full border border-white/[0.12] bg-[rgba(15,13,20,.9)] p-4 text-left"
		>
			<h2 className="m-0 mb-3 font-mono text-[12px] tracking-[3px] text-hazard">
				{s.title}
			</h2>

			{/* Lista (só aprovados — a API nunca devolve pendentes/rejeitados) */}
			{loadError ? (
				<p className="m-0 mb-3 font-mono text-[12px] text-[rgba(245,245,250,.55)]">
					{s.loadError}
				</p>
			) : comments === null ? (
				<p className="m-0 mb-3 font-mono text-[12px] text-[rgba(245,245,250,.5)]">…</p>
			) : comments.length === 0 ? (
				<p className="m-0 mb-3 font-mono text-[12px] text-[rgba(245,245,250,.55)]">
					{s.empty}
				</p>
			) : (
				<ul className="m-0 mb-3 flex list-none flex-col gap-3 p-0">
					{comments.map((c) => (
						<li key={c.id} className="border-l-2 border-white/[0.14] pl-3">
							<p className="m-0 font-mono text-[11px] tracking-[1px] text-[rgba(0,229,255,.85)]">
								<strong>{c.authorName}</strong>
								<span className="text-[rgba(245,245,250,.45)]">
									{" · "}
									{new Date(c.createdAt).toLocaleDateString(locale)}
								</span>
							</p>
							<p className="m-0 whitespace-pre-wrap text-[13px] leading-[1.6] text-[rgba(245,245,250,.8)]">
								{c.body}
							</p>
						</li>
					))}
				</ul>
			)}

			{nextBefore && (
				<button
					type="button"
					onClick={loadMore}
					className="mb-3 cursor-pointer appearance-none border border-white/30 bg-transparent px-3 py-1 font-mono text-[11px] tracking-[2px] text-white hover:border-hazard"
				>
					{s.loadMore}
				</button>
			)}

			{/* Form anônimo — nome + comentário; nasce pendente. */}
			<form onSubmit={submit} className="flex flex-col gap-2">
				{/* Honeypot: fora da tela e fora da ordem de tab — bots preenchem. */}
				<div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
					<label>
						Website
						<input
							type="text"
							tabIndex={-1}
							autoComplete="off"
							value={website}
							onChange={(e) => setWebsite(e.target.value)}
						/>
					</label>
				</div>

				<label
					htmlFor={`comment-name-${imageId}`}
					className="font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.6)]"
				>
					{s.name}
				</label>
				<input
					id={`comment-name-${imageId}`}
					type="text"
					required
					minLength={2}
					maxLength={40}
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="border border-white/[0.18] bg-black/40 px-3 py-2 text-[13px] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-hazard"
				/>

				<label
					htmlFor={`comment-body-${imageId}`}
					className="font-mono text-[11px] tracking-[2px] text-[rgba(245,245,250,.6)]"
				>
					{s.comment}
				</label>
				<textarea
					id={`comment-body-${imageId}`}
					required
					minLength={3}
					maxLength={BODY_MAX}
					rows={3}
					value={body}
					onChange={(e) => setBody(e.target.value)}
					aria-describedby={`comment-chars-${imageId}`}
					className="resize-y border border-white/[0.18] bg-black/40 px-3 py-2 text-[13px] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-hazard"
				/>
				<span
					id={`comment-chars-${imageId}`}
					className="font-mono text-[10px] text-[rgba(245,245,250,.4)]"
				>
					{s.charsLeft.replace("{n}", String(BODY_MAX - body.length))}
				</span>

				<div className="flex flex-wrap items-center gap-3">
					<button
						type="submit"
						disabled={sending}
						className="cursor-pointer appearance-none border border-hazard/70 bg-transparent px-4 py-1.5 font-mono text-[12px] tracking-[2px] text-hazard hover:bg-hazard/10 disabled:cursor-wait disabled:opacity-60"
					>
						{sending ? s.sending : s.send}
					</button>
					{feedback === "sent" && (
						<span role="status" className="font-mono text-[11px] text-[rgba(0,229,255,.85)]">
							{s.sent}
						</span>
					)}
					{feedback === "error" && (
						<span role="alert" className="font-mono text-[11px] text-blood">
							{s.sendError}
						</span>
					)}
				</div>
			</form>
		</section>
	);
}
