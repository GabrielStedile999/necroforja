# PROJECT_CONTEXT

Technical context for the project, written so that an assistant can work on it
without re-analysing everything from scratch. For the roadmap, see
`IMPLEMENTATION_PLAN.md`. For the original strategic decisions, see
`TECHNICAL_PLAN.md`.

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
  proxy.ts                   # protects /admin (role admin) and /player (authenticated) — Next.js 16 uses "proxy" convention (replaces deprecated middleware.ts)
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
- `proxy.ts` uses `auth.config.ts` (edge-safe, WITHOUT DB/argon2). The
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
  in-memory), retrieves chunks (`searchRulesWithExpansion`), generates a response
  with Claude (`streamText` → `toDataStreamResponse`), and sends the source list
  as a **message annotation** via `StreamData`.
- **Ingestion pipeline** (`npm run rules:ingest` → `lib/ai/ingest.ts`): reads
  `content/books/*.jsonl` (book+page) and `content/rules/*.md`; **skips index
  pages**; breaks into chunks (`chunk.ts`, `chunkPlain` breaks by UPPERCASE
  keyword to isolate each trait/rule); embeddings via OpenAI
  (`text-embedding-3-small`, 1536 dims); writes to `rule_chunk`.
- **Retrieval** (`retrieval.ts`): three exported entry points:
  - `searchRules(query, k, minSimilarity)` — single pgvector search (basic).
  - `expandQuery(query)` — cheap Claude Haiku call that rewrites the query using
    official Necromunda terminology; returns original string on any error.
  - `searchRulesWithExpansion(query, k, minSimilarity)` — runs the original and
    expanded searches in parallel, then calls `mergeChunks` to deduplicate and
    re-rank. **This is the function used by the route.**
  - `mergeChunks(a, b, k)` — pure function: deduplicates by first 120 chars of
    content, re-sorts by similarity, caps at k. Tested in `tests/retrieval.test.ts`.
  - `citationLabel()` formats "Book, p. X".
- **StreamData annotation**: the route creates a `StreamData` instance, appends
  `{ sources: [{ label, book, page, similarity }] }` as a message annotation in
  `onFinish`, and passes `data` to `toDataStreamResponse`. The client
  (`RulesChat.tsx`) reads `message.annotations` and renders a collapsible
  "Sources consulted" panel below each assistant response.
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
- **Language:** English is the **only** language for all project artifacts — code
  comments, commit messages, PR titles, GitHub issue titles/bodies, documentation,
  and in-app text. This rule applies regardless of the language used in conversation;
  all output that enters the repository must be in English.
- UI language and messages: **English**.

## 8. Important cautions for future changes

- **IP / Games Workshop**: the assistant is **private** (behind login). Never
  expose rule text/art in the public area. `content/books/` is gitignored and
  must not be committed. Citing book+page is fine; reproducing content publicly
  is not.
- **Edge vs Node**: `proxy.ts`/`auth.config.ts` CANNOT import DB or argon2
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
challenges+live ranking, RAG assistant). All 10 features of
`IMPLEMENTATION_PLAN.md` delivered (equip/unequip fighters, Stash management,
fighter lifecycle + Downtime, initial Sympathiser assignment, Triumphs &
campaign closure, AI assistant improvements, PDF gang sheet export, PWA,
SEO & Lighthouse, hardening). All tests passing (158/158).

### Feature 5 — Triumphs & Campaign Closure (technical summary)
- `Campaign` domain type now includes `status: string` (`"active" | "finished"`).
- New `Triumph` interface in `types/index.ts`; `PublicView` gains `triumphs: Triumph[]`.
- `awardTriumphSchema` added to `lib/validation.ts` (title required, gangId optional UUID).
- `listTriumphs(campaignId)` + `getLatestCampaign()` added to `lib/db/queries.ts`.
  `getLatestCampaign` returns the most recent campaign regardless of status.
- `awardTriumph(_prev, formData)` + `finishCampaign()` added to
  `app/admin/campaign/actions.ts`. `finishCampaign` sets `campaign.status = "finished"`.
- Admin page now uses `getLatestCampaign` (works post-closure). Shows "Campaign
  Closure" card on last cycle: award form, Triumph list, "Close Campaign" button.
  Challenge forms are hidden/read-only when campaign is finished.
- `lib/repo.ts` updated: falls back to finished campaign when no active one;
  includes `triumphs` and `campaign.status` in `PublicView`.
- `src/lib/data/campaign.ts` seed now includes `status: "active"`.
- New components: `AwardTriumphForm.tsx` (admin, client), `Triumphs.tsx` (landing,
  presentational). Landing shows Triumphs + "Campaign Closed" badge when applicable.
- Tests: `tests/triumphs.test.ts` (8 cases for `awardTriumphSchema`).
- **No schema migration needed** — the `triumph` table and `campaign.status` column
  already existed in the schema.

### Feature 6 — AI Assistant Improvements (technical summary)
- `retrieval.ts` gains three new exports: `expandQuery` (Claude Haiku rewrites
  the query using Necromunda terminology; gracefully falls back on errors),
  `mergeChunks` (pure dedup+sort, testable), `searchRulesWithExpansion` (runs
  original + expanded searches in parallel, merges with `mergeChunks`, caps at k).
- The route now uses `searchRulesWithExpansion` instead of `searchRules`.
- `StreamData` (from `ai`) wired in the route: appended as
  `{ sources: [{ label, book, page, similarity }] }` in `onFinish`; `data`
  passed to `toDataStreamResponse`. `data.close()` called in both `onFinish` and
  `onError` to avoid a hung stream.
- `RulesChat.tsx` reads `message.annotations` via a `getSources` helper and
  renders a `<details>` "Sources consulted" panel (book, page, similarity %) below
  each assistant message. Uses `BookOpen` icon from lucide-react.
- Tests: `tests/retrieval.test.ts` (7 cases for `mergeChunks`, 4 for
  `citationLabel`).
- **No schema or ingestion changes needed.**
- **StreamData wiring is not testable in the sandbox** — validate with `tsc` and
  test manually after deploying.

### Feature 7 — PDF Gang Sheet Export (technical summary)
- New dependency: **`pdf-lib`** (pure JS, no native binaries). Must be Node
  runtime (not edge). Install with `npm install pdf-lib`.
- `src/lib/pdf/gangSheet.ts` exports two layers:
  - `buildGangSheetData(gang: Gang): GangSheetData` — pure function; extracts
    rating, wealth, per-fighter totals, stash items. Tested in Vitest.
  - `buildGangSheetPdf(gang: Gang): Promise<Uint8Array>` — calls the above then
    assembles an A4 PDF using pdf-lib (header band, metrics band, roster table
    with equipment lines, stash section, footer). Multi-page support via
    `ensureSpace()`.
- `src/app/player/export/route.ts` — `GET /player/export`; Node runtime;
  authenticates with `auth()`, loads gang via `getGangByOwnerId`, returns
  `Content-Type: application/pdf` download. Players can only export their own gang.
- `src/app/admin/gangs/[gangId]/export/route.ts` — `GET /admin/gangs/[id]/export`;
  Node runtime; checks `role === "admin"`, loads gang via `getGangById`, returns
  PDF download. Admin can export any gang.
- UI: "Export PDF" button (`FileDown` icon) added to `/player` header. Per-gang
  "PDF" ghost button added to each player row in `/admin`.
- Return type `Uint8Array` from pdf-lib wrapped in `Buffer.from()` before passing
  to `NextResponse` to satisfy TypeScript's `BodyInit` constraint.
- **No schema changes.** No `db:push` or `rules:ingest` needed.
- Tests: `tests/gang-sheet.test.ts` (11 cases for `buildGangSheetData`).

### Feature 10 — Hardening: Durable Rate Limit, Integration Tests, Observability (technical summary)

- **`src/lib/ai/rate-limit.ts`** rewritten:
  - `rateLimit(key, limit?, windowSec?)` is now **`async`**. Returns
    `Promise<boolean>`.
  - When `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set:
    delegates to `@upstash/ratelimit` (`Ratelimit.slidingWindow`) + `@upstash/redis`.
    Counts accurately across multiple serverless instances (no reset on cold
    start).
  - Otherwise: falls back to the existing in-memory sliding window
    (`inMemoryRateLimit`), now exported for testing.
  - Singleton `_upstash` is created once per Node.js instance and reused.
  - Install with `npm install @upstash/ratelimit @upstash/redis` and set
    `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` in `.env`.
    Without the env vars the app continues to use in-memory (zero config change
    needed for local dev).
- **`src/lib/logger.ts`** (new): structured JSON logger — thin wrapper around
  `console` that emits `{ ts, level, msg, ...ctx }` per line. On Vercel,
  function logs capture stdout/stderr, making these entries queryable in the
  dashboard. No external dependency.
- **`src/app/api/assistant/route.ts`** updated:
  - `rateLimit()` is now awaited.
  - `logger.warn` on 401 (unauthenticated) — includes `x-forwarded-for` IP.
  - `logger.warn` on 429 (rate limited) — includes `userId`.
  - `logger.error` on `streamText` error — includes `userId` and error message.
    Replaces the bare `console.error`.
- **`src/proxy.ts`** convention note: the file is edge-safe and must never
  import DB or argon2. See §8.
- **Tests**:
  - `tests/rate-limit.test.ts` — 9 Vitest cases for `inMemoryRateLimit`:
    allow up to limit, block at limit+1, sliding window reset (fake timers),
    partial expiry, key isolation, limit=1, short window.
  - `tests/create-player.test.ts` — 7 Vitest cases for the `createPlayer`
    Server Action using `vi.mock` / `vi.hoisted` for `@/lib/db`,
    `@/lib/db/queries`, `@/lib/auth/guards`, `@/lib/auth/password`, `next/cache`.
    Covers: short password, invalid email, duplicate email, no active campaign,
    DB insert failure, happy path inserts user+gang, password is never stored
    in plain text.
- **Total tests**: 158 passing (15 test files). `tsc --noEmit` → 0 errors.
- **User commands**: `npm install @upstash/ratelimit @upstash/redis` (one-time,
  for Upstash support). `npm test` to run the full suite.

---

### Feature 9 — SEO & Lighthouse Audit (technical summary)

- **`src/app/robots.ts`**: `MetadataRoute.Robots` export. Allows `/`; disallows
  `/admin`, `/player`, `/api/`, `/dashboard`, `/login`. Includes `sitemap` URL.
  Base URL from `process.env.AUTH_URL || "https://necroforja.vercel.app"`.
- **`src/app/sitemap.ts`**: `MetadataRoute.Sitemap` export. Single entry for `/`
  with `changeFrequency: "daily"`, `priority: 1`, and a live `lastModified` date.
- **`src/app/opengraph-image.tsx`**: Dynamic OG image via `ImageResponse`
  (`next/og`). Edge runtime; 1200×630 px. Dark void background, hazard-yellow
  accent gradient, NecroForja branding, campaign name pill, author byline.
  Served at `/opengraph-image` and automatically picked up by Next.js as the
  default OG image for all pages in the root layout.
- **`src/app/layout.tsx`** enriched metadata:
  - `metadataBase: new URL(siteUrl)` — makes all relative metadata URLs canonical.
  - Full `openGraph` block: `type`, `url`, `siteName`, `locale`, `description`.
  - `twitter` card: `summary_large_image`, title, description.
  - `authors`, `creator`, `keywords` fields added.
  - `alternates.canonical: "/"` for the root.
- **`src/app/page.tsx`**:
  - Replaced `export const dynamic = "force-dynamic"` with
    `export const revalidate = 60` (ISR). Campaign data changes at most a few
    times per session; 60 s is fresh enough while letting Vercel's CDN cache HTML.
  - Injects two JSON-LD `<script type="application/ld+json">` blocks: `WebSite`
    (with `potentialAction` SearchAction) and `SoftwareApplication`
    (`applicationCategory: "GameApplication"`, `offers.price: "0"`).
- **noindex on private pages**: `robots: { index: false, follow: false }` added
  to `metadata` in `admin/page.tsx`, `admin/campaign/page.tsx`,
  `player/page.tsx`, `player/assistant/page.tsx`, `login/page.tsx`, and
  `dashboard/page.tsx` (which also gained a `Metadata` export for the first time).
- **`src/lib/seo/json-ld.ts`**: pure helper module exporting
  `buildWebsiteJsonLd(siteUrl)` → `WebsiteJsonLd` and
  `buildAppJsonLd(siteUrl)` → `SoftwareApplicationJsonLd`. Fully typed
  interfaces. Used by `page.tsx`.
- **No schema changes.** No `db:push` or `rules:ingest` needed.
- **Tests**: `tests/seo.test.ts` — 12 Vitest cases covering both builders:
  `@type`/`@context`, URL embedding, name, description presence, author shape,
  potentialAction target, multi-URL correctness, applicationCategory, price.
- **Total tests**: 142 passing (13 test files).

---

### Feature 8 — PWA: Installable & Offline-Friendly (technical summary)

- No new npm dependencies — implemented with native Web APIs and a manual service
  worker to avoid `@serwist/next` / `next-pwa` webpack-plugin complexity with
  Next.js 16.
- **Icon generation** (`scripts/generate-icons.mjs`): pure Node.js script (no
  external deps). Encodes a `192×192` and `512×512` PNG from scratch using
  `zlib.deflateSync` + a hand-rolled CRC-32 table. Run once with
  `node scripts/generate-icons.mjs` to emit `public/icons/icon-192.png` and
  `public/icons/icon-512.png`. `public/icon.svg` provides the vector version.
- **Web App Manifest** (`src/app/manifest.ts`): Next.js `MetadataRoute.Manifest`
  export served at `/manifest.webmanifest`. Colours match the Necromunda theme
  (`background_color: "#0b0c0e"`, `theme_color: "#f2a900"`).
- **Caching strategy** (`src/lib/pwa/cache-routes.ts`): pure TypeScript helper
  `getCacheStrategy(pathname): CacheStrategy` with three tiers:
  - `network-only` — `/api/*`, `/admin*`, `/login*`, `/dashboard*`,
    `/_next/data/*` (mutations + auth — never cached).
  - `cache-first` — `/_next/static/*`, `/icons/*`, `/icon.svg`, `/favicon.ico`
    (content-hashed or rarely-changing static assets).
  - `network-first` — `/player*`, `/` and everything else (navigable pages;
    cached for offline fallback).
- **Service worker** (`public/sw.js`): plain JavaScript mirroring
  `cache-routes.ts`. Install: `skipWaiting`. Activate: purge stale caches,
  `clients.claim`. Fetch: network-only skips interception; cache-first serves
  from cache and fills on miss; network-first tries network, caches successful
  navigations, falls back to cache or returns a `503` plain-text response.
- **SW headers** in `next.config.ts`: `/sw.js` gets
  `Cache-Control: public, max-age=0, must-revalidate` and
  `Service-Worker-Allowed: /` so the browser re-fetches it on every page load and
  the SW can register with full scope.
- **`PwaRegister`** (`src/components/PwaRegister.tsx`): `"use client"` component
  that registers `/sw.js` on mount. Returns `null`. Placed in `layout.tsx`.
- **`OfflineBanner`** (`src/components/OfflineBanner.tsx`): `"use client"`
  component. Reads `navigator.onLine` on mount; listens to `online`/`offline`
  window events. When offline renders a fixed top banner (z-50, `bg-rust/90`)
  with a `WifiOff` icon and the message "You're offline. Viewing cached data —
  changes require a connection." Returns `null` when online.
- **`layout.tsx`** updated: imports both components; renders `<OfflineBanner />`
  before `{children}` and `<PwaRegister />` after. Also adds `themeColor`,
  `appleWebApp`, and `icons` metadata entries for iOS Safari PWA support
  (apple-touch-icon, theme-color meta tag).
- **No schema changes.** No `db:push` or `rules:ingest` needed.
- **Tests**: `tests/pwa.test.ts` — 15 Vitest cases for `getCacheStrategy`
  covering all three tiers, edge cases (exact-match `/icon.svg`,
  `/api` vs `/api/`), and boundary conditions.
- **User commands**: `node scripts/generate-icons.mjs` (already run; re-run if
  the icon design changes). `npm test` to run the full test suite.

---

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
