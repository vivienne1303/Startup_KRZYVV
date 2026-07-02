alter table public.user_profiles
add column if not exists education_level text check (
  education_level is null
  or education_level in (
    'Secondary School',
    'Junior College',
    'Polytechnic',
    'ITE',
    'University',
    'Other'
  )
);

notify pgrst, 'reload schema';
