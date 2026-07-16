import Link from "next/link";
import { useTranslations } from "next-intl";
import s from "./Hero.module.scss";
import TrailerModal from "./TrailerModal";

/**
 * Hero — Tailwind layout + globals.css visual utilities + SCSS for
 * text-shadow, complex gradients, and hover transitions.
 */
export default function Hero() {
	const t = useTranslations("Hero");
	return (
		<div
			className="ncf-hero relative flex min-h-screen max-h-screen items-end overflow-hidden bg-[#0a0507]"
			style={{
				backgroundImage: "url(/hero.png)",
				backgroundSize: "auto 100%",
				backgroundPosition: "right center",
				backgroundRepeat: "no-repeat",
			}}
		>
			{/* Left-to-right gradient (text legibility) */}
			<div
				className={`ncf-hero-gradient absolute inset-0 z-[1] ${s.heroGradient}`}
			/>

			{/* Top/bottom darken */}
			<div className={`absolute inset-0 z-[2] ${s.heroDarken}`} />

			{/* Perspective grid floor */}
			<div
				className="absolute bottom-0 z-[3] h-[42%] opacity-[0.1] grid-hero animate-grid-hero"
				style={{ left: "-10%", right: "-10%" }}
			/>

			{/* Particles */}
			<div className="absolute z-[5] left-[22%] bottom-[8%] h-[3px] w-[3px] rounded-full bg-[#00e5ff] shadow-particle-c animate-rise-1" />
			<div className="absolute z-[5] left-[44%] bottom-[4%]  h-[2px] w-[2px] rounded-full bg-hazard         shadow-particle-m animate-rise-2" />
			<div className="absolute z-[5] left-[63%] bottom-[10%] h-[3px] w-[3px] rounded-full bg-[#00e5ff] shadow-particle-c animate-rise-3" />
			<div className="absolute z-[5] left-[80%] bottom-[6%]  h-[2px] w-[2px] rounded-full bg-hazard         shadow-particle-m animate-rise-4" />

			{/* Top-right HUD */}
			<div className="ncf-hero-deco absolute right-[48px] top-[26px] z-[21] flex items-center gap-[14px] font-mono text-xs tracking-[1px] text-[rgba(245,245,250,.7)]">
				<span className="inline-flex items-center gap-[7px]">
					<span className={s.recDot} />
					{t("rec")}
				</span>
				<span className="text-[rgba(245,245,250,.4)]">
					{t("liveFeed")}
				</span>
				<span className="border border-white/[0.15] px-2 py-[3px]">
					02:14:08
				</span>
			</div>

			{/* Left vertical text */}
			<div className="ncf-hero-deco absolute left-5 top-1/2 z-[21] -translate-y-1/2 rotate-180 writing-vertical font-mono text-[11px] tracking-[5px] text-[rgba(245,245,250,.32)]">
				{t("verticalDeco")}
			</div>

			{/* Scroll cue */}
			<div className="ncf-hero-deco absolute bottom-[40px] right-[48px] z-[21] flex flex-col items-center gap-[10px]">
				<span className="writing-vertical font-mono text-[10px] tracking-[3px] text-[rgba(245,245,250,.4)]">
					{t("scroll")}
				</span>
				<span className={s.scrollMouse}>
					<span className={s.scrollDot} />
				</span>
			</div>

			{/* Main content */}
			<div className="ncf-hero-content relative z-[20] mx-auto w-full max-w-[1380px] px-[48px] pb-[96px]">
				{/* Pre-title */}
				<div className="mb-[18px] flex items-center gap-[14px]">
					<span className="h-px w-[54px] bg-hazard" />
					<span className="font-mono text-[13px] tracking-[5px] text-hazard">
						{t("preTitle")}
					</span>
				</div>

				{/* H1 */}
				<h1
					className={`ncf-h1 m-0 text-[clamp(64px,9.6vw,158px)] font-bold leading-[0.9] tracking-[2px] text-[#fafaff] whitespace-nowrap ${s.heroTitle}`}
				>
					NECRO
					<span className="text-hazard animate-flicker">FORJA</span>
				</h1>

				{/* Tagline */}
				<div className="ncf-hero-tagline mt-4 mb-6 font-mono text-[clamp(15px,1.5vw,22px)] tracking-[9px] text-[rgba(245,245,250,.82)]">
					{t("tagline")}
				</div>

				{/* Lead */}
				<p className="ncf-hero-lead m-0 mb-9 max-w-[600px] text-[18px] leading-[1.65] text-[rgba(245,245,250,.62)]">
					{t("lead")}
				</p>

				{/* CTAs */}
				<div className="ncf-hero-cta flex flex-wrap items-stretch gap-[18px]">
					{/* Primary */}
					<Link href="/dashboard" className={s.ctaPrimary}>
						<span className="text-[17px] font-bold tracking-[2px]">
							{t("ctaPrimary")}
						</span>
						<span className="mt-[3px] font-mono text-[11px] tracking-[1px] opacity-70">
							{t("ctaPrimarySub")}
						</span>
					</Link>

					{/* Watch Trailer — opens video modal */}
					<TrailerModal />
				</div>
			</div>

			{/* Scanlines overlay */}
			<div
				className={`absolute inset-0 z-[8] pointer-events-none opacity-[0.8] ${s.heroScanlines}`}
			/>

			{/* Vignette */}
			<div
				className={`absolute inset-0 z-[9] pointer-events-none ${s.heroVignette}`}
			/>
		</div>
	);
}
