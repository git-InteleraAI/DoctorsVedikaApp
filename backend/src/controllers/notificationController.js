/**
 * backend/src/controllers/notificationController.js
 * Controller handling HTTP requests for in-app notifications.
 */
const notificationService = require('../services/notificationService');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const { userId } = req.params;
      const notifications = await notificationService.getNotifications(userId);
      res.json({ success: true, data: notifications });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      const { notificationId } = req.params;
      const result = await notificationService.markNotificationRead(notificationId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req, res, next) {
    try {
      const { userId } = req.params;
      await notificationService.markAllNotificationsRead(userId);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const { notificationId } = req.params;
      await notificationService.deleteNotification(notificationId);
      res.json({ success: true, message: 'Notification deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
