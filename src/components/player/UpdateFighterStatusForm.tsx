"use client";

import { useActionState, useState, useEffect } from "react";
import { updateFighterStatus, type PlayerState } from "@/app/player/actions";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import type { FighterStatus } from "@/types";

const STATUS_OPTIONS: { value: FighterStatus; label: string }[] = [
  { value: "active", label: "Ativo" },
  { value: "in_recovery", label: "Em recuperação" },
  { value: "injured", label: "Ferido" },
  { value: "captured", label: "Capturado" },
  { value: "dead", label: "Morto" },
];

interface GangOption {
  id: string;
  name: string;
}

export function UpdateFighterStatusForm({
  fighterId,
  currentStatus,
  otherGangs,
}: {
  fighterId: string;
  currentStatus: FighterStatus;
  otherGangs: GangOption[];
}) {
  const [state, formAction, pending] = useActionState<PlayerState, FormData>(
    updateFighterStatus,
    {},
  );

  // Controla exibição do seletor de gangue captora
  const [showCapture, setShowCapture] = useState(
    currentStatus === "captured",
  );

  // Sincroniza com o status vindo do servidor após re-render
  useEffect(() => {
    setShowCapture(currentStatus === "captured");
  }, [currentStatus]);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="fighterId" value={fighterId} />

      <div className="flex flex-wrap items-end gap-2">
        <div>
          <Label htmlFor={`status-${fighterId}`}>Status</Label>
          <Select
            id={`status-${fighterId}`}
            name="status"
            defaultValue={currentStatus}
            onChange={(e) =>
              setShowCapture(e.target.value === "captured")
            }
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        {showCapture && otherGangs.length > 0 && (
          <div>
            <Label htmlFor={`captor-${fighterId}`}>Capturado por</Label>
            <Select id={`captor-${fighterId}`} name="capturedByGangId">
              <option value="">— sem gangue —</option>
              {otherGangs.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <Button type="submit" disabled={pending} variant="outline">
          {pending ? "Salvando..." : "Atualizar"}
        </Button>
      </div>

      {state.error && (
        <p className="text-xs text-blood">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-toxic">{state.success}</p>
      )}
    </form>
  );
}
