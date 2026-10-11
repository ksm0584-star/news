-- 모아요: 서비스 평가(별점 + 의견) 저장.
-- Not run automatically — review and run yourself in the Supabase SQL
-- Editor (same process as 0001_init.sql / 0006_economic_terms_cache.sql).
-- Purely additive: creates one new table, touches nothing existing.
--
-- Logged-in and anonymous users can both submit. Anonymous submissions
-- store no identifying field at all beyond rating/comment/timestamp
-- (user_id stays null) — minimal PII by design.

create table if not exists public.app_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists app_feedback_user_id_idx on public.app_feedback (user_id);

alter table public.app_feedback enable row level security;

-- Deliberately NO select/insert/update/delete policy, and NO grant to
-- anon/authenticated at all — not even the submitter can read this back
-- through the browser client. The only writer is /api/feedback, using the
-- service_role key (which bypasses RLS and grants entirely), never a
-- browser-held anon/authenticated session. Same server-only-write model
-- 0006_economic_terms_cache.sql uses, minus even the select grant that
-- table has — that one is a public cache meant to be read back; feedback
-- is one-way and must never be client-readable by anyone.
