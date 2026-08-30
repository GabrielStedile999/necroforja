"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  clearRecoveryBoon,
  homeSupportRecruit,
  type PlayerState,
} from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

function StateMessages({ state }: { state: PlayerState }) {
  return (
    <div role="status" aria-live="polite">
      {state.error && <p className="text-xs text-blood">{state.error}</p>}
      {state.success && <p className="text-xs text-toxic">{state.success}</p>}
    </div>
  );
}

/**
 * Water Guild roster boon (issue #85): clear one fighter's recovery per
 * pre-battle sequence. Rendered only while the gang controls a Sympathiser
 * granting it; frequency is policed at the table.
 */
export function ClearRecoveryBoonForm({
  gangId,
  fighters,
}: {
  gangId: string;
  /** Fighters currently in recovery. */
  fighters: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    clearRecoveryBoon,
    {},
  );

  if (fighters.length === 0) {
    return (
      <p className="text-xs text-muted">No fighters in recovery right now.</p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="gangId" value={gangId} />
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-44">
          <Label htmlFor={`wg-fighter-${gangId}`}>Fighter in recovery</Label>
          <Select id={`wg-fighter-${gangId}`} name="fighterId" className="h-9">
            {fighters.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" pending={pending} variant="outline" className="h-9">
          {pending ? "..." : "Clear recovery"}
        </Button>
      </div>
      <p className="text-xs text-muted">
        One fighter per pre-battle sequence — the table keeps count.
      </p>
      <StateMessages state={state} />
    </form>
  );
}

/**
 * Home Support free Ganger (issue #85): Spark of Rebellion phase, table
 * roll confirmed at the table (2D6 ≥ 10), one per gang per cycle. The
 * recruit is born with an empty card; equipment is paid as normal.
 */
export function HomeSupportRecruitForm({
  gangId,
  dice,
  threshold,
}: {
  gangId: string;
  dice: string;
  threshold: number;
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    homeSupportRecruit,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="gangId" value={gangId} />
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-44 flex-1">
          <Label htmlFor={`hs-name-${gangId}`}>New Ganger&apos;s name</Label>
          <Input
            id={`hs-name-${gangId}`}
            name="name"
            maxLength={60}
            placeholder="e.g. Vex"
            required
            className="h-9"
          />
        </div>
        <Button type="submit" pending={pending} variant="outline" className="h-9">
          {pending ? "..." : "Recruit for free"}
        </Button>
      </div>
      <p className="text-xs text-muted">
        Only after rolling {dice} ≥ {threshold} at the table. Once per cycle;
        fill in the card afterwards — equipment is paid as normal.
      </p>
      <StateMessages state={state} />
    </form>
  );
}
