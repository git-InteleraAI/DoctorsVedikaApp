/**
 * backend/src/routes/patientRoutes.js
 */
const express = require('express');
const patientController = require('../controllers/patientController');

const router = express.Router();

router.get('/profile/:userId', patientController.getProfile);
router.put('/profile/:userId', patientController.updateProfile);
router.get('/favorites/:patientId', patientController.getFavorites);
router.post('/favorites/:patientId', patientController.toggleFavorite);

module.exports = router;
