/**
 * src/features/appointments/api.ts
 * Frontend UI API layer — routes core booking and cancellation through Express API Gateway.
 */
import { apiClient } from '../../core/api/httpClient';
import type { AppointmentWithDoctor, CreateAppointmentPayload } from './types';

export async function getPatientAppointments(patientId: string): Promise<AppointmentWithDoctor[]> {
  try {
    return await apiClient<AppointmentWithDoctor[]>(`/appointments/patient/${patientId}`);
  } catch (err: any) {
    console.error('[AppointmentsService] getPatientAppointments error:', err.message);
    throw err;
  }
}

export async function createAppointment(payload: CreateAppointmentPayload) {
  try {
    return await apiClient('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    console.error('[AppointmentsService] createAppointment error:', err.message);
    throw err;
  }
}

export async function cancelAppointment(appointmentId: string) {
  try {
    return await apiClient(`/appointments/${appointmentId}/cancel`, {
      method: 'PATCH',
    });
  } catch (err: any) {
    console.error('[AppointmentsService] cancelAppointment error:', err.message);
    throw err;
  }
}
