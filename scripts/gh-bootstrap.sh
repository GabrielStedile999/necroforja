#!/usr/bin/env bash
#
# Cria as labels e a primeira issue no GitHub via GitHub CLI (gh).
# Rode DENTRO da pasta do repositório (o gh detecta o remote sozinho).
#
# Pré-requisitos (uma vez):
#   brew install gh        # ou https://cli.github.com
#   gh auth login          # autentica no seu GitHub
#
# Uso:
#   bash scripts/gh-bootstrap.sh
#
set -euo pipefail

echo "→ Criando labels (ignora as que já existem)…"
gh label create bug           --color d73a4a --description "Algo está incorreto"        2>/dev/null || true
gh label create enhancement   --color a2eeef --description "Nova feature ou melhoria"   2>/dev/null || true
gh label create tech-debt     --color fbca04 --description "Refactor / dívida técnica"  2>/dev/null || true
gh label create documentation --color 0075ca --description "Documentação"               2>/dev/null || true

echo "→ Criando issue do PDF…"
gh issue create \
  --title "Ficha de gangue em PDF com elementos colados" \
  --label bug \
  --body "$(cat <<'BODY'
## Objetivo
O PDF da ficha de gangue sai correto, mas alguns elementos ficam colados uns aos
outros. Quero um template mais clean, espaçado e com a identidade NecroForja.

## Comportamento esperado
- Blocos de fighter espaçados, equipamento sem sobreposição (com quebra de linha).
- Fighters mortos destacados.
- Tema NecroForja (header escuro, acento âmbar, números em mono).

## Critérios de aceite
- [ ] Layout espaçado e legível (ver `src/lib/pdf/gangSheet.ts`).
- [ ] `npm run typecheck` e `npm test` verdes.
BODY
)"

echo "✔ Pronto. Veja em: gh issue list"
