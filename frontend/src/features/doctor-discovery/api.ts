/**
 * src/features/doctor-discovery/api.ts
 * Service layer for searching doctors & slot availability via Express API Gateway.
 * Also exposes Supabase Realtime subscriptions for:
 *  - Live slot locking  (subscribeBookedSlots)
 *  - Live doctor detail sync (subscribeDoctorUpdates)
 */
import { apiClient } from '../../core/api/httpClient';
import { supabase } from '../../lib/supabase';
import type { DoctorsRow } from '../../types/database';
import { DoctorFilters, FALLBACK_TOP_DOCTORS } from './types';

export interface ExtendedDoctorFilters extends DoctorFilters {
  maxFee?: number;
  minRating?: number;
}

export async function getTopDoctors(limit: number = 3): Promise<DoctorsRow[]> {
  try {
    const data = await apiClient<DoctorsRow[]>('/doctors/search');
    return data ? data.slice(0, limit) : FALLBACK_TOP_DOCTORS.slice(0, limit);
  } catch (err) {
    console.warn('[DoctorDiscoveryService] getTopDoctors fallback triggered:', err);
    return FALLBACK_TOP_DOCTORS.slice(0, limit);
  }
}

export async function searchDoctors({
  specialization,
  query,
  sortBy,
  maxFee,
  minRating,
}: ExtendedDoctorFilters): Promise<DoctorsRow[]> {
  try {
    const params = new URLSearchParams();
    if (specialization && specialization !== 'All' && specialization !== 'More') {
      params.append('specialty', specialization);
    }
    if (query && query.trim().length > 0) {
      params.append('q', query.trim());
    }

    const endpoint = `/doctors/search?${params.toString()}`;
    const data = await apiClient<DoctorsRow[]>(endpoint);
    let list = data || [];

    if (maxFee && maxFee > 0) {
      list = list.filter((d) => (d.doctor_consultation_fee ?? 0) <= maxFee);
    }
    if (minRating && minRating > 0) {
      list = list.filter((d) => (d.doctor_rating ?? 0) >= minRating);
    }

    if (sortBy === 'fee_asc') {
      list.sort((a, b) => (a.doctor_consultation_fee ?? 0) - (b.doctor_consultation_fee ?? 0));
    } else if (sortBy === 'experience_desc') {
      list.sort((a, b) => (b.doctor_experience ?? 0) - (a.doctor_experience ?? 0));
    }

    return list;
  } catch (err) {
    console.warn('[DoctorDiscoveryService] searchDoctors fallback triggered:', err);
    return FALLBACK_TOP_DOCTORS;
  }
}

export async function getBookedSlots(doctorId: string, dateIsoString: string): Promise<string[]> {
  try {
    return await apiClient<string[]>(`/doctors/${doctorId}/slots?date=${encodeURIComponent(dateIsoString)}`);
  } catch (err) {
    console.warn('[DoctorDiscoveryService] getBookedSlots failed:', err);
    return [];
  }
}

/**
 * Subscribes to live appointment INSERT events for a specific doctor and date.
 * When another patient books a slot, onNewSlot is called with the booked time string
 * (e.g. "09:30 AM") so the UI can immediately mark it as unavailable.
 *
 * @returns a cleanup function — call it to unsubscribe when the date changes or
 *          the component unmounts.
 */
export function subscribeBookedSlots(
  doctorId: string,
  dateIsoString: string,
  onNewSlot: (slot: string) => void
): () => void {
  const channel = supabase
    .channel(`slots:${doctorId}:${dateIsoString}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'appointments',
        // Filter server-side: only events where doctor_id matches.
        // (Supabase Realtime only supports a single filter column; we verify
        //  appointment_date on the client side to keep the subscription tight.)
        filter: `doctor_id=eq.${doctorId}`,
      },
      (payload) => {
        const row = payload.new as {
          appointment_time: string;
          appointment_date: string;
          status: string;
        };
        // Client-side guard: only react to the date currently on screen
        // and ignore cancelled bookings.
        if (
          row.appointment_date === dateIsoString &&
          row.status !== 'cancelled'
        ) {
          onNewSlot(row.appointment_time);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribes to live UPDATE events on the doctors table.
 * When an admin edits a doctor record in Supabase (fee, rating, photo, etc.),
 * onDoctorUpdated is called with the full updated doctor row so the UI can
 * patch its local state without a full re-fetch.
 *
 * @returns a cleanup function — call it on component unmount.
 */
export function subscribeDoctorUpdates(
  onDoctorUpdated: (doctor: DoctorsRow) => void
): () => void {
  const channel = supabase
    .channel('doctors:updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'doctors',
      },
      (payload) => {
        onDoctorUpdated(payload.new as DoctorsRow);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

