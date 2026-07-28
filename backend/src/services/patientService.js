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
    return await patientRepository.updatePatient(userId, updateData);
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
