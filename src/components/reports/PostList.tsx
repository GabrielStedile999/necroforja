"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { POST_TYPES, POST_TYPE_KEYS, type PostType } from "./postTypes";

/** Item já resolvido para o locale no servidor (datas como string). */
export type PostListItem = {
	id: string;
	slug: string;
	type: PostType;
	title: string;
	excerpt: string;
	coverImage: string | null;
	coverAlt: string | null;
	date: string;
};

const STRINGS: Record<Locale, { all: string; empty: string; offline: string }> = {
	en: {
		all: "ALL",
		empty: "No reports published yet — the presses of the Underhive are warming up.",
		offline: "Campaign journal is unavailable right now. Try again in a moment.",
	},
	"pt-BR": {
		all: "TODOS",
		empty: "Nenhum relatório publicado ainda — as prensas do Underhive estão esquentando.",
		offline: "O jornal de campanha está indisponível no momento. Tente de novo em instantes.",
	},
};

/**
 * Lista de posts do jornal (issue #5), no estilo das news rows da landing,
 * com filtro client-side por tipo de post (a lista completa chega do servidor
 * via ISR — filtrar no cliente mantém a página estática).
 */
export default function PostList({
	posts,
	offline,
}: {
	posts: PostListItem[];
	offline?: boolean;
}) {
	const locale = useLocale() as Locale;
	const s = STRINGS[locale] ?? STRINGS.en;
	const [filter, setFilter] = useState<PostType | "all">("all");

	const visible = filter === "all" ? posts : posts.filter((p) => p.type === filter);

	if (offline || posts.length === 0) {
		return (
			<div className="clip-chamfer-sm border border-white/[0.1] bg-[rgba(15,13,20,.82)] p-6">
				<p className="m-0 text-[14px] leading-[1.7] text-[rgba(245,245,250,.6)]">
					{offline ? s.offline : s.empty}
				</p>
			</div>
		);
	}

	return (
		<div>
			{/* Filtro por tipo */}
			<div className="mb-6 flex flex-wrap items-center gap-2">
				{(["all", ...POST_TYPE_KEYS] as const).map((key) => {
					const active = filter === key;
					const meta = key === "all" ? null : POST_TYPES[key];
					const color = meta?.color ?? "#f5f5fa";
					return (
						<button
							key={key}
							onClick={() => setFilter(key)}
							className="cursor-pointer border bg-transparent px-[14px] py-[7px] font-mono text-[11px] tracking-[2px] transition-colors"
							style={{
								borderColor: active ? color : "rgba(255,255,255,.14)",
								color: active ? color : "rgba(245,245,250,.55)",
								boxShadow: active && meta ? `0 0 12px ${meta.shadow}` : "none",
							}}
						>
							{key === "all" ? s.all : meta!.labels[locale] ?? meta!.labels.en}
						</button>
					);
				})}
			</div>

			{/* Rows */}
			<div className="flex flex-col">
				{visible.map((post, i) => {
					const meta = POST_TYPES[post.type];
					return (
						<Link
							key={post.id}
							href={`/reports/${post.slug}`}
							className={`ncf-news-row ncf-news-row-item flex items-center gap-7 border-t border-white/[0.09] px-2 py-6 no-underline text-ink ${
								i === visible.length - 1 ? "border-b border-white/[0.09]" : ""
							}`}
						>
							{/* Tag + data */}
							<div className="w-[150px] shrink-0 font-mono">
								<div className="text-xs tracking-[1px]" style={{ color: meta.color }}>
									{meta.labels[locale] ?? meta.labels.en}
								</div>
								<div className="mt-1 text-xs text-[rgba(245,245,250,.4)]">{post.date}</div>
							</div>

							{/* Thumb */}
							<div className="ncf-news-thumb relative h-[84px] w-[160px] shrink-0 overflow-hidden border border-white/[0.08] bg-[linear-gradient(135deg,#1a1320,#0a0810)]">
								{post.coverImage ? (
									<Image
										src={post.coverImage}
										alt={post.coverAlt ?? post.title}
										width={320}
										height={168}
										className="h-full w-full object-cover object-top"
									/>
								) : (
									<div className="stripe-thumb-magenta absolute inset-0" />
								)}
							</div>

							{/* Texto */}
							<div className="min-w-0 flex-1">
								<div className="ncf-news-text-h mb-1.5 text-[25px] font-bold tracking-[0.5px]">
									{post.title}
								</div>
								{post.excerpt && (
									<div className="text-[14px] leading-[1.55] text-[rgba(245,245,250,.55)]">
										{post.excerpt}
									</div>
								)}
							</div>

							<span className="ncf-news-arrow text-[22px]" style={{ color: meta.color }}>
								→
							</span>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
