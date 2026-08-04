/**
 * backend/src/routes/educationalVideosRoutes.js
 * Express router for Educational Videos & Shorts module.
 */
const express = require('express');
const educationalVideosController = require('../controllers/educationalVideosController');

const router = express.Router();

router.get('/', (req, res, next) => educationalVideosController.getVideos(req, res, next));
router.post('/sync', (req, res, next) => educationalVideosController.syncVideos(req, res, next));

module.exports = router;
