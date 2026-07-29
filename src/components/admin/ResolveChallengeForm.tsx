"use client";

import { useActionState } from "react";
import {
  resolveChallenge,
  type CampaignState,
} from "@/app/admin/campaign/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";

export function ResolveChallengeForm({
  challengeId,
  hasDefender,
}: {
  challengeId: string;
  hasDefender: boolean;
}) {
  const [state, formAction, pending] = useActionState<CampaignState, FormData>(
    resolveChallenge,
    {},
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="challengeId" value={challengeId} />
      <Select name="outcome" defaultValue="challenger_win" className="h-9 w-44">
        <option value="challenger_win">Challenger won</option>
        {hasDefender && (
          <option value="challenged_win">Defender won</option>
        )}
        <option value="declined">Declined</option>
        <option value="draw">Draw</option>
      </Select>
      <Button type="submit" variant="outline" pending={pending} className="h-9">
        {pending ? "..." : "Resolve"}
      </Button>
      {state.error && <span className="text-xs text-blood">{state.error}</span>}
    </form>
  );
}
