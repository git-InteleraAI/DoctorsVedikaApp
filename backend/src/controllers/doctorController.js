/**
 * backend/src/controllers/doctorController.js
 * Controller handling HTTP requests for doctor discovery & slots.
 */
const doctorService = require('../services/doctorService');

class DoctorController {
  async searchDoctors(req, res, next) {
    try {
      const doctors = await doctorService.searchDoctors(req.query);
      res.json({ success: true, data: doctors });
    } catch (err) {
      next(err);
    }
  }

  async getDoctorById(req, res, next) {
    try {
      const { doctorId } = req.params;
      const doctor = await doctorService.getDoctorById(doctorId);
      res.json({ success: true, data: doctor });
    } catch (err) {
      next(err);
    }
  }

  async getBookedSlots(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;
      const slots = await doctorService.getBookedSlots(doctorId, date);
      res.json({ success: true, data: slots });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DoctorController();
