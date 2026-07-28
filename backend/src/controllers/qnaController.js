/**
 * backend/src/controllers/qnaController.js
 * Controller handling HTTP requests for Q&A questions.
 */
const qnaService = require('../services/qnaService');

class QnaController {
  async getPatientQuestions(req, res, next) {
    try {
      const { patientId } = req.params;
      if (!patientId) {
        return res.status(400).json({ success: false, message: 'patientId is required' });
      }
      const questions = await qnaService.getPatientQuestions(patientId);
      res.json({ success: true, data: questions });
    } catch (err) {
      next(err);
    }
  }

  async submitQuestion(req, res, next) {
    try {
      const { patient_id, doctor_id, question_text } = req.body || {};
      if (!patient_id || !doctor_id || !question_text || !question_text.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: patient_id, doctor_id, or question_text',
        });
      }

      const question = await qnaService.submitQuestion(req.body);
      res.status(201).json({ success: true, data: question });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new QnaController();
