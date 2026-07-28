-- Migration: 0011_create_avatars_storage_bucket
-- Purpose: Ensure profile_photo column exists on public.patients table and set up patient-profiles storage bucket with public access & insert RLS policies.

-- 1. Ensure profile_photo column exists on patients table
alter table public.patients
  add column if not exists profile_photo text;

-- 2. Create storage bucket for patient profiles if it doesn't exist
insert into storage.buckets (id, name, public)
values ('patient-profiles', 'patient-profiles', true)
on conflict (id) do update set public = true;

-- 3. Storage RLS policies for patient-profiles bucket
drop policy if exists "Public read patient-profiles" on storage.objects;
create policy "Public read patient-profiles"
on storage.objects for select
using (bucket_id = 'patient-profiles');

drop policy if exists "Authenticated insert patient-profiles" on storage.objects;
create policy "Authenticated insert patient-profiles"
on storage.objects for insert
with check (bucket_id = 'patient-profiles');

drop policy if exists "Authenticated update patient-profiles" on storage.objects;
create policy "Authenticated update patient-profiles"
on storage.objects for update
using (bucket_id = 'patient-profiles');

drop policy if exists "Authenticated delete patient-profiles" on storage.objects;
create policy "Authenticated delete patient-profiles"
on storage.objects for delete
using (bucket_id = 'patient-profiles');
