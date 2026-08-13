-- Fighter advancements & lasting injuries (issue #71) — ADDITIVE migration,
-- safe on production. Run in the Supabase SQL editor (never db:push).
--
-- fighter_advancement: XP spent on a stat bump or recorded skill; each row
-- raises the fighter's cost by credit_increase (joins the gang Rating).
-- fighter_injury: permanent marks on the Fighter card; stat_delta is the
-- STORED-value delta actually applied after clamping, so removal reverts
-- exactly. Injuries never change the fighter's cost.

do $$ begin
  create type advancement_kind as enum ('stat_increase', 'skill');
exception
  when duplicate_object then null;
end $$;

create table if not exists fighter_advancement (
  id uuid primary key default gen_random_uuid(),
  fighter_id uuid not null references fighter(id) on delete cascade,
  kind advancement_kind not null,
  stat_key text,
  skill_name text,
  xp_cost integer not null,
  credit_increase integer not null default 0,
  created_at timestamp not null default now()
);

create index if not exists fighter_advancement_fighter_idx
  on fighter_advancement (fighter_id);

create table if not exists fighter_injury (
  id uuid primary key default gen_random_uuid(),
  fighter_id uuid not null references fighter(id) on delete cascade,
  name text not null,
  stat_key text,
  stat_delta smallint,
  notes text not null default '',
  created_at timestamp not null default now()
);

create index if not exists fighter_injury_fighter_idx
  on fighter_injury (fighter_id);
