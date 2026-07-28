-- Migration: 0010_create_backend_functions
-- Purpose: Move appointment booking & cancellation business logic into backend SQL functions (RPC)

-- 1. RPC Function to atomically book an appointment with double-booking prevention
create or replace function public.book_appointment(
  p_patient_id uuid,
  p_doctor_id uuid,
  p_date date,
  p_time text,
  p_reason text default null,
  p_payment_method text default 'pay_at_clinic'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing_id uuid;
  v_new_appointment public.appointments%rowtype;
begin
  -- Security check: Ensure calling user is the patient
  if auth.uid() <> p_patient_id then
    raise exception 'Unauthorized: You can only book appointments for yourself.';
  end if;

  -- Atomic Double-booking validation
  select id into v_existing_id
  from public.appointments
  where doctor_id = p_doctor_id
    and appointment_date = p_date
    and appointment_time = p_time
    and status <> 'cancelled'
  limit 1;

  if v_existing_id is not null then
    raise exception 'SLOT_TAKEN: This time slot is already booked. Please choose another slot.';
  end if;

  -- Insert appointment record
  insert into public.appointments (
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    reason,
    status,
    payment_method,
    payment_status
  ) values (
    p_patient_id,
    p_doctor_id,
    p_date,
    p_time,
    p_reason,
    'pending',
    p_payment_method,
    'pending'
  )
  returning * into v_new_appointment;

  return to_jsonb(v_new_appointment);
end;
$$;

grant execute on function public.book_appointment(uuid, uuid, date, text, text, text) to authenticated;

-- 2. RPC Function to cancel appointment safely on the backend
create or replace function public.cancel_appointment(
  p_appointment_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_id uuid;
begin
  select patient_id into v_patient_id
  from public.appointments
  where id = p_appointment_id;

  if v_patient_id is null then
    raise exception 'Appointment not found.';
  end if;

  if auth.uid() <> v_patient_id then
    raise exception 'Unauthorized: You can only cancel your own appointments.';
  end if;

  update public.appointments
  set status = 'cancelled',
      updated_at = now()
  where id = p_appointment_id;

  return true;
end;
$$;

grant execute on function public.cancel_appointment(uuid) to authenticated;
