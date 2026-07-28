-- Migration: 0013_remove_emergency_contact.sql
-- Purpose: Remove emergency_contact column from public.patients table.

alter table public.patients
  drop column if exists emergency_contact;
