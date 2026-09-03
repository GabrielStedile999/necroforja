"use client";

import { useActionState } from "react";
import { awardTriumph, type CampaignState } from "@/app/admin/campaign/actions";
import { Button } from "@/components/ui/button";

/**
 * One-click award for a suggested Triumph (issue #88) — posts through the
 * EXISTING awardTriumph action with the title and gang pre-filled.
 */
export function AwardSuggestionButton({
  title,
  gangId,
}: {
  title: string;
  gangId: string;
}) {
  const [state, formAction, pending] = useActionState<CampaignState, FormData>(
    awardTriumph,
    {},
  );

  return (
    <form action={formAction} className="inline-flex flex-col items-end gap-1">
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="gangId" value={gangId} />
      <Button
        type="submit"
        pending={pending}
        variant="outline"
        className="h-7 px-2 text-xs"
      >
        {pending ? "..." : "Award"}
      </Button>
      <div role="status" aria-live="polite">
        {state.error && <p className="m-0 text-xs text-blood">{state.error}</p>}
      </div>
    </form>
  );
}
