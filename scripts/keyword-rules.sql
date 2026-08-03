-- Keyword rules glossary (issue #67 follow-up) — ADDITIVE migration.
-- Run in the Supabase SQL editor (never db:push against the prod database).
--
-- Stores the clickable trait/keyword summaries shown in the catalogue and
-- equipment forms. IP strategy for the public repository: the summaries are
-- rewritten in our own wording (function preserved, no book prose) and live
-- ONLY in this private table — the repo ships no rule content. Population
-- happens from /admin/catalog (JSON paste-import or manual CRUD).

create table if not exists keyword_rule (
  id uuid primary key default gen_random_uuid(),
  keyword text not null unique,
  summary text not null,
  book text,
  page integer,
  updated_at timestamp not null default now()
);
