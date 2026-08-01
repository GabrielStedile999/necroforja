-- Fighter portrait (issue #63) — additive migration.
-- Run once against the database (SQL editor or `npm run db:push`).
-- The object itself lives in the public `gallery` bucket under the
-- `fighter/` prefix; no new bucket and no RLS change needed.

alter table fighter add column if not exists avatar_path text;
