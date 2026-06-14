import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-hazard text-void hover:bg-hazard-strong font-semibold shadow-md shadow-hazard/20",
  ghost: "bg-transparent text-ink hover:bg-elevated",
  outline: "border border-rivet bg-transparent text-ink hover:bg-elevated",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-sm px-4 text-sm uppercase tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
