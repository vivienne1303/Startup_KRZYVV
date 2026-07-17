-- Additive metadata for the rule-based Career DNA opportunity matcher.
-- Review and run this migration through Supabase; it is not executed automatically.

alter table public.opportunities
  add column if not exists categories text[] not null default '{}'::text[],
  add column if not exists skills text[] not null default '{}'::text[],
  add column if not exists education_levels text[] not null default '{}'::text[],
  add column if not exists status text not null default 'active';

update public.opportunities
set categories = array[category]
where coalesce(array_length(categories, 1), 0) = 0
  and category is not null
  and btrim(category) <> '';

alter table public.opportunities
  drop constraint if exists opportunities_status_check;

alter table public.opportunities
  add constraint opportunities_status_check
  check (status in ('draft', 'active', 'inactive', 'archived'));

create index if not exists opportunities_categories_gin_idx
  on public.opportunities using gin(categories);

create index if not exists opportunities_skills_gin_idx
  on public.opportunities using gin(skills);

create index if not exists opportunities_status_idx
  on public.opportunities(status);

notify pgrst, 'reload schema';
