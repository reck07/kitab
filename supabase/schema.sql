-- Kitāb — run this in Supabase Dashboard → SQL Editor

-- 1) Notes table
create table if not exists public.notes (
  id bigint primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text default '',
  content text default '',
  "isPinned" boolean default false,
  "isFavorite" boolean default false,
  "isArchived" boolean default false,
  tags text[] default '{}',
  folder text default '',
  "paperStyle" text default 'ruled',
  "fontSize" text default '17px',
  "coverImage" text,
  position integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.notes enable row level security;

drop policy if exists "Users read own notes" on public.notes;
drop policy if exists "Users insert own notes" on public.notes;
drop policy if exists "Users update own notes" on public.notes;
drop policy if exists "Users delete own notes" on public.notes;

create policy "Users read own notes"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Users insert own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Users update own notes"
  on public.notes for update
  using (auth.uid() = user_id);

create policy "Users delete own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- 2) Realtime (optional — enables multi-tab sync)
alter publication supabase_realtime add table public.notes;

-- 3) Storage bucket `images` (public read, authenticated upload)
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read images" on storage.objects;
drop policy if exists "Auth upload images" on storage.objects;
drop policy if exists "Auth update own images" on storage.objects;
drop policy if exists "Auth delete own images" on storage.objects;

create policy "Public read images"
  on storage.objects for select
  using (bucket_id = 'images');

create policy "Auth upload images"
  on storage.objects for insert
  with check (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "Auth update images"
  on storage.objects for update
  using (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "Auth delete images"
  on storage.objects for delete
  using (bucket_id = 'images' and auth.role() = 'authenticated');
