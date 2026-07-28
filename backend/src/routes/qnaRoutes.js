/**
 * backend/src/routes/qnaRoutes.js
 */
const express = require('express');
const qnaController = require('../controllers/qnaController');

const router = express.Router();

router.get('/patient/:patientId', qnaController.getPatientQuestions);
router.post('/', qnaController.submitQuestion);

module.exports = router;
