import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ChallengeView } from "@/types";

const OUTCOME_LABEL: Record<string, { text: string; variant: "toxic" | "blood" | "muted" }> = {
  challenger_win: { text: "Desafiante venceu", variant: "toxic" },
  challenged_win: { text: "Defensor venceu", variant: "toxic" },
  declined: { text: "Recusado", variant: "muted" },
  draw: { text: "Empate", variant: "muted" },
};

export function ChallengeLog({
  challenges,
}: {
  challenges: ChallengeView[];
}) {
  if (challenges.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desafios recentes</CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <ul className="divide-y divide-rivet/50">
          {challenges.map((c) => {
            const outcome = c.outcome ? OUTCOME_LABEL[c.outcome] : null;
            return (
              <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                <span className="font-mono text-xs text-muted">C{c.cycle}</span>
                <div className="flex-1 text-sm">
                  <span className="text-ink">{c.challengerName}</span>
                  <span className="text-muted"> desafiou </span>
                  <span className="text-ink">{c.challengedName ?? "—"}</span>
                  {c.sympathiserName && (
                    <span className="text-muted">
                      {" "}
                      por {c.sympathiserName.replace(" Sympathisers", "")}
                    </span>
                  )}
                  {c.scenario && (
                    <div className="text-xs text-muted">{c.scenario}</div>
                  )}
                </div>
                {outcome ? (
                  <Badge variant={outcome.variant}>{outcome.text}</Badge>
                ) : (
                  <Badge variant="hazard">Pendente</Badge>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
