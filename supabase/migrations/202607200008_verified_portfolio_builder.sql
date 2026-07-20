-- Verified Portfolio Builder (additive and non-destructive).
alter table public.registrations
  add column if not exists completion_date date,
  add column if not exists completion_verified boolean not null default false,
  add column if not exists certificate_url text,
  add column if not exists completion_badge text,
  add column if not exists verified_skills text[] not null default '{}',
  add column if not exists admin_remarks text;

alter table public.registrations drop constraint if exists registrations_status_check;
alter table public.registrations add constraint registrations_status_check
  check (status in ('saved','registered','cancelled','pending','shortlisted','accepted','rejected','attended','completed'));

create table if not exists public.portfolio_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,50}$'),
  introduction text,
  personal_description text,
  contact_links jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  registration_id uuid not null references public.registrations(id) on delete cascade,
  is_published boolean not null default false,
  position integer not null default 0,
  user_description text,
  reflection text,
  skills_learned text[] not null default '{}',
  evidence_urls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolio_items_user_registration_unique unique (user_id, registration_id)
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text,
  skills text[] not null default '{}',
  evidence_urls jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_items_user_position_idx on public.portfolio_items(user_id, position);
create index if not exists portfolio_projects_user_position_idx on public.portfolio_projects(user_id, position);
alter table public.portfolio_profiles enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.portfolio_projects enable row level security;

drop policy if exists "Users manage own portfolio profile" on public.portfolio_profiles;
create policy "Users manage own portfolio profile" on public.portfolio_profiles for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Public can view published portfolio profiles" on public.portfolio_profiles;
create policy "Public can view published portfolio profiles" on public.portfolio_profiles for select to anon, authenticated
using (is_public = true);

drop policy if exists "Users manage own portfolio items" on public.portfolio_items;
create policy "Users manage own portfolio items" on public.portfolio_items for all to authenticated
using (user_id = auth.uid()) with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.registrations r
    where r.id = portfolio_items.registration_id
      and r.user_id = auth.uid()
      and r.status = 'completed'
      and r.completion_verified = true
  )
);
drop policy if exists "Public can view published portfolio items" on public.portfolio_items;
create policy "Public can view published portfolio items" on public.portfolio_items for select to anon, authenticated
using (is_published = true and exists (select 1 from public.portfolio_profiles p where p.user_id = portfolio_items.user_id and p.is_public = true));

drop policy if exists "Users manage own portfolio projects" on public.portfolio_projects;
create policy "Users manage own portfolio projects" on public.portfolio_projects for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Public can view published portfolio projects" on public.portfolio_projects;
create policy "Public can view published portfolio projects" on public.portfolio_projects for select to anon, authenticated
using (is_published = true and exists (select 1 from public.portfolio_profiles p where p.user_id = portfolio_projects.user_id and p.is_public = true));

drop trigger if exists set_portfolio_profiles_updated_at on public.portfolio_profiles;
create trigger set_portfolio_profiles_updated_at before update on public.portfolio_profiles for each row execute function public.set_updated_at();
drop trigger if exists set_portfolio_items_updated_at on public.portfolio_items;
create trigger set_portfolio_items_updated_at before update on public.portfolio_items for each row execute function public.set_updated_at();
drop trigger if exists set_portfolio_projects_updated_at on public.portfolio_projects;
create trigger set_portfolio_projects_updated_at before update on public.portfolio_projects for each row execute function public.set_updated_at();
