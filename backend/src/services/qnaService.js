/**
 * backend/src/services/qnaService.js
 * Business logic layer for Q&A questions.
 */
const qnaRepository = require('../repositories/qnaRepository');

class QnaService {
  async getPatientQuestions(patientId) {
    return await qnaRepository.getPatientQuestions(patientId);
  }

  async submitQuestion(questionData) {
    return await qnaRepository.submitQuestion(questionData);
  }
}

module.exports = new QnaService();
