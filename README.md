# NecroForja — Necromunda Campaign Manager

**NecroForja** is a web application with two overlapping goals: serving as an **engineering/product design portfolio** and being a **real tool** for arbitrating Necromunda campaigns. The campaign currently managed is *The Aranthian Succession: Cinderak Burning*.

> Planning documentation in [`docs/`](./docs): architecture and decisions
> ([`TECHNICAL_PLAN.md`](./docs/TECHNICAL_PLAN.md)), technical context
> ([`PROJECT_CONTEXT.md`](./docs/PROJECT_CONTEXT.md)) and roadmap
> ([`IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md)).

## Stack

- **Next.js 16** (App Router, React 19, Server Components) + **TypeScript** (strict)
- **Tailwind CSS v4** + custom components (Necromunda theme tokens)
- **PostgreSQL** + **Drizzle ORM** (hosted on Supabase, São Paulo region)
- **Auth.js v5** (accounts created by admin — no self-signup)
- **Vitest** for testing
- Deploy: **Vercel** (Hobby) — initial cost US$ 0/month

## Running locally

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL and AUTH_SECRET
npx auth secret           # generates AUTH_SECRET in .env automatically
npm run dev               # http://localhost:3000
```

The public landing (`/`) renders with seed data from `src/lib/data/`, **no database required**. Authenticated areas (`/admin`, `/player`) require a connected database and a seeded dataset:

```bash
# once: enable pgvector on the database (Supabase > SQL Editor)
#       scripts/enable-pgvector.sql  →  CREATE EXTENSION IF NOT EXISTS vector;
npm run db:push           # creates tables in Postgres
npm run db:seed           # populates campaign + 26 Sympathisers + 4 gangs + passwords
```

### Rules Assistant (AI / RAG)

Behind the login, at `/player/assistant`. Books are indexed **page by page** (`content/books/*.jsonl`, with book + page) and, optionally, custom notes (`content/rules/*.md`). Text is split into chunks, embedded (OpenAI `text-embedding-3-small`) and stored in `rule_chunk` (pgvector). On a question, the closest chunks are retrieved by cosine distance and Claude answers **only from the context**, finishing with a **"Sources:"** section citing the **official reference (book and page)** — easy to verify in the book. Authenticated route with per-user rate limiting.

```bash
# requires OPENAI_API_KEY and ANTHROPIC_API_KEY in .env
npm run rules:ingest      # indexes content/books + content/rules (idempotent)
```

> IP: `content/books/` contains the full text of the books (© Games Workshop) and
> is in `.gitignore` — **local/private** use by players who own the books; never
> exposed in the public area. See `content/rules/README.md`.

### Authentication

Auth.js v5 with credentials. **No self-signup**: the admin (Arbitrator) creates accounts. The proxy protects `/admin` (admin only) and `/player` (authenticated).

Initial credentials come from `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PLAYER_PASSWORD`) — see `.env.example`. When running `npm run db:seed`, accounts are created with these values and printed to the terminal.

> Change passwords after the first login. Passwords are stored with **Argon2id** hashing (`@node-rs/argon2`), never in plain text.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | development server |
| `npm run build` / `start` | build and production |
| `npm run typecheck` | type checking |
| `npm run lint` | ESLint |
| `npm run test` | tests (Vitest) |
| `npm run db:push` | applies schema to the database |
| `npm run db:seed` | populates initial data |
| `npm run db:studio` | Drizzle Studio (database inspection) |

## Structure

```
src/
  app/
    page.tsx              # public landing: status, ranking, map, challenge log
    login/                # authentication (Auth.js v5)
    dashboard/            # dispatches admin/player based on role
    admin/                # accounts (page) + campaign panel (campaign/)
    player/               # player dashboard / gang management
    api/auth/             # Auth.js handlers
    layout.tsx · globals.css
  components/             # UI + features (landing, admin, player, auth)
  lib/
    scoring.ts            # official calculations: Gang Rating, Wealth, credits
    campaign-rules.ts     # phases, challenge order, 2D6 scenario, winner
    repo.ts               # PublicView (DB with fallback to seed data)
    validation.ts         # Zod schemas
    auth/                 # config, password (Argon2id), role guards
    data/                 # seed data (sympathisers + current campaign)
    db/                   # Drizzle schema, queries, mutations, client, seed
  types/                  # domain types + public view
tests/
  scoring.test.ts       # formula and seed integrity tests
```

## The Campaign (Cinderak Burning)

A **7-cycle** Succession Campaign: Great Darkness (3) → Downtime (1) →
Spark of Rebellion (3). The scoreboard revolves around control of the **26
Sympathisers**. Formulas implemented in `lib/scoring.ts`:

- **Gang Rating** = cost of all fighters/vehicles + equipment/upgrades.
- **Wealth** = Rating + credits and equipment in the Stash.
- Foundation: **2,000 credits**.

### Seeded Players

| Player | Gang | House | Initial Sympathiser |
|---|---|---|---|
| Davi | Red Harvest | Corpse Grinder Cult | Fallen House |
| Gabriel | Shadow Syndicate | Delaque | House Ko'iron |
| Jeferson | Thick Boys | Squat Prospectors | House Greim |
| Heitor | Cult of the Wyrm | Corrupted Outcast | Narco Lord |

## Roadmap

- **Phase 1 (MVP):** ✅ Admin auth (Auth.js v5 + Argon2id), player account CRUD, gang editing (recruit/remove fighters) with automatic Rating/Wealth recalculation, role-protected routes.
- **Phase 2:** ✅ Sympathiser challenges (registration + resolution with control transfer and history), automatic cycle/phase advancement, Arbitrator campaign panel (`/admin/campaign`), live ranking on the landing reading from DB (with seed fallback) and challenge log.
- **Phase 3:** ✅ AI rules assistant (RAG) behind login — pgvector + embeddings (OpenAI) + Claude (AI SDK), with streaming, citations, rate limiting and `content/rules/` ingestion.
- **Phase 4:** PWA, PDF gang sheet export, polish.

## IP Notice

Necromunda content, rules, art, and trademarks are © Games Workshop. This
project uses functional terms and **original identity/art**; any rule text derived
from the books is **restricted to authenticated players** who own the material.
Nothing official is reproduced in the public area.
