-- TeenLaunch tiers, healthy weekly streaks, rewards and experience journal.
create table if not exists public.experience_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  caption text not null default '' check (char_length(caption) <= 1000),
  event_date date not null,
  image_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists experience_posts_user_date_idx
  on public.experience_posts(user_id, event_date desc, created_at desc);

alter table public.experience_posts enable row level security;
drop policy if exists "Users view own experience posts" on public.experience_posts;
create policy "Users view own experience posts" on public.experience_posts for select using (auth.uid() = user_id);
drop policy if exists "Users create own experience posts" on public.experience_posts;
create policy "Users create own experience posts" on public.experience_posts for insert with check (auth.uid() = user_id);
drop policy if exists "Users delete own experience posts" on public.experience_posts;
create policy "Users delete own experience posts" on public.experience_posts for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('experience-photos', 'experience-photos', true, 4194304, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 4194304, allowed_mime_types = excluded.allowed_mime_types;
