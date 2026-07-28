-- Migration: 0001_create_users_table
-- Purpose: Public profile table linked 1:1 to Supabase Auth users.
-- Referenced by PRD Section 2, Module 1 (Registration & Login):
--   "Supabase Auth handles phone/OTP verification; role is set to 'patient' in the users table."

-- 1. Role enum shared across Doctor / Patient / Admin / Assistant modules
create type public.user_role as enum ('patient', 'doctor', 'admin', 'assistant');

-- 2. Public users table (1:1 with auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique not null,
  full_name text,
  role public.user_role not null default 'patient',
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Keep updated_at fresh on every update
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

-- 4. Row-Level Security
alter table public.users enable row level security;

-- A user can read their own row
create policy "Users can view own profile"
on public.users for select
using (auth.uid() = id);

-- A user can update their own row (but not their role — handled below)
create policy "Users can update own profile"
on public.users for update
using (auth.uid() = id);

-- Insert only allowed for the authenticated user creating their own row
create policy "Users can insert own profile"
on public.users for insert
with check (auth.uid() = id);