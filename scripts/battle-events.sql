-- Battle aftermath log (issue #69) — ADDITIVE migration, safe on production.
-- Run in the Supabase SQL editor (never db:push against the prod database).
--
-- Append-only record of what a resolved challenge did to gangs and fighters
-- (credits, XP, injuries, deaths, captures, reputation). Rows are never
-- edited or deleted; corrections are compensating events (e.g. a negative
-- credits_gained). Effects are applied by applyBattleEvent in the same
-- transaction that inserts the row.

do $$ begin
  create type battle_event_kind as enum (
    'credits_gained',
    'xp_gained',
    'fighter_injured',
    'fighter_dead',
    'fighter_captured',
    'reputation_change'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists battle_event (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenge(id) on delete cascade,
  -- gang the event applies to (must be a participant of the challenge)
  gang_id uuid not null references gang(id) on delete cascade,
  kind battle_event_kind not null,
  -- fighter kinds only (xp/injured/dead/captured); kept on fighter removal
  fighter_id uuid references fighter(id) on delete set null,
  -- credits/XP/reputation delta; null for status kinds; negative = compensation
  amount integer,
  notes text not null default '',
  created_at timestamp not null default now()
);

create index if not exists battle_event_challenge_idx
  on battle_event (challenge_id, created_at);
