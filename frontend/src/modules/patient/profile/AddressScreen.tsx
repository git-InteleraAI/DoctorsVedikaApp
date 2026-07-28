/**
 * frontend/src/modules/patient/profile/AddressScreen.tsx
 * Premium address management screen.
 * All business logic lives in useAddressForm — this file is UI-only.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../core/theme';
import { FormInput } from '../../../core/components/FormInput';
import { PrimaryButton } from '../../../core/components/PrimaryButton';
import { useAddressForm } from './useAddressForm';

export function AddressScreen() {
  const insets = useSafeAreaInsets();
  const {
    city,
    setCity,
    streetAddress,
    setStreetAddress,
    isLoading,
    handleSaveAddress,
    handleGoBack,
  } = useAddressForm();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Feather name="arrow-left" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + theme.spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Live preview card — reflects what is currently saved */}
        <View style={styles.addressCard}>
          <View style={styles.addressCardHeader}>
            <View style={styles.homeBadge}>
              <Ionicons name="home" size={16} color={styles.accentText.color} />
              <Text style={styles.homeBadgeText}>Home Address</Text>
            </View>
            <Feather name="map-pin" size={18} color={theme.colors.textSecondary} />
          </View>

          <Text style={styles.addressLocality}>
            {city.trim() || 'No Locality Configured'}
          </Text>
          <Text style={styles.addressDetails}>
            {streetAddress.trim() || 'No Street Address Configured'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Edit Address Details</Text>

        <FormInput
          label="Locality / City"
          icon="map-pin"
          placeholder="e.g. Hyderabad, Telangana"
          value={city}
          onChangeText={setCity}
        />

        <FormInput
          label="Full Street Address"
          icon="home"
          placeholder="e.g. Humayun Nagar, House #12"
          value={streetAddress}
          onChangeText={setStreetAddress}
        />

        <View style={styles.spacer} />
        <PrimaryButton
          title="Update Address"
          onPress={handleSaveAddress}
          isLoading={isLoading}
        />
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
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  addressCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
    ...theme.shadow.card,
  },
  addressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  homeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    gap: 6,
  },
  // Hidden style used only to pull the accent color for the Ionicons prop
  accentText: {
    color: theme.colors.accent,
  },
  homeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  addressLocality: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  addressDetails: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  spacer: {
    height: theme.spacing.md,
  },
});
