"use client";

import dynamic from "next/dynamic";

/**
 * Carregamento sob demanda do RulesChat (issue #42) — o chat puxa
 * `@ai-sdk/react` (streaming) e não precisa estar no bundle inicial da
 * rota nem ser renderizado no servidor. `ssr: false` só é permitido em
 * client components, por isso este wrapper existe em vez de o dynamic
 * viver direto na página (server component).
 */
export const RulesChat = dynamic(
	() => import("./RulesChat").then((m) => m.RulesChat),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-[200px] items-center justify-center font-mono text-xs tracking-[2px] text-muted">
				LOADING ASSISTANT…
			</div>
		),
	},
);
