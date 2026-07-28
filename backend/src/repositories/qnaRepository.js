/**
 * backend/src/repositories/qnaRepository.js
 * Database access layer for Q&A questions.
 */
const { supabase } = require('../database/supabase/client');

class QnaRepository {
  async getPatientQuestions(patientId) {
    const { data, error } = await supabase
      .from('questions')
      .select('*, doctors(*)')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async submitQuestion(questionData) {
    const { data, error } = await supabase
      .from('questions')
      .insert({ ...questionData, status: 'pending' })
      .select('*, doctors(*)')
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new QnaRepository();
