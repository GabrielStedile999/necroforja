"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/**
 * Campo de senha com toggle de visibilidade (issue #54).
 *
 * Arquivo próprio (e não em `ui/input.tsx`) de propósito: precisa de
 * "use client" (estado do toggle) e o input.tsx continua utilizável em
 * server components. Os aria-labels chegam por props — o componente fica
 * agnóstico de namespace i18n e reutilizável em qualquer formulário.
 *
 * A11y: `aria-pressed` reflete o estado, `aria-label` dinâmico traduzido,
 * alvo de clique de 40×40px (mínimo 24×24 da issue). Toggle puramente
 * visual — não mexe em `autoComplete` nem no `name` do campo.
 */
export function PasswordInput({
  showLabel,
  hideLabel,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** aria-label do botão quando a senha está oculta (ação: mostrar). */
  showLabel: string;
  /** aria-label do botão quando a senha está visível (ação: ocultar). */
  hideLabel: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center bg-transparent text-muted transition-colors hover:text-ink focus-visible:text-hazard focus-visible:outline-none"
      >
        {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
      </button>
    </div>
  );
}
