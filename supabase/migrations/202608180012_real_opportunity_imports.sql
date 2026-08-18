-- Canonical real-opportunity fields, while retaining legacy columns for compatibility.
alter table public.opportunities
  add column if not exists organisation text,
  add column if not exists eligibility text,
  add column if not exists minimum_age integer,
  add column if not exists maximum_age integer,
  add column if not exists education_level text,
  add column if not exists format text,
  add column if not exists application_deadline date,
  add column if not exists last_verified_at timestamptz;

-- Remove the legacy checks before converting legacy values. PostgreSQL checks
-- constraints row-by-row during UPDATE, so doing this afterward makes the
-- migration fail as soon as `teenlaunch` becomes `manual` or `active` becomes
-- `published`.
alter table public.opportunities drop constraint if exists opportunities_source_type_check;
alter table public.opportunities drop constraint if exists opportunities_status_check;

update public.opportunities set
  organisation = coalesce(organisation, organizer),
  minimum_age = coalesce(minimum_age, age_min),
  maximum_age = coalesce(maximum_age, age_max),
  education_level = coalesce(education_level, array_to_string(education_levels, ', ')),
  format = coalesce(format, mode),
  application_deadline = coalesce(application_deadline, deadline),
  last_verified_at = coalesce(last_verified_at, verified_at),
  source_type = case source_type
    when 'partner' then 'partner'
    when 'api' then 'ai_fetched'
    else 'manual'
  end,
  status = case
    when coalesce(application_deadline, deadline, expiry_date) < current_date then 'expired'
    when is_published and verification_status = 'verified' then 'published'
    when verification_status = 'pending_review' then 'pending_review'
    else 'draft'
  end;

-- The fixed development seed records are not real opportunities. Keep them in
-- the database for development history, but never expose them as current data.
update public.opportunities set
  status = 'draft',
  is_published = false,
  verification_status = 'draft',
  last_verified_at = null
where id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000006'
);

alter table public.opportunities add constraint opportunities_source_type_check
  check (source_type in ('manual','partner','ai_fetched'));
alter table public.opportunities alter column source_type set default 'manual';

alter table public.opportunities add constraint opportunities_status_check
  check (status in ('draft','pending_review','published','expired'));
alter table public.opportunities alter column status set default 'draft';

alter table public.opportunities drop constraint if exists opportunities_minimum_age_check;
alter table public.opportunities add constraint opportunities_minimum_age_check
  check (minimum_age is null or minimum_age >= 0);
alter table public.opportunities drop constraint if exists opportunities_maximum_age_check;
alter table public.opportunities add constraint opportunities_maximum_age_check
  check (maximum_age is null or maximum_age >= 0);
alter table public.opportunities drop constraint if exists opportunities_canonical_age_range_check;
alter table public.opportunities add constraint opportunities_canonical_age_range_check
  check (minimum_age is null or maximum_age is null or minimum_age <= maximum_age);

create unique index if not exists opportunities_source_url_unique_idx
  on public.opportunities (lower(source_url)) where source_url is not null and btrim(source_url) <> '';
create unique index if not exists opportunities_application_url_unique_idx
  on public.opportunities (lower(application_url)) where application_url is not null and btrim(application_url) <> '';
create unique index if not exists opportunities_title_organisation_unique_idx
  on public.opportunities (lower(title), lower(organisation)) where organisation is not null and btrim(organisation) <> '';
create index if not exists opportunities_public_deadline_idx
  on public.opportunities(status, application_deadline);

create or replace function public.sync_opportunity_fields()
returns trigger language plpgsql as $$
begin
  new.organisation := coalesce(new.organisation, new.organizer);
  new.organizer := coalesce(new.organizer, new.organisation);
  new.minimum_age := coalesce(new.minimum_age, new.age_min);
  new.age_min := coalesce(new.age_min, new.minimum_age);
  new.maximum_age := coalesce(new.maximum_age, new.age_max);
  new.age_max := coalesce(new.age_max, new.maximum_age);
  new.format := coalesce(new.format, new.mode);
  new.mode := coalesce(new.mode, new.format);
  new.application_deadline := coalesce(new.application_deadline, new.deadline);
  new.deadline := coalesce(new.deadline, new.application_deadline);
  new.expiry_date := coalesce(new.application_deadline, new.expiry_date);
  if new.application_deadline is not null and new.application_deadline < current_date then
    new.status := 'expired'; new.is_published := false; new.verification_status := 'expired';
  end if;
  return new;
end; $$;

drop trigger if exists sync_opportunity_fields_trigger on public.opportunities;
create trigger sync_opportunity_fields_trigger before insert or update on public.opportunities
for each row execute function public.sync_opportunity_fields();

drop policy if exists "Verified opportunities are readable by everyone" on public.opportunities;
create policy "Published unexpired opportunities are readable by everyone"
on public.opportunities for select to anon, authenticated
using (is_published = true and status = 'published' and (application_deadline is null or application_deadline >= current_date));

notify pgrst, 'reload schema';
