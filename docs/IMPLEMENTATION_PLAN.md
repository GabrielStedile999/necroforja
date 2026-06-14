# IMPLEMENTATION_PLAN

Roadmap of upcoming features, in recommended order. Each item is
self-contained: an assistant should be able to implement **one feature at a
time** by reading this file + `PROJECT_CONTEXT.md`, without re-analysing the
entire project.

Conventions valid for all features (see PROJECT_CONTEXT §7):
- Validate input with **Zod** (`lib/validation.ts`), check authorisation
  (`requireUser`/`requireAdmin`) and **ownership** before writing.
- After a mutation on a gang, call `recalcGangScores(gangId)`; always
  `revalidatePath` the affected routes.
- Server Actions return `{ error?, success? }` and are consumed by
  `useActionState` in `"use client"` components.
- Use Necromunda theme tokens; UI in English; authenticated pages with
  `export const dynamic = "force-dynamic"`.
- Verify with `tsc --noEmit` (stub for `@node-rs/argon2`) + Vitest tests on the
  user's machine.

Current status: Phases 1–3 delivered. The features below are Phase 4+ and
refinements.

---

## Handoff prompt (copy/paste)

Use this to delegate **one feature at a time** to an implementing model (Claude
Code, Codex/Cursor, etc.). Prerequisite: the implementor needs **direct
repository access** (read/write files) — does not work well in pure chat.
Recommended: intermediate model (Sonnet/GPT-5) for mechanical features; reserve
a stronger model (or its review) for #6 (AI/RAG), #8 (PWA), and #10 (tests).
Open a **new context per feature** to spend fewer tokens.

Replace `<NUMBER>` with the desired feature and paste the prompt below:

```
You will implement ONE feature in this project (Next.js 16 + TS + Drizzle +
Auth.js + RAG). Work only within the feature's scope; do not refactor the rest.

Before coding, read IN FULL:
- PROJECT_CONTEXT.md  (stack, structure, conventions, already-solved problems)
- The "## <NUMBER>." section of IMPLEMENTATION_PLAN.md (the feature to implement)
- The "Conventions valid for all features" block at the top of IMPLEMENTATION_PLAN.md

Non-negotiable rules (from PROJECT_CONTEXT §6 and §8):
- Do NOT migrate the AI SDK to v5 (the code depends on the v4 API).
- middleware.ts / auth.config.ts are edge-safe: do not import DB or argon2 there.
- When reading env, use `||` (not `??`) to treat "" as absent.
- Validate input with Zod; check requireUser/requireAdmin AND ownership
  (e.g.: the resource belongs to the user's gang) BEFORE writing.
- After a mutation on a gang, call recalcGangScores(gangId); revalidatePath.
- UI in English, Necromunda theme tokens; authenticated pages with
  `export const dynamic = "force-dynamic"`.

Deliver:
1. The complete feature implementation, following the "Likely files".
2. `npm run typecheck` WITHOUT errors. (In the sandbox, if @node-rs/argon2 or
   the @ai-sdk/* packages don't install, create a temporary ambient .d.ts
   declaring them, run tsc, and remove the stub afterwards — see PROJECT_CONTEXT §8.)
3. New Vitest tests for the pure logic introduced; do not break the existing ones.
4. Meet the "Acceptance criteria" for the feature.
5. Update PROJECT_CONTEXT.md if the schema, conventions, or behaviour changed.
6. A final summary: what changed, and the commands that I (the user) need to run
   on my machine (e.g.: `npm run db:push`, `npm run rules:ingest`, `npm test`).

Do not run db:push/seed/ingest yourself (they depend on my database/keys); just
tell me when they are needed. Ask if anything in the scope is ambiguous.
```

> Tip: once the feature passes (tsc + tests + acceptance criteria), ask the
> implementor to update this file marking the feature as complete, so the next
> iteration starts clean.

---

## 1. Equip/unequip fighters (equipment UI) ✅ COMPLETED

**Goal.** Allow the player to equip weapons/wargear/armour/skills on fighters in
their own gang via the interface. The `addEquipment` action already exists;
missing: UI and item removal.

**Expected behaviour.**
- In `/player`, each fighter shows its equipped items (name + cost) and the
  fighter's total cost.
- "Add equipment" form per fighter: name, category
  (weapon/wargear/skill/armour/upgrade), cost. On submit, the item is created
  and linked; Rating/Wealth recalculate.
- "Remove" button per equipped item.

**Likely files.**
- `src/app/player/actions.ts` — already has `addEquipment`; add
  `removeEquipment(formData)` (validates that the `fighter_equipment` belongs to
  a fighter in the user's gang; deletes the link + optionally the `equipment`).
- `src/components/player/AddEquipmentForm.tsx` (new, client, `useActionState`).
- `src/app/player/page.tsx` — render items per fighter + form + remove.
- `src/lib/validation.ts` — already has `addEquipmentSchema`; create
  `removeEquipmentSchema` if needed.
- `src/lib/db/queries.ts` — `getGangByOwnerId` already brings
  `fighter.equipment`; reuse.

**Risks.** Authorisation (do not equip another gang's fighter) — reuse
`fighterBelongsToGang`. Deleting orphan `equipment` vs. shared: today each item
is its own row per fighter, so it can be safely deleted.

**Acceptance criteria.**
- Player adds/removes item; Rating and Wealth update immediately.
- Player cannot modify another gang's fighter (test the action directly).
- Items appear listed under each fighter.

---

## 2. Stash management (credits + stored equipment) ✅ COMPLETED

**Goal.** Correctly reflect **Wealth** (= Rating + Stash). Today `stash_credits`
exists and `stash_item` is in the schema, but there is no UI to interact with it.

**Expected behaviour.**
- Player sees the Stash (credits + stored items) in `/player`.
- Actions: adjust Stash credits (post-battle rewards), add/remove item to Stash,
  and **move item from Stash to a fighter** (and vice-versa).

**Likely files.**
- `src/app/player/actions.ts` — `setStashCredits`, `addStashItem`,
  `removeStashItem`, `equipFromStash` (transaction: removes from `stash_item`,
  creates `fighter_equipment`).
- `src/lib/validation.ts` — stash schemas.
- `src/components/player/StashPanel.tsx` (new).
- `src/app/player/page.tsx` — Stash panel.
- `src/lib/db/mutations.ts` — transaction helper to move item; `recalcGangScores`.

**Risks.** Consistency (moving item must be atomic — use Drizzle `db.transaction`).
Wealth depends on `stash_item.qty * equipment.cost` — check `gangWealth`
(already implemented).

**Acceptance criteria.**
- Changing Stash credits/items changes Wealth (not Rating).
- Moving an item Stash→fighter increases Rating and removes it from Stash;
  Wealth constant.
- Operations restricted to the player's own gang.

---

## 3. Fighter lifecycle + Downtime steps ✅ COMPLETED

**Goal.** Support fighter statuses (active/in_recovery/injured/captured/dead),
XP/advances, and the campaign's Downtime steps.

**Expected behaviour.**
- Player/admin changes fighter status and XP; dead fighters do not count in
  Rating (already handled in `gangRating`).
- Admin, when advancing to/from the Downtime phase, triggers the steps: clear
  "In Recovery", return captured fighters, etc. (see PLANO-TECNICO Appendix A;
  Core Rulebook p.164+ via assistant).
- "Captured": record `captured_by_gang_id`.

**Likely files.**
- `src/app/player/actions.ts` — `updateFighterStatus`, `addFighterXp`.
- `src/app/admin/campaign/actions.ts` — `applyDowntime(campaignId)` (clears
  recovery, returns captured fighters) triggered on entering cycle 4.
- `src/lib/validation.ts` — schemas.
- `src/app/player/page.tsx` — status/XP controls per fighter.
- `src/lib/db/mutations.ts` — `applyDowntimeEffects`.

**Risks.** Downtime rules are detailed; start with the essentials (recovery +
captured) and iterate. Recalculate Rating when status changes (dead fighters
leave).

**Acceptance criteria.**
- Marking a fighter as `dead` reduces the Rating; `in_recovery` is reset on
  Downtime.
- XP persists and appears in the roster.
- Capture records the capturing gang.

---

## 4. Admin: initial Sympathiser assignment ✅ COMPLETED

**Goal.** Allow the Arbitrator to manually set/adjust who controls each
Sympathiser (currently only changes via challenge resolution; the initial state
comes from the seed).

**Expected behaviour.**
- In `/admin/campaign`, a section lists the 26 Sympathisers with the current
  controller and a selector to reassign (or "free").
- Reassigning uses `setSympathiserController` (ends current control, creates a
  new one).

**Likely files.**
- `src/app/admin/campaign/actions.ts` — `assignSympathiser(formData)`
  (`requireAdmin`, validates sympathiserId ∈ catalogue, gangId ∈ campaign or
  empty).
- `src/components/admin/SympathiserAssignForm.tsx` (new).
- `src/app/admin/campaign/page.tsx` — assignment section.
- `src/lib/validation.ts` — `assignSympathiserSchema`.

**Risks.** Keep history consistent (`is_current`). For "free", either insert a
control with `gangId = null` or just end the current one (decision: ending
without inserting is cleaner).

**Acceptance criteria.**
- Admin reassigns a Sympathiser; landing and map reflect it immediately.
- Marking as "free" removes the controller.
- Non-admin cannot access.

---

## 5. Triumphs and campaign closure ✅ COMPLETED

**Goal.** Close the campaign loop: at the end (cycle 7), the Arbitrator awards
**Triumphs** (table `triumph` already exists) and the campaign can be marked as
finished.

**Expected behaviour.**
- In `/admin/campaign`, when `currentCycle === totalCycles`, a "Closure" section
  appears: award Triumphs (title + gang) and a "Close campaign" button (changes
  `campaign.status` to `finished`).
- The public landing shows the Triumphs and a "Campaign closed" badge.

**Likely files.**
- `src/app/admin/campaign/actions.ts` — `awardTriumph`, `finishCampaign`.
- `src/lib/db/queries.ts` — `listTriumphs(campaignId)`.
- `src/lib/repo.ts` + `src/types/index.ts` — include `triumphs` in `PublicView`.
- `src/components/admin/AwardTriumphForm.tsx` (new).
- `src/components/Triumphs.tsx` (new, landing) + `src/app/page.tsx`.

**Risks.** `getActiveCampaign` filters `status = "active"`; on closure, the
landing/admin that depend on it need to handle a `finished` campaign (show result
instead of active panel).

**Acceptance criteria.**
- Admin awards Triumphs and closes; landing shows the result.
- Once closed, the challenge panel is read-only.

---

## 6. AI assistant improvements ✅ COMPLETED

**Goal.** Increase precision (cross-lingual search) and usability of sources.

**Expected behaviour.**
- **Query expansion EN→EN:** before searching, translate/expand the key terms of
  the question to English (cheap Claude call or a simple dictionary) and embed
  the EN version (or both, merging results). Improves recall over English text.
- **Clickable sources panel:** instead of text only, attach the retrieved chunks
  (book, page, similarity) as structured data and render a "Sources" block below
  the response.

**Likely files.**
- `src/lib/ai/retrieval.ts` — optional `expandQuery()`; merge results from two
  searches (deduplicate by content).
- `src/app/api/assistant/route.ts` — use `StreamData`/`appendMessageAnnotation`
  from AI SDK v4 to send sources; keep the text fallback.
- `src/components/assistant/RulesChat.tsx` — read `message.annotations` and
  render the sources panel.

**Risks.** The `StreamData` wiring is not testable in the sandbox — validate via
`tsc` against the real AI SDK types and test manually. Query expansion adds
latency/cost (minimal at current volume). Do not break the already-working text
fallback.

**Acceptance criteria.**
- An English question about a specific rule (e.g.: "Web trait") returns the
  definition with the correct book+page.
- Each response displays the consulted sources in a structured way.

---

## 7. Export gang sheet as PDF ✅ COMPLETED

**Goal.** Generate a printable PDF of the gang (roster, costs, Rating/Wealth)
for use at the table.

**Expected behaviour.**
- "Export PDF" button in `/player` (and admin per gang). Generates the PDF on
  the server and triggers a download.

**Likely files.**
- `src/app/player/export/route.ts` (Route Handler `GET` returning the PDF) or a
  Server Action returning a blob.
- `src/lib/pdf/gangSheet.ts` — PDF assembly.
- Dependency: evaluate `@react-pdf/renderer` or `pdf-lib` (no native binaries;
  be careful with bundle/edge — use Node runtime).

**Risks.** PDF libraries can be heavy/edge-incompatible — pin `runtime = "nodejs"`
on the route. Accents/fonts in the PDF.

**Acceptance criteria.**
- Download a readable PDF with the roster and correct totals.
- Only owner/admin can export the gang.

---

## 8. PWA (installable and offline-friendly) ✅ COMPLETED

**Goal.** Allow installing the app on phone/tablet and consulting basic data even
with a poor connection at the game table.

**Expected behaviour.**
- Manifest + icons; service worker caching the player's pages and assets.
- Gang/roster lookup works offline (last cached state).

**Likely files.**
- `src/app/manifest.ts` (Next Metadata) + icons in `public/`.
- Service worker (e.g.: `@serwist/next` or `next-pwa`) — evaluate compatibility
  with Next 16.
- Adjustments in `layout.tsx` (PWA metadata).

**Risks.** SW + App Router require care; authenticated data must not be cached
inadvertently. Choose a lib compatible with Next 16.

**Acceptance criteria.**
- App installable (Lighthouse PWA).
- Roster visible offline after a prior visit; mutations require network (degrade
  with a clear message).

---

## 9. SEO and Lighthouse audit (public section) ✅ COMPLETED

**Goal.** Maximise discoverability and quality of the landing (target: 95+ in all
4 categories).

**Expected behaviour.**
- `sitemap.xml`, `robots.txt`, Open Graph/Twitter, JSON-LD; optimised images;
  green Core Web Vitals.

**Likely files.**
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`.
- Metadata adjustments in `layout.tsx`/`page.tsx`.

**Risks.** Only the landing should be indexable; `/admin` and `/player` stay
`noindex` (and are already protected). Ensure that `dynamic` on the landing does
not tank metrics — consider ISR where possible.

**Acceptance criteria.**
- Lighthouse 95+ on Performance/Accessibility/Best Practices/SEO on the landing.
- `sitemap.xml` and `robots.txt` valid; OG renders on share.

---

## 10. Hardening: integration tests, durable rate limit, observability

**Goal.** Production robustness and a quality signal in the portfolio.

**Expected behaviour.**
- Tests for Server Actions (account creation, challenge→control transfer, Rating
  recalculation) — ideally with ephemeral Postgres (Testcontainers/PGlite).
- Durable rate limit for multi-instance serverless (replace in-memory with
  **Upstash Ratelimit**) on `/api/assistant`.
- Basic logging/observability (AI errors, auth failures).

**Likely files.**
- `tests/` — new integration tests.
- `src/lib/ai/rate-limit.ts` — optional Upstash backend (in-memory fallback in
  dev).
- `src/app/api/assistant/route.ts` — use the new rate limiter.

**Risks.** Integration tests require a database; choose PGlite (no container) to
run in CI. Upstash adds env/infra (free tier available).

**Acceptance criteria.**
- `npm test` covers the critical write flows.
- Rate limit works consistently in a serverless environment.

---

## Prioritisation notes

- **1–3** complete the *core loop* of gang management (equip, stash, lifecycle)
  — highest value for real use and dependencies of other features.
- **4–5** close the **campaign mechanics** (manual Sympathisers + closure).
- **6** is high portfolio value (AI) and can be done at any time after 1.
- **7–9** are polish/delivery (PDF, PWA, SEO).
- **10** is hardening; do before publicly sharing the project.

Suggested execution: one feature per iteration, always finishing with `tsc`,
tests, and (if schema/ingestion was touched) `db:push` / `rules:ingest`.
