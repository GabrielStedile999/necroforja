"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import {
  addFighter,
  recruitFighter,
  type PlayerState,
} from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { FighterFields } from "./FighterFields";

/**
 * Recruiting (issue #68): players PAY the fighter's base cost from the
 * Stash (recruitFighter — atomic conditional debit). In Arbitrator mode a
 * payment select also exposes the free grant (addFighter, admin-only on
 * the server), used for narrative rewards or fixing mistakes.
 */
export function AddFighterForm({
  gangId,
  arbitratorMode = false,
}: {
  gangId: string;
  arbitratorMode?: boolean;
}) {
  const [buyState, buyAction, buyPending] = useActionState<
    PlayerState,
    FormData
  >(recruitFighter, {});
  const [grantState, grantAction, grantPending] = useActionState<
    PlayerState,
    FormData
  >(addFighter, {});
  const [payment, setPayment] = useState<"debit" | "grant">("debit");
  const formRef = useRef<HTMLFormElement>(null);

  const isGrant = arbitratorMode && payment === "grant";
  const state = isGrant ? grantState : buyState;
  const formAction = isGrant ? grantAction : buyAction;
  const pending = isGrant ? grantPending : buyPending;

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="gangId" value={gangId} />

      {arbitratorMode && (
        <div className="sm:max-w-xs">
          <Label htmlFor="add-fighter-payment">Payment</Label>
          <Select
            id="add-fighter-payment"
            value={payment}
            onChange={(e) => setPayment(e.target.value as "debit" | "grant")}
          >
            <option value="debit">Debit Stash (purchase)</option>
            <option value="grant">Free (Arbitrator grant)</option>
          </Select>
        </div>
      )}

      <FighterFields idPrefix="add-" />

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
        <Button type="submit" pending={pending}>
          {pending
            ? "Recruiting..."
            : isGrant
              ? "Add fighter (free grant)"
              : "Recruit (pay base cost)"}
        </Button>
      </div>
    </form>
  );
}
