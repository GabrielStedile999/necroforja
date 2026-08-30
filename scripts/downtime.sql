-- Complete Downtime (issue #83) — ADDITIVE migration, safe on production.
-- Run in the Supabase SQL editor (never db:push against the prod database).
--
-- campaign.fresh_recruitment_at: when the Downtime Fresh Recruitment credits
-- (250c per active gang) were granted — null = not yet. The grant is a
-- conditional UPDATE on `is null`, so it lands exactly once per campaign.
--
-- downtime_event: append-only log of what the Downtime sequence did
-- (fighters recovered, captives returned + captors paid, Juves/Prospects
-- promoted, Fresh Recruitment granted). Written in the same transaction as
-- the effect; feeds the Arbitrator's Downtime summary panel.

alter table campaign
  add column if not exists fresh_recruitment_at timestamp;

do $$ begin
  create type downtime_event_kind as enum (
    'fighter_recovered',
    'captive_returned',
    'captor_paid',
    'fighter_promoted',
    'fresh_recruitment'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists downtime_event (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaign(id) on delete cascade,
  cycle smallint not null,
  gang_id uuid not null references gang(id) on delete cascade,
  fighter_id uuid references fighter(id) on delete set null,
  kind downtime_event_kind not null,
  amount integer,
  notes text not null default '',
  created_at timestamp not null default now()
);

create index if not exists downtime_event_campaign_idx
  on downtime_event (campaign_id, created_at);
