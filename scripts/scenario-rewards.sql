-- Scenario catalogue with preset rewards (issue #87) — ADDITIVE migration,
-- safe on production. Run in the Supabase SQL editor (never db:push).
--
-- challenge.scenario_id: catalogue id (src/lib/data/scenarios.ts) when the
-- scenario matches an entry; null for free-text/legacy rows (the display
-- string stays in challenge.scenario).
--
-- challenge.rewards_applied_at: when the scenario's standard rewards were
-- applied through the aftermath log — null = not yet. The conditional
-- UPDATE on `is null` is the one-shot guard.

alter table challenge
  add column if not exists scenario_id text;

alter table challenge
  add column if not exists rewards_applied_at timestamp;
