/**
 * frontend/src/modules/patient/notifications/NotificationScreen.tsx
 * Premium Notifications inbox log.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../core/theme';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../../features/notifications/api';
import type { NotificationsRow } from '../../../types/database';

export function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { profile } = useAuth();

  const [notifications, setNotifications] = useState<NotificationsRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadNotifications(silent = false) {
    if (!profile?.id) return;
    if (!silent) setIsLoading(true);

    try {
      const data = await getNotifications(profile.id);
      setNotifications(data);
    } catch (err: any) {
      console.error('[Notifications] Load error:', err);
      Alert.alert('Error', 'Unable to retrieve notifications.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [profile?.id]);

  async function handleMarkAllRead() {
    if (!profile?.id || notifications.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      await markAllNotificationsRead(profile.id);
    } catch (err: any) {
      console.error('[Notifications] Mark all read error:', err);
      loadNotifications(true);
    }
  }

  async function handleMarkRead(id: string, currentlyRead: boolean) {
    if (currentlyRead) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    try {
      await markNotificationRead(id);
    } catch (err: any) {
      console.error('[Notifications] Mark read error:', err);
      loadNotifications(true);
    }
  }

  async function handleDeleteNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteNotification(id);
    } catch (err: any) {
      console.error('[Notifications] Delete error:', err);
    }
  }

  const getNotificationIcon = (type: NotificationsRow['type']) => {
    switch (type) {
      case 'booking':
        return {
          name: 'calendar-check-outline',
          color: '#00A8B5',
          bg: '#E0F2F1',
          component: MaterialCommunityIcons,
        };
      case 'reply':
        return {
          name: 'message-reply-text',
          color: '#2196F3',
          bg: '#E3F2FD',
          component: MaterialCommunityIcons,
        };
      case 'reminder':
        return {
          name: 'bell-ring-outline',
          color: '#FF9800',
          bg: '#FFF3E0',
          component: MaterialCommunityIcons,
        };
      default:
        return {
          name: 'shield-alert-outline',
          color: '#E91E63',
          bg: '#FCE4EC',
          component: MaterialCommunityIcons,
        };
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeftRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color="#0F2537" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={styles.headerSubtitle}>{unreadCount} unread alerts</Text>
            )}
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00A8B5" />
          <Text style={styles.loadingText}>Fetching alerts...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            loadNotifications(true);
          }}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + theme.spacing.lg },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="notifications-off-outline" size={50} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>Your inbox is empty</Text>
              <Text style={styles.emptySubtitle}>
                No updates for now. We will notify you when you book an appointment, get a doctor's answer, or have reminders!
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const config = getNotificationIcon(item.type);
            const IconComponent = config.component;
            const timeStr = new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <TouchableOpacity
                style={[styles.card, !item.is_read && styles.cardUnread]}
                activeOpacity={0.8}
                onPress={() => handleMarkRead(item.id, item.is_read)}
              >
                <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
                  <IconComponent name={config.name as any} size={22} color={config.color} />
                </View>

                <View style={styles.contentCol}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, !item.is_read && styles.cardTitleBold]}>
                      {item.title}
                    </Text>
                    {!item.is_read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.cardBody} numberOfLines={3}>
                    {item.body}
                  </Text>
                  <Text style={styles.timeText}>{timeStr}</Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteNotification(item.id)}
                >
                  <Feather name="trash-2" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2537',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#00A8B5',
    fontWeight: '600',
  },
  markAllBtn: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A8B5',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    ...theme.shadow.card,
  },
  cardUnread: {
    borderColor: '#B2DFDB',
    backgroundColor: '#F7FEFD',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  contentCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  cardTitleBold: {
    color: '#1E293B',
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00A8B5',
  },
  cardBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
