import { cn } from "@/lib/utils";

type Variant = "default" | "hazard" | "toxic" | "blood" | "muted" | "cyan";

const variants: Record<Variant, string> = {
  default: "border-rivet bg-elevated text-ink",
  hazard:  "border-hazard/40 bg-hazard/10 text-hazard",
  toxic:   "border-toxic/40 bg-toxic/10 text-toxic",
  blood:   "border-blood/40 bg-blood/15 text-blood",
  muted:   "border-rivet bg-transparent text-muted",
  cyan:    "border-cyan/40 bg-cyan/10 text-cyan",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-2 py-0.5 text-xs font-medium uppercase tracking-wide clip-chamfer-sm",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
