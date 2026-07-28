-- Migration: 0008_create_questions_table
-- Purpose: Create questions table to support Ask a Doctor Q&A flow with RLS policies

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users(id) on delete cascade,
  doctor_id uuid not null references public.doctors(doctor_id) on delete cascade,
  question_text text not null,
  answer_text text,
  status text not null default 'pending' check (status in ('pending', 'answered')),
  created_at timestamptz not null default now(),
  answered_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Safely recreate updated_at trigger
drop trigger if exists trg_questions_updated_at on public.questions;
create trigger trg_questions_updated_at
before update on public.questions
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.questions enable row level security;

-- 1. Patients SELECT policy: Can view their own questions
drop policy if exists "Patients can view own questions" on public.questions;
create policy "Patients can view own questions"
on public.questions for select
using (auth.uid() = patient_id);

-- 2. Patients INSERT policy: Can post their own questions
drop policy if exists "Patients can insert own questions" on public.questions;
create policy "Patients can insert own questions"
on public.questions for insert
with check (auth.uid() = patient_id);

-- 3. Doctors SELECT policy: Can view questions directed to them
drop policy if exists "Doctors can view assigned questions" on public.questions;
create policy "Doctors can view assigned questions"
on public.questions for select
using (
  exists (
    select 1 from public.doctors d
    where d.doctor_id = questions.doctor_id
    and d.user_id = auth.uid()
  )
);

-- 4. Doctors UPDATE policy: Can update/answer questions directed to them
drop policy if exists "Doctors can answer assigned questions" on public.questions;
create policy "Doctors can answer assigned questions"
on public.questions for update
using (
  exists (
    select 1 from public.doctors d
    where d.doctor_id = questions.doctor_id
    and d.user_id = auth.uid()
  )
);
