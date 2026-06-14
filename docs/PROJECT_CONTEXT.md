# PROJECT_CONTEXT

Technical context for the project, written so that an assistant can work on it
without re-analysing everything from scratch. For the roadmap, see
`IMPLEMENTATION_PLAN.md`. For the original strategic decisions, see
`PLANO-TECNICO.md`.

## 1. What it is

A web application with two overlapping goals:

1. **Portfolio** of engineering / product design (Gabriel Stedile).
2. **Real tool** for managing the Necromunda *The Aranthian Succession: Cinderak
   Burning* campaign. The app is, in practice, the Arbitrator's digital tool:
   manages gangs, credits, Sympathisers, challenges, and the ranking.

Small audience (a few players). Priorities: rendering performance, security,
great mobile UX (used at the table via phone/tablet), and SEO on the public
section.

## 2. Stack

- **Next.js 16** (App Router, React 19, Server Components) + **TypeScript strict**
  (`noUncheckedIndexedAccess` enabled — pay attention to indexed accesses).
- **Tailwind CSS v4** (CSS-first config via `@theme` in `globals.css`) + custom
  shadcn-style components (no UI library dependency).
- **PostgreSQL** + **Drizzle ORM** (`postgres-js`). Intended hosting: Supabase
  (São Paulo region). **pgvector** for RAG.
- **Auth.js v5** (`next-auth@5 beta`) with **Credentials** provider + **Argon2id**
  (`@node-rs/argon2`). No self-signup.
- **AI / RAG:** Vercel **AI SDK v4** (`ai@4`), `@ai-sdk/anthropic` (generation,
  Claude), `@ai-sdk/openai` (embeddings), `@ai-sdk/react` (`useChat`).
- **Zod** for validation. **Vitest** for tests. Deploy target: **Vercel** (Hobby).

Versions pinned in `package.json`. AI SDK intentionally on the **v4 line** (API
`useChat` with `input/handleInputChange/handleSubmit/isLoading`, and
`result.toDataStreamResponse()` in the route). Do NOT migrate to v5 without
refactoring.

## 3. Structure (summary of what each part does)

```
src/
  middleware.ts              # protects /admin (role admin) and /player (authenticated)
  auth.config.ts             # Auth.js edge-safe config (authorized/jwt/session callbacks)
  auth.ts                    # full NextAuth (Credentials + argon2 + DB) — Node runtime
  app/
    layout.tsx, globals.css  # fonts (Oswald/Inter/JetBrains), metadata, theme tokens
    page.tsx                 # public landing (dynamic). Uses lib/repo.getPublicView()
    login/                   # page.tsx + actions.ts (authenticate via signIn)
    dashboard/page.tsx       # dispatches admin/player based on role
    admin/
      page.tsx               # accounts: lists players, creates account+gang, activates/deactivates
      actions.ts             # createPlayer, togglePlayerActive (requireAdmin)
      campaign/
        page.tsx             # campaign panel: advance cycle, create/resolve challenges
        actions.ts           # createChallenge, resolveChallenge, advanceCycle
    player/
      page.tsx               # player's gang: roster, Rating/Wealth, assistant link
      actions.ts             # addFighter, removeFighter, addEquipment (own gang)
      assistant/page.tsx     # rules assistant chat (RulesChat)
    api/
      auth/[...nextauth]/    # Auth.js handlers
      assistant/route.ts     # POST RAG: auth + rate limit + retrieval + streamText (Claude)
  components/
    SiteHeader.tsx           # server header, session-aware (login/logout/links by role)
    CampaignStatus / GangRankingTable / SympathiserMap / ChallengeLog  # landing (presentational, receive props)
    SignOutButton.tsx
    ui/                      # button, card, badge, input(+Label,Select)
    admin/                   # CreatePlayerForm, CreateChallengeForm, ResolveChallengeForm (client, useActionState)
    player/AddFighterForm.tsx
    auth/LoginForm.tsx
    assistant/RulesChat.tsx  # client, useChat -> /api/assistant
  lib/
    scoring.ts               # official formulas: fighterTotalCost, gangRating, gangWealth, creditsRemaining
    campaign-rules.ts        # phaseForCycle, nextCycleState, challengeOrder, rollScenario, controlWinner
    repo.ts                  # getPublicView(): DB if DATABASE_URL, otherwise seed data (fallback)
    validation.ts            # Zod schemas (login, createPlayer, fighter, equipment, challenge…)
    utils.ts                 # cn() (clsx + tailwind-merge)
    auth/                    # password (argon2), guards (requireUser/requireAdmin), session-actions (signOut)
    data/                    # sympathisers.ts (26-entry catalogue), campaign.ts (seed: 4 gangs + control)
    db/                      # schema.ts, index.ts (client), queries.ts, mutations.ts, seed.ts
    ai/                      # chunk.ts, embeddings.ts, retrieval.ts, ingest.ts, rate-limit.ts
  types/
    index.ts                 # domain types + public view (PublicView, GangRankRow, etc.)
    next-auth.d.ts           # augments Session/JWT with id + role
content/
  books/*.jsonl              # book text page by page (GITIGNORED — IP). RAG source
  rules/*.md                 # optional personal rule notes (README explains)
scripts/enable-pgvector.sql  # CREATE EXTENSION vector (run once on the database)
tests/                       # scoring, campaign-rules, chunk, fase1 (validation + password)
```

## 4. How the main parts work

### Authentication and authorisation
- `middleware.ts` uses `auth.config.ts` (edge-safe, WITHOUT DB/argon2). The
  `authorized` callback decides access by route: `/admin` requires
  `role === "admin"`, `/player` requires a session.
- `auth.ts` (Node runtime) has the Credentials provider: validates with
  `loginSchema`, looks up the user (`getUserByEmail`), checks the password with
  `verifyPassword` (argon2).
- Session is **JWT**; `id` and `role` are propagated in `jwt`/`session` callbacks.
  Types augmented in `types/next-auth.d.ts`.
- In Server Actions/Components, use `requireUser()` / `requireAdmin()` from
  `lib/auth/guards.ts`.

### Campaign data (DB)
- Schema in `lib/db/schema.ts`. Tables: `campaign`, `app_user`, `gang`, `fighter`,
  `equipment`, `fighter_equipment`, `stash_item`, `sympathiser`,
  `sympathiser_control`, `challenge`, `triumph`, `rule_chunk` (pgvector).
- Reads in `queries.ts` (map rows → domain types via `toDomainGang`). Writes /
  derived values in `mutations.ts` (`recalcGangScores`, `setSympathiserController`,
  `advanceCampaignCycle`).
- **Rating/Wealth are cached** in `gang.rating_cached`/`wealth_cached`,
  recalculated on every mutation via `recalcGangScores`. The source calculation
  lives in `lib/scoring.ts` (pure functions).

### Public landing (resilient)
- `lib/repo.ts > getPublicView()`: if `DATABASE_URL` exists, reads from DB;
  if not (or if tables don't exist / error), falls back to the **static seed
  data** (`lib/data/*`). The landing therefore never breaks without a database.
- Landing components are **presentational** (receive `view`/props); they don't
  fetch data themselves. The page (`app/page.tsx`) is `dynamic`.

### Campaign mechanics (Cinderak Burning)
- 7 cycles: Great Darkness (1-3) → Downtime (4) → Spark of Rebellion (5-7).
  `phaseForCycle`/`nextCycleState` in `campaign-rules.ts`.
- **Sympathisers** = campaign currency (26, catalogue in
  `lib/data/sympathisers.ts`, `id`+`name` only). The Arbitrator enables/disables
  each one via `sympathiser.enabled` (action `toggleSympathiser` in
  `/admin/campaign`); only **enabled** ones appear on the public map and can be
  contested. There is NO longer any deck/suit logic — it was removed as it made
  no sense in the app.
  Public ranking sorted by number of controlled Sympathisers, tie-broken by
  Rating.
- **Challenges:** admin creates (`createChallenge`) and resolves
  (`resolveChallenge`). On resolution, `controlWinner` decides who gets the
  Sympathiser and `setSympathiserController` transfers control (history via
  `is_current`). Scenario can be rolled with `rollScenario` (2D6 table by
  phase).

### Rules Assistant (RAG)
- Route `POST /api/assistant` (`app/api/assistant/route.ts`): authenticated
  (`auth()` → 401), with **rate limit** per user (`lib/ai/rate-limit.ts`,
  in-memory), retrieves chunks (`searchRules`), and generates a response with
  Claude (`streamText` → `toDataStreamResponse`).
- **Ingestion pipeline** (`npm run rules:ingest` → `lib/ai/ingest.ts`): reads
  `content/books/*.jsonl` (book+page) and `content/rules/*.md`; **skips index
  pages**; breaks into chunks (`chunk.ts`, `chunkPlain` breaks by UPPERCASE
  keyword to isolate each trait/rule); embeddings via OpenAI
  (`text-embedding-3-small`, 1536 dims); writes to `rule_chunk`.
- **Retrieval** (`retrieval.ts`): embeds the question, searches by cosine
  distance (pgvector), `k=8`, `minSimilarity=0.1` (low because of cross-lingual
  EN→EN). `citationLabel()` formats "Book, p. X".
- The prompt instructs the model to answer only from the context and close with a
  **"Sources:"** section with book + page, **without inventing page numbers**.

## 5. Technical decisions already made (and why)

- **Next.js App Router + Server Components**: SEO (SSR/SSG on the public side),
  performance, server-side secrets. (See PLANO-TECNICO section 2.)
- **Postgres + Drizzle** (not NoSQL): relational data and integrity; pgvector in
  the same database serves the RAG. Drizzle for its lightness in serverless.
- **Auth.js Credentials + Argon2id**, no self-signup: admin creates accounts;
  smaller attack surface; showcases auth engineering in the portfolio.
- **AI SDK v4** (not v5): stable and known API (`useChat` classic,
  `toDataStreamResponse`). Migrating to v5 would require refactoring the route +
  chat.
- **OpenAI embeddings + Anthropic generation**: multi-provider via AI SDK (good
  portfolio signal). Models configurable via env.
- **Books indexed page-by-page** (not paraphrase notes): allows citing the
  **official book + page**, which is verifiable. Book text is **gitignored**
  (`/content/books`) — IP.
- **Rating/Wealth cached** in the database for fast ranking reads.
- **Repo with static fallback**: landing works without a connected database.

## 6. Problems already solved (do not repeat)

- **Discontinued AI model**: `claude-3-5-haiku-latest` (from the 2025 base) was
  retired → silent failure. Current default: **`claude-haiku-4-5`**. Also, use
  `||` (not `??`) when reading `ASSISTANT_MODEL` to treat an empty string in
  `.env` as "not defined".
- **Invisible stream errors**: the AI SDK masks errors by default. The route uses
  `streamText({ onError })` + `toDataStreamResponse({ getErrorMessage })`, and
  the UI (`RulesChat`) renders `error` with a "Try again" button. Keep this.
- **RAG was returning the index instead of the definition**: caused by (a) large
  multi-topic chunks, (b) index/summary pages, (c) narrow cross-lingual search.
  Fixed with UPPERCASE keyword chunking, `isIndexLike` filter on ingestion, and
  `k=8`/`minSimilarity=0.1`.
- **Citation `[1]` without a reference**: the context now carries
  `SOURCE: Book, p. X` and the model lists "Sources:" at the end.
- **Page numbering**: calibrated — printed page = PDF index − 1 (in both books).
  Confirmed (Gang Rating p.92, founding p.81).
- **JWT augmentation not applied in `auth.config`**: in the `session` callback,
  cast (`token.id as string`, `token.role as "admin" | "player"`).
- **Tables overflowing the grid on the landing**: grid items need `min-w-0`
  (otherwise the table forces the column to grow and overlaps the map). Wide
  tables go inside an `overflow-x-auto` wrapper. See `app/page.tsx` and
  `GangRankingTable`.
- **Deck logic removed**: `card`/`suit`/`CardSuit`/pgEnum `card_suit` were
  removed from schema, types, data, seed, repo, and UI. Sympathisers now only
  have `id`, `name`, and `enabled`. If a "card/suit" reference reappears, it is
  a residue.
- **`StashItem.id` missing from the domain type**: the `stash_item.id` column
  was not exposed in `types/index.ts` nor in `toDomainGang`. Fixed: `StashItem`
  now includes `id: string`, and `toDomainGang` maps `s.id`. Scoring test
  fixtures were updated to include `id` in the stash.

## 7. Code conventions

- TypeScript **strict**; with `noUncheckedIndexedAccess`, accesses like `arr[0]`
  are `T | undefined` → use `!` when guaranteed, or add a check.
- Import alias **`@/*` → `src/*`**.
- **Server Actions**: file with `"use server"`; return state
  `{ error?, success? }` for `useActionState`. Always validate with Zod and check
  authorisation (`requireUser`/`requireAdmin`) and ownership (e.g. fighter
  belongs to the user's gang) BEFORE writing. Call `revalidatePath` after
  mutation.
- **Components**: presentational ones receive data via props; only those that
  need state/effects have `"use client"`. Client forms use `useActionState`.
- **Necromunda style**: use theme tokens (`bg-void`, `text-hazard`, `text-ink`,
  `text-muted`, `border-rivet`, `bg-panel`, `text-toxic`, `text-blood`,
  `text-cyan`), `stencil` class for headings. Do not introduce UI libraries.
- **DB**: reads in `queries.ts`, writes/derived values in `mutations.ts`. After
  changing a gang, call `recalcGangScores(gangId)`.
- Authenticated/admin pages: `export const dynamic = "force-dynamic"`.
- UI language and messages: **English**.

## 8. Important cautions for future changes

- **IP / Games Workshop**: the assistant is **private** (behind login). Never
  expose rule text/art in the public area. `content/books/` is gitignored and
  must not be committed. Citing book+page is fine; reproducing content publicly
  is not.
- **Edge vs Node**: `middleware.ts`/`auth.config.ts` CANNOT import DB or argon2
  (they run on the edge). Logic that touches the database/crypto stays in
  `auth.ts`/actions (Node runtime).
- **Changed the schema?** Run `npm run db:push`. **Changed chunking/ingestion or
  book content?** Run `npm run rules:ingest` (recreates `rule_chunk`).
- **pgvector** must be enabled on the database (`scripts/enable-pgvector.sql`)
  before `db:push`.
- **Embedding dimension** (1536) is coupled to the `text-embedding-3-small`
  model (`EMBEDDING_DIMENSIONS` in the schema). Changing the embedding model
  requires a migration of the `vector` column and re-ingestion.
- **Do not migrate the AI SDK to v5** without refactoring `route.ts` (stream
  response) and `RulesChat.tsx` (`useChat`).
- **Sandbox verification**: the npm registry is blocked and `node_modules` is
  from macOS (native binary incompatible with the sandbox Linux), so `vitest`
  does not run there. Pattern used: `tsc --noEmit` (with an env stub for
  `@node-rs/argon2` in a temporary `.d.ts` at the root, removed afterwards) +
  standalone runners via `node --experimental-strip-types` for pure functions.
  `vitest` tests run on the user's machine with `npm test`.

## 9. Scripts and variables

- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `db:push`,
  `db:seed`, `db:studio`, `rules:ingest`.
- `.env` (see `.env.example`): `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`,
  `ANTHROPIC_API_KEY`, `ASSISTANT_MODEL` (= `claude-haiku-4-5`),
  `OPENAI_API_KEY`, `EMBEDDING_MODEL` (= `text-embedding-3-small`), and the
  seed credentials `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `PLAYER_PASSWORD`.
- Seed credentials: defined in `.env` (with generic fallbacks in `seed.ts`);
  players are `<name>@campaign.local`. Change after the first login.

## 10. Current state

Phases 1–3 of `PLANO-TECNICO.md` delivered (auth+accounts, gang management,
challenges+live ranking, RAG assistant). Features 1, 2, 3, and 4 of
`IMPLEMENTATION_PLAN.md` delivered (equip/unequip fighters, Stash management,
fighter lifecycle + Downtime, initial Sympathiser assignment). Pending items and
next steps detailed in `IMPLEMENTATION_PLAN.md`.

### Feature 4 — Initial Sympathiser Assignment (technical summary)
- New action `assignSympathiser` in `app/admin/campaign/actions.ts`:
  `requireAdmin`, validates `sympathiserId ∈ SYMPATHISERS` and
  `gangId ∈ campaign`; calls `setSympathiserController` (with a gang) or
  `clearSympathiserController` (to release).
- New function `clearSympathiserController(sympathiserId)` in
  `lib/db/mutations.ts`: ends `isCurrent = true` without inserting a new record.
- New schema `assignSympathiserSchema` in `lib/validation.ts`.
- New component `SympathiserAssignForm.tsx` in `src/components/admin/`: client,
  `useActionState`, inline select per Sympathiser.
- "Sympathiser Assignment" section in `app/admin/campaign/page.tsx`: lists all
  26 Sympathisers with the current controller and an inline form per row. Does
  not change the database schema (uses the existing `sympathiser_control`
  structure with `is_current`).
