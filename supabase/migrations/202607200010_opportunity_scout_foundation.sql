-- TeenLaunch Opportunity Scout MVP foundation (additive, no external scraping/API calls).
create table if not exists public.partner_organisations (
  id uuid primary key default gen_random_uuid(),
  organisation_name text not null,
  organisation_description text,
  logo_url text,
  website_url text,
  contact_name text not null,
  contact_email text not null,
  verification_status text not null default 'pending_review'
    check (verification_status in ('pending_review','verified','rejected')),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_members (
  partner_id uuid not null references public.partner_organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null default 'editor' check (member_role in ('owner','editor')),
  created_at timestamptz not null default now(),
  primary key (partner_id, user_id)
);

alter table public.opportunities
  add column if not exists source_type text,
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists partner_id uuid references public.partner_organisations(id) on delete set null,
  add column if not exists external_id text,
  add column if not exists last_synced_at timestamptz,
  add column if not exists verification_status text,
  add column if not exists verified_by uuid references auth.users(id) on delete set null,
  add column if not exists verified_at timestamptz,
  add column if not exists expiry_date date,
  add column if not exists application_method text,
  add column if not exists internal_application_enabled boolean not null default true;

update public.opportunities set
  source_type = coalesce(source_type, 'teenlaunch'),
  source_name = coalesce(source_name, 'TeenLaunch'),
  verification_status = coalesce(verification_status, 'verified'),
  verified_at = coalesce(verified_at, created_at),
  expiry_date = coalesce(expiry_date, deadline),
  application_method = coalesce(application_method, case when application_url is null then 'internal' else 'external' end)
where source_type is null or verification_status is null or application_method is null;

-- These fixed IDs come from 202607140004_seed_demo_opportunities.sql. They are
-- development samples, not verified public listings.
update public.opportunities set
  title = case when title like '[MOCK]%' then title else '[MOCK] ' || title end,
  source_name = 'TeenLaunch demo seed [MOCK]',
  verification_status = 'draft',
  status = 'draft',
  is_published = false,
  verified_by = null,
  verified_at = null
where id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000006'
);

alter table public.opportunities alter column source_type set default 'teenlaunch';
alter table public.opportunities alter column source_type set not null;
alter table public.opportunities alter column verification_status set default 'draft';
alter table public.opportunities alter column verification_status set not null;
alter table public.opportunities alter column application_method set default 'internal';
alter table public.opportunities alter column application_method set not null;
alter table public.opportunities drop constraint if exists opportunities_source_type_check;
alter table public.opportunities add constraint opportunities_source_type_check
  check (source_type in ('teenlaunch','partner','public_manual','api'));
alter table public.opportunities drop constraint if exists opportunities_verification_status_check;
alter table public.opportunities add constraint opportunities_verification_status_check
  check (verification_status in ('draft','pending_review','verified','rejected','expired'));
alter table public.opportunities drop constraint if exists opportunities_application_method_check;
alter table public.opportunities add constraint opportunities_application_method_check
  check (application_method in ('internal','external','both'));

create unique index if not exists opportunities_source_external_unique_idx
  on public.opportunities(source_type, source_name, external_id)
  where external_id is not null;
create index if not exists opportunities_review_queue_idx
  on public.opportunities(verification_status, created_at);
create index if not exists opportunities_partner_idx on public.opportunities(partner_id);
create index if not exists partner_members_user_idx on public.partner_members(user_id);

alter table public.partner_organisations enable row level security;
alter table public.partner_members enable row level security;

drop policy if exists "Partner members view own organisation" on public.partner_organisations;
create policy "Partner members view own organisation" on public.partner_organisations for select to authenticated
using (created_by = auth.uid() or exists (select 1 from public.partner_members m where m.partner_id = id and m.user_id = auth.uid()) or exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Partner owners update own pending organisation" on public.partner_organisations;
create policy "Partner owners update own pending organisation" on public.partner_organisations for update to authenticated
using (created_by = auth.uid() and verification_status = 'pending_review')
with check (created_by = auth.uid() and verification_status = 'pending_review');
drop policy if exists "Admins manage partner organisations" on public.partner_organisations;
create policy "Admins manage partner organisations" on public.partner_organisations for all to authenticated
using (exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "Partner members view own memberships" on public.partner_members;
create policy "Partner members view own memberships" on public.partner_members for select to authenticated
using (user_id = auth.uid() or exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Admins manage partner memberships" on public.partner_members;
create policy "Admins manage partner memberships" on public.partner_members for all to authenticated
using (exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "Published opportunities are readable by everyone" on public.opportunities;
create policy "Verified opportunities are readable by everyone" on public.opportunities for select to anon, authenticated
using (is_published = true and status = 'active' and verification_status = 'verified' and (expiry_date is null or expiry_date >= current_date));
drop policy if exists "Partners view own submissions" on public.opportunities;
create policy "Partners view own submissions" on public.opportunities for select to authenticated
using (partner_id is not null and exists (select 1 from public.partner_members m where m.partner_id = opportunities.partner_id and m.user_id = auth.uid()));
drop policy if exists "Partners create pending submissions" on public.opportunities;
create policy "Partners create pending submissions" on public.opportunities for insert to authenticated
with check (source_type = 'partner' and verification_status = 'pending_review' and is_published = false and partner_id is not null and exists (select 1 from public.partner_members m where m.partner_id = opportunities.partner_id and m.user_id = auth.uid()));
drop policy if exists "Partners edit own unverified submissions" on public.opportunities;
create policy "Partners edit own unverified submissions" on public.opportunities for update to authenticated
using (verification_status in ('draft','pending_review','rejected') and partner_id is not null and exists (select 1 from public.partner_members m where m.partner_id = opportunities.partner_id and m.user_id = auth.uid()))
with check (source_type = 'partner' and verification_status in ('draft','pending_review') and is_published = false);

drop trigger if exists set_partner_organisations_updated_at on public.partner_organisations;
create trigger set_partner_organisations_updated_at before update on public.partner_organisations
for each row execute function public.set_updated_at();

notify pgrst, 'reload schema';
