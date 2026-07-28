-- Migration: 0003_fix_signup_trigger_final
-- Purpose: Consolidated fix for handle_new_user().
-- 1. Casts against the REAL existing enum public.app_role
--    ('patient','doctor','admin','assistant') — not public.user_role,
--    which migration 0001 tried and failed to create because the
--    `users` table already existed in this project beforehand.
-- 2. Wraps the insert in exception handling so a profile-row failure
--    never blocks Supabase Auth signup.
-- Safe to re-run (CREATE OR REPLACE) even if already applied manually.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'patient')
  )
  on conflict (id) do nothing;
  return new;
exception
  when others then
    raise warning 'handle_new_user failed for user %: %', new.id, sqlerrm;
    return new;
end;
$$;
