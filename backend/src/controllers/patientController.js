/**
 * backend/src/controllers/patientController.js
 * Controller handling HTTP requests for patient profile & favorites.
 */
const patientService = require('../services/patientService');

class PatientController {
  async getProfile(req, res, next) {
    try {
      const { userId } = req.params;
      const profile = await patientService.getPatientProfile(userId);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { userId } = req.params;
      const updated = await patientService.updatePatientProfile(userId, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async getFavorites(req, res, next) {
    try {
      const { patientId } = req.params;
      const favorites = await patientService.getFavorites(patientId);
      res.json({ success: true, data: favorites });
    } catch (err) {
      next(err);
    }
  }

  async toggleFavorite(req, res, next) {
    try {
      const { patientId } = req.params;
      const { doctorId, isFavorite } = req.body;
      const result = await patientService.toggleFavorite(patientId, doctorId, isFavorite);
      res.json({ success: true, isFavorite: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PatientController();
