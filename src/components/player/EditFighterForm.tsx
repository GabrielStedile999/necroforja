"use client";

import { useActionState } from "react";
import { updateFighter, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { FighterFields } from "./FighterFields";
import type { Fighter } from "@/types";

/**
 * Full edit of a fighter (issue #63) — same fields as AddFighterForm,
 * pre-filled with the current values. Rendered inside a <details> per
 * fighter, so the ids are prefixed with the fighter id. XP, status and
 * equipment keep their dedicated forms.
 */
export function EditFighterForm({
  fighter,
  gangId,
}: {
  fighter: Fighter;
  gangId: string;
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    updateFighter,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="fighterId" value={fighter.id} />
      <input type="hidden" name="gangId" value={gangId} />
      <FighterFields
        idPrefix={`edit-${fighter.id}-`}
        defaults={{
          name: fighter.name,
          type: fighter.type,
          category: fighter.category,
          baseCost: fighter.baseCost,
          profile: fighter.profile,
        }}
      />

      {state.error && (
        <p className="rounded-sm border border-blood/40 bg-blood/15 px-3 py-2 text-sm text-blood">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-sm border border-toxic/40 bg-toxic/10 px-3 py-2 text-sm text-toxic">
          {state.success}
        </p>
      )}

      <div>
        <Button variant="outline" type="submit" pending={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
