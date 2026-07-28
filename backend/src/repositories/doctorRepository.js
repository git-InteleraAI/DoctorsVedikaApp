/**
 * backend/src/repositories/doctorRepository.js
 * Database access layer for doctors discovery & slots.
 */
const { supabase } = require('../database/supabase/client');

class DoctorRepository {
  async getAllDoctors(limit = 50) {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getDoctorById(doctorId) {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('doctor_id', doctorId)
      .single();

    if (error) throw error;
    return data;
  }

  async getBookedSlots(doctorId, date) {
    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .neq('status', 'cancelled');

    if (error) throw error;
    return data ? data.map((a) => a.appointment_time) : [];
  }
}

module.exports = new DoctorRepository();
