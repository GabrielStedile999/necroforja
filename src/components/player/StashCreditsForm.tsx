"use client";

import { useActionState, useEffect, useRef } from "react";
import { setStashCredits, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function StashCreditsForm({
  currentCredits,
  gangId,
}: {
  currentCredits: number;
  gangId: string;
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    setStashCredits,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  // On successful save the value already comes from the server via revalidatePath;
  // we don't need to reset the input (it reflects the new value via props).
  useEffect(() => {
    if (state.success && formRef.current) {
      // Ensure the input shows the saved value (without needing a forced re-render)
      const input = formRef.current.elements.namedItem(
        "credits",
      ) as HTMLInputElement | null;
      if (input) input.value = String(currentCredits);
    }
  }, [state.success, currentCredits]);

  return (
    <form ref={formRef} action={formAction} className="flex items-end gap-3">
      <input type="hidden" name="gangId" value={gangId} />
      <div className="flex-1">
        <Label htmlFor="stash-credits">Credits in Stash</Label>
        <Input
          id="stash-credits"
          name="credits"
          type="number"
          min={0}
          defaultValue={currentCredits}
          required
        />
      </div>
      <Button type="submit" pending={pending} variant="outline">
        {pending ? "Saving..." : "Save"}
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
