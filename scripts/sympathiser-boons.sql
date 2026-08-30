-- Sympathiser Boons (issue #85) — ADDITIVE migration, safe on production.
-- Run in the Supabase SQL editor (never db:push against the prod database).
--
-- sympathiser_boon: REWRITTEN boon summaries (keyword_rule IP pattern) —
-- populated only via the admin paste-import from a private gitignored
-- JSON; the public repo carries no rule prose.
--
-- sympathiser_income: append-only ledger of credits collected from a
-- controlled Sympathiser. UNIQUE (gang, sympathiser, cycle) is the
-- one-shot guard against double collection.
--
-- home_support_recruit: guard for the Spark-phase free Ganger (Home
-- Support, table roll 2D6 >= 10) — UNIQUE (gang, cycle).

create table if not exists sympathiser_boon (
  id uuid primary key default gen_random_uuid(),
  sympathiser_id text not null unique references sympathiser(id) on delete cascade,
  summary text not null,
  updated_at timestamp not null default now()
);

create table if not exists sympathiser_income (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaign(id) on delete cascade,
  gang_id uuid not null references gang(id) on delete cascade,
  sympathiser_id text not null references sympathiser(id) on delete cascade,
  cycle smallint not null,
  amount integer not null,
  created_at timestamp not null default now(),
  constraint sympathiser_income_gang_symp_cycle_uq unique (gang_id, sympathiser_id, cycle)
);

create index if not exists sympathiser_income_campaign_idx
  on sympathiser_income (campaign_id, created_at);

create table if not exists home_support_recruit (
  id uuid primary key default gen_random_uuid(),
  gang_id uuid not null references gang(id) on delete cascade,
  cycle smallint not null,
  fighter_id uuid references fighter(id) on delete set null,
  created_at timestamp not null default now(),
  constraint home_support_recruit_gang_cycle_uq unique (gang_id, cycle)
);
