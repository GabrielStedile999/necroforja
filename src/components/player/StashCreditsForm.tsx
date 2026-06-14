"use client";

import { useActionState, useEffect, useRef } from "react";
import { setStashCredits, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function StashCreditsForm({
  currentCredits,
}: {
  currentCredits: number;
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    setStashCredits,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Ao salvar com sucesso o valor já vem do servidor via revalidatePath;
  // não precisamos resetar o input (ele reflete o novo valor via props).
  useEffect(() => {
    if (state.success && formRef.current) {
      // Garante que o input mostra o valor salvo (sem precisar de re-render forçado)
      const input = formRef.current.elements.namedItem(
        "credits",
      ) as HTMLInputElement | null;
      if (input) input.value = String(currentCredits);
    }
  }, [state.success, currentCredits]);

  return (
    <form ref={formRef} action={formAction} className="flex items-end gap-3">
      <div className="flex-1">
        <Label htmlFor="stash-credits">Créditos no Stash</Label>
        <Input
          id="stash-credits"
          name="credits"
          type="number"
          min={0}
          defaultValue={currentCredits}
          required
        />
      </div>
      <Button type="submit" disabled={pending} variant="outline">
        {pending ? "Salvando..." : "Salvar"}
      </Button>

      {state.error && (
        <p className="mt-1 text-sm text-blood">{state.error}</p>
      )}
      {state.success && (
        <p className="mt-1 text-sm text-toxic">{state.success}</p>
      )}
    </form>
  );
}
