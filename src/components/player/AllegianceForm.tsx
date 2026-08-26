"use client";

import { useActionState } from "react";
import { setGangAllegiance, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { ALLEGIANCE_OPTIONS } from "@/lib/data/allegiances";
import type { GangAllegiance } from "@/types";

/**
 * Declare/change the gang's civil-war side (issue #82). A player only sees
 * this while Unaligned (a declared side is final — Cinderak p.63 "Take a
 * Side"); the Arbitrator can set anything as a correction. The server
 * enforces both rules regardless of what renders.
 */
export function AllegianceForm({
  gangId,
  current,
  arbitratorMode = false,
}: {
  gangId: string;
  current: GangAllegiance;
  arbitratorMode?: boolean;
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    setGangAllegiance,
    {},
  );

  const options = arbitratorMode
    ? ALLEGIANCE_OPTIONS
    : ALLEGIANCE_OPTIONS.filter((o) => o.key !== "unaligned");

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="gangId" value={gangId} />
      <div className="flex items-center gap-2">
        <label htmlFor={`allegiance-${gangId}`} className="sr-only">
          Allegiance
        </label>
        <Select
          id={`allegiance-${gangId}`}
          name="allegiance"
          defaultValue={current === "unaligned" ? "" : current}
          required
          className="h-9 w-44"
        >
          <option value="" disabled>
            Choose a side…
          </option>
          {options.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline" pending={pending} className="h-9">
          {pending ? "..." : arbitratorMode ? "Set" : "Declare"}
        </Button>
      </div>
      {!arbitratorMode && (
        <p className="text-xs text-muted">
          Declaring a side is final — only the Arbitrator can change it later.
        </p>
      )}
      <div role="status" aria-live="polite">
        {state.error && <p className="text-xs text-blood">{state.error}</p>}
        {state.success && <p className="text-xs text-toxic">{state.success}</p>}
      </div>
    </form>
  );
}
