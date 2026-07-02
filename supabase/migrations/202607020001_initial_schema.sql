-- TeenLaunch initial Supabase schema
-- Uses Supabase Auth (auth.users) as the source of user identity.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.prevent_user_profile_role_change()
returns trigger
language plpgsql
as $$
begin
  if old.role is distinct from new.role
    and auth.uid() is not null
    and auth.role() <> 'service_role'
  then
    raise exception 'user profile role cannot be changed through this operation';
  end if;

  return new;
end;
$$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  avatar_url text,
  bio text,
  school_name text,
  age integer check (age is null or (age >= 10 and age <= 19)),
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  organizer text,
  location text,
  mode text check (mode is null or mode in ('online', 'in_person', 'hybrid')),
  age_min integer check (age_min is null or age_min >= 0),
  age_max integer check (age_max is null or age_max >= 0),
  deadline date,
  start_date date,
  end_date date,
  application_url text,
  image_url text,
  is_published boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunities_age_range_check check (
    age_min is null
    or age_max is null
    or age_min <= age_max
  ),
  constraint opportunities_date_range_check check (
    start_date is null
    or end_date is null
    or start_date <= end_date
  )
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  status text not null default 'saved' check (status in ('saved', 'registered', 'completed', 'cancelled')),
  notes text,
  registered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registrations_user_opportunity_unique unique (user_id, opportunity_id)
);

create table if not exists public.career_dna_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  result_title text not null,
  summary text,
  strengths jsonb not null default '[]'::jsonb,
  interests jsonb not null default '[]'::jsonb,
  recommended_paths jsonb not null default '[]'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  score jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_role_idx
  on public.user_profiles(role);

create index if not exists opportunities_category_idx
  on public.opportunities(category);

create index if not exists opportunities_deadline_idx
  on public.opportunities(deadline);

create index if not exists opportunities_is_published_idx
  on public.opportunities(is_published);

create index if not exists registrations_user_id_idx
  on public.registrations(user_id);

create index if not exists registrations_opportunity_id_idx
  on public.registrations(opportunity_id);

create index if not exists registrations_status_idx
  on public.registrations(status);

create index if not exists career_dna_results_user_id_idx
  on public.career_dna_results(user_id);

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists prevent_user_profile_role_change on public.user_profiles;
create trigger prevent_user_profile_role_change
before update on public.user_profiles
for each row
execute function public.prevent_user_profile_role_change();

drop trigger if exists set_opportunities_updated_at on public.opportunities;
create trigger set_opportunities_updated_at
before update on public.opportunities
for each row
execute function public.set_updated_at();

drop trigger if exists set_registrations_updated_at on public.registrations;
create trigger set_registrations_updated_at
before update on public.registrations
for each row
execute function public.set_updated_at();

drop trigger if exists set_career_dna_results_updated_at on public.career_dna_results;
create trigger set_career_dna_results_updated_at
before update on public.career_dna_results
for each row
execute function public.set_updated_at();

alter table public.user_profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.registrations enable row level security;
alter table public.career_dna_results enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.user_profiles;
create policy "Profiles are viewable by owner"
on public.user_profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users can create own profile" on public.user_profiles;
create policy "Users can create own profile"
on public.user_profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'user'
);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
on public.user_profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Published opportunities are readable by everyone" on public.opportunities;
create policy "Published opportunities are readable by everyone"
on public.opportunities
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Admins can manage opportunities" on public.opportunities;
create policy "Admins can manage opportunities"
on public.opportunities
for all
to authenticated
using (
  exists (
    select 1
    from public.user_profiles
    where user_profiles.id = auth.uid()
      and user_profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.user_profiles
    where user_profiles.id = auth.uid()
      and user_profiles.role = 'admin'
  )
);

drop policy if exists "Users can view own registrations" on public.registrations;
create policy "Users can view own registrations"
on public.registrations
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.user_profiles
    where user_profiles.id = auth.uid()
      and user_profiles.role = 'admin'
  )
);

drop policy if exists "Users can create own registrations" on public.registrations;
create policy "Users can create own registrations"
on public.registrations
for insert
to authenticated
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.user_profiles
    where user_profiles.id = auth.uid()
      and user_profiles.role = 'admin'
  )
);

drop policy if exists "Users can update own registrations" on public.registrations;
create policy "Users can update own registrations"
on public.registrations
for update
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.user_profiles
    where user_profiles.id = auth.uid()
      and user_profiles.role = 'admin'
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.user_profiles
    where user_profiles.id = auth.uid()
      and user_profiles.role = 'admin'
  )
);

drop policy if exists "Users can delete own registrations" on public.registrations;
create policy "Users can delete own registrations"
on public.registrations
for delete
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.user_profiles
    where user_profiles.id = auth.uid()
      and user_profiles.role = 'admin'
  )
);

drop policy if exists "Users can view own career DNA results" on public.career_dna_results;
create policy "Users can view own career DNA results"
on public.career_dna_results
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.user_profiles
    where user_profiles.id = auth.uid()
      and user_profiles.role = 'admin'
  )
);

drop policy if exists "Users can create own career DNA results" on public.career_dna_results;
create policy "Users can create own career DNA results"
on public.career_dna_results
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own career DNA results" on public.career_dna_results;
create policy "Users can update own career DNA results"
on public.career_dna_results
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete own career DNA results" on public.career_dna_results;
create policy "Users can delete own career DNA results"
on public.career_dna_results
for delete
to authenticated
using (user_id = auth.uid());
