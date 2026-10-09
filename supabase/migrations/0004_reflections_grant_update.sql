-- NewsNote: fixes `permission denied for table reflections` (Postgres
-- code 42501) on UPDATE.
--
-- That error code is a TABLE-level privilege failure, not a row-level RLS
-- denial — if RLS were simply missing a matching policy, an UPDATE would
-- just affect zero rows, not raise "permission denied for table". So the
-- `authenticated` role is missing the base UPDATE grant on this table (it
-- already has SELECT/INSERT/DELETE, since those visibly work). This file
-- grants only that missing privilege, plus (idempotently) re-affirms the
-- RLS UPDATE policy so both layers are definitely in place together — RLS
-- stays enabled; this does not disable it or grant anything beyond UPDATE,
-- and it never touches the service_role key or any data.
--
-- Not run automatically — review and run yourself in the Supabase SQL
-- Editor. Safe to run even if parts of this were already applied
-- (0002_reflections_update_and_dedupe.sql's Step 1): every statement here
-- is idempotent.

grant update on public.reflections to authenticated;

drop policy if exists "reflections_update_own" on public.reflections;
create policy "reflections_update_own" on public.reflections
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
