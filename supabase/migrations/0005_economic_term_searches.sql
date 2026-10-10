-- 모아요: AI 경제용어사전 검색 기록.
-- Not run automatically — review and run yourself in the Supabase SQL
-- Editor (same process as 0001_init.sql). Purely additive: creates one new
-- table, touches nothing existing.

create table if not exists public.economic_term_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  term text not null,
  normalized_term text not null,
  description text not null,
  created_at timestamptz not null default now(),
  last_searched_at timestamptz not null default now()
);

-- One row per (user, normalized term) — re-searching the same term updates
-- this row (last_searched_at) instead of inserting a duplicate.
create unique index if not exists economic_term_searches_user_term_unique
  on public.economic_term_searches (user_id, normalized_term);

create index if not exists economic_term_searches_user_id_idx
  on public.economic_term_searches (user_id);

-- Supports "마이페이지 > 검색한 경제용어" sorted by most recently searched.
create index if not exists economic_term_searches_user_last_searched_idx
  on public.economic_term_searches (user_id, last_searched_at desc);

alter table public.economic_term_searches enable row level security;

create policy "economic_term_searches_select_own" on public.economic_term_searches
  for select using (auth.uid() = user_id);

create policy "economic_term_searches_insert_own" on public.economic_term_searches
  for insert with check (auth.uid() = user_id);

create policy "economic_term_searches_update_own" on public.economic_term_searches
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "economic_term_searches_delete_own" on public.economic_term_searches
  for delete using (auth.uid() = user_id);

-- RLS policies alone aren't always enough — 0004_reflections_grant_update.sql
-- hit "permission denied for table" on reflections because the base table
-- grant was missing even though the RLS policy existed. Granting all four
-- explicitly up front for this new table avoids hitting that same gap.
-- RLS (above) still restricts every one of these to the caller's own rows.
grant select, insert, update, delete on public.economic_term_searches to authenticated;
