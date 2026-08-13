"use client";

import { useActionState } from "react";
import { removeInjury, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";

/**
 * Arbitrator-only correction (issue #71): removes a lasting injury and
 * reverts exactly the stat delta it applied. Rendered only in Arbitrator
 * mode; the server enforces the role regardless.
 */
export function RemoveInjuryButton({
  injuryId,
  fighterId,
  gangId,
}: {
  injuryId: string;
  fighterId: string;
  gangId: string;
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    removeInjury,
    {},
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="injuryId" value={injuryId} />
      <input type="hidden" name="fighterId" value={fighterId} />
      <input type="hidden" name="gangId" value={gangId} />
      <Button
        variant="ghost"
        type="submit"
        pending={pending}
        className="h-7 px-2 text-xs text-blood hover:text-blood"
      >
        {pending ? "..." : "Remove"}
      </Button>
      {state.error && <span className="text-xs text-blood">{state.error}</span>}
    </form>
  );
}
