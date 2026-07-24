import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Corpo do post em Markdown (issue #5), renderizado no servidor com
 * react-markdown + GFM. HTML cru fica desabilitado por padrão (seguro por
 * construção — sem necessidade de sanitização extra).
 */
const components: Components = {
	h2: ({ children }) => (
		<h2 className="mb-4 mt-10 flex items-center gap-3 text-[24px] font-bold uppercase tracking-[1px] text-ink">
			<span className="h-px w-[26px] bg-hazard" aria-hidden />
			{children}
		</h2>
	),
	h3: ({ children }) => (
		<h3 className="mb-3 mt-8 font-mono text-[13px] tracking-[3px] text-cyan">
			{children}
		</h3>
	),
	p: ({ children }) => (
		<p className="m-0 mb-5 text-justify text-[15px] leading-[1.8] text-[rgba(245,245,250,.72)]">
			{children}
		</p>
	),
	a: ({ href, children }) => (
		<a
			href={href}
			className="text-cyan underline decoration-cyan/40 underline-offset-4 hover:decoration-cyan"
			target={href?.startsWith("http") ? "_blank" : undefined}
			rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
		>
			{children}
		</a>
	),
	ul: ({ children }) => (
		<ul className="m-0 mb-5 list-disc pl-5 marker:text-hazard">{children}</ul>
	),
	ol: ({ children }) => (
		<ol className="m-0 mb-5 list-decimal pl-5 marker:text-hazard">{children}</ol>
	),
	li: ({ children }) => (
		<li className="mb-2 text-[14px] leading-[1.65] text-[rgba(245,245,250,.68)]">
			{children}
		</li>
	),
	blockquote: ({ children }) => (
		<blockquote className="m-0 mb-5 border-l-2 border-hazard bg-white/[0.02] py-2 pl-5 pr-4 text-[15px] italic text-[rgba(245,245,250,.75)]">
			{children}
		</blockquote>
	),
	hr: () => (
		<div className="my-8 flex items-center gap-3" aria-hidden>
			<span className="h-px flex-1 bg-white/[0.1]" />
			<span className="font-mono text-[11px] tracking-[3px] text-[rgba(245,245,250,.3)]">{"///"}</span>
			<span className="h-px flex-1 bg-white/[0.1]" />
		</div>
	),
	strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
	code: ({ children }) => (
		<code className="bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-cyan">
			{children}
		</code>
	),
	img: ({ src, alt }) => (
		// Dimensões desconhecidas em Markdown — <img> simples com estilo do site.
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={typeof src === "string" ? src : undefined}
			alt={alt ?? ""}
			loading="lazy"
			className="clip-card my-2 w-full border border-white/[0.09]"
		/>
	),
};

export default function PostBody({ markdown }: { markdown: string }) {
	return (
		// id targeted by <ScrollToTerm> (issue #15 follow-up) — a search result
		// for this post scrolls to and highlights the first match in here.
		<div id="post-body" className="max-w-[820px]">
			<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
				{markdown}
			</ReactMarkdown>
		</div>
	);
}
