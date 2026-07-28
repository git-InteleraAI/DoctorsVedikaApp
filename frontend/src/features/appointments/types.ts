/**
 * src/features/appointments/types.ts
 * Types for appointments and booking payloads.
 */
import type { AppointmentsRow, DoctorsRow } from '../../types/database';

export type AppointmentWithDoctor = AppointmentsRow & {
  doctors: DoctorsRow | null;
};

export interface CreateAppointmentPayload {
  patient_id: string;
  doctor_id: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // e.g. "09:30 AM"
  reason?: string;
  payment_method?: 'pay_at_clinic';
}
