# Changelog

All notable changes to this project. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[SemVer](https://semver.org/) versioning.

## [Unreleased]

### Changed
- **Limpeza do menu principal** (junto da issue #19): link de topo "NEWS"
  renomeado para "REPORTS"/"RELATÓRIOS" e "WORLD"/"MUNDO" para "LORE"
  (nomes iguais às páginas de destino); "Lore" e "Reports" removidos do
  mega-panel GAME — eram links duplicados para os mesmos destinos dos
  links de topo.
- **Performance/a11y da landing e code-splitting** (issue #42): arte do hero
  convertida de `public/hero.png` (1.2 MB, background-image inline) para
  WebP de 77 KB servido via `next/image` com `priority` (preload do LCP,
  srcset/AVIF automáticos); `RulesChat` (@ai-sdk/react), `SiteSearch` e o
  lightbox da galeria (extraído para `GalleryLightbox.tsx`) agora carregam
  em chunks separados sob demanda (`next/dynamic`/`React.lazy`), fora do JS
  inicial das rotas; hierarquia de headings corrigida na landing (`<h2>`
  reais em Features/News, título de report em `<h3>`) e textos decorativos
  de baixa opacidade elevados para contraste AA (≥4.5:1).
- **Landing "Dispatches" section renamed to "Reports"** (EN "Reports" /
  PT-BR "Relatórios") and now loads the 3 latest published journal posts
  from the database, each row linking to /reports/<slug>; static placeholder
  items removed from messages. Landing wrapper switched from
  `overflow-x: hidden` to `overflow-x-clip` so the SiteNav is sticky like
  on the other pages. Reports seed now covers 3 posts (Ambush at the Sump
  Gates, the retitled "Season 1 Mid-Point: The Map Redrawn", and the
  Painting the Rust proxy).
- **PDF gang sheet** redesigned: "dossier" spaced layout with NecroForja theme
  (dark header + hazard stripe, metrics in mono, fighter blocks with side band,
  equipment with line breaks, dead fighters highlighted).

### Added
- **Símbolos das gangues nos cards da landing** (issue #19): faixa de arte
  (~110px) no topo de cada card da seção "The Gangs" com o emblema da gangue
  — arte própria estilizada (stencil spray-paint), sem arte oficial da GW
  (ver issue #17). Cobertura completa: **17 símbolos** como WebP 640px em
  `src/components/gangs/symbols/` chaveados por slug do catálogo
  (`symbols.ts`, pensado para reuso no nav/página de gangues). Fallback
  defensivo (logos de marca por hash determinístico do slug, evitando
  hydration mismatch) fica disponível para gangues futuras sem arte.
- **Carrossel de jogadores da campanha na landing** (issue #18): nova seção
  "03 // THE PLAYERS" entre Gangs e Reports (Reports renumerada para 04) —
  marquee infinito em CSS puro (mesmo keyframe do Ticker, pausa no hover,
  respeita `prefers-reduced-motion`) com os jogadores ativos vindos do banco
  (`listActivePlayersPublic`: gangues cujo dono é `player` com
  `is_active = true`), cards com retrato, nome, gangue e cor da casa
  (`matchHouseSlug`), retratos como assets estáticos WebP otimizados
  (~30–58 KB) e placeholder temático para jogador sem retrato; seção some
  graciosamente com banco offline ou sem jogadores.
- **Lighthouse CI + axe-core no pipeline** (issue #42): `@lhci/cli` roda no
  job e2e contra o build de produção (home/gallery/reports/skirmish) com
  thresholds "warn" não bloqueantes (`lighthouserc.json`) e relatório por PR
  (link no log + artifact); `@axe-core/playwright` em `e2e/a11y.spec.ts`
  cobre as mesmas rotas — violações `critical` falham, demais impactos são
  logados como baseline.
- **Campaign journal** (`/reports`, issue #5): Postgres-backed posts (bilingual
  EN/PT-BR, four types: session report, chronicle, painting log, dispatch),
  public listing with client-side type filter + post page rendering Markdown
  (react-markdown/GFM), admin editor with zod-validated server actions,
  image upload to Supabase Storage (bucket `reports`, REST — no SDK), dynamic
  sitemap entries, nav/footer links and seed with the week 1 mission report.
- **Gangs page** (`/gangs`, issue #8): full dossiers of the six Great Houses
  (art, identity, playstyle, strengths/weaknesses) plus cards for the
  independent, Ash Wastes and Hive Secundus gangs, with i18n (EN/PT-BR),
  a live "In the campaign" section reading the `gang` table, and nav/landing
  links (mega-menu, mobile menu, landing cards, LoreCTA) now pointing at it.
- Player equipment and Stash management (equip/unequip, move from Stash).
- Fighter lifecycle (status/XP) and Downtime effects.
- Manual Sympathiser assignment by the Arbitrator.
- Triumphs and campaign closure.
- AI assistant improvements (retrieval) and durable rate limit (Upstash).
- PDF gang sheet export.
- PWA (installable) and SEO/Lighthouse adjustments.
- Integration tests and general hardening.

### Security
- **Pre-open-source hardening (issue #43):** `db:seed` now refuses to run
  with the default admin/player passwords whenever `DATABASE_URL` doesn't
  point at `localhost`/`127.0.0.1`, preventing an accidental seed of
  production with publicly-known credentials. Added a `LICENSE`
  (All rights reserved).

### Fixed
- `opengraph-image.tsx` no longer declares `runtime = "edge"` (the image is
  fully static, so it's now pre-rendered at build time) and loads its local
  crest asset via `fs.readFile` instead of an Edge-only `fetch(new URL(...))`
  pattern, which failed under the Node.js runtime.

> Update this section with every PR. When publishing a version, move items to a
> versioned section (e.g. `## [0.2.0] - 2026-07-01`).

## [0.1.0] - 2026-06-15

### Added
- **Phase 1:** authentication (Auth.js v5 + Argon2id), admin account creation,
  gang editing with Rating/Wealth recalculation, protected routes.
- **Phase 2:** Sympathiser challenges (registration/resolution with control
  transfer), cycle/phase advancement, Arbitrator panel, live ranking on the landing.
- **Phase 3:** AI rules assistant (RAG) — pgvector + embeddings + Claude,
  citing official book and page; `content/` ingestion.
- "Necromunda tone" visual identity and **NecroForja** brand.
