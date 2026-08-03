/**
 * frontend/src/modules/patient/appointments/AppointmentsScreen.tsx
 * Segmented appointment tracker tab (Upcoming vs History).
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../core/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { getPatientAppointments, cancelAppointment } from '../../../features/appointments/api';
import type { AppointmentWithDoctor } from '../../../features/appointments/types';
import type { AppointmentsRow } from '../../../types/database';

export function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeUpdated, setRealtimeUpdated] = useState(false);

  async function loadAppointments(showRefreshing = false) {
    if (!profile?.id) return;
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    setError(null);
    try {
      const data = await getPatientAppointments(profile.id);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Could not retrieve bookings.');
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();

    if (!profile?.id) return;

    const channel = supabase
      .channel('patient-appointments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `patient_id=eq.${profile.id}`,
        },
        (payload) => {
          console.log('[Realtime] Appointment status change received:', payload);
          setRealtimeUpdated(true);
          loadAppointments(true);
          setTimeout(() => setRealtimeUpdated(false), 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const onRefresh = useCallback(() => loadAppointments(true), [profile?.id]);

  async function handleCancelAppointment(appointmentId: string, doctorName: string) {
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel your consultation with Dr. ${doctorName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancel Appointment',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await cancelAppointment(appointmentId);
              Alert.alert('Success', 'Appointment cancelled successfully.');
              loadAppointments();
            } catch (err: any) {
              Alert.alert('Cancellation Failed', err.message);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }

  const filteredAppointments = React.useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    return appointments.filter((app) => {
      const isPast = app.appointment_date < todayStr;
      const isCancelledOrCompleted = app.status === 'cancelled' || app.status === 'completed';

      if (activeTab === 'upcoming') {
        return !isPast && !isCancelledOrCompleted;
      } else {
        return isPast || isCancelledOrCompleted;
      }
    });
  }, [appointments, activeTab]);

  const getStatusStyle = (status: AppointmentsRow['status']) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#E0F2F1', text: '#00A8B5' };
      case 'completed':
        return { bg: '#E8F5E9', text: '#4CAF50' };
      case 'cancelled':
        return { bg: '#FFEBEE', text: '#F44336' };
      default:
        return { bg: '#FFF3E0', text: '#FF9800' };
    }
  };

  const getPaymentStatusLabel = (status: AppointmentsRow['payment_status']) => {
    return status === 'paid' ? 'Paid' : 'Pending payment';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Appointments</Text>
      </View>

      {realtimeUpdated && (
        <View style={{ backgroundColor: '#0284C7', paddingVertical: 6, paddingHorizontal: 16, alignItems: 'center' }}>
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>⚡ Realtime Update Syncing...</Text>
        </View>
      )}

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'upcoming' && styles.tabButtonActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A8B5" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Feather name="wifi-off" size={32} color="#EF4444" />
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + theme.spacing.lg }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#00A8B5"
              colors={['#00A8B5']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Feather name="calendar" size={32} color="#00BCD4" />
              </View>
              <Text style={styles.emptyTitle}>No appointments found</Text>
              <Text style={styles.emptyBody}>
                {activeTab === 'upcoming'
                  ? "You don't have any upcoming consultations."
                  : 'Your past appointment history is empty.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const doc = item.doctors;
            const docName = doc?.doctor_name ?? 'Doctor';
            const docSpecialty = doc?.doctor_specialization ?? 'General Practitioner';
            const docInitials = docName
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            const statusColors = getStatusStyle(item.status);
            const formattedDate = new Date(item.appointment_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.docAvatarCol}>
                    {doc?.doctor_profile_photo ? (
                      <Image source={{ uri: doc.doctor_profile_photo }} style={styles.docAvatar} />
                    ) : (
                      <View style={styles.docAvatarFallback}>
                        <Text style={styles.docAvatarFallbackText}>{docInitials}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.docInfoCol}>
                    <Text style={styles.docName}>Dr. {docName}</Text>
                    <Text style={styles.docSpecialty}>{docSpecialty}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                    <Text style={[styles.statusText, { color: statusColors.text }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Feather name="calendar" size={14} color="#64748B" />
                    <Text style={styles.infoLabel}>{formattedDate}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Feather name="clock" size={14} color="#64748B" />
                    <Text style={styles.infoLabel}>{item.appointment_time}</Text>
                  </View>
                </View>

                <View style={styles.paymentRow}>
                  <View style={styles.paymentMethod}>
                    <Ionicons name="card-outline" size={14} color="#64748B" />
                    <Text style={styles.paymentMethodText}>Pay at Clinic</Text>
                  </View>
                  <View style={styles.paymentStatus}>
                    <View
                      style={[
                        styles.dotIndicator,
                        { backgroundColor: item.payment_status === 'paid' ? '#4CAF50' : '#FF9800' },
                      ]}
                    />
                    <Text style={styles.paymentStatusText}>
                      {getPaymentStatusLabel(item.payment_status)}
                    </Text>
                  </View>
                </View>

                {item.reason && (
                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel} numberOfLines={2}>
                      Reason: <Text style={styles.reasonText}>{item.reason}</Text>
                    </Text>
                  </View>
                )}

                {(item.status === 'pending' || item.status === 'confirmed') && activeTab === 'upcoming' && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancelAppointment(item.id, docName)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                  </TouchableOpacity>
                )}
              </View>
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
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E2229',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: theme.radius.pill,
    marginHorizontal: theme.spacing.lg,
    padding: 4,
    marginBottom: theme.spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    ...theme.shadow.card,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#00A8B5',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...theme.shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docAvatarCol: {
    marginRight: theme.spacing.md,
  },
  docAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
  },
  docAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docAvatarFallbackText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  docInfoCol: {
    flex: 1,
  },
  docName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  docSpecialty: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: theme.spacing.md - 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
    marginBottom: theme.spacing.sm,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  reasonBox: {
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 6,
    marginBottom: theme.spacing.sm,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  reasonText: {
    fontWeight: '400',
    color: '#64748B',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: theme.radius.pill,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xs,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  errorText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: theme.spacing.xs,
  },
  emptyBody: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
