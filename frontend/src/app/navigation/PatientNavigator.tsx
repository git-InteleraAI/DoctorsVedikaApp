/**
 * frontend/src/app/navigation/PatientNavigator.tsx
 * Root stack for a logged-in patient.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { EditProfileScreen } from '../../(patient)/EditProfileScreen';
import { DoctorProfileScreen } from '../../(patient)/DoctorProfileScreen';
import { AddressScreen } from '../../(patient)/AddressScreen';
import { AskDoctorScreen } from '../../(patient)/AskDoctorScreen';
import { NotificationScreen } from '../../(patient)/NotificationScreen';
import type { DoctorsRow } from '../../types/database';

export type PatientStackParamList = {
  PatientTabs: undefined;
  EditProfile: undefined;
  DoctorProfile: { doctor: DoctorsRow };
  Address: undefined;
  AskDoctor?: { preselectedDoctorId?: string; preselectedDoctorName?: string };
  Notification: undefined;
};

const Stack = createNativeStackNavigator<PatientStackParamList>();

export function PatientNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientTabs" component={BottomTabNavigator} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
      <Stack.Screen name="Address" component={AddressScreen} />
      <Stack.Screen name="AskDoctor" component={AskDoctorScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
    </Stack.Navigator>
  );
}
