"use client";

import { useActionState } from "react";
import {
  collectSympathiserIncome,
  type CampaignState,
} from "@/app/admin/campaign/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

/**
 * One (gang × Sympathiser) income collection row (issue #85) — the
 * Arbitrator types the amount rolled at the table; the server validates
 * bounds, control, phase and the one-shot-per-cycle guard.
 */
export function CollectIncomeForm({
  gangId,
  sympathiserId,
  diceLabel,
}: {
  gangId: string;
  sympathiserId: string;
  /** e.g. "2D6x10", or "D6x10 + 2D6x10" when base and Spark stack. */
  diceLabel: string;
}) {
  const [state, formAction, pending] = useActionState<CampaignState, FormData>(
    collectSympathiserIncome,
    {},
  );
  const inputId = `income-${gangId}-${sympathiserId}`;

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="gangId" value={gangId} />
      <input type="hidden" name="sympathiserId" value={sympathiserId} />
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-28">
          <Label htmlFor={inputId}>Rolled ({diceLabel})</Label>
          <Input
            id={inputId}
            name="amount"
            type="number"
            min={10}
            max={300}
            step={10}
            placeholder="c"
            required
            className="h-8"
          />
        </div>
        <Button type="submit" pending={pending} variant="outline" className="h-8 text-xs">
          {pending ? "..." : "Collect"}
        </Button>
      </div>
      <div role="status" aria-live="polite">
        {state.error && <p className="text-xs text-blood">{state.error}</p>}
        {state.success && <p className="text-xs text-toxic">{state.success}</p>}
      </div>
    </form>
  );
}
