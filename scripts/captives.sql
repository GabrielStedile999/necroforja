-- Full captive flow (issue #86) — ADDITIVE migration, safe on production.
-- Run in the Supabase SQL editor (never db:push against the prod database).
--
-- captive_event: append-only audit of what a captor did with a held
-- captive (sold to the Guilders / ransomed back / released), written in
-- the same transaction as the effect. The fighter name is snapshotted
-- because a sale deletes the fighter row.

do $$ begin
  create type captive_event_kind as enum ('sold', 'ransomed', 'released');
exception
  when duplicate_object then null;
end $$;

create table if not exists captive_event (
  id uuid primary key default gen_random_uuid(),
  captor_gang_id uuid not null references gang(id) on delete cascade,
  owner_gang_id uuid not null references gang(id) on delete cascade,
  fighter_id uuid references fighter(id) on delete set null,
  fighter_name text not null,
  kind captive_event_kind not null,
  amount integer not null default 0,
  notes text not null default '',
  created_at timestamp not null default now()
);

create index if not exists captive_event_captor_idx
  on captive_event (captor_gang_id, created_at);
