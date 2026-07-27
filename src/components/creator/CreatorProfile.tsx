import Image from "next/image";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { AUTHOR_LINKEDIN_URL, SITE_REPO_URL } from "@/lib/seo/json-ld";
import { getCreatorContent } from "./content.i18n";
import photo from "./photo.webp";

/**
 * Perfil do criador (issue #39 follow-up) — foto à esquerda, bio à direita
 * (empilha no mobile). Import estático da foto = dimensões conhecidas +
 * otimização automática do next/image (issue #42); chips de "ficha técnica"
 * na mesma linguagem visual dos contadores do FaqHero.
 */
export default function CreatorProfile() {
	const locale = useLocale() as Locale;
	const { CREATOR_INTRO, CREATOR_PARAGRAPHS, CREATOR_FACTS, CREATOR_LINKS } =
		getCreatorContent(locale);

	return (
		<section className="ncf-section py-[96px]">
			<div className="ncf-wrap mx-auto max-w-[1380px] px-[48px]">
				{/* Kicker */}
				<div className="mb-[44px] flex items-center gap-[14px]">
					<span className="font-mono text-[13px] tracking-[4px] text-hazard">
						{CREATOR_INTRO.kicker}
					</span>
					<span className="h-px flex-1 bg-white/[0.1]" />
				</div>

				<div className="flex flex-col gap-[56px] lg:flex-row lg:items-start">
					{/* Foto — esquerda */}
					<div className="relative w-full max-w-[400px] shrink-0 self-center lg:self-start">
						<div className="clip-chamfer-sm relative overflow-hidden border border-white/[0.12] bg-[rgba(15,13,20,.82)]">
							<Image
								src={photo}
								alt={CREATOR_INTRO.photoAlt}
								priority
								sizes="(max-width: 1024px) 100vw, 400px"
								className="h-auto w-full object-cover"
							/>
							<div className="scanlines-dark pointer-events-none absolute inset-0 opacity-25" />
						</div>
						{/* Barra de identificação sob a foto */}
						<div className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-[2px] text-[rgba(245,245,250,.45)]">
							<span>ID // STEDILE.G</span>
							<span className="text-cyan">HIVE SECUNDUS CLEARANCE</span>
						</div>
					</div>

					{/* Bio — direita */}
					<div className="min-w-0 flex-1">
						<h1 className="glow-magenta m-0 mb-[10px] text-[clamp(34px,5vw,56px)] font-bold uppercase leading-[1] tracking-[2px]">
							{CREATOR_INTRO.name}
						</h1>
						<p className="m-0 mb-[30px] font-mono text-[13px] tracking-[2px] text-cyan">
							{CREATOR_INTRO.role}
						</p>

						<div className="flex max-w-[720px] flex-col gap-4">
							{CREATOR_PARAGRAPHS.map((paragraph) => (
								<p
									key={paragraph.id}
									className="m-0 text-justify text-[15px] leading-[1.75] text-[rgba(245,245,250,.7)]"
								>
									{paragraph.text}
								</p>
							))}
						</div>

						{/* Ficha técnica */}
						<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-[720px]">
							{CREATOR_FACTS.map((fact) => (
								<div
									key={fact.id}
									className="clip-chamfer-sm border border-white/[0.1] bg-[rgba(15,13,20,.82)] p-5"
								>
									<div className="mb-1 font-mono text-[10px] tracking-[2px] text-[rgba(245,245,250,.55)]">
										{fact.label}
									</div>
									<div className="text-[17px] font-bold leading-snug text-cyan">{fact.value}</div>
								</div>
							))}
						</div>

						{/* Links externos */}
						<div className="mt-9 flex flex-wrap items-center gap-6 font-mono text-[13px] tracking-[2px]">
							<a
								href={AUTHOR_LINKEDIN_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="ncf-util-link text-[rgba(245,245,250,.7)] no-underline"
							>
								{CREATOR_LINKS.linkedin}
							</a>
							<a
								href={SITE_REPO_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="ncf-util-link text-[rgba(245,245,250,.7)] no-underline"
							>
								{CREATOR_LINKS.github}
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
