-- Migration: 0006_create_appointments_table
-- Purpose: Create public.appointments table, add unique constraints to prevent double booking,
--          enable RLS, and define security policies.

-- 1. Create the appointments table
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users(id) on delete cascade,
  doctor_id uuid not null references public.doctors(doctor_id) on delete cascade,
  appointment_date date not null,
  appointment_time text not null, -- e.g. "09:30 AM"
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_method text not null default 'pay_at_clinic' check (payment_method = 'pay_at_clinic'),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Prevent double-booking (ensure doctor_id + appointment_date + appointment_time combination is unique)
alter table public.appointments
  add constraint unique_doctor_slot unique (doctor_id, appointment_date, appointment_time);

-- 3. Keep updated_at fresh
create trigger trg_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

-- 4. Enable RLS
alter table public.appointments enable row level security;

-- 5. Row-Level Security Policies
create policy "Patients can view own appointments"
on public.appointments for select
using (auth.uid() = patient_id);

create policy "Patients can insert own appointments"
on public.appointments for insert
with check (auth.uid() = patient_id);

create policy "Patients can update own appointments"
on public.appointments for update
using (auth.uid() = patient_id);
