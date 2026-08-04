/**
 * frontend/src/modules/patient/doctor-profile/DoctorProfileScreen.tsx
 * Complete visual & layout overhaul of Doctor Details & Appointment Booking Screen
 * Inspired by Pinterest UI references: Glassmorphic hero, floating contact bar,
 * 3-column stats pill, curved bottom sheet container (rounded-t-32), date capsules,
 * and sticky "Book Session" button.
 * Maintains 100% theme colors (#00A8B5, #0E224A, #E0F7FA, #FFFFFF) and real-time functionality.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ArrowLeft,
  Heart,
  BadgeCheck,
  Star,
  Users,
  Quote,
  MapPin,
  X,
  Clock,
  CheckCircle2,
  User,
  Calendar as CalendarIcon,
} from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../contexts/AuthContext';
import { getBookedSlots, subscribeBookedSlots } from '../../../features/doctor-discovery/api';
import { createAppointment } from '../../../features/appointments/api';
import { PrimaryButton } from '../../../core/components/PrimaryButton';
import type { PatientStackParamList } from '../../../app/navigation/PatientNavigator';

type RoutePropType = RouteProp<PatientStackParamList, 'DoctorProfile'>;
type PatientNavProp = NativeStackNavigationProp<PatientStackParamList>;

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
  const navigation = useNavigation<PatientNavProp>();
  const route = useRoute<RoutePropType>();
  const { doctor } = route.params;
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'details' | 'book'>('details');

  const dates = useMemo(() => {
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

  const openExternalUrl = useCallback(async (url: string, fallbackAlertMsg: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Notice', fallbackAlertMsg);
      }
    } catch {
      Alert.alert('Error', 'Unable to launch application.');
    }
  }, []);

  const getISODateString = useCallback((date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const loadBookedSlots = useCallback(async (date: Date) => {
    setIsSlotsLoading(true);
    try {
      const dateStr = getISODateString(date);
      const slots = await getBookedSlots(doctor.doctor_id, dateStr);
      setBookedSlots(slots || []);
    } catch (err) {
      console.error('Failed to load booked slots:', err);
      Alert.alert('Error', 'Unable to fetch available time slots. Please try again.');
    } finally {
      setIsSlotsLoading(false);
    }
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

  const initials = useMemo(() => {
    return (doctor.doctor_name || 'Dr')
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [doctor.doctor_name]);

  const formatDateLabel = useCallback((date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }, []);

  const currentMonthName = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedDate]);

  const parsedLanguages = useMemo(() => {
    const raw = doctor.doctor_languages;
    if (Array.isArray(raw)) {
      const cleaned = raw.map((lang) => String(lang).trim()).filter(Boolean);
      return cleaned.length > 0 ? cleaned : ['English', 'Telugu', 'Hindi'];
    }
    if (typeof raw === 'string' && raw.trim().length > 0) {
      const cleaned = raw.split(',').map((lang) => lang.trim()).filter(Boolean);
      return cleaned.length > 0 ? cleaned : ['English', 'Telugu', 'Hindi'];
    }
    return ['English', 'Telugu', 'Hindi'];
  }, [doctor.doctor_languages]);

  async function handleBookAppointment() {
    if (!selectedSlot) {
      Alert.alert('Selection Required', 'Please select a time slot.');
      return;
    }
    setShowConfirmModal(true);
  }

  async function confirmBooking() {
    if (!profile?.id || isBookingLoading) return;
    setIsBookingLoading(true);

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

      setShowConfirmModal(false);
      Alert.alert(
        'Booking Confirmed!',
        `Your consultation with Dr. ${doctor.doctor_name} on ${dateStr} at ${selectedSlot} is scheduled.`,
        [
          {
            text: 'View Appointments',
            onPress: () => {
              navigation.navigate('PatientTabs', { screen: 'Appointments' } as any);
            },
          },
          { text: 'Done', style: 'cancel' },
        ]
      );
    } catch (err: any) {
      Alert.alert('Booking Failed', err.message || 'Unable to complete appointment booking.');
    } finally {
      setIsBookingLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* GLASSMorphic TOP HERO SECTION */}
        <View style={styles.heroSectionBackground}>
          {/* Floating Top Navigation Header */}
          <View style={styles.topNavRow}>
            <TouchableOpacity style={styles.glassHeaderBtn} onPress={() => navigation.goBack()}>
              <ArrowLeft size={20} color="#0E224A" />
            </TouchableOpacity>

            <View style={styles.glassHeaderTitleBadge}>
              <Text style={styles.glassHeaderTitleText}>Doctor Details</Text>
            </View>

            <TouchableOpacity style={styles.glassHeaderBtn} onPress={() => setIsFavorite(!isFavorite)}>
              <Heart
                size={20}
                color={isFavorite ? '#EF4444' : '#0E224A'}
                fill={isFavorite ? '#EF4444' : 'transparent'}
              />
            </TouchableOpacity>
          </View>

          {/* Doctor Portrait & Details */}
          <View style={styles.heroProfileRow}>
            <View style={styles.heroAvatarWrapper}>
              {doctor.doctor_profile_photo ? (
                <Image source={{ uri: doctor.doctor_profile_photo }} style={styles.heroAvatarImg} contentFit="cover" />
              ) : (
                <View style={styles.heroAvatarInitials}>
                  <Text style={styles.heroInitialsText}>{initials}</Text>
                </View>
              )}
              <View style={styles.heroOnlineBadge} />
            </View>

            <View style={styles.heroTextCol}>
              <View style={styles.ratingGlassBadge}>
                <Star size={12} color="#D97706" fill="#D97706" />
                <Text style={styles.ratingBadgeText}>
                  {doctor.doctor_rating !== undefined && doctor.doctor_rating !== null ? doctor.doctor_rating : '4.9'}
                </Text>
                <Text style={styles.reviewsBadgeText}>
                  ({doctor.doctor_reviews_count ?? 120})
                </Text>
              </View>

              <View style={styles.heroNameRow}>
                <Text style={styles.heroNameText} numberOfLines={1}>
                  Dr. {doctor.doctor_name}
                </Text>
                <BadgeCheck size={18} color="#00BCD4" style={{ marginLeft: 4 }} />
              </View>

              <Text style={styles.heroSpecText}>
                {doctor.doctor_specialization ?? 'General Physician'}
              </Text>
              <Text style={styles.heroQualText}>
                {doctor.doctor_qualification ?? 'MBBS, MD'}
              </Text>
            </View>
          </View>

          {/* Floating Quick Action Contacts Bar */}
          <View style={styles.quickActionBar}>
            <TouchableOpacity
              style={[styles.quickActionTabBtn, activeTab === 'details' && styles.quickActionTabBtnActive]}
              onPress={() => setActiveTab('details')}
              activeOpacity={0.85}
            >
              <User size={15} color={activeTab === 'details' ? '#FFFFFF' : '#0E224A'} />
              <Text style={[styles.quickActionTabText, activeTab === 'details' && styles.quickActionTabTextActive]}>
                Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionTabBtn, activeTab === 'book' && styles.quickActionTabBtnActive]}
              onPress={() => setActiveTab('book')}
              activeOpacity={0.85}
            >
              <CalendarIcon size={15} color={activeTab === 'book' ? '#FFFFFF' : '#0E224A'} />
              <Text style={[styles.quickActionTabText, activeTab === 'book' && styles.quickActionTabTextActive]}>
                Book
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickIconCircleBtn}
              onPress={() => {
                const phone = doctor.doctor_mobile || '+919876543210';
                openExternalUrl(`tel:${phone}`, `Phone: ${phone}`);
              }}
            >
              <MaterialIcons name="call" size={18} color="#00A8B5" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickIconCircleBtn}
              onPress={() =>
                navigation.navigate('AskDoctor', {
                  preselectedDoctorId: doctor.doctor_id,
                  preselectedDoctorName: doctor.doctor_name,
                })
              }
            >
              <MaterialIcons name="chat" size={18} color="#00A8B5" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickIconCircleBtn}
              onPress={() => {
                const phone = (doctor.doctor_mobile || '919876543210').replace(/\D/g, '');
                const msg = encodeURIComponent(`Hello Dr. ${doctor.doctor_name}, inquiring about consultation.`);
                openExternalUrl(`whatsapp://send?phone=${phone}&text=${msg}`, `WhatsApp: ${phone}`);
              }}
            >
              <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
            </TouchableOpacity>
          </View>

          {/* 3-Column Floating Quick Stats Card */}
          <View style={styles.floatingStatsCard}>
            <View style={styles.statColItem}>
              <Clock size={20} color="#00A8B5" />
              <Text style={styles.statColValue}>{doctor.doctor_experience ?? 5}+ Yrs</Text>
              <Text style={styles.statColLabel}>Experience</Text>
            </View>

            <View style={styles.statColDivider} />

            <View style={styles.statColItem}>
              <Users size={20} color="#00A8B5" />
              <Text style={styles.statColValue}>
                {doctor.doctor_patients_treated !== undefined && doctor.doctor_patients_treated !== null
                  ? `${doctor.doctor_patients_treated}+`
                  : '1,000+'}
              </Text>
              <Text style={styles.statColLabel}>Patients</Text>
            </View>

            <View style={styles.statColDivider} />

            <View style={styles.statColItem}>
              <Star size={20} color="#D97706" fill="#D97706" />
              <Text style={styles.statColValue}>
                {doctor.doctor_reviews_count !== undefined && doctor.doctor_reviews_count !== null
                  ? `${doctor.doctor_reviews_count}+`
                  : '120+'}
              </Text>
              <Text style={styles.statColLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* BOTTOM CURVED SHEET CONTAINER */}
        <View
          style={[
            styles.curvedSheetContainer,
            { paddingBottom: activeTab === 'book' ? insets.bottom + 90 : insets.bottom + 24 },
          ]}
        >
          {/* Top Drag Handle */}
          <View style={styles.sheetHandleBar} />

          {/* TAB 1: DOCTOR OVERVIEW & CLINIC DETAILS */}
          {activeTab === 'details' && (
            <View>
              {/* About Doctor Section */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionBlockHeading}>About Doctor</Text>

                <View style={styles.quoteCalloutBox}>
                  <Quote size={18} color="#00A8B5" style={{ marginRight: 6, marginTop: 1 }} />
                  <Text style={styles.quoteCalloutText}>
                    {doctor.doctor_quote
                      ? `"${doctor.doctor_quote.replace(/['"]+/g, '')}"`
                      : '"Your health is your greatest wealth. My mission is to deliver comprehensive, compassionate, and personalized care."'}
                  </Text>
                </View>

                <Text style={styles.bioTextParagraph}>
                  {doctor.doctor_description ||
                    `Dr. ${doctor.doctor_name} is a highly accomplished ${doctor.doctor_specialization ?? 'Specialist'} with extensive training in diagnosing and managing complex medical conditions.`}
                </Text>

                <View style={styles.horizontalDivider} />

                <View style={styles.languagesGroup}>
                  <Text style={styles.languagesTitle}>Languages Spoken:</Text>
                  <View style={styles.languagePillContainer}>
                    {parsedLanguages.map((lang, idx) => (
                      <View key={idx} style={styles.langPillBadge}>
                        <Text style={styles.langPillText}>{lang}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.askQuestionDirectBtn}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('AskDoctor', {
                      preselectedDoctorId: doctor.doctor_id,
                      preselectedDoctorName: doctor.doctor_name,
                    })
                  }
                >
                  <MaterialIcons name="chat" size={18} color="#00A8B5" />
                  <Text style={styles.askQuestionDirectText}>
                    Ask Dr. {doctor.doctor_name.split(' ')[0]} a Question
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Clinic Location & Directions Section */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionBlockHeading}>Clinic & Directions</Text>

                <View style={styles.clinicCardContent}>
                  <View style={styles.clinicIconCircle}>
                    <MaterialIcons name="location-on" size={22} color="#FF9800" />
                  </View>
                  <View style={styles.clinicTextContent}>
                    <Text style={styles.clinicMainName}>
                      {doctor.doctor_clinic_name || 'Vedika Healthcare Clinic'}
                    </Text>
                    <Text style={styles.clinicMainAddr}>
                      {doctor.doctor_clinic_address || 'Main Road, Health City'}
                    </Text>
                  </View>
                </View>

                <View style={styles.clinicActionRow}>
                  <TouchableOpacity
                    style={[styles.clinicActionBtn, { backgroundColor: '#0284C7' }]}
                    onPress={() => {
                      const phone = doctor.doctor_mobile || '+919876543210';
                      openExternalUrl(`tel:${phone}`, `Phone: ${phone}`);
                    }}
                  >
                    <MaterialIcons name="call" size={16} color="#FFFFFF" />
                    <Text style={styles.clinicActionBtnText}>Call Clinic</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.clinicActionBtn, { backgroundColor: '#0F766E' }]}
                    onPress={() => {
                      const query = encodeURIComponent(
                        `${doctor.doctor_clinic_name || ''} ${doctor.doctor_clinic_address || 'India'}`
                      );
                      openExternalUrl(`https://www.google.com/maps/search/?api=1&query=${query}`, 'Maps link unavailable.');
                    }}
                  >
                    <MaterialIcons name="directions" size={16} color="#FFFFFF" />
                    <Text style={styles.clinicActionBtnText}>Get Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Direct CTA to Jump to Booking */}
              <View style={{ marginTop: 10 }}>
                <PrimaryButton
                  title="Proceed to Book Appointment"
                  onPress={() => setActiveTab('book')}
                />
              </View>
            </View>
          )}

          {/* TAB 2: BOOK APPOINTMENT */}
          {activeTab === 'book' && (
            <View>
              {/* Select Date Header & Month Selector */}
              <View style={styles.bookingSectionHeader}>
                <Text style={styles.bookingSectionTitle}>Select Date</Text>
                <View style={styles.monthSelectorPill}>
                  <Text style={styles.monthSelectorText}>{currentMonthName}</Text>
                </View>
              </View>

              {/* Horizontal Date Capsules */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateCapsuleScrollContainer}
              >
                {dates.map((date, idx) => {
                  const isSelected = getISODateString(date) === getISODateString(selectedDate);
                  const [dayName, dateNum] = formatDateLabel(date).split(' ');
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.dateCapsuleCard, isSelected && styles.dateCapsuleCardActive]}
                      onPress={() => setSelectedDate(date)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.capsuleDayName, isSelected && styles.capsuleDayNameActive]}>
                        {dayName}
                      </Text>
                      <Text style={[styles.capsuleDateNum, isSelected && styles.capsuleDateNumActive]}>
                        {dateNum}
                      </Text>
                      {isSelected && <View style={styles.capsuleActiveDot} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Select Time Slot Header */}
              <View style={styles.bookingSectionHeader}>
                <Text style={styles.bookingSectionTitle}>Select Time Slot</Text>
                {selectedSlot && (
                  <View style={styles.selectedSlotPillBadge}>
                    <CheckCircle2 size={12} color="#00838F" />
                    <Text style={styles.selectedSlotPillBadgeText}>{selectedSlot}</Text>
                  </View>
                )}
              </View>

              {/* 3-Column Time Slot Grid */}
              {isSlotsLoading ? (
                <View style={styles.slotLoadingBox}>
                  <ActivityIndicator size="small" color="#00A8B5" />
                  <Text style={styles.slotLoadingText}>Fetching live available slots...</Text>
                </View>
              ) : (
                <View style={styles.timeSlotGridContainer}>
                  {AVAILABLE_SLOTS.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = selectedSlot === slot;

                    return (
                      <TouchableOpacity
                        key={slot}
                        disabled={isBooked}
                        style={[
                          styles.slotButtonPill,
                          isSelected && styles.slotButtonPillActive,
                          isBooked && styles.slotButtonPillDisabled,
                        ]}
                        onPress={() => setSelectedSlot(slot)}
                        activeOpacity={0.8}
                      >
                        <Clock
                          size={13}
                          color={isSelected ? '#FFFFFF' : isBooked ? '#CBD5E1' : '#64748B'}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            styles.slotButtonPillText,
                            isSelected && styles.slotButtonPillTextActive,
                            isBooked && styles.slotButtonPillTextDisabled,
                          ]}
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Reason for Visit Optional Text Box */}
              <Text style={styles.bookingSectionTitle}>Reason for Visit (Optional)</Text>
              <TextInput
                style={styles.reasonInputContainer}
                multiline
                numberOfLines={3}
                placeholder="Describe your health issue, symptoms, or check-up needs..."
                placeholderTextColor="#94A3B8"
                value={reason}
                onChangeText={setReason}
                maxLength={500}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Floating Action Bar for Book Tab */}
      {activeTab === 'book' && (
        <View style={[styles.stickyBottomBarContainer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <View style={styles.stickyBottomBarContent}>
            <View style={styles.bottomFeeInfoGroup}>
              <Text style={styles.bottomFeeTitle}>Consultation Fee</Text>
              <Text style={styles.bottomFeeAmount}>₹{doctor.doctor_consultation_fee ?? 500}</Text>
            </View>

            <View style={styles.bottomCtaButtonBox}>
              <PrimaryButton
                title={selectedSlot ? `Book Session (${selectedSlot})` : 'Book Session'}
                onPress={handleBookAppointment}
                isLoading={isBookingLoading}
              />
            </View>
          </View>
        </View>
      )}

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeadingText}>Confirm Appointment</Text>
              <TouchableOpacity
                style={styles.modalCloseCircleBtn}
                onPress={() => setShowConfirmModal(false)}
              >
                <X size={20} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSummaryBox}>
              <View style={styles.modalRowItem}>
                <Text style={styles.modalRowLabel}>Doctor</Text>
                <Text style={styles.modalRowValue}>Dr. {doctor.doctor_name}</Text>
              </View>

              <View style={styles.modalRowItem}>
                <Text style={styles.modalRowLabel}>Specialization</Text>
                <Text style={styles.modalRowValue}>
                  {doctor.doctor_specialization ?? 'General Physician'}
                </Text>
              </View>

              <View style={styles.modalRowItem}>
                <Text style={styles.modalRowLabel}>Date</Text>
                <Text style={styles.modalRowValue}>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>

              <View style={styles.modalRowItem}>
                <Text style={styles.modalRowLabel}>Time Slot</Text>
                <Text style={[styles.modalRowValue, { color: '#00A8B5', fontWeight: '700' }]}>
                  {selectedSlot}
                </Text>
              </View>

              <View style={styles.modalRowItem}>
                <Text style={styles.modalRowLabel}>Consultation Fee</Text>
                <Text style={[styles.modalRowValue, { color: '#00A8B5', fontWeight: '700' }]}>
                  ₹{doctor.doctor_consultation_fee ?? 500}
                </Text>
              </View>

              <View style={styles.modalRowItem}>
                <Text style={styles.modalRowLabel}>Payment Method</Text>
                <View style={styles.payAtClinicBadgeTag}>
                  <Text style={styles.payAtClinicTagText}>Pay at Clinic</Text>
                </View>
              </View>
            </View>

            <Text style={styles.modalDisclaimerText}>
              * No online payment required now. You can settle the consultation fee directly at the clinic reception.
            </Text>

            <View style={{ marginBottom: 6 }}>
              <PrimaryButton title="Confirm Booking" onPress={confirmBooking} isLoading={isBookingLoading} />
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

  /* Top Hero Section */
  heroSectionBackground: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  glassHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  glassHeaderTitleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  glassHeaderTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0E224A',
  },

  /* Hero Profile Info */
  heroProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  heroAvatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  heroAvatarImg: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  heroAvatarInitials: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#00A8B5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  heroInitialsText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 28,
  },
  heroOnlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  heroTextCol: {
    flex: 1,
  },
  ratingGlassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 4,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  reviewsBadgeText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  heroNameText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0E224A',
    maxWidth: '85%',
  },
  heroSpecText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00A8B5',
    marginBottom: 2,
  },
  heroQualText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Floating Quick Action Contacts Bar */
  quickActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  quickActionTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 5,
  },
  quickActionTabBtnActive: {
    backgroundColor: '#00A8B5',
  },
  quickActionTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0E224A',
  },
  quickActionTabTextActive: {
    color: '#FFFFFF',
  },
  quickIconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  /* 3-Column Floating Quick Stats Card */
  floatingStatsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  statColItem: {
    flex: 1,
    alignItems: 'center',
  },
  statColValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0E224A',
    marginTop: 4,
    marginBottom: 1,
  },
  statColLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  statColDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#F1F5F9',
  },

  /* Curved Bottom Sheet Container */
  curvedSheetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 10,
    marginTop: -10,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  sheetHandleBar: {
    width: 44,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },

  /* Section Blocks in Tab 1 */
  sectionBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionBlockHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0E224A',
    marginBottom: 10,
  },
  quoteCalloutBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 14,
    borderLeftWidth: 3.5,
    borderLeftColor: '#00A8B5',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  quoteCalloutText: {
    flex: 1,
    fontSize: 12.5,
    color: '#1B4332',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  bioTextParagraph: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  languagesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  languagesTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  languagePillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  langPillBadge: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  langPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#00838F',
  },
  askQuestionDirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E0F2F1',
    borderWidth: 1,
    borderColor: '#B2DFDB',
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 14,
  },
  askQuestionDirectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00A8B5',
  },

  /* Clinic Section */
  clinicCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clinicIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clinicTextContent: {
    flex: 1,
  },
  clinicMainName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  clinicMainAddr: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  clinicActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  clinicActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  clinicActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  /* TAB 2: BOOK APPOINTMENT STYLES */
  bookingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 6,
  },
  bookingSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0E224A',
  },
  monthSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  monthSelectorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0E224A',
  },
  dateCapsuleScrollContainer: {
    paddingBottom: 16,
    gap: 12,
  },
  dateCapsuleCard: {
    width: 64,
    height: 78,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  dateCapsuleCardActive: {
    backgroundColor: '#00A8B5',
    borderColor: '#00A8B5',
    shadowColor: '#00A8B5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  capsuleDayName: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  capsuleDayNameActive: {
    color: '#E0F7FA',
  },
  capsuleDateNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0E224A',
  },
  capsuleDateNumActive: {
    color: '#FFFFFF',
  },
  capsuleActiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 6,
  },

  /* Time Slots Grid */
  selectedSlotPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  selectedSlotPillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00838F',
  },
  slotLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  slotLoadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  timeSlotGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  slotButtonPill: {
    width: '31.5%',
    paddingVertical: 11,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  slotButtonPillActive: {
    backgroundColor: '#00A8B5',
    borderColor: '#00A8B5',
    shadowColor: '#00A8B5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  slotButtonPillDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.5,
  },
  slotButtonPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  slotButtonPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  slotButtonPillTextDisabled: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },

  /* Reason Box */
  reasonInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    fontSize: 13,
    color: '#1E293B',
    textAlignVertical: 'top',
    marginTop: 8,
    marginBottom: 14,
  },

  /* Sticky Bottom Bar */
  stickyBottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  stickyBottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  bottomFeeInfoGroup: {
    justifyContent: 'center',
  },
  bottomFeeTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  bottomFeeAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00A8B5',
  },
  bottomCtaButtonBox: {
    flex: 1,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0E224A',
  },
  modalCloseCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSummaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalRowLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  modalRowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  payAtClinicBadgeTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  payAtClinicTagText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D97706',
  },
  modalDisclaimerText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: 18,
  },
});
