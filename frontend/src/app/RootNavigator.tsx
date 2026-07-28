/**
 * src/app/RootNavigator.tsx
 * The single decision point: no session -> AuthNavigator, session -> role-based navigator.
 * Only 'patient' is wired up (your owned vertical). Other roles fall back to
 * AuthNavigator with a warning — Doctor/Admin/Assistant navigators are owned
 * by other team members and will be wired in by them.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { AuthNavigator } from '../navigation/AuthNavigator';
import { PatientNavigator } from '../navigation/PatientNavigator';
import { OnboardingScreen } from '../(auth)/OnboardingScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { session, profile, patientProfile, isLoading } = useAuth();

  if (isLoading) {
    return null; // AppInitializer shows the loading UI, so render nothing here
  }

  // 1. Unauthenticated -> Auth Flow
  if (!session) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  // 2. Authenticated Patient -> Check Onboarding Status
  if (profile?.role === 'patient') {
    if (!patientProfile || !patientProfile.onboarding_completed) {
      return (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }

    return (
      <NavigationContainer>
        <PatientNavigator />
      </NavigationContainer>
    );
  }

  // 3. Fallback / Other roles
  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
}
