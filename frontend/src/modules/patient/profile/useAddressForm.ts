/**
 * frontend/src/modules/patient/profile/useAddressForm.ts
 * Custom hook encapsulating address form state, validation, and save logic.
 * Keeps AddressScreen a pure render component.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../contexts/AuthContext';
import { updateUserAddress } from '../../../features/patient-profile/api';
import { ApiError } from '../../../core/api/httpClient';
import type { PatientStackParamList } from '../../../app/navigation/PatientNavigator';

type AddressNav = NativeStackNavigationProp<PatientStackParamList, 'Address'>;

/** Maps ApiError status codes to user-friendly messages. Never leaks server details. */
function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.statusCode === 504) return 'Request timed out. Please check your connection and try again.';
    if (err.statusCode === 401) return 'Your session has expired. Please sign in again.';
    if (err.statusCode >= 500) return 'A server error occurred. Please try again later.';
    if (err.statusCode >= 400) return 'Invalid request. Please check your input and try again.';
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred. Please try again.';
}

export function useAddressForm() {
  const navigation = useNavigation<AddressNav>();
  const { profile, patientProfile, refreshProfile } = useAuth();

  const [city, setCity] = useState(patientProfile?.locality ?? '');
  const [streetAddress, setStreetAddress] = useState(patientProfile?.address ?? '');
  const [isLoading, setIsLoading] = useState(false);

  // Sync initial values from patientProfile only on first load.
  // Using a ref prevents the form from being overwritten if the profile
  // is refreshed in the background while the user is actively editing.
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (patientProfile && !hasInitialized.current) {
      setCity(patientProfile.locality ?? '');
      setStreetAddress(patientProfile.address ?? '');
      hasInitialized.current = true;
    }
  }, [patientProfile]);

  const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleSaveAddress = useCallback(async () => {
    // Guard: surface session expiry rather than silently failing
    if (!profile?.id) {
      Alert.alert('Session Expired', 'Please sign in again to update your address.');
      return;
    }

    // Client-side validation
    if (!city.trim()) {
      Alert.alert('Validation Error', 'Please enter your Locality / City.');
      return;
    }
    if (!streetAddress.trim()) {
      Alert.alert('Validation Error', 'Please enter your Full Address.');
      return;
    }

    setIsLoading(true);

    try {
      // Save address and refresh profile inside a single try block so any
      // failure (including from refreshProfile) is caught and reported.
      await updateUserAddress(profile.id, {
        address: streetAddress.trim(),
        locality: city.trim(),
      });

      await refreshProfile();

      Alert.alert('Success', 'Address updated successfully.', [
        { text: 'OK', onPress: handleGoBack },
      ]);
    } catch (err: unknown) {
      // Map error to a safe, user-friendly message — never expose raw server details.
      Alert.alert('Save Failed', getErrorMessage(err));
    } finally {
      // Always clear loading state, regardless of success or failure.
      setIsLoading(false);
    }
  }, [profile?.id, city, streetAddress, refreshProfile, handleGoBack]);

  return {
    city,
    setCity,
    streetAddress,
    setStreetAddress,
    isLoading,
    handleSaveAddress,
    handleGoBack,
  };
}
