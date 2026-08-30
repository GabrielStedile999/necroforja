"use client";

import { useActionState } from "react";
import { medicalEscort, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";

/** 2D6x10 possible rolls (the app never rolls — pick the table result). */
const COSTS = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];

/**
 * Medical Escort form (issue #84; Core Rulebook 2023, p.145) — shown only
 * while the fighter is injured / in recovery. The 2D6x10 cost and the D6
 * outcome are rolled at the table; the server debits the Stash
 * conditionally and applies the outcome atomically.
 */
export function MedicalEscortForm({
  fighterId,
  gangId,
}: {
  fighterId: string;
  gangId: string;
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    medicalEscort,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="fighterId" value={fighterId} />
      <input type="hidden" name="gangId" value={gangId} />

      <div className="flex flex-wrap items-end gap-2">
        <div className="w-40">
          <Label htmlFor={`escort-cost-${fighterId}`}>Rolled cost (2D6x10)</Label>
          <Select
            id={`escort-cost-${fighterId}`}
            name="cost"
            defaultValue={70}
            className="h-9"
          >
            {COSTS.map((c) => (
              <option key={c} value={c}>
                {c}c
              </option>
            ))}
          </Select>
        </div>
        <div className="w-44">
          <Label htmlFor={`escort-outcome-${fighterId}`}>Rolled outcome</Label>
          <Select
            id={`escort-outcome-${fighterId}`}
            name="outcome"
            defaultValue="stabilised"
            className="h-9"
          >
            <option value="died">Died</option>
            <option value="stabilised">Stabilised</option>
            <option value="full_recovery">Full recovery</option>
          </Select>
        </div>
        <Button type="submit" pending={pending} variant="outline" className="h-9">
          {pending ? "..." : "Pay escort"}
        </Button>
      </div>

      <p className="text-xs text-muted">
        Debits the Stash conditionally — refused if the credits aren&apos;t
        there. Stabilised: record the rolled lasting injury below. Dice are
        rolled at the table.
      </p>

      <div role="status" aria-live="polite">
        {state.error && <p className="text-xs text-blood">{state.error}</p>}
        {state.success && <p className="text-xs text-toxic">{state.success}</p>}
      </div>
    </form>
  );
}
