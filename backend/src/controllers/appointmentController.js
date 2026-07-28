/**
 * backend/src/controllers/appointmentController.js
 * Controller handling HTTP requests for appointments.
 */
const appointmentService = require('../services/appointmentService');

class AppointmentController {
  async getPatientAppointments(req, res, next) {
    try {
      const { patientId } = req.params;
      const appointments = await appointmentService.getPatientAppointments(patientId);
      res.json({ success: true, data: appointments });
    } catch (err) {
      next(err);
    }
  }

  async createAppointment(req, res, next) {
    try {
      const appointment = await appointmentService.createAppointment(req.body);
      res.status(201).json({ success: true, data: appointment });
    } catch (err) {
      next(err);
    }
  }

  async cancelAppointment(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const cancelled = await appointmentService.cancelAppointment(appointmentId);
      res.json({ success: true, data: cancelled });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AppointmentController();
