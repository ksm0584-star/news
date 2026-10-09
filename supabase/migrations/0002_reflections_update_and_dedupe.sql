-- NewsNote: fixes the 회고(reflection) duplicate-save bug.
-- This file is NOT run automatically — review it, then run it yourself in
-- the Supabase SQL Editor (same process as 0001_init.sql).

-- =============================================================
-- STEP 1 (REQUIRED) — allow updating a reflection you own.
-- =============================================================
-- There was never an UPDATE policy on public.reflections (only
-- select/insert/delete), so the app's new updateReflection() call will
-- fail with a permission error until this runs. Purely additive — no data
-- is touched.
drop policy if exists "reflections_update_own" on public.reflections;
create policy "reflections_update_own" on public.reflections
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =============================================================
-- STEP 2 (RECOMMENDED, REVIEW FIRST) — clean up existing duplicates, then
-- prevent new ones at the DB level.
-- =============================================================
-- The app-level fix (saveReflection now updates an existing row instead of
-- inserting) stops NEW duplicates regardless of whether you run this. This
-- step only matters if you already have duplicate rows from before the fix,
-- or want the DB itself to guarantee it (defense in depth, e.g. against a
-- direct SQL insert bypassing the app).
--
-- Run this SELECT first to see exactly which rows would be deleted — for
-- each (record_id, compared_record_id) pair, every row except the most
-- recently created one:
--
-- select * from public.reflections r
-- where exists (
--   select 1 from public.reflections r2
--   where r2.record_id = r.record_id
--     and r2.compared_record_id = r.compared_record_id
--     and (r2.created_at, r2.id) > (r.created_at, r.id)
-- );
--
-- If that result looks right (i.e. you're OK permanently losing those
-- older duplicate rows — only the duplicates, never the one you'd keep),
-- uncomment and run the DELETE below, then the CREATE UNIQUE INDEX.

-- delete from public.reflections r
-- where exists (
--   select 1 from public.reflections r2
--   where r2.record_id = r.record_id
--     and r2.compared_record_id = r.compared_record_id
--     and (r2.created_at, r2.id) > (r.created_at, r.id)
-- );

-- create unique index if not exists reflections_record_pair_unique
--   on public.reflections (record_id, compared_record_id);
