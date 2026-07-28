/**
 * frontend/src/modules/patient/edit-profile/EditProfileScreen.tsx
 * Premium Edit Profile screen matching design tokens.
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
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { DatePickerModal } from '../../../core/components/DatePickerModal';
import { theme } from '../../../core/theme';
import { FormInput } from '../../../core/components/FormInput';
import { PrimaryButton } from '../../../core/components/PrimaryButton';
import { useAuth } from '../../../contexts/AuthContext';
import { updatePatientProfile } from '../../../features/patient-profile/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other'] as const;

type GenderType = typeof GENDERS[number];
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';

export function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { session, profile, patientProfile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [gender, setGender] = useState<GenderType | null>(
    patientProfile?.gender
      ? (patientProfile.gender.charAt(0).toUpperCase() + patientProfile.gender.slice(1)) as GenderType
      : null
  );
  const [dob, setDob] = useState(patientProfile?.date_of_birth ?? '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bloodGroup, setBloodGroup] = useState<string | null>(patientProfile?.blood_group ?? null);

  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    patientProfile?.profile_photo ?? session?.user?.user_metadata?.avatar_url ?? DEFAULT_AVATAR
  );
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your gallery to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setProfilePhoto(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 ?? null);
    }
  }

  async function handleSave() {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    const formattedDob = dob.trim() ? parseDateToISO(dob) : null;
    if (dob.trim() && !formattedDob) {
      Alert.alert('Validation Error', 'Enter Date of Birth in a valid format (e.g. 17 Oct 2000 or 17/10/2000).');
      return;
    }
    if (!profile?.id) {
      Alert.alert('Session Error', 'Your session could not be verified. Please sign in again.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await updatePatientProfile(profile.id, {
        full_name: fullName.trim(),
        gender: gender ? gender.toLowerCase() : undefined,
        date_of_birth: formattedDob ?? undefined,
        blood_group: bloodGroup ?? undefined,
        profile_photo: profilePhoto ?? undefined,
        profile_photo_base64: photoBase64 ?? undefined,
      });

      setIsLoading(false);
      await refreshProfile();
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message);
      Alert.alert('Save Failed', err.message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + theme.spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: profilePhoto || DEFAULT_AVATAR }} style={styles.avatarImage} />
            {isPhotoLoading && (
              <View style={styles.photoSpinner}>
                <ActivityIndicator size="small" color={theme.colors.textInverse} />
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.editPhotoBtn} onPress={handlePickImage}>
            <Feather name="camera" size={14} color={theme.colors.textInverse} />
            <Text style={styles.editPhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <FormInput
          label="Full Name"
          icon="user"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
        />

        <FormInput
          label="Phone Number"
          icon="phone"
          keyboardType="phone-pad"
          placeholder="e.g. +91 98765 43210"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderRow}>
          {GENDERS.map((item) => {
            const isActive = gender === item;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.genderButton, isActive && styles.genderButtonActive]}
                onPress={() => setGender(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.genderText, isActive && styles.genderTextActive]}>
                  {item}
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

        <Text style={styles.label}>Blood Group</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bloodChips}
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

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <View style={styles.actionRow} />
        <PrimaryButton title="Save Changes" onPress={handleSave} isLoading={isLoading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
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
  headerRightPlaceholder: {
    width: 36,
  },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...theme.shadow.card,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  photoSpinner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00A8B5',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    marginTop: theme.spacing.sm,
  },
  editPhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  genderRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  genderButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  genderButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  genderText: {
    ...theme.typography.bodyBold,
    color: theme.colors.textSecondary,
  },
  genderTextActive: {
    color: theme.colors.textInverse,
  },
  bloodChips: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  bloodChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bloodChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  bloodChipText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  bloodChipTextActive: {
    color: theme.colors.textInverse,
  },
  error: { ...theme.typography.body, color: theme.colors.danger, marginBottom: theme.spacing.sm },
  actionRow: { height: theme.spacing.sm },
});
