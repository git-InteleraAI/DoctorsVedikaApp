/**
 * backend/src/services/patientService.js
 * Business logic layer for patient operations.
 */
const patientRepository = require('../repositories/patientRepository');

class PatientService {
  async getPatientProfile(userId) {
    return await patientRepository.getPatientByUserId(userId);
  }

  async updatePatientProfile(userId, updateData) {
    const { full_name, phone, profile_photo_base64, ...patientFields } = updateData || {};

    // 1. Update public.users table if full_name or phone provided
    const userUpdates = {};
    if (full_name !== undefined) userUpdates.full_name = full_name;
    if (phone !== undefined) userUpdates.phone = phone;

    if (Object.keys(userUpdates).length > 0) {
      await patientRepository.updateUser(userId, userUpdates);
    }

    // 2. Filter valid fields for public.patients table
    const validPatientFields = {};
    const allowedKeys = [
      'date_of_birth',
      'gender',
      'email',
      'blood_group',
      'locality',
      'address',
      'profile_photo',
      'onboarding_completed',
    ];

    for (const key of allowedKeys) {
      if (patientFields[key] !== undefined) {
        validPatientFields[key] = patientFields[key];
      }
    }

    // 3. Update public.patients table if there are patient-specific fields
    if (Object.keys(validPatientFields).length > 0) {
      return await patientRepository.updatePatient(userId, validPatientFields);
    }

    return await patientRepository.getPatientByUserId(userId);
  }

  async getFavorites(patientId) {
    return await patientRepository.getFavorites(patientId);
  }

  async toggleFavorite(patientId, doctorId, isFavorite) {
    if (isFavorite) {
      await patientRepository.removeFavorite(patientId, doctorId);
      return false;
    } else {
      await patientRepository.addFavorite(patientId, doctorId);
      return true;
    }
  }
}

module.exports = new PatientService();
