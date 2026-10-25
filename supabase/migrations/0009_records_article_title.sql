-- Adds a nullable `article_title` column to public.records, storing the
-- original article's own title separately from the user's own record
-- title (`title`). Previously there was no separate field, so the
-- connected-article banner on record detail/edit showed the user's own
-- title instead of the real headline (see project bug report). Purely
-- additive: existing rows get NULL, nothing is backfilled or altered.
-- Run this once in the Supabase SQL Editor (or via `supabase db push`).
alter table public.records
  add column if not exists article_title text;
