create table if not exists public.saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint saved_opportunities_user_opportunity_unique unique (user_id, opportunity_id)
);

create index if not exists saved_opportunities_user_idx on public.saved_opportunities(user_id);
alter table public.saved_opportunities enable row level security;

drop policy if exists "Users can view own saved opportunities" on public.saved_opportunities;
create policy "Users can view own saved opportunities" on public.saved_opportunities
for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users can save opportunities" on public.saved_opportunities;
create policy "Users can save opportunities" on public.saved_opportunities
for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Users can remove own saved opportunities" on public.saved_opportunities;
create policy "Users can remove own saved opportunities" on public.saved_opportunities
for delete to authenticated using (user_id = auth.uid());
