-- NewsNote: adds a 4th reflection result value, "비교하기 어려워요"
-- (hard_to_compare). Safe/additive — only widens an existing CHECK
-- constraint; no rows are touched. Not run automatically — review and run
-- yourself in the Supabase SQL Editor.

-- If the constraint name below doesn't match what's actually in your
-- database (Postgres names an inline column CHECK as
-- <table>_<column>_check by default, which is what 0001_init.sql's
-- `result text not null check (...)` should have produced), find the
-- real name first with:
-- select conname from pg_constraint where conrelid = 'public.reflections'::regclass and contype = 'c';

alter table public.reflections
  drop constraint if exists reflections_result_check;

alter table public.reflections
  add constraint reflections_result_check
  check (result in ('same', 'changed', 'unsure', 'hard_to_compare'));
