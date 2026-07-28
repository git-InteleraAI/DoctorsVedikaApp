/**
 * frontend/src/modules/patient/doctor-profile/DoctorProfileScreen.tsx
 * Premium doctor profile card with calendar, time slots, and Pay-at-Clinic modal.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Heart,
  BadgeCheck,
  Star,
  Users,
  Award,
  Quote,
  MessageSquare,
  MapPin,
  Phone,
  Navigation as NavigationIcon,
  MessageCircle,
  X,
} from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../core/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getBookedSlots, subscribeBookedSlots } from '../../../features/doctor-discovery/api';
import { createAppointment } from '../../../features/appointments/api';
import { PrimaryButton } from '../../../core/components/PrimaryButton';
import type { DoctorsRow } from '../../../types/database';
import type { PatientStackParamList } from '../../../app/navigation/PatientNavigator';

type RoutePropType = RouteProp<PatientStackParamList, 'DoctorProfile'>;

const AVAILABLE_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
];

export function DoctorProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const { doctor } = route.params;
  const { profile } = useAuth();

  const dates = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const slotUnsubscribeRef = useRef<(() => void) | null>(null);

  const getISODateString = useCallback((date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const loadBookedSlots = useCallback(async (date: Date) => {
    setIsSlotsLoading(true);
    const dateStr = getISODateString(date);
    const slots = await getBookedSlots(doctor.doctor_id, dateStr);
    setIsSlotsLoading(false);
    setBookedSlots(slots);
  }, [doctor.doctor_id, getISODateString]);

  useEffect(() => {
    setSelectedSlot(null);
    loadBookedSlots(selectedDate);

    const dateStr = getISODateString(selectedDate);

    if (slotUnsubscribeRef.current) {
      slotUnsubscribeRef.current();
    }

    slotUnsubscribeRef.current = subscribeBookedSlots(
      doctor.doctor_id,
      dateStr,
      (newlyBookedSlot) => {
        setBookedSlots((prev) => {
          if (prev.includes(newlyBookedSlot)) return prev;
          return [...prev, newlyBookedSlot];
        });

        setSelectedSlot((current) => {
          if (current === newlyBookedSlot) {
            Alert.alert(
              'Slot Just Taken',
              `The ${newlyBookedSlot} slot was just booked by another patient. Please choose a different time.`
            );
            return null;
          }
          return current;
        });
      }
    );

    return () => {
      if (slotUnsubscribeRef.current) {
        slotUnsubscribeRef.current();
        slotUnsubscribeRef.current = null;
      }
    };
  }, [selectedDate, doctor.doctor_id, getISODateString, loadBookedSlots]);

  const initials = doctor.doctor_name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const formatDateLabel = useCallback((date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }, []);

  async function handleBookAppointment() {
    if (!selectedSlot) {
      Alert.alert('Selection Required', 'Please select a time slot.');
      return;
    }
    setShowConfirmModal(true);
  }

  async function confirmBooking() {
    if (!profile?.id) return;
    setIsBookingLoading(true);
    setShowConfirmModal(false);

    const dateStr = getISODateString(selectedDate);

    try {
      await createAppointment({
        patient_id: profile.id,
        doctor_id: doctor.doctor_id,
        appointment_date: dateStr,
        appointment_time: selectedSlot!,
        reason: reason.trim() || undefined,
        payment_method: 'pay_at_clinic',
      });

      setIsBookingLoading(false);
      Alert.alert(
        'Booking Confirmed!',
        `Your consultation with Dr. ${doctor.doctor_name} on ${dateStr} at ${selectedSlot} is scheduled.`,
        [
          {
            text: 'View Appointments',
            onPress: () => {
              (navigation as any).navigate('AppointmentsTab');
            },
          },
          { text: 'Done', style: 'cancel' },
        ]
      );
    } catch (err: any) {
      setIsBookingLoading(false);
      Alert.alert('Booking Failed', err.message);
    }
  }

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white">
        <TouchableOpacity className="w-9 h-9 rounded-full bg-white items-center justify-center border border-slate-200" onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-lg font-bold color-[#0E224A]">Doctor Details</Text>
        <TouchableOpacity className="w-9 h-9 rounded-full bg-white items-center justify-center border border-slate-200" onPress={() => setIsFavorite(!isFavorite)}>
          <Heart
            size={22}
            color={isFavorite ? '#EF4444' : '#1E293B'}
            fill={isFavorite ? '#EF4444' : 'transparent'}
          />
        </TouchableOpacity>
      </View>


      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: insets.bottom + theme.spacing.lg }]}>
        <View className="bg-white rounded-2xl p-4 flex-row items-center border border-slate-100 mb-4 shadow-sm">
          <View className="relative mr-4">
            {doctor.doctor_profile_photo ? (
              <Image source={{ uri: doctor.doctor_profile_photo }} className="w-20 h-20 rounded-full bg-slate-100" contentFit="cover" />
            ) : (
              <View className="w-20 h-20 rounded-full bg-[#0284C7] items-center justify-center">
                <Text className="color-white font-bold text-2xl">{initials}</Text>
              </View>
            )}
            <View className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center mb-0.5">
              <Text className="text-lg font-bold color-slate-800 max-w-[85%]" numberOfLines={1}>
                Dr. {doctor.doctor_name}
              </Text>
              <BadgeCheck size={18} color="#00BCD4" className="ml-1" />
            </View>
            <Text className="text-xs color-[#00BCD4] font-semibold mb-0.5">{doctor.doctor_specialization ?? 'General Physician'}</Text>
            <Text className="text-xs color-slate-500 mb-1">{doctor.doctor_qualification ?? 'MBBS, MD'}</Text>

            <View className="bg-cyan-50 rounded px-2 py-1 self-start mt-1">
              <Text className="text-xs font-bold color-[#00A8B5]">Consultation Fee: ₹{doctor.doctor_consultation_fee ?? 500}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between mb-4 gap-2">
          <View className="flex-1 bg-white rounded-xl py-4 items-center border border-slate-100 shadow-sm">
            <View className="w-9 h-9 rounded-full bg-amber-100 items-center justify-center mb-1.5">
              <Star size={18} color="#FBC02D" fill="#FBC02D" />
            </View>
            <Text className="text-sm font-bold color-slate-800 mb-0.5">
              {doctor.doctor_rating !== undefined && doctor.doctor_rating !== null
                ? `${doctor.doctor_rating} ★`
                : '4.9 ★'}
            </Text>
            <Text className="text-[10px] color-slate-500 font-semibold">
              {doctor.doctor_reviews_count !== undefined && doctor.doctor_reviews_count !== null
                ? `${doctor.doctor_reviews_count}+ Reviews`
                : '120+ Reviews'}
            </Text>
          </View>

          <View className="flex-1 bg-white rounded-xl py-4 items-center border border-slate-100 shadow-sm">
            <View className="w-9 h-9 rounded-full bg-teal-100 items-center justify-center mb-1.5">
              <Users size={18} color="#00A8B5" />
            </View>
            <Text className="text-sm font-bold color-slate-800 mb-0.5">
              {doctor.doctor_patients_treated !== undefined && doctor.doctor_patients_treated !== null
                ? `${doctor.doctor_patients_treated}+`
                : '1,000+'}
            </Text>
            <Text className="text-[10px] color-slate-500 font-semibold">Patients</Text>
          </View>

          <View className="flex-1 bg-white rounded-xl py-4 items-center border border-slate-100 shadow-sm">
            <View className="w-9 h-9 rounded-full bg-blue-100 items-center justify-center mb-1.5">
              <Award size={18} color="#2196F3" />
            </View>
            <Text className="text-sm font-bold color-slate-800 mb-0.5">{doctor.doctor_experience ?? 5}+ Years</Text>
            <Text className="text-[10px] color-slate-500 font-semibold">Experience</Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-4 shadow-sm">
          <Text className="text-base font-bold color-slate-800 mb-2 mt-1">About Doctor</Text>

          <View className="flex-row bg-emerald-50/60 p-4 rounded-xl border-l-4 border-[#00A8B5] mb-4 items-start">
            <Quote size={20} color="#00A8B5" className="mr-1.5 -mt-0.5" />
            <Text className="flex-1 text-xs color-[#1B4332] italic leading-4.5 ml-2">
              {doctor.doctor_quote
                ? `"${doctor.doctor_quote.replace(/['"]+/g, '')}"`
                : '"Your health is your greatest wealth. My mission is to deliver comprehensive, compassionate, and personalized care."'}
            </Text>
          </View>

          <Text className="text-xs color-slate-600 leading-5 mb-4">
            {doctor.doctor_description ||
              `Dr. ${doctor.doctor_name} is a highly accomplished ${doctor.doctor_specialization ?? 'Specialist'} with extensive training in diagnosing and managing complex cases.`}
          </Text>

          <View className="h-[1px] bg-slate-100 mb-4" />

          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-bold color-slate-700">Languages:</Text>
            <Text className="text-xs color-[#00A8B5] font-semibold">{doctor.doctor_languages || 'English, Telugu, Hindi'}</Text>
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-teal-50 border border-teal-200 rounded-lg py-2.5 mt-4"
            onPress={() => (navigation as any).navigate('AskDoctor', {
              preselectedDoctorId: doctor.doctor_id,
              preselectedDoctorName: doctor.doctor_name,
            })}
          >
            <MessageSquare size={15} color="#00A8B5" />
            <Text className="text-xs font-bold color-[#00A8B5]">Ask Dr. {doctor.doctor_name.split(' ')[0]} a Question</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-4 shadow-sm">
          <Text className="text-base font-bold color-slate-800 mb-2 mt-1">Clinic & Quick Contact</Text>
          <View className="flex-row items-center gap-3">
            <MapPin size={20} color="#FF9800" />
            <View className="flex-1">
              <Text className="text-sm font-bold color-slate-700">{doctor.doctor_clinic_name || 'Vedika Healthcare Clinic'}</Text>
              <Text className="text-xs color-slate-500 mt-0.5">{doctor.doctor_clinic_address || 'Main Road, Health City'}</Text>
            </View>
          </View>

          <View className="flex-row gap-2 mt-3.5">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center bg-[#0284C7] py-2.5 rounded-xl gap-1.5"
              onPress={() => {
                const phone = doctor.doctor_mobile || '+919876543210';
                Linking.openURL(`tel:${phone}`).catch(() =>
                  Alert.alert('Notice', `Call ${phone}`)
                );
              }}
            >
              <Phone size={16} color="#FFF" />
              <Text className="color-white font-bold text-xs">Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center bg-[#0F766E] py-2.5 rounded-xl gap-1.5"
              onPress={() => {
                const query = encodeURIComponent(
                  `${doctor.doctor_clinic_name || ''} ${doctor.doctor_clinic_address || 'India'}`
                );
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
              }}
            >
              <NavigationIcon size={16} color="#FFF" />
              <Text className="color-white font-bold text-xs">Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center bg-[#25D366] py-2.5 rounded-xl gap-1.5"
              onPress={() => {
                const phone = (doctor.doctor_mobile || '919876543210').replace(/\D/g, '');
                const msg = encodeURIComponent(
                  `Hello Dr. ${doctor.doctor_name}, I would like to inquire about consultation slots.`
                );
                Linking.openURL(`whatsapp://send?phone=${phone}&text=${msg}`).catch(() =>
                  Linking.openURL(`https://api.whatsapp.com/send?phone=${phone}&text=${msg}`)
                );
              }}
            >
              <MessageCircle size={16} color="#FFF" />
              <Text className="color-white font-bold text-xs">WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-base font-bold color-slate-800 mb-2 mt-1">Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
          {dates.map((date, idx) => {
            const isSelected = getISODateString(date) === getISODateString(selectedDate);
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                onPress={() => setSelectedDate(date)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dateLabelActive]}>
                  {formatDateLabel(date).split(' ')[0]}
                </Text>
                <Text style={[styles.dateLabel, isSelected && styles.dateLabelActive]}>
                  {formatDateLabel(date).split(' ')[1]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text className="text-base font-bold color-slate-800 mb-2 mt-1">Available Time Slots</Text>
        {isSlotsLoading ? (
          <View style={styles.loadingSlots}>
            <ActivityIndicator size="small" color="#0F525D" />
            <Text style={styles.loadingText}>Fetching slots...</Text>
          </View>
        ) : (
          <View style={styles.slotsGrid}>
            {AVAILABLE_SLOTS.map((slot) => {
              const isBooked = bookedSlots.includes(slot);
              const isSelected = selectedSlot === slot;

              return (
                <TouchableOpacity
                  key={slot}
                  disabled={isBooked}
                  style={[
                    styles.slotButton,
                    isSelected && styles.slotButtonActive,
                    isBooked && styles.slotButtonDisabled,
                  ]}
                  onPress={() => setSelectedSlot(slot)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.slotText,
                      isSelected && styles.slotTextActive,
                      isBooked && styles.slotTextDisabled,
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text className="text-base font-bold color-slate-800 mb-2 mt-1">Reason for Visit (Optional)</Text>
        <TextInput
          style={styles.reasonInput}
          multiline
          numberOfLines={3}
          placeholder="Describe your health issue, symptoms, or check-up needs..."
          placeholderTextColor="#94A3B8"
          value={reason}
          onChangeText={setReason}
        />

        <View style={styles.actionSection}>
          <PrimaryButton
            title="Book Appointment"
            onPress={handleBookAppointment}
            isLoading={isBookingLoading}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Appointment</Text>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                <X size={22} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Doctor</Text>
                <Text style={styles.detailValue}>Dr. {doctor.doctor_name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time Slot</Text>
                <Text style={styles.detailValue}>{selectedSlot}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Consultation Fee</Text>
                <Text style={[styles.detailValue, { color: '#0F525D', fontWeight: '700' }]}>
                  ₹{doctor.doctor_consultation_fee ?? 500}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={[styles.detailValue, { color: '#FF9800', fontWeight: '600' }]}>
                  Pay at Clinic
                </Text>
              </View>
            </View>

            <Text style={styles.modalDisclaimer}>
              * No online payment required now. You can settle the consultation fee directly at the clinic reception.
            </Text>

            <View style={styles.modalAction}>
              <PrimaryButton title="Confirm Booking" onPress={confirmBooking} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    color: '#0E2229',
  },
  favButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  doctorInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: theme.spacing.md,
    ...theme.shadow.card,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: theme.spacing.lg,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 24,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    maxWidth: '85%',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  docSpecialization: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '600',
    marginBottom: 2,
  },
  docQualification: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: theme.spacing.xs,
  },
  feeBadge: {
    backgroundColor: '#E0F7FA',
    borderRadius: theme.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  feeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A8B5',
  },
  highlightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  highlightItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...theme.shadow.card,
  },
  highlightIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  highlightVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  highlightLbl: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  quoteBanner: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderLeftWidth: 3,
    borderLeftColor: '#00A8B5',
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  quoteIcon: {
    marginRight: 6,
    marginTop: -2,
  },
  quoteText: {
    flex: 1,
    fontSize: 13,
    color: '#1B4332',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  descriptionParagraph: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: theme.spacing.md,
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaInfoLbl: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  metaInfoVal: {
    fontSize: 13,
    color: '#00A8B5',
    fontWeight: '600',
  },
  askQuestionDirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E0F2F1',
    borderWidth: 1,
    borderColor: '#B2DFDB',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: theme.spacing.md,
  },
  askQuestionDirectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00A8B5',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: theme.spacing.md,
    ...theme.shadow.card,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  clinicDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  clinicTextGroup: {
    flex: 1,
  },
  clinicName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  clinicAddress: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  calendarScroll: {
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  dateCard: {
    width: 60,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...theme.shadow.card,
  },
  dateCardActive: {
    backgroundColor: '#0F525D',
    borderColor: '#0F525D',
  },
  dayLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  dateLabelActive: {
    color: '#FFFFFF',
  },
  loadingSlots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  slotButton: {
    width: '31%',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  slotButtonActive: {
    backgroundColor: '#0F525D',
    borderColor: '#0F525D',
  },
  slotButtonDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.5,
  },
  slotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  slotTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  slotTextDisabled: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  reasonInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textPrimary,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.lg,
  },
  actionSection: {
    marginTop: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0E2229',
  },
  modalDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalDisclaimer: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: theme.spacing.lg,
  },
  modalAction: {
    marginBottom: theme.spacing.sm,
  },
});
