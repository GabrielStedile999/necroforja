"use client";

import { useActionState, useRef, useEffect } from "react";
import { addFighter, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { FighterFields } from "./FighterFields";

export function AddFighterForm({ gangId }: { gangId: string }) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    addFighter,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="gangId" value={gangId} />
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
          {pending ? "Recruiting..." : "Recruit fighter"}
        </Button>
      </div>
    </form>
  );
}
