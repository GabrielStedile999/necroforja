import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

type Variant = "primary" | "ghost" | "outline" | "accent" | "cyan";

const variants: Record<Variant, string> = {
  // Magenta/accent solid with chamfered corners + glow
  primary:
    "bg-hazard text-void hover:bg-hazard-strong font-semibold clip-chamfer-sm glow-box-magenta",
  accent:
    "bg-accent text-void hover:bg-hazard-strong font-semibold clip-chamfer-sm glow-box-magenta",
  // Cyan outline
  cyan:
    "border border-accent2 text-accent2 hover:bg-accent2/10 clip-chamfer-sm glow-box-cyan",
  // Ghost — transparent, subtle hover
  ghost: "bg-transparent text-ink hover:bg-elevated",
  // Outlined — border-rivet, subtle hover
  outline:
    "border border-rivet bg-transparent text-ink hover:bg-elevated hover:border-hazard/50",
};

export function Button({
  className,
  variant = "primary",
  pending = false,
  disabled,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  /**
   * Estado de espera (issue #60): desabilita o botão, marca aria-busy e
   * renderiza o Spinner inline antes do texto. O spinner é decorativo
   * (sem role) — a troca de texto do botão ("Enviando…" etc.) continua
   * sendo o anúncio para leitores de tela.
   */
  pending?: boolean;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center px-4 text-sm uppercase tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...props}
    >
      {pending && <Spinner size="sm" className="mr-2 shrink-0" />}
      {children}
    </button>
  );
}
