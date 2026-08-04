/**
 * backend/src/routes/index.js
 * Central Express Router aggregator.
 */
const express = require('express');
const patientRoutes = require('./patientRoutes');
const doctorRoutes = require('./doctorRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const qnaRoutes = require('./qnaRoutes');
const notificationRoutes = require('./notificationRoutes');
const educationalVideosRoutes = require('./educationalVideosRoutes');

const router = express.Router();

router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/qna', qnaRoutes);
router.use('/notifications', notificationRoutes);
router.use('/educational-videos', educationalVideosRoutes);

module.exports = router;
