/**
 * backend/src/routes/appointmentRoutes.js
 */
const express = require('express');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

router.get('/patient/:patientId', appointmentController.getPatientAppointments);
router.post('/', appointmentController.createAppointment);
router.patch('/:appointmentId/cancel', appointmentController.cancelAppointment);

module.exports = router;
