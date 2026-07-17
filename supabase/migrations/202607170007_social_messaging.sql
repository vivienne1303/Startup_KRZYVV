-- TeenLaunch social messaging MVP. Safe to run more than once.
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint direct_messages_not_self check (sender_id <> recipient_id)
);

create index if not exists direct_messages_sender_idx on public.direct_messages(sender_id, created_at desc);
create index if not exists direct_messages_recipient_idx on public.direct_messages(recipient_id, created_at desc);
alter table public.direct_messages enable row level security;

drop policy if exists "Users can read their conversations" on public.direct_messages;
create policy "Users can read their conversations" on public.direct_messages
for select to authenticated using (sender_id = auth.uid() or recipient_id = auth.uid());

drop policy if exists "Users can send their own messages" on public.direct_messages;
create policy "Users can send their own messages" on public.direct_messages
for insert to authenticated with check (sender_id = auth.uid() and recipient_id <> auth.uid());

drop policy if exists "Recipients can mark messages read" on public.direct_messages;
create policy "Recipients can mark messages read" on public.direct_messages
for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
