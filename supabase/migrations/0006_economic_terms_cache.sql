-- 모아요: 경제용어사전의 공용(모든 사용자 공유) 설명 캐시.
-- Not run automatically — review and run yourself in the Supabase SQL
-- Editor (same process as 0001_init.sql). Purely additive: creates one new
-- table, touches nothing existing (economic_term_searches/records/
-- reflections are untouched).
--
-- This table holds ONLY a term and its AI-generated description — no
-- user_id, no per-user search history. Personal search history stays in
-- economic_term_searches (0005), unchanged.

create table if not exists public.economic_terms (
  id uuid primary key default gen_random_uuid(),
  normalized_term text not null unique,
  term text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists economic_terms_set_updated_at on public.economic_terms;
create trigger economic_terms_set_updated_at
  before update on public.economic_terms
  for each row execute function public.set_updated_at();

alter table public.economic_terms enable row level security;

-- Readable by everyone, including anonymous users — the whole point is
-- that a cached description is reusable regardless of login state.
create policy "economic_terms_select_all" on public.economic_terms
  for select using (true);

-- Deliberately no insert/update/delete policy for anon/authenticated, and
-- no grant beyond select below — the app only ever writes to this table
-- from the server using the service_role key (which bypasses RLS and
-- grants entirely), never from a browser-held anon/authenticated session.
-- This is what makes "공용 캐시 쓰기는 서버에서만 수행" actually enforced
-- at the database level, not just by convention in application code.
grant select on public.economic_terms to anon, authenticated;
