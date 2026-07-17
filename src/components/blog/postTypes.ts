// Metadados de exibição dos tipos de post do jornal de campanha (issue #5).
// O valor do enum (`post_type`) é chave de lógica e fica em inglês (issue #12);
// os rótulos são traduzidos aqui, no padrão STRINGS dos componentes.

import type { Locale } from "@/i18n/config";

export type PostType = "session_report" | "chronicle" | "painting" | "news";

export type PostTypeMeta = {
	labels: Record<Locale, string>;
	/** Cor de identidade no padrão do site. */
	color: string;
	shadow: string;
};

export const POST_TYPES: Record<PostType, PostTypeMeta> = {
	session_report: {
		labels: { en: "SESSION REPORT", "pt-BR": "RELATO DE SESSÃO" },
		color: "#ff2d6f",
		shadow: "rgba(255,45,111,.4)",
	},
	chronicle: {
		labels: { en: "CHRONICLE", "pt-BR": "CRÔNICA" },
		color: "#b07bff",
		shadow: "rgba(176,123,255,.4)",
	},
	painting: {
		labels: { en: "PAINTING LOG", "pt-BR": "DIÁRIO DE PINTURA" },
		color: "#ff8a3d",
		shadow: "rgba(255,138,61,.4)",
	},
	news: {
		labels: { en: "DISPATCH", "pt-BR": "DESPACHO" },
		color: "#00e5ff",
		shadow: "rgba(0,229,255,.4)",
	},
};

export const POST_TYPE_KEYS = Object.keys(POST_TYPES) as PostType[];

/** Narrow a DB string to a known PostType (fallback: news). */
export function toPostType(value: string): PostType {
	return (POST_TYPE_KEYS as string[]).includes(value)
		? (value as PostType)
		: "news";
}
