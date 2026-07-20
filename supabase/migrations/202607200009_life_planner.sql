-- TeenLaunch Life Planner MVP (additive and non-destructive).
create table if not exists public.planner_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  education_level text,
  school_schedule jsonb not null default '[]'::jsonb,
  personal_goals text,
  preferred_session_minutes integer not null default 45 check (preferred_session_minutes between 20 and 180),
  preferred_rest_days integer[] not null default '{}',
  wake_time time not null default '07:00',
  sleep_time time not null default '23:00',
  preferred_study_start time not null default '16:00',
  preferred_study_end time not null default '21:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.planner_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text,
  category text not null default 'personal' check (category in ('school','study','cca','tuition','opportunity','personal')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  start_time timestamptz,
  end_time timestamptz,
  deadline date,
  recurrence text not null default 'none' check (recurrence in ('none','daily','weekly')),
  status text not null default 'todo' check (status in ('todo','planned','suggested','rejected','completed')),
  source_type text not null default 'personal' check (source_type in ('personal','planner_task','opportunity','registration')),
  source_id uuid,
  parent_task_id uuid references public.planner_tasks(id) on delete cascade,
  estimated_minutes integer not null default 45 check (estimated_minutes between 20 and 1440),
  is_suggestion boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint planner_tasks_time_range check (start_time is null or end_time is null or start_time < end_time)
);

create index if not exists planner_tasks_user_start_idx on public.planner_tasks(user_id, start_time);
create index if not exists planner_tasks_user_deadline_idx on public.planner_tasks(user_id, deadline);
create index if not exists planner_tasks_parent_idx on public.planner_tasks(parent_task_id);

alter table public.planner_preferences enable row level security;
alter table public.planner_tasks enable row level security;

drop policy if exists "Users manage own planner preferences" on public.planner_preferences;
create policy "Users manage own planner preferences" on public.planner_preferences
for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Users view own planner tasks" on public.planner_tasks;
create policy "Users view own planner tasks" on public.planner_tasks
for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users create own planner tasks" on public.planner_tasks;
create policy "Users create own planner tasks" on public.planner_tasks
for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Users update own planner tasks" on public.planner_tasks;
create policy "Users update own planner tasks" on public.planner_tasks
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Users delete own planner tasks" on public.planner_tasks;
create policy "Users delete own planner tasks" on public.planner_tasks
for delete to authenticated using (user_id = auth.uid());

drop trigger if exists set_planner_preferences_updated_at on public.planner_preferences;
create trigger set_planner_preferences_updated_at before update on public.planner_preferences
for each row execute function public.set_updated_at();
drop trigger if exists set_planner_tasks_updated_at on public.planner_tasks;
create trigger set_planner_tasks_updated_at before update on public.planner_tasks
for each row execute function public.set_updated_at();

-- Opportunity deadlines remain in public.opportunities. The planner API reads
-- saved_opportunities and registrations by their existing foreign keys instead
-- of copying opportunity records into planner tables.
