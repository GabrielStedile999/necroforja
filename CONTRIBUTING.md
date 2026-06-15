# Contribuindo / fluxo de desenvolvimento

Este projeto segue um fluxo enxuto, porém profissional — pensado para evoluir bem
e ser legível como portfólio. Vale tanto para trabalho solo quanto com um
assistente de IA implementando features.

## O ciclo de uma mudança

1. **Issue primeiro.** Todo bug/feature/melhoria começa como uma _issue_
   (templates em `.github/ISSUE_TEMPLATE`). Use labels: `bug`, `enhancement`,
   `tech-debt`, `documentation`. Agrupe por _milestone_ (ex.: "Fase 5").
2. **Branch por mudança**, a partir de `main`:
   - `feat/<slug>` — nova funcionalidade
   - `fix/<slug>` — correção de bug
   - `refactor/<slug>` — tech-debt / refactor
   - `docs/<slug>` — documentação
   - `chore/<slug>` — infra/config
3. **Implemente** seguindo as convenções de `docs/PROJECT_CONTEXT.md` (§7 e §8).
4. **Verifique localmente** antes de abrir o PR:
   ```bash
   npm run typecheck && npm run lint && npm test
   ```
5. **Pull Request** referenciando a issue (`Closes #N`), título em
   Conventional Commits. O CI roda typecheck + lint + test.
6. **Squash merge** no `main`. Mantém o histórico limpo (1 commit por feature).

## Conventional Commits

Formato: `tipo(escopo opcional): descrição`. Exemplos:

```
feat(player): equipar e desequipar fighters
fix(assistant): tratar string vazia em ASSISTANT_MODEL
refactor(rate-limit): backend Upstash com fallback em memória
docs: guia de deploy na Vercel
test(campaign-rules): cobrir tabela de cenário 2D6
chore(ci): adicionar workflow de typecheck/lint/test
```

Tipos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `build`.

## Quando rodar comandos de banco/IA

- Alterou o **schema** (`src/lib/db/schema.ts`) → `npm run db:push`.
- Alterou **chunking/ingestão** ou o conteúdo de `content/` → `npm run rules:ingest`.
- `pgvector` precisa estar habilitado no banco antes do `db:push`
  (`scripts/enable-pgvector.sql`).

## Decisões de arquitetura (ADR)

Decisões técnicas relevantes são registradas — hoje em `docs/PLANO-TECNICO.md` e
`docs/PROJECT_CONTEXT.md` (§5 e §6). Para novas decisões grandes (trocar de
provedor de IA, migrar AI SDK, mudar modelo de dados), crie um ADR curto em
`docs/adr/NNNN-titulo.md` (contexto → decisão → consequências).

## Cuidados que não podem regredir

Ver `docs/PROJECT_CONTEXT.md §8`. Os principais:

- **Não** migrar o AI SDK para v5 sem refatorar a rota e o `useChat`.
- `middleware.ts` / `auth.config.ts` são **edge-safe**: nada de DB nem argon2.
- Ler env com `||` (não `??`) para tratar `""` como ausente.
- Sempre validar com Zod + checar autorização/propriedade antes de escrever.
- **IP:** `content/books/` é gitignored; o assistente é privado (atrás de login).
