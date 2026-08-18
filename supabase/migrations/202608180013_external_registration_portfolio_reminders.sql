alter table public.registrations
  add column if not exists portfolio_reminder boolean not null default false,
  add column if not exists portfolio_reminder_at timestamptz;

notify pgrst, 'reload schema';
