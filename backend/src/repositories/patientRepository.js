/**
 * backend/src/repositories/patientRepository.js
 * Database access layer for patient profiles and favorites.
 */
const { supabase } = require('../database/supabase/client');

class PatientRepository {
  async getPatientByUserId(userId) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updatePatient(userId, updateData) {
    const { data, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFavorites(patientId) {
    const { data, error } = await supabase
      .from('patient_favorites')
      .select('doctor_id')
      .eq('patient_id', patientId);

    if (error) throw error;
    return data ? data.map((f) => f.doctor_id) : [];
  }

  async addFavorite(patientId, doctorId) {
    const { error } = await supabase
      .from('patient_favorites')
      .insert({ patient_id: patientId, doctor_id: doctorId });

    if (error) throw error;
    return true;
  }

  async removeFavorite(patientId, doctorId) {
    const { error } = await supabase
      .from('patient_favorites')
      .delete()
      .eq('patient_id', patientId)
      .eq('doctor_id', doctorId);

    if (error) throw error;
    return true;
  }
}

module.exports = new PatientRepository();
