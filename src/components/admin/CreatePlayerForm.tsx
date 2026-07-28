"use client";

import { useActionState, useRef, useEffect } from "react";
import { createPlayer, type AdminState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function CreatePlayerForm() {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    createPlayer,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="displayName">Player</Label>
          <Input id="displayName" name="displayName" required />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Initial password</Label>
          <Input
            id="password"
            name="password"
            type="text"
            minLength={8}
            placeholder="min. 8 characters"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="gangName">Gang</Label>
            <Input id="gangName" name="gangName" required />
          </div>
          <div>
            <Label htmlFor="house">House</Label>
            <Input id="house" name="house" required />
          </div>
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
        <Button type="submit" pending={pending}>
          {pending ? "Creating..." : "Create account + gang"}
        </Button>
      </div>
    </form>
  );
}
