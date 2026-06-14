"use client";

import { useActionState, useRef, useEffect } from "react";
import { addFighterXp, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function FighterXpForm({
  fighterId,
}: {
  fighterId: string;
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    addFighterXp,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="fighterId" value={fighterId} />

      <div className="flex items-end gap-2">
        <div>
          <Label htmlFor={`xp-delta-${fighterId}`}>+ XP</Label>
          <Input
            id={`xp-delta-${fighterId}`}
            name="xpDelta"
            type="number"
            min={1}
            max={100}
            defaultValue={1}
            className="w-20"
            required
          />
        </div>
        <Button type="submit" disabled={pending} variant="outline">
          {pending ? "..." : "Add XP"}
        </Button>
      </div>

      {state.error && (
        <p className="text-xs text-blood">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-toxic">{state.success}</p>
      )}
    </form>
  );
}
