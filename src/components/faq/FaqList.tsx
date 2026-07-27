import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { getFaqContent } from "./content.i18n";

/**
 * Perguntas de um grupo do FAQ, em <details>/<summary> nativos: acessíveis
 * por teclado, sem JavaScript e com o texto sempre presente no DOM
 * (indexável — o que também alimenta o FAQPage JSON-LD da página, issue #47).
 * O cabeçalho do grupo é o próprio capítulo da página (h2), então aqui fica
 * só a lista.
 */
export default function FaqList({ groupId, accent }: { groupId: string; accent: string }) {
	const locale = useLocale() as Locale;
	const { FAQ_GROUPS } = getFaqContent(locale);
	const group = FAQ_GROUPS.find((g) => g.id === groupId);

	if (!group) return null;

	return (
		<div className="flex flex-col gap-3">
			{group.items.map((item) => (
				<details
					key={item.id}
					id={`faq-${item.id}`}
					className="group clip-chamfer border border-white/[0.08] bg-[#0f0d14] transition-colors hover:border-white/[0.2] open:border-white/[0.2]"
				>
					<summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-[15px] font-bold leading-[1.3] text-ink [&::-webkit-details-marker]:hidden">
						{item.question}
						<span
							aria-hidden="true"
							className="shrink-0 font-mono text-[16px] leading-none transition-transform group-open:rotate-45"
							style={{ color: accent }}
						>
							+
						</span>
					</summary>
					<p className="m-0 px-5 pb-5 text-justify text-[13.5px] leading-[1.7] text-[rgba(245,245,250,.65)]">
						{item.answer}
					</p>
				</details>
			))}
		</div>
	);
}
