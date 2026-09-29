-- Location is the venue; eligibility is the applicant's country, never inferred from format.
begin;
alter table public.opportunities
  drop constraint if exists opportunities_host_country_check,
  drop constraint if exists opportunities_eligibility_scope_check,
  drop constraint if exists opportunities_country_scope_check,
  drop constraint if exists opportunities_country_codes_check;

alter table public.opportunities
  add column if not exists host_country text,
  add column if not exists eligibility_scope text not null default 'unknown',
  add column if not exists eligible_countries text[] not null default '{}',
  add column if not exists travel_required boolean;

alter table public.opportunities
  add constraint opportunities_host_country_check check (host_country is null or host_country ~ '^[A-Z]{2}$'),
  add constraint opportunities_eligibility_scope_check check (eligibility_scope in ('unknown','worldwide','countries')),
  add constraint opportunities_country_scope_check check (
    (eligibility_scope = 'countries' and cardinality(eligible_countries) > 0)
    or (eligibility_scope <> 'countries' and cardinality(eligible_countries) = 0)
  ),
  add constraint opportunities_country_codes_check check (array_to_string(eligible_countries, ',') ~ '^([A-Z]{2}(,[A-Z]{2})*)?$');

comment on column public.opportunities.host_country is 'ISO 3166-1 alpha-2 host country, distinct from applicant eligibility. NULL when unknown or not applicable.';
comment on column public.opportunities.eligibility_scope is 'unknown: not verified; worldwide: no country restriction; countries: explicit eligible country codes. Other age/school requirements remain in eligibility.';
comment on column public.opportunities.eligible_countries is 'Explicit ISO alpha-2 applicant country codes; only populated for countries scope.';
comment on column public.opportunities.travel_required is 'True/false only when verified; NULL means unspecified. Do not infer from host country.';

create index if not exists opportunities_public_deadline_id_idx on public.opportunities(application_deadline, id) where is_published and status = 'published';
notify pgrst, 'reload schema';
commit;
