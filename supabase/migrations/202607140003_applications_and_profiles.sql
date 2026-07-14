-- Application forms and social profile fields (additive migration).
alter table public.user_profiles
  add column if not exists username text,
  add column if not exists profile_picture_url text,
  add column if not exists phone_number text,
  add column if not exists portfolio_url text;

create unique index if not exists user_profiles_username_unique_idx
  on public.user_profiles (lower(username)) where username is not null;

alter table public.user_profiles drop constraint if exists user_profiles_username_format_check;
alter table public.user_profiles add constraint user_profiles_username_format_check
  check (username is null or username ~ '^[A-Za-z0-9_.]{3,30}$');

alter table public.registrations
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists phone_number text,
  add column if not exists date_of_birth date,
  add column if not exists school_name text,
  add column if not exists education_level text,
  add column if not exists portfolio_url text,
  add column if not exists resume_url text,
  add column if not exists motivation text,
  add column if not exists relevant_experience text,
  add column if not exists additional_comments text;

alter table public.registrations drop constraint if exists registrations_status_check;
alter table public.registrations alter column status set default 'pending';
alter table public.registrations add constraint registrations_status_check
  check (status in ('saved','registered','completed','cancelled','pending','shortlisted','accepted','rejected'));

create table if not exists public.user_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_follows_not_self check (follower_id <> following_id),
  constraint user_follows_unique unique (follower_id, following_id)
);

create index if not exists user_follows_follower_idx on public.user_follows(follower_id);
create index if not exists user_follows_following_idx on public.user_follows(following_id);
alter table public.user_follows enable row level security;

drop policy if exists "Authenticated users can view follows" on public.user_follows;
create policy "Authenticated users can view follows" on public.user_follows
for select to authenticated using (true);
drop policy if exists "Users can follow from own account" on public.user_follows;
create policy "Users can follow from own account" on public.user_follows
for insert to authenticated with check (follower_id = auth.uid());
drop policy if exists "Users can unfollow from own account" on public.user_follows;
create policy "Users can unfollow from own account" on public.user_follows
for delete to authenticated using (follower_id = auth.uid());
