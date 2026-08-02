"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createGangForUser,
  type GangAdminState,
} from "@/app/admin/gangs/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

/**
 * Creates a gang for an existing account that has none (issue #64).
 * Rendered inside the player's row in the admin dashboard.
 */
export function CreateGangForm({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [state, formAction, pending] = useActionState<GangAdminState, FormData>(
    createGangForUser,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="userId" value={userId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`new-gang-name-${userId}`}>
            Gang name for {userName}
          </Label>
          <Input id={`new-gang-name-${userId}`} name="name" required />
        </div>
        <div>
          <Label htmlFor={`new-gang-house-${userId}`}>House</Label>
          <Input
            id={`new-gang-house-${userId}`}
            name="house"
            placeholder="e.g.: House Goliath"
            required
          />
        </div>
      </div>

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
        <Button variant="outline" type="submit" pending={pending}>
          {pending ? "Creating..." : "Create gang"}
        </Button>
      </div>
    </form>
  );
}
