-- Medical Escort & fighter promotions (issue #84) — ADDITIVE migration,
-- safe on production. Run in the Supabase SQL editor (never db:push).
--
-- Promotions (Ganger → Specialist, Specialist → Champion) ride the
-- fighter_advancement machinery from issue #71 as a third kind; the
-- promotion label is stored in skill_name. Medical Escort needs no schema:
-- it is a conditional Stash debit + fighter status change.

alter type advancement_kind add value if not exists 'promotion';
