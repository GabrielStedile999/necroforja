# NecroForja — Gestor de Campanhas de Necromunda

**NecroForja** é uma aplicação web com dois objetivos: servir de **portfólio** de engenharia/product design e ser uma **ferramenta real** para arbitrar campanhas de Necromunda. A campanha atualmente gerida é *The Aranthian Succession: Cinderak Burning*.

> Documentação de planejamento em [`docs/`](./docs): arquitetura e decisões
> ([`PLANO-TECNICO.md`](./docs/PLANO-TECNICO.md)), contexto técnico
> ([`PROJECT_CONTEXT.md`](./docs/PROJECT_CONTEXT.md)) e roadmap
> ([`IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md)).

## Stack

- **Next.js 16** (App Router, React 19, Server Components) + **TypeScript** (strict)
- **Tailwind CSS v4** + componentes próprios (tema "tom Necromunda")
- **PostgreSQL** + **Drizzle ORM** (hospedagem: Supabase, região São Paulo)
- **Auth.js v5** (contas criadas pelo admin — sem self-signup) — *Fase 1*
- **Vitest** para testes
- Deploy: **Vercel** (Hobby) — custo inicial US$ 0/mês

## Rodando localmente

```bash
npm install
cp .env.example .env      # preencha DATABASE_URL e AUTH_SECRET
npx auth secret           # gera AUTH_SECRET no .env automaticamente
npm run dev               # http://localhost:3000
```

A landing pública (`/`) já renderiza com dados-semente em `src/lib/data/`, **sem
precisar de banco**. As áreas autenticadas (`/admin`, `/player`) exigem o banco
conectado e o seed rodado:

```bash
# 1x: habilite o pgvector no banco (Supabase > SQL Editor)
#     scripts/enable-pgvector.sql  →  CREATE EXTENSION IF NOT EXISTS vector;
npm run db:push           # cria as tabelas no Postgres
npm run db:seed           # popula campanha + 26 Sympathisers + 4 gangues + senhas
```

### Assistente de Regras (IA / RAG — Fase 3)

Atrás do login, em `/player/assistant`. Os livros são indexados **página a
página** (`content/books/*.jsonl`, com livro + página) e, opcionalmente, notas
próprias (`content/rules/*.md`). O texto é dividido em chunks, embutido (OpenAI
`text-embedding-3-small`) e gravado em `rule_chunk` (pgvector). Na pergunta,
recuperamos os trechos mais próximos por distância de cosseno e o Claude responde
**apenas com base no contexto**, terminando com uma seção **"Fontes:"** que cita
a **referência oficial (livro e página)** — fácil de conferir no livro. Rota
autenticada e com rate limiting por usuário.

```bash
# requer OPENAI_API_KEY e ANTHROPIC_API_KEY no .env
npm run rules:ingest      # indexa content/books + content/rules (idempotente)
```

> IP: `content/books/` contém o texto integral dos livros (© Games Workshop) e
> está no `.gitignore` — uso **local/privado** dos jogadores que possuem os
> livros; nunca exposto na área pública. Ver `content/rules/README.md`.

### Autenticação (Fase 1)

Auth.js v5 com credenciais. **Sem self-signup**: o admin (Arbitrator) cria as
contas. O middleware protege `/admin` (apenas admin) e `/player` (autenticado).

As credenciais iniciais vêm do `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`,
`PLAYER_PASSWORD`) — veja `.env.example`. Ao rodar `npm run db:seed`, as contas
são criadas com esses valores e impressas no terminal.

> Troque as senhas após o primeiro acesso. As senhas são guardadas com hash
> **Argon2id** (`@node-rs/argon2`), nunca em texto puro.

## Scripts

| Script | O quê |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` / `start` | build e produção |
| `npm run typecheck` | checagem de tipos |
| `npm run lint` | ESLint |
| `npm run test` | testes (Vitest) |
| `npm run db:push` | aplica o schema no banco |
| `npm run db:seed` | popula dados iniciais |
| `npm run db:studio` | Drizzle Studio (inspeção do banco) |

## Estrutura

```
src/
  app/
    page.tsx              # landing pública: estado, ranking, mapa, log de desafios
    login/                # autenticação (Auth.js v5)
    dashboard/            # despacha admin/player conforme o papel
    admin/                # contas (page) + painel da campanha (campaign/)
    player/               # dashboard do jogador / gestão da gangue
    api/auth/             # handlers do Auth.js
    layout.tsx · globals.css
  components/             # UI + features (landing, admin, player, auth)
  lib/
    scoring.ts            # cálculos oficiais: Gang Rating, Wealth, créditos
    campaign-rules.ts     # fases, ordem de desafio, cenário 2D6, vencedor
    repo.ts               # PublicView (banco com fallback aos dados-semente)
    validation.ts         # schemas Zod
    auth/                 # config, senha (Argon2id), guards de papel
    data/                 # dados-semente (sympathisers + campanha atual)
    db/                   # schema Drizzle, queries, mutations, cliente, seed
  types/                  # tipos de domínio + view pública
tests/
  scoring.test.ts       # testes das fórmulas e integridade do seed
```

## A campanha (Cinderak Burning)

Succession Campaign de **7 ciclos**: Great Darkness (3) → Downtime (1) →
Spark of Rebellion (3). O placar gira em torno do controle dos **26
Sympathisers**. Fórmulas implementadas em `lib/scoring.ts`:

- **Gang Rating** = custo de todos os fighters/veículos + equipamento/upgrades.
- **Wealth** = Rating + créditos e equipamento no Stash.
- Fundação: **2.000 créditos**.

### Jogadores semeados

| Jogador | Gangue | Casa | Sympathiser inicial |
|---|---|---|---|
| Davi | Red Harvest | Corpse Grinder Cult | Fallen House |
| Gabriel | Shadow Syndicate | Delaque | House Ko'iron |
| Jeferson | Thick Boys | Squat Prospectors | House Greim |
| Heitor | Cult of the Wyrm | Corrupted Outcast | Narco Lord |

## Roadmap

- **Fase 1 (MVP):** ✅ Auth do admin (Auth.js v5 + Argon2id), CRUD de contas de jogador, edição de gangue (recrutar/remover fighters) com recálculo automático de Rating/Wealth, rotas protegidas por papel.
- **Fase 2:** ✅ desafios por Sympathiser (registro + resolução com transferência de controle e histórico), avanço de ciclo/fase automático, painel da campanha do Arbitrator (`/admin/campaign`), ranking vivo na landing já lendo do banco (com fallback aos dados-semente) e log de desafios.
- **Fase 3:** ✅ assistente de regras com IA (RAG) atrás do login — pgvector + embeddings (OpenAI) + Claude (AI SDK), com streaming, citações, rate limiting e ingestão de `content/rules/`.
- **Fase 4:** PWA, exportar ficha em PDF, polimento.

## Nota de IP

Conteúdo, regras, arte e marcas de Necromunda são © Games Workshop. Este
projeto usa termos funcionais e **arte/identidade próprias**; qualquer texto de
regra derivado dos livros fica **restrito aos jogadores autenticados** que
possuem o material. Nada de oficial é reproduzido na área pública.
