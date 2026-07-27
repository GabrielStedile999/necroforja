import type { HouseRule } from "./content";

/**
 * Corpo de uma Campaign Custom Rule — contexto + cláusulas rotuladas (mesma
 * pegada de "condição/efeito" das páginas de regras oficiais). O título da
 * regra é o próprio cabeçalho do capítulo na página (h2), então aqui ficam
 * só a introdução e a lista de cláusulas. Fonte: corpo da issue #41.
 */
export default function HrRule({ rule, accent }: { rule: HouseRule; accent: string }) {
	return (
		<div>
			<p
				className="m-0 mb-6 max-w-[760px] border-l-2 pl-4 text-justify text-[14px] leading-[1.7] text-[rgba(245,245,250,.72)]"
				style={{ borderColor: accent }}
			>
				{rule.intro}
			</p>

			<ul role="list" className="m-0 flex list-none flex-col gap-4 p-0">
				{rule.clauses.map((clause) => (
					<li
						key={clause.id}
						className="clip-chamfer border border-white/[0.08] bg-[#0f0d14] p-5 transition-colors hover:border-white/[0.2]"
					>
						<span
							className="mb-[6px] block font-mono text-[10px] tracking-[2px]"
							style={{ color: accent }}
						>
							{clause.label}
						</span>
						<p className="m-0 text-justify text-[13.5px] leading-[1.7] text-[rgba(245,245,250,.65)]">
							{clause.text}
						</p>
					</li>
				))}
			</ul>
		</div>
	);
}
