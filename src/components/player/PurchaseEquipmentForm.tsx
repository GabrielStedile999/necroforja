"use client";

/**
 * Trading Post purchase form (issue #68) — buys a catalogue item debiting
 * the gang's Stash credits atomically on the server. Destination is fixed
 * by the caller: a fighter's card ("equip on purchase") or the Stash
 * (qty allowed). Shows the price and the current credits up front; the
 * client-side disable is a courtesy — the conditional debit on the server
 * is the authority.
 */

import { useActionState, useRef, useEffect, useState } from "react";
import { purchaseEquipment, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  CatalogPicker,
  type CatalogOption,
} from "@/components/player/CatalogPicker";
import {
  KeywordChips,
  type KeywordRuleMap,
} from "@/components/rules/KeywordChips";

export function PurchaseEquipmentForm({
  gangId,
  destination,
  catalog,
  keywordRules = {},
  stashCredits,
}: {
  gangId: string;
  /** "stash" or the target fighter's id. */
  destination: string;
  catalog: CatalogOption[];
  keywordRules?: KeywordRuleMap;
  stashCredits: number;
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    purchaseEquipment,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [pick, setPick] = useState("");
  const [qty, setQty] = useState(1);
  const toStash = destination === "stash";
  const picked = catalog.find((o) => o.id === pick);
  const total = picked ? picked.cost * (toStash ? qty : 1) : 0;
  const short = picked ? total - stashCredits : 0;

  /** Render-time reset on success (same pattern as the #67 forms). */
  const [lastSuccess, setLastSuccess] = useState<string | undefined>(undefined);
  if (state.success !== lastSuccess) {
    setLastSuccess(state.success);
    if (state.success) {
      setPick("");
      setQty(1);
    }
  }

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  if (catalog.length === 0) {
    return (
      <p className="text-sm text-muted">
        The equipment catalogue is empty — ask the Arbitrator to seed it at
        /admin/catalog.
      </p>
    );
  }

  const uid = `buy-${destination}`;

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="gangId" value={gangId} />
      <input type="hidden" name="destination" value={destination} />
      <input type="hidden" name="catalogItemId" value={pick} />

      <div className="grid gap-3 sm:grid-cols-4">
        <div className={toStash ? "sm:col-span-3" : "sm:col-span-4"}>
          <CatalogPicker
            id={`${uid}-item`}
            options={catalog}
            value={pick}
            onChange={setPick}
          />
        </div>
        {toStash && (
          <div>
            <Label htmlFor={`${uid}-qty`}>Qty</Label>
            <Input
              id={`${uid}-qty`}
              name="qty"
              type="number"
              min={1}
              max={9}
              value={qty}
              onChange={(e) =>
                setQty(Math.max(1, Math.min(9, Number(e.target.value) || 1)))
              }
            />
          </div>
        )}
      </div>

      {picked && (
        <div className="rounded-sm border border-rivet/60 bg-elevated/40 px-3 py-2 text-sm text-muted">
          <span className="font-medium text-ink">{picked.name}</span>
          {" · "}
          {picked.category}
          {" · "}
          <span className="font-mono text-hazard">{picked.cost}c</span>
          {toStash && qty > 1 && (
            <span className="font-mono"> ×{qty} = {total}c</span>
          )}
          {picked.traits && (
            <span className="mt-1 block">
              <KeywordChips traits={picked.traits} rules={keywordRules} />
            </span>
          )}
          {picked.effect && (
            <span className="mt-1 block text-xs">{picked.effect}</span>
          )}
        </div>
      )}

      {picked && short > 0 && (
        <p className="rounded-sm border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-rust">
          Insufficient credits: this costs {total}c and the Stash has{" "}
          {stashCredits}c ({short}c short).
        </p>
      )}

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

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          pending={pending}
          disabled={!picked || short > 0}
        >
          {pending
            ? "Buying..."
            : picked
              ? `Buy for ${total}c`
              : "Pick an item to buy"}
        </Button>
        <span className="font-mono text-xs text-muted">
          Stash: {stashCredits}c
        </span>
      </div>
    </form>
  );
}
