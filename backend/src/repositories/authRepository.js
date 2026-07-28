/**
 * backend/src/repositories/authRepository.js
 * Database access layer for authentication & profiles.
 */
const { supabase } = require('../database/supabase/client');

class AuthRepository {
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async createProfile(profileData) {
    const { data, error } = await supabase
      .from('users')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId, updateData) {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new AuthRepository();
