/**
 * backend/src/repositories/appointmentRepository.js
 * Database access layer for appointments.
 * Uses SECURITY DEFINER RPC functions to bypass RLS safely for backend operations.
 */
const { supabase } = require('../database/supabase/client');

class AppointmentRepository {
  async getPatientAppointments(patientId) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, doctors(*)')
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createAppointment(appointmentData) {
    // 1. Try calling SECURITY DEFINER RPC procedure 'book_appointment' (bypasses RLS safely)
    const { data: rpcData, error: rpcError } = await supabase.rpc('book_appointment', {
      p_patient_id: appointmentData.patient_id,
      p_doctor_id: appointmentData.doctor_id,
      p_date: appointmentData.appointment_date,
      p_time: appointmentData.appointment_time,
      p_reason: appointmentData.reason || null,
      p_payment_method: appointmentData.payment_method || 'pay_at_clinic',
    });

    if (!rpcError && rpcData) {
      return rpcData;
    }

    if (rpcError && rpcError.message && rpcError.message.includes('SLOT_TAKEN')) {
      throw new Error('This time slot has just been booked by someone else. Please pick another slot.');
    }

    // 2. Direct table insert fallback
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select('*, doctors(*)')
      .single();

    if (error) throw error;
    return data;
  }

  async cancelAppointment(appointmentId) {
    // 1. Try calling SECURITY DEFINER RPC procedure 'cancel_appointment' (bypasses RLS safely)
    const { data: rpcData, error: rpcError } = await supabase.rpc('cancel_appointment', {
      p_appointment_id: appointmentId,
    });

    if (!rpcError) {
      return rpcData;
    }

    // 2. Direct update fallback
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new AppointmentRepository();
