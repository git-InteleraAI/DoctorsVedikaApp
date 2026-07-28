/**
 * frontend/src/modules/common/Onboarding/OnboardingScreen.tsx
 * High-fidelity, premium Patient Onboarding & Complete Profile screen.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { DatePickerModal } from '../../../core/components/DatePickerModal';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../core/theme';
import { FormInput } from '../../../core/components/FormInput';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { uploadPatientAvatar } from '../../../features/patient-profile/api';
import assets from '../../../core/assets';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = [
  { label: 'Male', icon: 'male-outline' },
  { label: 'Female', icon: 'female-outline' },
  { label: 'Other', icon: 'person-outline' },
] as const;

type GenderType = typeof GENDERS[number]['label'];

export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { profile, refreshProfile } = useAuth();
  const [gender, setGender] = useState<GenderType | null>(null);
  const [dob, setDob] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1));
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handlePickAvatar() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setAvatarUri(result.assets[0].uri);
        setPhotoBase64(result.assets[0].base64 ?? null);
      }
    } catch (err) {
      console.warn('Avatar picker error:', err);
    }
  }

  function parseDateToISO(dateStr: string): string | null {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    const parts = dateStr.trim().split(/[-/ ]+/);
    if (parts.length === 3) {
      let day = parseInt(parts[0], 10);
      let monthStr = parts[1];
      let year = parseInt(parts[2], 10);

      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        monthStr = parts[1];
        day = parseInt(parts[2], 10);
      }

      let month = parseInt(monthStr, 10) - 1;

      if (isNaN(month)) {
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        month = months.findIndex((m) => monthStr.toLowerCase().startsWith(m));
      }

      if (month >= 0 && month < 12 && day > 0 && day <= 31 && year > 1900) {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${year}-${pad(month + 1)}-${pad(day)}`;
      }
    }
    return null;
  }

  function validate(): string | null {
    if (!gender) return 'Please select your gender.';
    if (!dob.trim()) return 'Please select your date of birth from calendar.';
    if (!parseDateToISO(dob)) return 'Select a valid Date of Birth from the calendar.';
    if (!bloodGroup) return 'Please select your blood group.';
    if (!locality.trim()) return 'Please enter your locality / city.';
    if (!address.trim()) return 'Please enter your full address.';
    if (!phone.trim()) return 'Please enter your primary phone number.';
    return null;
  }

  async function handleOnboardingSubmit() {
    const errorMsg = validate();
    if (errorMsg) {
      setErrorMessage(errorMsg);
      Alert.alert('Validation Error', errorMsg);
      return;
    }

    if (!profile?.id) {
      setErrorMessage('Your session could not be verified. Please sign in again.');
      Alert.alert('Session Error', 'Your session could not be verified. Please sign in again.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const formattedDob = parseDateToISO(dob);

    const { error: userError } = await supabase
      .from('users')
      .update({ phone: phone.trim() })
      .eq('id', profile.id);

    if (userError) {
      setIsLoading(false);
      setErrorMessage(userError.message);
      Alert.alert('Database Save Error', userError.message);
      return;
    }

    let photoUrl = avatarUri;
    if (avatarUri && (avatarUri.startsWith('file://') || avatarUri.startsWith('content://'))) {
      try {
        photoUrl = await uploadPatientAvatar(
          profile.id,
          avatarUri,
          photoBase64 ?? undefined,
          profile.full_name ?? 'Patient'
        );
      } catch (uploadErr) {
        console.warn('[Onboarding] Photo upload warning, continuing profile save:', uploadErr);
      }
    }

    const { error } = await supabase
      .from('patients')
      .upsert(
        {
          user_id: profile.id,
          email: profile.email,
          gender: gender ? (gender.toLowerCase() as any) : null,
          date_of_birth: formattedDob,
          blood_group: bloodGroup,
          locality: locality.trim(),
          address: address.trim(),
          onboarding_completed: true,
          profile_photo: photoUrl ?? null,
        },
        { onConflict: 'user_id' }
      );

    setIsLoading(false);

    if (error) {
      console.error('[Onboarding] Upsert failed:', error);
      setErrorMessage(error.message);
      Alert.alert('Database Save Error', error.message);
      return;
    }

    await refreshProfile();
  }

  const safeTopPadding = Math.max(insets.top, 24) + 16;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topCurveDecoration} pointerEvents="none" />

      <View style={[styles.waveformBackground, { bottom: 20 }]} pointerEvents="none">
        <View style={styles.heartbeatRow}>
          <View style={styles.line} />
          <MaterialCommunityIcons name="heart-flash" size={18} color="#00BCD4" style={styles.pulseIcon} />
          <View style={styles.line} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          { paddingTop: safeTopPadding, paddingBottom: insets.bottom + theme.spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRightStethoscope} pointerEvents="none">
          <Image source={assets.images.stethoscope} style={styles.stethoscopeImage} resizeMode="contain" />
        </View>

        <Image source={assets.logo.withName} style={styles.cardLogo} resizeMode="contain" />

        <View style={styles.greetingHeader}>
          <Text style={styles.titleText}>
            Complete <Text style={styles.titleTextTeal}>Profile</Text>
          </Text>
          <Text style={styles.subtitleText}>Help us customize your healthcare experience</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickAvatar} activeOpacity={0.85}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Feather name="user" size={34} color="#00A8B5" />
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Feather name="camera" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHintText}>Tap to add profile photo</Text>
          </View>

          <View style={styles.sectionHeader}>
            <Feather name="user" size={16} color="#00A8B5" />
            <Text style={styles.sectionTitle}>Gender</Text>
          </View>
          <View style={styles.genderRow}>
            {GENDERS.map((item) => {
              const isActive = gender === item.label;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.genderCard, isActive && styles.genderCardActive]}
                  onPress={() => setGender(item.label)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={isActive ? '#FFFFFF' : '#64748B'}
                  />
                  <Text style={[styles.genderLabel, isActive && styles.genderLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
            <View pointerEvents="none">
              <FormInput
                label="Date of Birth"
                icon="calendar"
                placeholder="Tap to select Date of Birth from calendar"
                value={dob}
                editable={false}
              />
            </View>
          </TouchableOpacity>

          <DatePickerModal
            visible={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            onSelectDate={(formatted) => setDob(formatted)}
          />

          <View style={styles.sectionHeader}>
            <Feather name="droplet" size={16} color="#E53E3E" />
            <Text style={styles.sectionTitle}>Blood Group</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bloodChipsRow}
          >
            {BLOOD_GROUPS.map((item) => {
              const isActive = bloodGroup === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.bloodChip, isActive && styles.bloodChipActive]}
                  onPress={() => setBloodGroup(item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.bloodChipText, isActive && styles.bloodChipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={[styles.sectionHeader, { marginTop: theme.spacing.md }]}>
            <Feather name="map-pin" size={16} color="#00A8B5" />
            <Text style={styles.sectionTitle}>Locality & Address</Text>
          </View>

          <FormInput
            label="Locality / City"
            icon="map-pin"
            placeholder="e.g. Hyderabad, Telangana"
            value={locality}
            onChangeText={setLocality}
          />

          <FormInput
            label="Full Street Address"
            icon="home"
            placeholder="Door No, Street Name, Landmark"
            value={address}
            onChangeText={setAddress}
          />

          <View style={[styles.sectionHeader, { marginTop: theme.spacing.sm }]}>
            <Feather name="phone" size={16} color="#00A8B5" />
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>

          <FormInput
            label="Primary Phone Number"
            icon="phone"
            keyboardType="phone-pad"
            placeholder="e.g. +91 98765 43210"
            value={phone}
            onChangeText={setPhone}
          />

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={15} color={theme.colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
            onPress={handleOnboardingSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Save & Continue</Text>
                <View style={styles.arrowCircle}>
                  <Feather name="arrow-right" size={16} color="#00A8B5" />
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#EBF1F5' },
  container: {
    paddingHorizontal: theme.spacing.lg,
    flexGrow: 1,
  },
  topCurveDecoration: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.08,
    left: -SCREEN_WIDTH * 0.1,
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_HEIGHT * 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderBottomLeftRadius: SCREEN_WIDTH * 0.6,
    borderBottomRightRadius: SCREEN_WIDTH * 0.6,
    transform: [{ rotate: '-12deg' }],
  },
  topRightStethoscope: {
    position: 'absolute',
    top: 10,
    right: -20,
    zIndex: 2,
    opacity: 0.5,
  },
  stethoscopeImage: {
    width: 180,
    height: 180,
  },
  waveformBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    opacity: 0.08,
    alignItems: 'center',
  },
  heartbeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#00BCD4',
  },
  pulseIcon: {
    marginHorizontal: 8,
  },
  cardLogo: {
    width: 253,
    height: 143,
    alignSelf: 'center',
    marginLeft: -12,
    marginTop: -31,
    marginBottom: -24,
  },
  greetingHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    zIndex: 5,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F2537',
    textAlign: 'center',
  },
  titleTextTeal: {
    color: '#00A8B5',
  },
  subtitleText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 5,
    marginBottom: theme.spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatarWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    position: 'relative',
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#00A8B5',
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E6F7F5',
    borderWidth: 2,
    borderColor: '#00A8B5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00A8B5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarHintText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm + 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2537',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: theme.spacing.lg,
  },
  genderCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
  },
  genderCardActive: {
    backgroundColor: '#00A8B5',
    borderColor: '#00A8B5',
  },
  genderLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  genderLabelActive: {
    color: '#FFFFFF',
  },
  bloodChipsRow: {
    gap: 8,
    paddingBottom: theme.spacing.sm,
  },
  bloodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bloodChipActive: {
    backgroundColor: '#00A8B5',
    borderColor: '#00A8B5',
  },
  bloodChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  bloodChipTextActive: {
    color: '#FFFFFF',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.danger,
    fontWeight: '500',
    flex: 1,
  },
  submitButton: {
    height: 52,
    backgroundColor: '#00A8B5',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: theme.spacing.sm,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arrowCircle: {
    position: 'absolute',
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
