-- Gang allegiances (issue #82) — ADDITIVE migration, safe on production.
-- Run in the Supabase SQL editor (never db:push against the prod database).
--
-- Declared side in the Succession Campaign's civil war. Gangs are born
-- Unaligned; every change is logged append-only in allegiance_change.
-- challenge.winner_allegiance snapshots the winner's side AT RESOLUTION
-- TIME, so the Champion Triumph counts never drift when a gang re-declares.

do $$ begin
  create type gang_allegiance as enum ('unaligned', 'imperial_house', 'rebellion');
exception
  when duplicate_object then null;
end $$;

alter table gang
  add column if not exists allegiance gang_allegiance not null default 'unaligned';

alter table challenge
  add column if not exists winner_allegiance gang_allegiance;

create table if not exists allegiance_change (
  id uuid primary key default gen_random_uuid(),
  gang_id uuid not null references gang(id) on delete cascade,
  allegiance gang_allegiance not null,
  cycle smallint not null,
  created_at timestamp not null default now()
);

create index if not exists allegiance_change_gang_idx
  on allegiance_change (gang_id, created_at);
