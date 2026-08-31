"use client";

import { useActionState } from "react";
import {
  sellCaptive,
  ransomCaptive,
  releaseCaptive,
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
 * Arbitrator actions for ONE held captive (issue #86): sell to the
 * Guilders (destructive, type-to-confirm, amount clamped server-side),
 * ransom back (conditional credit leg, either direction) or release for
 * free. The server enforces authorisation, guards and atomicity.
 */
export function CaptiveActions({
  gangId,
  fighterId,
  fighterName,
  value,
  half,
}: {
  /** The CAPTOR gang (the panel's gang). */
  gangId: string;
  fighterId: string;
  fighterName: string;
  /** Full cost (equipment + advancements included). */
  value: number;
  /** Half rounded up to 5s — the book's sale price. */
  half: number;
}) {
  const [sellState, sellAction, sellPending] = useActionState<
    PlayerState,
    FormData
  >(sellCaptive, {});
  const [ransomState, ransomAction, ransomPending] = useActionState<
    PlayerState,
    FormData
  >(ransomCaptive, {});
  const [releaseState, releaseAction, releasePending] = useActionState<
    PlayerState,
    FormData
  >(releaseCaptive, {});

  return (
    <div className="flex flex-col gap-4">
      {/* Ransom */}
      <form action={ransomAction} className="flex flex-col gap-2">
        <input type="hidden" name="gangId" value={gangId} />
        <input type="hidden" name="fighterId" value={fighterId} />
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-28">
            <Label htmlFor={`ransom-amount-${fighterId}`}>Ransom (c)</Label>
            <Input
              id={`ransom-amount-${fighterId}`}
              name="amount"
              type="number"
              min={5}
              max={5000}
              step={5}
              required
              className="h-9"
            />
          </div>
          <div className="w-44">
            <Label htmlFor={`ransom-payer-${fighterId}`}>Paid by</Label>
            <Select
              id={`ransom-payer-${fighterId}`}
              name="payer"
              defaultValue="owner"
              className="h-9"
            >
              <option value="owner">Captive&apos;s gang (classic)</option>
              <option value="captor">Captor (reverse trade)</option>
            </Select>
          </div>
          <Button type="submit" pending={ransomPending} variant="outline" className="h-9">
            {ransomPending ? "..." : "Ransom back"}
          </Button>
        </div>
        <StateMessages state={ransomState} />
      </form>

      {/* Release */}
      <form action={releaseAction} className="flex flex-col gap-2">
        <input type="hidden" name="gangId" value={gangId} />
        <input type="hidden" name="fighterId" value={fighterId} />
        <div className="flex items-center gap-3">
          <Button type="submit" pending={releasePending} variant="outline" className="h-9">
            {releasePending ? "..." : "Release for free"}
          </Button>
          <span className="text-xs text-muted">
            failed trade / goodwill — no credits move
          </span>
        </div>
        <StateMessages state={releaseState} />
      </form>

      {/* Sell — destructive */}
      <form
        action={sellAction}
        className="flex flex-col gap-2 border-t border-blood/30 pt-3"
      >
        <input type="hidden" name="gangId" value={gangId} />
        <input type="hidden" name="fighterId" value={fighterId} />
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-28">
            <Label htmlFor={`sell-amount-${fighterId}`}>Sale (c)</Label>
            <Input
              id={`sell-amount-${fighterId}`}
              name="amount"
              type="number"
              min={0}
              max={value}
              defaultValue={half}
              required
              className="h-9"
            />
          </div>
          <div className="min-w-44 flex-1">
            <Label htmlFor={`sell-confirm-${fighterId}`}>
              Type &quot;{fighterName}&quot; to confirm
            </Label>
            <Input
              id={`sell-confirm-${fighterId}`}
              name="confirmName"
              placeholder={fighterName}
              autoComplete="off"
              required
              className="h-9"
            />
          </div>
          <Button
            type="submit"
            pending={sellPending}
            variant="outline"
            className="h-9 border-blood/50 text-blood hover:bg-blood/10"
          >
            {sellPending ? "..." : "Sell to the Guilders"}
          </Button>
        </div>
        <p className="text-xs text-muted">
          Deletes the fighter permanently (equipment goes with them). Book
          price: half the value rounded up to 5s ({half}c); override up to
          the full {value}c for bounties or the Slave Guild boon.
        </p>
        <StateMessages state={sellState} />
      </form>
    </div>
  );
}
