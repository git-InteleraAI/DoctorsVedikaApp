-- Migration: 0004_create_patients_table
-- Purpose: Create public.patients table, set up RLS policies, and update the auth signup trigger
--          to automatically initialize a profile row for new patients.

-- 1. Create the patients table if it doesn't exist
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.users(id) on delete cascade,
  date_of_birth date,
  gender text check (gender in ('Male', 'Female', 'Other')),
  email text,
  blood_group text,
  locality text,
  address text,
  emergency_contact text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Keep updated_at fresh
create trigger trg_patients_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

-- 3. Enable RLS
alter table public.patients enable row level security;

-- 4. RLS Policies
create policy "Patients can view own details"
on public.patients for select
using (auth.uid() = user_id);

create policy "Patients can update own details"
on public.patients for update
using (auth.uid() = user_id);

create policy "Patients can insert own details"
on public.patients for insert
with check (auth.uid() = user_id);

-- 5. Update the handle_new_user() trigger function to auto-create the patient profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role public.app_role;
begin
  user_role := coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'patient');

  -- 1. Insert into public.users
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    user_role
  )
  on conflict (id) do nothing;

  -- 2. If the user is a patient, auto-create a matching row in public.patients
  if user_role = 'patient' then
    insert into public.patients (user_id, email, onboarding_completed)
    values (new.id, new.email, false)
    on conflict (user_id) do nothing;
  end if;

  return new;
exception
  when others then
    raise warning 'handle_new_user failed for user %: %', new.id, sqlerrm;
    return new;
end;
$$;
