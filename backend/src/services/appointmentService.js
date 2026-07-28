/**
 * backend/src/services/appointmentService.js
 * Business logic layer for appointments.
 */
const appointmentRepository = require('../repositories/appointmentRepository');
const doctorRepository = require('../repositories/doctorRepository');

class AppointmentService {
  async getPatientAppointments(patientId) {
    return await appointmentRepository.getPatientAppointments(patientId);
  }

  async createAppointment(appointmentData) {
    // Check if slot is already booked
    const booked = await doctorRepository.getBookedSlots(
      appointmentData.doctor_id,
      appointmentData.appointment_date
    );

    if (booked.includes(appointmentData.appointment_time)) {
      throw new Error('This time slot is already booked by another patient. Please select another slot.');
    }

    return await appointmentRepository.createAppointment({
      ...appointmentData,
      status: 'confirmed',
      payment_status: appointmentData.payment_method === 'pay_at_clinic' ? 'pending' : 'paid',
    });
  }

  async cancelAppointment(appointmentId) {
    return await appointmentRepository.cancelAppointment(appointmentId);
  }
}

module.exports = new AppointmentService();
