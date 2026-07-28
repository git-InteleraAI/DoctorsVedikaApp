/**
 * backend/src/routes/notificationRoutes.js
 */
const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/user/:userId', notificationController.getNotifications);
router.patch('/:notificationId/read', notificationController.markRead);
router.patch('/user/:userId/read-all', notificationController.markAllRead);
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
