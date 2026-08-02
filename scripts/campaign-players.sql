-- Campaign participation flag (issue #66 follow-up) — additive migration.
-- Run once against the database (SQL editor).
-- A gang with is_active = false sits out of the campaign: it leaves the
-- public ranking and the challenge/Sympathiser options, but keeps its data
-- and can be re-activated at any time from /admin/campaign.

alter table gang add column if not exists is_active boolean not null default true;
