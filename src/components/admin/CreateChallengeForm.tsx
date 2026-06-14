"use client";

import { useActionState } from "react";
import {
  createChallenge,
  type CampaignState,
} from "@/app/admin/campaign/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

type GangOption = { id: string; name: string };
type SympOption = { id: string; name: string; controllerName: string | null };

export function CreateChallengeForm({
  gangs,
  sympathisers,
}: {
  gangs: GangOption[];
  sympathisers: SympOption[];
}) {
  const [state, formAction, pending] = useActionState<CampaignState, FormData>(
    createChallenge,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="challengerGangId">Desafiante</Label>
          <Select id="challengerGangId" name="challengerGangId" required>
            {gangs.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="challengedGangId">Defensor (opcional)</Label>
          <Select id="challengedGangId" name="challengedGangId">
            <option value="">— Sympathiser livre —</option>
            {gangs.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="sympathiserId">Sympathiser em disputa</Label>
          <Select id="sympathiserId" name="sympathiserId" required>
            {sympathisers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name.replace(" Sympathisers", "")}
                {s.controllerName ? ` — ${s.controllerName}` : " — livre"}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="scenario">Cenário (vazio = rolar 2D6)</Label>
          <Input
            id="scenario"
            name="scenario"
            placeholder="ex.: Gunk War"
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
        <Button type="submit" disabled={pending}>
          {pending ? "Registrando..." : "Registrar desafio"}
        </Button>
      </div>
    </form>
  );
}
