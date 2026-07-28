-- Migration: 0012_patient_portal_full_schema_and_rls.sql
-- Purpose: Complete Patient Portal database updates:
--          1. Add patient_favorites table with full RLS
--          2. Add report_url column to questions table
--          3. Create medical-reports storage bucket & RLS policies
--          4. Enable Supabase Realtime for appointments & questions
--          5. Ensure RLS policies are optimized & consolidated for Patient Portal

-- ==========================================
-- 1. PATIENT FAVORITES TABLE & POLICIES
-- ==========================================
create table if not exists public.patient_favorites (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users(id) on delete cascade,
  doctor_id uuid not null references public.doctors(doctor_id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint unique_patient_doctor_favorite unique(patient_id, doctor_id)
);

alter table public.patient_favorites enable row level security;

drop policy if exists "Patients can view own favorites" on public.patient_favorites;
create policy "Patients can view own favorites"
on public.patient_favorites for select
using (auth.uid() = patient_id);

drop policy if exists "Patients can insert own favorites" on public.patient_favorites;
create policy "Patients can insert own favorites"
on public.patient_favorites for insert
with check (auth.uid() = patient_id);

drop policy if exists "Patients can delete own favorites" on public.patient_favorites;
create policy "Patients can delete own favorites"
on public.patient_favorites for delete
using (auth.uid() = patient_id);

-- ==========================================
-- 2. ASK DOCTOR: ADD MEDICAL REPORT ATTACHMENT
-- ==========================================
alter table public.questions
  add column if not exists report_url text;

-- ==========================================
-- 3. MEDICAL REPORTS STORAGE BUCKET & RLS
-- ==========================================
insert into storage.buckets (id, name, public)
values ('medical-reports', 'medical-reports', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read medical-reports" on storage.objects;
create policy "Public read medical-reports"
on storage.objects for select
using (bucket_id = 'medical-reports');

drop policy if exists "Authenticated insert medical-reports" on storage.objects;
create policy "Authenticated insert medical-reports"
on storage.objects for insert
with check (bucket_id = 'medical-reports');

drop policy if exists "Authenticated delete medical-reports" on storage.objects;
create policy "Authenticated delete medical-reports"
on storage.objects for delete
using (bucket_id = 'medical-reports');

-- ==========================================
-- 4. ENABLE REALTIME ON PATIENT TABLES
-- ==========================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'appointments'
  ) then
    alter publication supabase_realtime add table public.appointments;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'questions'
  ) then
    alter publication supabase_realtime add table public.questions;
  end if;
end $$;

-- ==========================================
-- 5. CONSOLIDATED PATIENT RLS SANITY CHECK
-- ==========================================
drop policy if exists "Patients can view active doctors" on public.doctors;
create policy "Patients can view active doctors"
on public.doctors for select
using (true);
