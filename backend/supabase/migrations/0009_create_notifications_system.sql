-- Migration: 0009_create_notifications_system
-- Purpose: Add push_token support, create notifications table, and automate triggers

-- 1. Add push_token column to users table
alter table public.users add column if not exists push_token text;

-- 2. Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null check (type in ('booking', 'reminder', 'reply', 'system')),
  is_read boolean not null default false,
  data jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

-- 3. RLS Policies
drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
on public.notifications for select
using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
on public.notifications for update
using (auth.uid() = user_id);

drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications"
on public.notifications for delete
using (auth.uid() = user_id);

-- 4. Trigger Function for Appointment Notifications
create or replace function public.fn_on_appointment_change()
returns trigger as $$
declare
  doc_name text;
  msg_title text;
  msg_body text;
  msg_type text := 'booking';
begin
  -- Fetch doctor name
  select doctor_name into doc_name from public.doctors where doctor_id = new.doctor_id;

  if (tg_op = 'INSERT') then
    msg_title := 'Appointment Booked';
    msg_body := 'Your appointment with Dr. ' || coalesce(doc_name, 'Doctor') || ' on ' || new.appointment_date || ' at ' || new.appointment_time || ' is pending confirmation.';
  elsif (tg_op = 'UPDATE' and old.status <> new.status) then
    msg_title := 'Appointment ' || initcap(new.status);
    msg_body := 'Your appointment with Dr. ' || coalesce(doc_name, 'Doctor') || ' on ' || new.appointment_date || ' has been ' || new.status || '.';
  else
    return new;
  end if;

  insert into public.notifications (user_id, title, body, type, data)
  values (
    new.patient_id, -- patient_id references public.users.id
    msg_title,
    msg_body,
    msg_type,
    jsonb_build_object('appointment_id', new.id)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger binding
drop trigger if exists trg_on_appointment_change on public.appointments;
create trigger trg_on_appointment_change
after insert or update of status on public.appointments
for each row execute function public.fn_on_appointment_change();

-- 5. Trigger Function for Question Reply Notifications
create or replace function public.fn_on_question_answer()
returns trigger as $$
declare
  doc_name text;
  msg_title text;
  msg_body text;
  msg_type text := 'reply';
begin
  -- Fire only when answer_text changes from null to not null
  if ((old.answer_text is null and new.answer_text is not null) or (old.answer_text <> new.answer_text)) then
    select doctor_name into doc_name from public.doctors where doctor_id = new.doctor_id;

    msg_title := 'New Doctor Reply';
    msg_body := 'Dr. ' || coalesce(doc_name, 'Doctor') || ' has replied to your medical question.';

    insert into public.notifications (user_id, title, body, type, data)
    values (
      new.patient_id, -- patient_id references public.users.id
      msg_title,
      msg_body,
      msg_type,
      jsonb_build_object('question_id', new.id)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger binding
drop trigger if exists trg_on_question_answer on public.questions;
create trigger trg_on_question_answer
after update of answer_text on public.questions
for each row execute function public.fn_on_question_answer();
