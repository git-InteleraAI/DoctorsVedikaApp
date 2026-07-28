/**
 * backend/src/routes/doctorRoutes.js
 */
const express = require('express');
const doctorController = require('../controllers/doctorController');

const router = express.Router();

router.get('/search', doctorController.searchDoctors);
router.get('/:doctorId', doctorController.getDoctorById);
router.get('/:doctorId/slots', doctorController.getBookedSlots);

module.exports = router;
