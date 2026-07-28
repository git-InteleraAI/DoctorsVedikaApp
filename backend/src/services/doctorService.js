/**
 * backend/src/services/doctorService.js
 * Business logic layer for doctor discovery and slots.
 */
const doctorRepository = require('../repositories/doctorRepository');

class DoctorService {
  async searchDoctors(query = {}) {
    const doctors = await doctorRepository.getAllDoctors();
    let result = [...doctors];

    if (query.specialty && query.specialty !== 'All') {
      result = result.filter(
        (doc) => doc.doctor_specialization?.toLowerCase() === query.specialty.toLowerCase()
      );
    }

    if (query.q) {
      const q = query.q.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.doctor_name.toLowerCase().includes(q) ||
          doc.doctor_specialization?.toLowerCase().includes(q) ||
          doc.doctor_clinic_name?.toLowerCase().includes(q)
      );
    }

    return result;
  }

  async getDoctorById(doctorId) {
    return await doctorRepository.getDoctorById(doctorId);
  }

  async getBookedSlots(doctorId, date) {
    return await doctorRepository.getBookedSlots(doctorId, date);
  }
}

module.exports = new DoctorService();
