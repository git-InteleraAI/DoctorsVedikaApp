-- Migration: 0005_add_patient_profile_photo
-- Purpose: Add profile_photo column to public.patients table.

alter table public.patients
  add column if not exists profile_photo text;
