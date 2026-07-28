/**
 * backend/src/services/notificationService.js
 * Business logic layer for in-app notifications.
 */
const notificationRepository = require('../repositories/notificationRepository');

class NotificationService {
  async getNotifications(userId) {
    return await notificationRepository.getNotifications(userId);
  }

  async markNotificationRead(notificationId) {
    return await notificationRepository.markAsRead(notificationId);
  }

  async markAllNotificationsRead(userId) {
    return await notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(notificationId) {
    return await notificationRepository.deleteNotification(notificationId);
  }
}

module.exports = new NotificationService();
