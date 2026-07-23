# Technical Plan — Portfolio + Necromunda Campaign Manager

> Architecture and product decisions document. Version 1.0 — Jun/2026.
> Project author: Gabriel Stedile. Living document: revise at each phase.

---

## 1. Overview and strategy

The project has **two overlapping goals** that, fortunately, reinforce each other:

1. **Professional portfolio** — proving engineering and product design ability to
   recruiters. What matters here: a modern and defensible stack, clean code,
   measurable performance (Lighthouse), accessibility, SEO, a real production
   deploy, and an AI feature that differentiates.
2. **Real Necromunda campaign tool** — you are the Arbitrator and need to manage
   gangs, credits, missions, and the ranking during in-person sessions, with a
   great phone/tablet experience.

The good news: the best technical decision for goal 1 (Next.js + Postgres + AI
with RAG + free deploy) is exactly the same that serves goal 2. No conflict. We
build **one product**, and the portfolio is "this product actually working +
a well-documented repository".

**Guiding principle:** start small (lean MVP), architect for expansion, and treat
each phase as a standalone, demonstrable "portfolio feature".

---

## 2. Recommended stack (and why)

### 2.1 Stack executive summary

| Layer | Choice | Alternative considered |
|---|---|---|
| Framework | **Next.js 16.2 (App Router, React 19, Server Components)** | Vite + React Router (pure SPA) |
| Language | **TypeScript** (strict) | — |
| Styling | **Tailwind CSS v4 + shadcn/ui (Radix)** | CSS Modules, Panda CSS |
| Database | **PostgreSQL** (via Supabase or Neon) | SQLite/Turso, MongoDB |
| ORM | **Drizzle ORM** | Prisma |
| Auth | **Auth.js v5** (admin creates accounts) or **Supabase Auth** | Clerk (paid above free tier) |
| Validation | **Zod** (client + server) | Yup |
| AI | **Vercel AI SDK + RAG with pgvector** | Direct API without abstraction |
| Hosting | **Vercel (Hobby, free)** + **Supabase/Neon** database | Cloudflare Pages + D1 |
| Testing | **Vitest + Playwright** | Jest + Cypress |
| Quality | **ESLint + Prettier + optional Biome**, **TypeScript strict** | — |

### 2.2 Framework: Next.js 16 (App Router)

The current stable version (Jun/2026) is **16.2.7**, with React 19 and Turbopack
as the default bundler. It's the right choice here for four reasons aligned with
the explicit requirements:

- **SEO and "found by Google"** — Next renders on the server (SSR/SSG). The public
  landing page and any page that needs to rank come with full HTML, dynamic metadata
  (Metadata API), `sitemap.xml`, `robots.txt`, and native Open Graph. A pure SPA
  (Vite/CRA) delivers an empty `<div id="root">` and hurts indexing — exactly what
  to avoid.
- **Speed and rendering optimisation** — Server Components render data on the server
  and send only the necessary HTML/JSON, reducing client JavaScript. Streaming +
  Suspense render the page progressively. `next/image` optimises images automatically.
  `next/font` eliminates font layout shift.
- **Security** — Server Components and Server Actions keep sensitive logic and secrets
  on the server; the client never sees database credentials or AI keys. Middleware
  centralises authentication checking per route.
- **Portfolio signal** — the most valued React framework on the market today.
  Demonstrating mastery of App Router, Server Components, and Server Actions is a
  strong seniority signal.

**Honest trade-off:** if you wanted the minimum complexity, a Vite + React SPA is
simpler mentally. But you'd lose SEO, server-side rendering optimisation, and
portfolio points — three things you asked for explicitly. Next.js wins easily here.

### 2.3 Styling: Tailwind v4 + shadcn/ui

- **Tailwind v4** — atomic utilities, mobile-first by default (essential for
  phone/tablet use at the table), zero dead CSS in production, and centralised theme
  tokens (we define Necromunda colours as CSS variables/tokens).
- **shadcn/ui** — accessible components (built on Radix: focus, keyboard, ARIA
  ready) that you **copy into your repository** instead of importing as a dependency.
  This means full visual control — perfect for rewriting the appearance in the
  Necromunda tone without fighting a library's styles. "Free" accessibility also
  helps the portfolio.

### 2.4 TypeScript strict + Zod

`tsconfig` in `strict` mode. **Zod** defines validation schemas once and reuses
them for: form validation on the client, Server Action/API route validation, and
type inference. This closes the door on invalid data reaching the database — a
pillar of security and demonstrable code quality.

---

## 3. Database (evaluation requested)

### 3.1 The choice: relational PostgreSQL

Your data is **strongly relational and with strict integrity**: a campaign has many
gangs; a gang has many fighters; each fighter has many weapons/equipment/skills;
each item has a cost in credits; battles generate scoring events. The "credits
spent" and "gang rating" calculations depend on consistent sums across these
relations.

For this profile, **PostgreSQL** is the natural choice and the most defensible for
portfolio:

- Referential integrity (foreign keys), ACID transactions, constraints — you'll
  never have an orphan fighter or equipment without an owner.
- Mature SQL for scoring aggregates (sum costs, rank gangs).
- **pgvector**: extension that turns the same Postgres into a vector database for
  the AI feature (RAG). One database serves both application data **and** semantic
  rule search — elegant and economical.
- Huge ecosystem, great for CV.

**Why not the alternatives:**
- *MongoDB (NoSQL)*: nested documents seem convenient for a gang, but you'd lose
  referential integrity and relational aggregations would become more fragile. Not
  recommended for data with so many relations and calculations.
- *SQLite/Turso*: excellent and very cheap, great for low traffic. Viable, but
  Postgres + pgvector delivers AI in the same place and impresses more in a
  portfolio. Valid alternative if you want extreme simplicity.

### 3.2 Where to host Postgres: Supabase vs Neon

Both have generous free tiers and a region in **South America (São Paulo /
`sa-east-1`)**, which reduces latency for players in Brazil.

**Supabase (recommended for getting started quickly)** — managed Postgres + Auth +
Storage (for gang/fighter images) + Row Level Security, all in one package. Free
tier (Jun/2026): ~500 MB database, 1 GB storage, 5 GB bandwidth, up to 50,000
active users/month, 2 projects. **Note:** the project is **paused after ~7 days of
inactivity** on the free plan and there are no automatic backups. For an occasional
campaign, this means the first access after days of inactivity may be slow to
"wake up" — mitigable with a cron ping or by accepting the cold start.

**Neon (elegant alternative)** — serverless Postgres that **scales to zero** and
comes back quickly; great for intermittent traffic like yours. Also has pgvector.
More "just database" (auth you handle with Auth.js).

**Recommendation:** start with **Supabase** for the time savings (auth + storage +
db + RLS in one place) and evaluate/migrate to Neon if the cold start becomes
an issue. In both, **select the São Paulo region** on creation.

### 3.2a Image storage strategy (issue #21)

Three different needs share the "image" label but have different lifecycles:

1. **Static content images** (lore, journal/news) — small volume, versioned
   together with the code. Stay in `public/` (e.g. `public/lore/*.webp`, issue
   #9); no reason to move them to object storage while the volume is small.
2. **Gallery photos** (campaign photos, user-submitted) — grows over time,
   needs public read access and a simple upload flow.
3. **Future uploads tied to entities** (fighter/gang sheet images, avatars) —
   not built yet; no issue currently requests this feature.

**Options considered:** Supabase Storage, Cloudflare R2, AWS S3 + CloudFront,
Vercel Blob (see issue #21 for the full comparison). **Decision: Supabase
Storage.** The project already runs on Supabase (Postgres + this), so there is
no new provider/credential to manage; `next.config.ts` already whitelists
`*.supabase.co` in `images.remotePatterns`. Free tier (1 GB) and no egress
billing are enough at this scale; revisit Cloudflare R2 only if storage/egress
cost becomes a real line item.

**Implemented (gallery, issues #6/#24):** direct-to-Storage signed uploads
(client uploads straight to the `gallery` bucket, bypassing the Vercel
serverless 4.5 MB body limit), admin at `/admin/gallery`, public read at
`/gallery`. Modeling: `gallery_image` table (owner-independent — no per-user
uploads yet) + `gallery_category` enum, indexed by
`(published, created_at)`/`category`. Buckets `gallery` (10 MB, images) and
`media` (50 MB, video — `trailer.mp4`) are public; RLS is enabled with no
policies because the app only writes through the service role / signed URLs,
never directly from the client with the anon key.

**Deferred:**
- Orphan cleanup (Storage objects left behind by a failed/abandoned upload) —
  no automated job yet; low risk at the current volume, revisit if the bucket
  grows.
- Migrating existing `public/lore` images to Storage — not worth it while
  static content stays small; reconsider if content images start needing
  runtime updates without a redeploy.
- Fichas/avatar uploads — no feature request for this yet; when it lands,
  reuse the same signed-upload pattern with a per-entity (fighter/gang) owner
  column instead of introducing a new storage decision.

### 3.3 ORM: Drizzle

**Drizzle ORM** — SQL-like, type-safe, lightweight, with versioned migrations. Runs
very well in serverless/edge environments (important on Vercel) and generates
TypeScript types from the schema. Preferred over Prisma here for its lightness in
serverless and the transparency of generated SQL (good for learning and for
discussing in interviews). Prisma is a perfectly valid alternative if you
prioritise DX/maturity.

---

## 4. Hosting and cost

### 4.1 Recommendation: Vercel (Hobby/free) + Supabase (free)

- **Vercel Hobby** hosts Next.js with global CDN, automatic HTTPS, deploy on every
  `git push`, preview deployments per PR, and edge network (good latency in Brazil).
  Free tier (Jun/2026): 100 GB bandwidth, ~1 million function invocations/month —
  well above what your campaign needs.
- **Expected total cost: US$ 0/month** initially (Vercel Hobby + Supabase Free).

**Important note — commercial use:** the Vercel **Hobby plan is personal/non-commercial
only**. A portfolio and a private campaign tool **qualify as non-commercial** — it's
fine. If the site ever carries ads, affiliate links, or becomes a paid product,
upgrade to **Pro (US$ 20/month)**.

### 4.2 Alternative if you want to avoid the commercial clause

**Cloudflare Pages + Workers** (with database on Neon or Cloudflare D1/SQLite)
allows commercial use on the free tier and has excellent network coverage in Brazil.
More configuration, though. Keep it as Plan B; for your goals, Vercel + Supabase is
the fastest and cleanest path.

### 4.3 Domain

Buy your own domain (`.com`/`.dev`, ~US$ 10–15/year) — it's the only recommended
cost and is very much worth it for portfolio and SEO. Point it to Vercel. It's what
separates "hobby project" from "professional product" in a recruiter's eyes.

---

## 5. "Necromunda tone" design system (without infringing IP)

### 5.1 The IP boundary — what's safe and what to avoid

Games Workshop is **aggressive** in defending its trademarks. The safe practical rule:

- **OK:** capture the *tone* and *genre visual language* — gothic industrial,
  underhive, corroded metal, hazard stripes, stencil typography, dystopian
  atmosphere. Genre aesthetics are not protectable.
- **Avoid:** the Necromunda logo, GW's proprietary fonts, the specific House
  symbols/icons (Goliath, Escher, Orlock, Van Saar, Delaque, Cawdor), official art,
  the "aquila"/registered imperial iconography, and proper names as a product brand.
  Do not republish official art or use logos.
- **Strategy:** create **original iconography and proper names** that evoke the
  universe. If the campaign uses the official Houses in the rules, reference them as
  **text** ("House Goliath") for personal/private use by players — without reproducing
  logos/art. The risk is very low on a private campaign site, but the public portfolio
  should use **original art and brand**.

> Summary: the user should **feel** like Necromunda when they enter; but everything
> that is trademarked is replaced by your own original equivalents.

### 5.2 Colour palette (tokens)

Dark industrial background with toxic/hazard accents. Proposed tokens (CSS variables):

```
--bg-void:        #0B0C0E   /* soot-black, base background               */
--bg-panel:       #15171B   /* panels/cards, dark metal                  */
--bg-elevated:    #1E2127   /* elevated surfaces                         */
--border-rivet:   #2C2F36   /* borders, "riveted plates"                 */
--ink:            #E6E1D6   /* main text, dirty off-white                */
--ink-muted:      #9A968C   /* secondary text                            */
--hazard:         #F2A900   /* amber/danger — primary CTA                */
--hazard-strong:  #FF7A00   /* warning orange, highlights                */
--toxic:          #8FBF3F   /* toxic green — status/success              */
--blood:          #A11B1B   /* blood red — danger/deletion               */
--rust:           #7A4A2B   /* rust — detail accents                     */
--gas-cyan:       #3FB6A8   /* neon cyan — links/AI                      */
```

Dark mode is the **default** (and likely the only mode — fits the tone). Ensure
AA contrast: the off-white `--ink` over `--bg-void` passes comfortably.

### 5.3 Typography

Use **free/open-source** fonts with an industrial feel (without using GW's
proprietary ones):

- **Display/headings:** a stencil or condensed industrial font — e.g. *Oswald*,
  *Saira Condensed*, *Teko*, or *Anton* (Google Fonts, OFL licence). Uppercase,
  wide tracking, heavy weight.
- **Body:** a neutral, readable sans-serif for use at the table — *Inter* or
  *IBM Plex Sans*.
- **Mono (data/stats):** *JetBrains Mono* or *IBM Plex Mono* — matches the
  "underhive terminal" tone and looks great in credit/rating tables.

Load via `next/font` (zero layout shift).

### 5.4 Visual language of components

- **"Metal plate" panels**: cards with 1px `--border-rivet` border, slightly
  chamfered corners, optional subtle noise/grain texture.
- **Hazard stripes**: diagonal amber/black bands as separators or in alert states
  (use sparingly).
- **Buttons**: primary amber (`--hazard`) with dark text; well-visible focus states
  (accessibility).
- **Section headings**: "stamped stencil" style, uppercase, with a small original
  icon/mark on the left.
- **Micro-interactions**: fast transitions (120–180ms), no excesses —
  performance and seriousness.
- **Iconography**: lucide-react as a base, with 3–5 original custom icons for
  identity (e.g. gang marker, credit, mission).

### 5.5 Accessibility and mobile-first

Since real use is on **phone/tablet at the game table**, the design is genuinely
mobile-first: touch targets ≥44px, tables that become cards on mobile, bottom
navigation in the management app, and high contrast for poorly lit environments.
All tested in Lighthouse (target: 95+ in Performance, Accessibility, SEO, Best
Practices).

---

## 6. Features and roadmap by phase

### Phase 0 — Foundation (infra + design tokens)
Repository, Next.js + TS strict, Tailwind + Necromunda tokens, customised
shadcn/ui, initial Drizzle schema, Supabase connection (SP region), basic CI
(lint + typecheck + tests), Vercel deploy with domain. **Portfolio deliverable:**
"site live, automated deploy".

### Phase 1 — MVP (authentication + gangs)
- **Admin login** and **admin dashboard**: create/edit/deactivate player accounts
  manually (no self-signup — closed by design). Invite by email or temporary password.
- **Public page (landing)**: open campaign dashboard — current phase, current
  mission, number of players, participating gangs, and a **best player ranking**.
  SSG/ISR for SEO and speed.
- **Player dashboard**: create their gang, view/edit the fighter roster, and
  automatic calculation of **credits spent** and **gang rating** per fighter and
  total.

### Phase 2 — Live campaign
- **Battle/mission registration** (outcome, participants, rewards/credits,
  injuries/deaths).
- **Automatic scoring** and ranking updated from battle events.
- Campaign timeline; "what mission are we on" state.
- Each gang's history (rating evolution over time).

### Phase 3 — AI (the portfolio differentiator)
Rules assistant with **RAG** (detailed in section 7).

### Phase 4 — Polish and PWA
- **PWA** (installable, offline-friendly for table reference).
- Image optimisation, fine code-splitting, Lighthouse audit.
- Export gang sheet as PDF.
- Basic logging/observability.

---

## 7. Data model (outline)

Main entities (PostgreSQL):

```
campaign        (id, name, status, current_phase, current_mission_id, created_at)
user            (id, email, role['admin'|'player'], display_name, is_active, created_at)
gang            (id, campaign_id, owner_user_id, name, house, credits_stash, rating_cached, created_at)
fighter         (id, gang_id, name, type, base_cost, status['active'|'injured'|'dead'], xp)
equipment       (id, name, category['weapon'|'wargear'|'skill'], cost)  -- catalogue
fighter_equipment (fighter_id, equipment_id, qty)                       -- N:N
battle          (id, campaign_id, mission_id, played_at, notes)
battle_result   (id, battle_id, gang_id, outcome, credits_earned, points)
mission         (id, campaign_id, name, sequence)
rule_chunk      (id, source, heading, content, embedding vector)        -- AI (pgvector)
```

**Derived calculations:**
- *Gang cost (credits spent)* = Σ `fighter.base_cost` + Σ (`equipment.cost` × `qty`).
- *Gang rating* = gang cost + XP/skill bonuses per Necromunda rules (exact formula
  comes from the books — adjust when PDFs are loaded).
- Maintain `rating_cached` on the gang, recalculated on every write (Server Action)
  for fast reads on the landing/ranking.

**Data security (RLS):** with Supabase, Row Level Security policies ensure a player
only reads/edits their **own** gang, while the admin sees everything, and the public
only accesses the aggregated campaign view. This is defence in depth beyond the
application-level check.

---

## 8. AI Feature — Rules Assistant (RAG)

### 8.1 The concept
A **conversational assistant** that answers rules questions about the campaign.
Instead of the LLM "inventing", we use **RAG (Retrieval-Augmented Generation)**:
we index rule texts in chunks, generate embeddings, and at query time search for
the most relevant chunks (vector search with pgvector) and deliver them to the
model as context. Grounded responses, with source citations.

### 8.2 Why it's a great portfolio feature
RAG is the most demanded AI application on the market today. It shows you know:
chunking, embeddings, vector search, prompt engineering, response streaming, and
chat UX. All in the same Postgres (pgvector), no extra infrastructure.

### 8.3 Technical pipeline
1. **Ingestion**: you feed rules gradually (text). Pipeline splits into chunks
   (~500–800 tokens), generates embeddings, and saves to `rule_chunk.embedding`.
2. **Query**: user question → embedding → `ORDER BY embedding <-> query`
   (similarity) in Postgres → top-k chunks.
3. **Generation**: chunks + question go to the LLM via **Vercel AI SDK** (streamed
   response in the chat). Prompt instructs it to answer only from context and cite
   the section.
4. **Guardrails**: if no relevant context is found, respond "not found in the rules"
   rather than hallucinating.

### 8.4 Applications beyond chat
- **Interactive FAQ**: pre-computed common questions.
- **Rule summaries**: generate section summaries on demand.
- **Arbitrator assistant**: quick table-side reference ("how much does rallying
  cost?", "how does injury X work?").

### 8.5 Cost and providers
Use the **Anthropic API (Claude)** or **OpenAI** — pay-as-you-go, cents at your
volume. Embeddings are very cheap. Apply **rate limiting** on the AI route (cost
protection and security). Keys stay on the server (Vercel environment variables),
never on the client.

### 8.6 ⚠️ IP caution for AI
Necromunda rules are **copyright-protected material**. For **private use** in your
campaign (authenticated users who already own the books) the risk is low. But
**do not expose the rules assistant publicly** by reproducing full book text —
that would be redistribution of protected content. Recommendation: the AI assistant
stays **behind login**, restricted to the campaign's players; the public area uses
only your original content. This lets you demonstrate RAG engineering in the portfolio
(you can record a video/demo) without republishing third-party IP.

---

## 9. Performance, security and SEO (cross-cutting requirements)

**Performance / rendering:**
- Server Components by default; Client Components only where interactivity is needed.
- Streaming + Suspense; `next/image` and `next/font`; ISR/SSG on public pages.
- `rating_cached` to avoid recalculation on reads; Postgres indexes on FKs and
  sort columns.
- Lighthouse target: 95+ in all four categories.

**Security:**
- Auth via Auth.js v5 (or Supabase Auth), sessions in httpOnly/secure cookies.
- Middleware protecting `/admin` and `/player` routes; role-based authorisation.
- **RLS in Postgres** as a second layer.
- Zod validation on all input; parametrised ORM (no SQL injection).
- Secrets on server only; rate limiting on AI and login; security headers (CSP,
  HSTS) — Vercel facilitates these.
- No self-signup: reduced attack surface by design.

**SEO / "found by Google":**
- Server-rendered HTML, Metadata API per page, `sitemap.xml`, `robots.txt`,
  structured data (JSON-LD), Open Graph for sharing.
- Own domain + HTTPS + green Core Web Vitals (which Google uses as a ranking signal).

---

## 10. Quality, tests and DX (portfolio points)

- **TypeScript strict**, ESLint, Prettier.
- **Vitest** (unit — especially the credit/rating calculations, which are the
  heart of the domain) + **Playwright** (e2e of critical flows: login, create gang,
  view ranking).
- **CI on GitHub Actions**: lint + typecheck + tests on every PR; automatic deploy
  on Vercel.
- **Strong README** + this document + diagrams (data model, architecture). For a
  recruiter, clear documentation is a huge differentiator.
- Conventional commits, feature branches, preview deploys per PR.

---

## 11. Risks and open decisions

- **Supabase Free cold start** (pauses after ~7 days) — mitigate with a scheduled
  ping task or accept the delay on the first access. Re-evaluate Neon if it becomes
  an issue.
- **Exact rating/credits formula** — ✅ resolved from the books (see Appendix A).
  Structure the equipment catalogue as configurable data to adjust without code
  changes.
- **Commercial use on Vercel** — keep the project non-commercial; if that changes,
  go to Pro or Cloudflare.
- **AI IP** — keep the rules assistant behind login (section 8.6).

---

## 12. Suggested next steps

1. You review this plan + Appendix A and adjust the MVP scope.
2. ✅ PDFs read — formulas and campaign mechanics extracted (Appendix A). You just
   need to confirm **which Sympathisers** and **which gangs/players** are already in
   your current campaign to seed the data.
3. I generate a **visual mockup** (landing + dashboard) in the Necromunda tone to
   validate the design before coding.
4. We start **Phase 0** (repository scaffold).

> Whenever you're ready, just say where to start (mockup, scaffold, or refine rules
> with the books).

---

## Appendix A — Rules extracted from the books (Core Rulebook 2023 + Cinderak Burning)

This section translates the official rules into the **concrete specifications** the
software needs to implement. The numbers below come directly from the two PDFs.

### A.1 The campaign you arbitrate: *The Aranthian Succession — Cinderak Burning*

This is not a generic campaign — it has its own structure and mechanics, and **the
app is essentially the Arbitrator's digital tool** (you). The responsibilities the
book assigns to the Arbitrator map almost 1:1 to features:

| Arbitrator responsibility (book) | App feature |
|---|---|
| List all gangs involved | Admin dashboard: player/gang CRUD |
| Track Sympathiser control | Sympathiser panel (who controls what) |
| Keep players informed of progression | Public landing: current cycle/phase, ranking |
| Decide start/end of each phase and championship | Admin: cycle and phase dates |
| Record victories | Challenge/battle log |
| Award Triumphs at the end | Closure and award screen |

### A.2 Campaign temporal structure

The campaign has **7 cycles** (each cycle ≈ 1 week, but the Arbitrator decides),
divided into three phases:

```
Phase 1: Great Darkness     → 3 cycles
Downtime                    → 1 cycle   (recovery/recruitment; steps A–E)
Phase 3: Spark of Rebellion → 3 cycles
```

Downtime steps (at the end of the Great Darkness phase): A. Fighters Recover ·
B. Captives Returned · C. Juves/Prospects promoted · D. Fresh Recruitment ·
E. Declare Allegiance.

> App implication: the `campaign` entity needs `phase` (enum: great_darkness |
> downtime | spark_of_rebellion) and `current_cycle` (1–7), with dates. The public
> landing shows "Cycle 4 of 7 — Downtime".

### A.3 Sympathisers (the heart of the scoreboard)

Sympathisers are a special type of **Territory** — the campaign's "currency".
Mechanics:

- Deck built with **half a deck**: only Spades and Diamonds (26 cards = 26
  Sympathisers, e.g. *Promethium Guild*, *Water Guild*, *House Ulanti*, *Heretek*…).
- Each gang **starts** with some; the goal is to control the maximum.
- Each cycle, **each player makes 1 challenge** to another gang for a Sympathiser.
- **Challenge order:** in cycle 1, random; afterwards, in **ascending Gang Rating**
  order (the gang with the lowest Rating challenges first).
- The **battle winner** takes control of the contested Sympathiser. If a challenge
  is refused, the challenger gets the Sympathiser automatically.
- Each Sympathiser gives **Boons** while controlled (e.g. "+D6×10 credits to
  Stash", special rules). These vary between phases.
- Battle scenario: 2D6 table (Fall of Badzones, Gunk War, Out of the Storm,
  Street Fight, etc.).

> App implication: entities `sympathiser` (26-entry catalogue), `sympathiser_control`
> (which gang controls which, with history), and `challenge` (challenger, challenged,
> sympathiser at stake, cycle, scenario, outcome). The **primary public ranking** is
> "number of Sympathisers controlled per gang".

### A.4 Victory

Winning is **more than controlling Sympathisers**. At the end, the Arbitrator
awards **Triumphs** based on: helping your own faction win, the gang's **Wealth**,
and how well it survived the Great Darkness. → closure screen with Arbitrator-
configurable awards.

### A.5 Exact formulas (Core Rulebook, p.80–92)

These are the official formulas the app calculations must reproduce:

- **Foundation budget (Succession Campaign): 2,000 credits** (not the standard
  1,000 for regular campaigns). Unspent credits go to the **Stash**. If using
  vehicles, +400 credits for "Mounted" wargear/vehicles only.
- **Gang Rating** = total cost of **all fighters and vehicles**, **including all
  equipment and upgrades** they carry.
  `rating = Σ fighter.cost(incl. weapons+wargear+skills+upgrades) + Σ vehicle.cost(incl. upgrades+wargear)`
- **Wealth** = Gang Rating **+** value of any **credits and equipment in the Stash**.
  `wealth = rating + stash_credits + Σ stash_equipment.cost`
- **Reputation** — **separate** attribute from Rating; starts at **1**; measures
  the gang's prestige and limits the number of Hangers-on/Brutes. (Grows/falls
  through campaign events.)

> The app calculates Rating and Wealth automatically on every gang change and stores
> `rating_cached`/`wealth_cached` for fast reads in the ranking and challenge ordering.

### A.6 Fighter structure (Fighter Card, p.78)

Each fighter has: **name**, **cost in credits**, and the **characteristics** profile
— 12 attributes, with the last 4 (psychological) highlighted:

```
M  WS  BS  S  T  W  I  A   |  Ld  Cl  Wil  Int
(Movement, Weapon Skill, Ballistic Skill, Strength, Toughness,
 Wounds, Initiative, Attacks | Leadership, Cool, Willpower, Intelligence)
```

Each fighter also carries: **weapons**, **skills**, **equipment/armour**, and in
campaign accumulates **XP** and **Advancements**, can suffer **Lasting Injuries**,
go **In Recovery**, be **Captured**, or die. Model categories: Leader, Champion,
Prospect, Ganger, Juve, Crew (+ Hangers-on, Brutes). Vehicles have an analogous
card (cost, crew characteristics, weapons, upgrades, wargear).

> App implication: `fighter` gains columns for the 12 attributes, `category`,
> `xp`, `status` (active/in_recovery/injured/captured/dead), and `captured_by`.
> The `equipment` catalogue needs `category` (weapon/wargear/skill/armour/upgrade)
> and `cost`.

### A.7 Refined data model (replaces/expands section 7)

```
campaign            (id, name, phase, current_cycle, start_date, end_date,
                     downtime_after_cycle, status)
user                (id, email, role, display_name, is_active)
gang                (id, campaign_id, owner_user_id, name, house,
                     stash_credits, reputation, rating_cached, wealth_cached)
fighter             (id, gang_id, name, type, category, base_cost,
                     m, ws, bs, s, t, w, i, a, ld, cl, wil, int,
                     xp, status, captured_by_gang_id)
equipment           (id, name, category['weapon'|'wargear'|'skill'|'armour'|'upgrade'], cost)
fighter_equipment   (fighter_id, equipment_id, qty)
stash_item          (id, gang_id, equipment_id, qty)      -- equipment stored in Stash
sympathiser         (id, name, card, suit, boon_text, boon_spark_text)  -- 26-entry catalogue
sympathiser_control (id, sympathiser_id, gang_id, since_cycle)          -- + history
challenge           (id, campaign_id, cycle, challenger_gang_id,
                     challenged_gang_id, sympathiser_id, scenario,
                     outcome, resolved)
triumph             (id, campaign_id, gang_id, title, awarded_at)
rule_chunk          (id, source, heading, content, embedding vector)    -- AI/RAG
```

### A.8 Adjustment to the public landing (based on what the campaign actually exposes)

The "public dashboard" you envisioned now has concrete content faithful to the campaign:

- **Campaign state:** "Cinderak Burning — Cycle X/7 · Phase: Great Darkness /
  Downtime / Spark of Rebellion".
- **Sympathiser map:** all 26, with the gang controlling each (the most
  "Necromunda" visual piece of the site).
- **Gang ranking:** by number of controlled Sympathisers (primary) and by Gang
  Rating / Wealth (secondary).
- **Participating gangs:** name, House, leader, number of fighters.
- **Recent challenge log:** who challenged who, for which Sympathiser, and the
  outcome.

### A.9 IP reinforcement (confirmed in the PDFs)

Both books carry an explicit Games Workshop copyright notice prohibiting
reproduction by any means. This **confirms the recommendation in section 8.6**: the
AI rules assistant and any text derived from the books stay **behind login**,
restricted to your players (who own the books). The public layer uses exclusively
**your original** content and art. Mechanic names (Sympathiser, Gang Rating) can
appear as functional terms; what must not be reproduced publicly is **rule text,
art, and official logos**.
