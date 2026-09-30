-- Evidence is separate from editorial publication. Existing verified rows stay intact.
alter table public.opportunities add column if not exists discovery jsonb;
alter table public.opportunities add column if not exists discovery_sources text[] not null default '{}';
alter table public.opportunities add constraint opportunities_discovery_object_check
  check (discovery is null or coalesce((
    jsonb_typeof(discovery) = 'object'
    and discovery ?& array['deadline_status','student_eligibility','application_access','last_checked_at']
    and discovery->>'deadline_status' in ('unknown','confirmed','rolling','upcoming','closed')
    and discovery->>'student_eligibility' in ('unknown','confirmed','ineligible')
    and discovery->>'application_access' in ('unknown','available','login_required','unavailable')
    and nullif(discovery->>'last_checked_at','') is not null
  ), false));
comment on column public.opportunities.discovery is 'Reviewed discovery evidence, including unknown fields, provenance, restrictions and last check. Publication does not imply verification.';
notify pgrst, 'reload schema';
