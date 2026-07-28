/**
 * frontend/src/app/navigation/navigationHelpers.ts
 * Type-safe, simplified routing helper functions for the Patient Portal.
 */
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PatientStackParamList } from './PatientNavigator';
import type { PatientTabParamList } from './BottomTabNavigator';
import type { DoctorsRow } from '../../types/database';

export type PatientNavigationProp = NativeStackNavigationProp<PatientStackParamList>;

export function useAppNavigation() {
  const navigation = useNavigation<PatientNavigationProp>();

  return {
    goToDoctorProfile: (doctor: DoctorsRow) => {
      navigation.navigate('DoctorProfile', { doctor });
    },
    goToAskDoctor: (params?: { preselectedDoctorId?: string; preselectedDoctorName?: string }) => {
      navigation.navigate('AskDoctor', params);
    },
    goToEditProfile: () => {
      navigation.navigate('EditProfile');
    },
    goToAddress: () => {
      navigation.navigate('Address');
    },
    goToNotification: () => {
      navigation.navigate('Notification');
    },
    goBack: () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
    switchTab: (tabName: keyof PatientTabParamList) => {
      navigation.navigate('PatientTabs', { screen: tabName } as any);
    },
  };
}
