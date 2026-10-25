-- 지금 주목할 뉴스: admin-curated economic-issue keywords matched against
-- already-collected RSS articles (see src/lib/hot-news-matching.ts),
-- refreshed once daily by the Vercel Cron job at /api/cron/hot-news
-- (08:00 KST = 23:00 UTC, see vercel.json). This is NOT a view-count or
-- popularity ranking — the admin manually judges what's worth highlighting
-- each day.
-- Run this once in the Supabase SQL Editor (or via `supabase db push`).

-- Admin-curated keywords. No RLS policy below grants anon/authenticated
-- access, so this table has no application-level read or write path at
-- all — every access goes through either the service-role client
-- (src/lib/supabase/admin.ts, used only by the cron route) or the
-- Supabase Studio Table Editor directly. That IS the entire "admin
-- management UI" for this MVP, per the project instructions not to build
-- a separate admin page — see the project report for exact row-editing
-- steps (등록/수정/삭제, 우선순위 지정 — all plain table-editor row edits).
create table if not exists public.hot_news_keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  -- Lower number = processed first = higher priority. Ties are broken by
  -- created_at (earlier registration wins) — see selectHotNews in
  -- src/lib/hot-news-matching.ts.
  priority integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hot_news_keywords_priority_idx
  on public.hot_news_keywords (priority, created_at);

alter table public.hot_news_keywords enable row level security;
-- Deliberately zero policies: enabling RLS with no policies denies all
-- access to anon/authenticated roles by default. Only the service-role key
-- (which bypasses RLS entirely) can read or write this table.

drop trigger if exists hot_news_keywords_set_updated_at on public.hot_news_keywords;
create trigger hot_news_keywords_set_updated_at
  before update on public.hot_news_keywords
  for each row execute function public.set_updated_at();

-- The frozen daily result the cron job writes and the home screen reads.
-- `effective_date` is the KST calendar date this result is "for" (computed
-- by the cron job via src/lib/kst-date.ts, not by Postgres `now()`, to get
-- the UTC→KST day-rollover right). GET /api/hot-news only ever reads
-- today's KST date's rows — never an older date — so a cron failure or a
-- day with zero keyword matches simply means no rows for today, and the
-- home screen section hides itself rather than ever showing yesterday's
-- picks as if they were today's.
create table if not exists public.hot_news_daily (
  id uuid primary key default gen_random_uuid(),
  effective_date date not null,
  rank_order integer not null,
  keyword text not null,
  title text not null,
  url text not null,
  press text not null,
  sector text not null,
  published_at timestamptz not null,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists hot_news_daily_effective_date_idx
  on public.hot_news_daily (effective_date, rank_order);

alter table public.hot_news_daily enable row level security;

-- Public read: this is the same kind of non-sensitive public content as
-- the RSS-backed home feed (GET /api/news) — every visitor, logged in or
-- not, sees the same picks.
create policy "hot_news_daily_select_all" on public.hot_news_daily
  for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policy for anon/authenticated — only the
-- service-role cron job (src/app/api/cron/hot-news/route.ts) writes here,
-- same lockdown reasoning as hot_news_keywords above.
