-- Migration: 0002_email_auth_and_signup_trigger
-- Purpose: Switch Module 1 from phone/OTP to email/password auth.
-- Adds an email column, makes phone optional, and auto-creates a row in
-- public.users whenever a new row appears in auth.users (via signUp()).
-- This runs as SECURITY DEFINER so it bypasses RLS — required because at
-- signup time (before email confirmation) there is no authenticated session
-- yet, so a client-side insert into public.users would fail RLS checks.

-- 1. Add email column, relax phone to optional (kept for future phone-based
--    features like WhatsApp reminders; not used by auth anymore)
alter table public.users
  add column email text unique;

alter table public.users
  alter column phone drop not null;

-- 2. Function: create the public.users row when a new auth.users row appears
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
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'patient')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 3. Trigger: fires on every new Supabase Auth signup
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
