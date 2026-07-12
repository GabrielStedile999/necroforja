import Link from "next/link";

/**
 * CTA final do lore — ponto de entrada para as Gangues e o How to Play
 * (escopo da issue #9).
 */
export default function LoreCTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] py-[96px] bg-[radial-gradient(120%_140%_at_50%_120%,#1c0e18,#08070a_70%)]">
      <div className="absolute left-0 right-0 top-0 h-1.5 opacity-80 stripe-hazard-top" />

      <div className="ncf-wrap relative z-[2] mx-auto max-w-[1380px] px-[48px]">
        <div className="mb-[14px] text-center font-mono text-[13px] tracking-[5px] text-hazard">
          VOCÊ CONHECE O MUNDO. AGORA ESCOLHA SEU LADO.
        </div>
        <h2 className="m-0 mb-[44px] text-center text-[clamp(34px,5vw,60px)] font-bold uppercase leading-[0.98] tracking-[2px]">
          Desça para o Underhive
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {/* TODO: apontar para a página de Gangues quando existir (issue #8) */}
          <Link
            href="/#factions"
            className="clip-card-bl-16 group relative block overflow-hidden border border-cyan/[0.28] bg-[linear-gradient(150deg,#0a1418,#06090d)] p-7 no-underline transition-colors hover:border-cyan"
          >
            <div className="mb-2 font-mono text-[11px] tracking-[2px] text-cyan">AS GANGUES</div>
            <div className="mb-2 text-[24px] font-bold uppercase leading-[1.05] text-ink">
              Conheça as Casas em jogo
            </div>
            <div className="mb-5 max-w-[340px] text-[13px] leading-[1.55] text-[rgba(245,245,250,.6)]">
              Cawdor, Delaque, Escher, Goliath, Orlock, Van Saar — cada Casa forja um estilo de gangue diferente.
            </div>
            <span className="font-mono text-[12px] tracking-[2px] text-cyan group-hover:glow-cyan">
              VER FACÇÕES →
            </span>
          </Link>

          <Link
            href="/how-to-play"
            className="clip-card-br-16 group relative block overflow-hidden border border-hazard/30 bg-[linear-gradient(150deg,#1a1020,#0a0810)] p-7 no-underline transition-colors hover:border-hazard"
          >
            <div className="mb-2 font-mono text-[11px] tracking-[2px] text-hazard">HOW TO PLAY</div>
            <div className="mb-2 text-[24px] font-bold uppercase leading-[1.05] text-ink">
              Aprenda a jogar a campanha
            </div>
            <div className="mb-5 max-w-[340px] text-[13px] leading-[1.55] text-[rgba(245,245,250,.6)]">
              Monte sua gangue, dispute territórios e acompanhe o ranking de The Aranthian Succession.
            </div>
            <span className="font-mono text-[12px] tracking-[2px] text-hazard group-hover:glow-magenta">
              COMEÇAR AGORA →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
