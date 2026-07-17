# Changelog

All notable changes to this project. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[SemVer](https://semver.org/) versioning.

## [Unreleased]

### Changed
- **PDF gang sheet** redesigned: "dossier" spaced layout with NecroForja theme
  (dark header + hazard stripe, metrics in mono, fighter blocks with side band,
  equipment with line breaks, dead fighters highlighted).

### Added
- **Campaign journal** (`/blog`, issue #5): Postgres-backed posts (bilingual
  EN/PT-BR, four types: session report, chronicle, painting log, dispatch),
  public listing with client-side type filter + post page rendering Markdown
  (react-markdown/GFM), admin editor with zod-validated server actions,
  image upload to Supabase Storage (bucket `blog`, REST — no SDK), dynamic
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
