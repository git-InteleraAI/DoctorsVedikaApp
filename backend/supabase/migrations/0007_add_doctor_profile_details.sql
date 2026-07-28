-- Migration: 0007_add_doctor_profile_details
-- Purpose: Safely handle doctors table, triggers, and add portfolio columns
--          (including description, quote, patients treated, rating, and reviews count)

-- 1. Create table public.doctors if not exists
create table if not exists public.doctors (
  doctor_id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete set null,
  doctor_name text not null,
  doctor_email text,
  doctor_mobile text,
  doctor_registration_number text,
  doctor_specialization text,
  doctor_qualification text,
  doctor_experience integer,
  doctor_clinic_name text,
  doctor_clinic_address text,
  doctor_consultation_fee numeric,
  doctor_languages text,
  doctor_profile_photo text,
  doctor_verification_status text default 'pending',
  doctor_is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Safely recreate trigger
drop trigger if exists trg_doctors_updated_at on public.doctors;
create trigger trg_doctors_updated_at
before update on public.doctors
for each row execute function public.set_updated_at();

alter table public.doctors enable row level security;

-- 3. Safely recreate policies
drop policy if exists "Anyone can view active doctors" on public.doctors;
create policy "Anyone can view active doctors"
on public.doctors for select
using (doctor_is_active = true);

drop policy if exists "Doctors can view own row" on public.doctors;
create policy "Doctors can view own row"
on public.doctors for select
using (auth.uid() = user_id);

drop policy if exists "Doctors can update own row" on public.doctors;
create policy "Doctors can update own row"
on public.doctors for update
using (auth.uid() = user_id);

-- 4. Add dynamic portfolio detail columns
alter table public.doctors
  add column if not exists doctor_description text,
  add column if not exists doctor_quote text,
  add column if not exists doctor_patients_treated integer default 0,
  add column if not exists doctor_rating numeric default 4.9,
  add column if not exists doctor_reviews_count integer default 120;
