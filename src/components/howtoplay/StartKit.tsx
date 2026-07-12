import Image from "next/image";
import { START_KIT, type KitItem } from "./content";

/** Ícones inline de cada item do kit — traço fino, estética terminal. */
function KitIcon({ name, color }: { name: KitItem["icon"]; color: string }) {
	const common = {
		width: 30,
		height: 30,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: color,
		strokeWidth: 1.6,
		strokeLinecap: "round",
		strokeLinejoin: "round",
	} as const;

	switch (name) {
		case "gang":
			return (
				<svg {...common}>
					<circle cx="8" cy="7" r="3" />
					<path d="M2 21v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2" />
					<circle cx="17" cy="8" r="2.4" />
					<path d="M15.5 13.2a4 4 0 0 1 6.5 3.1V21" />
				</svg>
			);
		case "book":
			return (
				<svg {...common}>
					<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
					<path d="M4 19a2 2 0 0 0 2 2h13" />
					<line x1="9" y1="7" x2="15" y2="7" />
				</svg>
			);
		case "dice":
			return (
				<svg {...common}>
					<rect x="3" y="3" width="18" height="18" rx="2.5" />
					<circle cx="8" cy="8" r="1" fill={color} stroke="none" />
					<circle cx="16" cy="8" r="1" fill={color} stroke="none" />
					<circle cx="12" cy="12" r="1" fill={color} stroke="none" />
					<circle cx="8" cy="16" r="1" fill={color} stroke="none" />
					<circle cx="16" cy="16" r="1" fill={color} stroke="none" />
				</svg>
			);
		case "tape":
			return (
				<svg {...common}>
					<circle cx="9" cy="12" r="6" />
					<circle cx="9" cy="12" r="1.6" />
					<path d="M15 12h7M18 12v3M21 12v3" />
				</svg>
			);
		case "cards":
			return (
				<svg {...common}>
					<rect x="3" y="6" width="12" height="15" rx="1.5" />
					<path d="M8 3h12v15" />
					<line x1="6" y1="10" x2="12" y2="10" />
					<line x1="6" y1="13" x2="12" y2="13" />
				</svg>
			);
		case "terrain":
			return (
				<svg {...common}>
					<path d="M3 21h18" />
					<path d="M5 21V11l4-2v12" />
					<path d="M13 21V7l6 3v11" />
					<line x1="16" y1="13" x2="16" y2="13.01" />
					<line x1="16" y1="16" x2="16" y2="16.01" />
				</svg>
			);
	}
}

const TAG_COLOR: Record<string, string> = {
	ESSENCIAL: "#00e5ff",
	"NA NECROFORJA": "#ff2d6f",
	RECOMENDADO: "#59e36b",
};

/**
 * 00 · Comece aqui — o que é preciso para jogar (escopo da issue #7):
 * miniaturas, livros e materiais de mesa.
 */
export default function StartKit() {
	return (
		<section
			id="comece-aqui"
			className="ncf-section scroll-mt-[130px] border-t border-white/[0.06] py-[88px]"
		>
			<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
				<div className="mb-[18px] flex items-center gap-[14px]">
					<span className="font-mono text-[13px] tracking-[4px] text-cyan">
						00 {"//"} COMECE AQUI
					</span>
					<span className="h-px flex-1 bg-white/[0.1]" />
				</div>

				<h2 className="m-0 mb-4 text-[clamp(28px,4vw,44px)] font-bold uppercase leading-[1.02] tracking-[1px]">
					O que você precisa para jogar
				</h2>
				<p className="m-0 mb-[44px] max-w-[720px] text-justify text-[15px] leading-[1.75] text-[rgba(245,245,250,.65)]">
					Sua primeira batalha no Underhive está próxima.
				</p>

				<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
					{START_KIT.map((item) => {
						const tagColor = TAG_COLOR[item.tag] ?? "#00e5ff";
						return (
							<div
								key={item.id}
								className="clip-chamfer group overflow-hidden border border-white/[0.08] bg-[#0f0d14] transition-colors hover:border-white/[0.2]"
							>
								{/* Imagem do card */}
								<div className="relative h-[180px] w-full overflow-hidden">
									<Image
										src={`/howtoplay/kit-${item.id}.webp`}
										alt={item.title}
										fill
										sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 430px"
										className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.04]"
									/>
									<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(15,13,20,.92))]" />
								</div>

								<div className="p-6 pt-4">
									<div className="mb-4 flex items-center justify-between">
										<KitIcon name={item.icon} color={tagColor} />
										<span
											className="font-mono text-[10px] tracking-[2px]"
											style={{ color: tagColor }}
										>
											{item.tag}
										</span>
									</div>
									<div className="mb-2 text-[17px] font-bold uppercase leading-[1.1] tracking-[0.5px]">
										{item.title}
									</div>
									<p className="m-0 text-justify text-[13px] leading-[1.65] text-[rgba(245,245,250,.6)]">
										{item.text}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
