-- Equipment catalogue (issue #67) — ADDITIVE migration, safe on production.
-- Run in the Supabase SQL editor (never db:push against the prod database).
--
-- 1. New master table for the official Trading Post catalogue, editable at
--    /admin/catalog. Weapon profile columns are text because the printed
--    tables mix numbers and symbols ("-", "S", "S+1", "+1", "4+", "E", "T″").
-- 2. Nullable equipment.catalog_id — owned gear keeps a link to the
--    catalogue entry it was bought from, but SNAPSHOTS name/cost, so later
--    catalogue edits (rebalancing) never rewrite gear a fighter already has.
--    Deleting a catalogue row keeps the owned item (set null).
--
-- The seed itself is done from the app (admin action "Seed official
-- catalogue" on /admin/catalog) — no INSERTs here.

create table if not exists equipment_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category equipment_category not null,
  subcategory text,
  cost integer not null default 0,
  range_short text,
  range_long text,
  acc_short text,
  acc_long text,
  strength text,
  ap text,
  damage text,
  ammo text,
  traits text not null default '',
  effect text not null default '',
  enabled boolean not null default true,
  created_at timestamp not null default now()
);

create index if not exists equipment_catalog_cat_idx
  on equipment_catalog (category, name);

alter table equipment
  add column if not exists catalog_id uuid
  references equipment_catalog (id) on delete set null;
