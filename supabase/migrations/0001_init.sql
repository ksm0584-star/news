-- 뉴스노트: per-user scraps ("records") and retrospective comparisons ("reflections").
-- Run this once in the Supabase SQL Editor (or via `supabase db push` if you use the CLI).

create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  sector text not null,
  image_url text,
  source_type text not null check (source_type in ('internal', 'external')),
  article_id text,
  url text,
  thought text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Same user can't scrap the same internal article, or the same external URL, twice.
create unique index if not exists records_user_article_unique
  on public.records (user_id, article_id)
  where article_id is not null;

create unique index if not exists records_user_url_unique
  on public.records (user_id, url)
  where url is not null;

create index if not exists records_user_id_idx on public.records (user_id);
create index if not exists records_user_sector_idx on public.records (user_id, sector);

alter table public.records enable row level security;

create policy "records_select_own" on public.records
  for select using (auth.uid() = user_id);

create policy "records_insert_own" on public.records
  for insert with check (auth.uid() = user_id);

create policy "records_update_own" on public.records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "records_delete_own" on public.records
  for delete using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists records_set_updated_at on public.records;
create trigger records_set_updated_at
  before update on public.records
  for each row execute function public.set_updated_at();

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  record_id uuid not null references public.records (id) on delete cascade,
  compared_record_id uuid not null references public.records (id) on delete cascade,
  result text not null check (result in ('same', 'changed', 'unsure')),
  created_at timestamptz not null default now()
);

create index if not exists reflections_user_id_idx on public.reflections (user_id);
create index if not exists reflections_record_id_idx on public.reflections (record_id);
create index if not exists reflections_compared_record_id_idx on public.reflections (compared_record_id);

alter table public.reflections enable row level security;

create policy "reflections_select_own" on public.reflections
  for select using (auth.uid() = user_id);

create policy "reflections_insert_own" on public.reflections
  for insert with check (auth.uid() = user_id);

create policy "reflections_delete_own" on public.reflections
  for delete using (auth.uid() = user_id);
