-- TeenLaunch tracks whether a user applied; applications do not require
-- acceptance or verification by a TeenLaunch administrator.
update public.registrations
set status = 'registered'
where status in ('pending', 'shortlisted', 'accepted');
