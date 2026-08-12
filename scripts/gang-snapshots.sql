-- Per-cycle gang history (issue #70) — ADDITIVE migration, safe on production.
-- Run in the Supabase SQL editor (never db:push against the prod database).
--
-- One snapshot per gang per cycle, taken inside the advanceCycle transaction
-- right before the cycle increments (state at the END of that cycle) and on
-- gang creation. Upsert on (gang_id, cycle): re-running refreshes instead of
-- duplicating. Feeds the public rating-evolution chart and campaign timeline.

create table if not exists gang_snapshot (
  id uuid primary key default gen_random_uuid(),
  gang_id uuid not null references gang(id) on delete cascade,
  campaign_id uuid not null references campaign(id) on delete cascade,
  cycle smallint not null,
  rating integer not null default 0,
  wealth integer not null default 0,
  reputation integer not null default 1,
  sympathiser_count smallint not null default 0,
  created_at timestamp not null default now(),
  constraint gang_snapshot_gang_cycle_uq unique (gang_id, cycle)
);

create index if not exists gang_snapshot_campaign_idx
  on gang_snapshot (campaign_id, cycle);
