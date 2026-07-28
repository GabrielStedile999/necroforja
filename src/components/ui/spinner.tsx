import { cn } from "@/lib/utils";

type Size = "sm" | "md";

/**
 * Spinner cyberpunk (issue #60) — anel de ticks segmentado (HUD) com um arco
 * magenta varrendo por cima, no estilo dos medidores circulares de interfaces
 * sci-fi (referência visual da issue).
 *
 * - Puro SVG + CSS (`.ncf-spinner*` em globals.css); nenhum JS de animação.
 * - Anti-flicker: o wrapper `.ncf-spinner-delay` só aparece após ~180ms —
 *   ações rápidas terminam antes de o spinner piscar na tela.
 * - `prefers-reduced-motion`: o giro é desligado em globals.css e sobra o
 *   anel estático (a informação continua visível, sem movimento infinito).
 * - Acessibilidade: com `label`, vira `role="status"` (aria-live implícito)
 *   com texto `sr-only`; sem `label` é decorativo (`aria-hidden`) — para
 *   quando um texto visível ao lado (ex. "Enviando…") já anuncia o estado.
 */
const SIZES: Record<Size, string> = {
	sm: "h-4 w-4",
	md: "h-10 w-10 ncf-spinner-glow",
};

export function Spinner({
	size = "sm",
	label,
	className,
}: {
	size?: Size;
	/** Rótulo sr-only anunciado a leitores de tela; omitir quando já existe texto visível de loading ao lado. */
	label?: string;
	className?: string;
}) {
	return (
		<span
			{...(label ? { role: "status" } : { "aria-hidden": true })}
			className={cn("ncf-spinner-delay inline-flex items-center justify-center", className)}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
				className={cn("ncf-spinner", SIZES[size])}
			>
				{/* Trilho: anel de ticks cyan (segmentos curtos, estética HUD) */}
				<circle
					cx="12"
					cy="12"
					r="10"
					stroke="rgba(0,229,255,.35)"
					strokeWidth="2.5"
					strokeDasharray="1.6 2.4"
				/>
				{/* Arco de varredura magenta com glow */}
				<circle
					cx="12"
					cy="12"
					r="10"
					stroke="#ff2d6f"
					strokeWidth="2.5"
					strokeDasharray="17 45.8"
					transform="rotate(-90 12 12)"
				/>
			</svg>
			{label ? <span className="sr-only">{label}</span> : null}
		</span>
	);
}
