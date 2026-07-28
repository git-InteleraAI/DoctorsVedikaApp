/**
 * src/features/notifications/api.ts
 * Notifications service layer routing through Express API Gateway & Realtime channels.
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { apiClient } from '../../core/api/httpClient';
import { supabase } from '../../lib/supabase';
import type { NotificationsRow } from '../../types/database';

export async function getNotifications(userId: string): Promise<NotificationsRow[]> {
  try {
    return await apiClient<NotificationsRow[]>(`/notifications/user/${userId}`);
  } catch (err: any) {
    console.warn('[NotificationService] getNotifications error:', err.message);
    return [];
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    await apiClient(`/notifications/${notificationId}/read`, { method: 'PATCH' });
  } catch (err: any) {
    console.error('[NotificationService] markNotificationRead error:', err.message);
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  try {
    await apiClient(`/notifications/user/${userId}/read-all`, { method: 'PATCH' });
  } catch (err: any) {
    console.error('[NotificationService] markAllNotificationsRead error:', err.message);
  }
}

export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    await apiClient(`/notifications/${notificationId}`, { method: 'DELETE' });
  } catch (err: any) {
    console.error('[NotificationService] deleteNotification error:', err.message);
  }
}

export async function registerPushNotificationToken(userId: string): Promise<string | null> {
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  if (isExpoGo) {
    console.log('[Push] Running in Expo Go. Skipping remote token registration.');
    return null;
  }

  if (!Device.isDevice) {
    console.log('[Push] Physical device required for push tokens.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    if (token) {
      await supabase.from('users').update({ push_token: token }).eq('id', userId);
    }
    return token;
  } catch (err) {
    console.warn('[Push] Error getting expo push token:', err);
    return null;
  }
}

export function subscribeRealtimeNotifications(
  userId: string,
  onNewNotification: (notification: NotificationsRow) => void
) {
  const channel = supabase
    .channel(`public:notifications:user:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const notif = payload.new as NotificationsRow;
        onNewNotification(notif);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
