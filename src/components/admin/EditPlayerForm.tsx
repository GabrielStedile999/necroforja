"use client";

import { useActionState } from "react";
import { updatePlayer, type AdminState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

/**
 * Edição de conta de player no painel admin (issue #57): nome, e-mail de
 * login e senha nova opcional. O campo de senha é `type="text"` de
 * propósito — é o admin definindo senha de terceiro, mesmo design do
 * CreatePlayerForm (decisão registrada na issue #54). IDs sufixados com o
 * id do player porque há um form por linha na lista.
 */
export function EditPlayerForm({
  player,
}: {
  player: { id: string; displayName: string; email: string };
}) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    updatePlayer,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="userId" value={player.id} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor={`edit-name-${player.id}`}>Player</Label>
          <Input
            id={`edit-name-${player.id}`}
            name="displayName"
            defaultValue={player.displayName}
            required
          />
        </div>
        <div>
          <Label htmlFor={`edit-email-${player.id}`}>Login e-mail</Label>
          <Input
            id={`edit-email-${player.id}`}
            name="email"
            type="email"
            defaultValue={player.email}
            required
          />
        </div>
        <div>
          <Label htmlFor={`edit-password-${player.id}`}>New password</Label>
          <Input
            id={`edit-password-${player.id}`}
            name="password"
            type="text"
            minLength={8}
            placeholder="leave blank to keep"
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
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
