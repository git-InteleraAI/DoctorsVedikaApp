/**
 * frontend/src/app/navigation/BottomTabNavigator.tsx
 * Custom Floating Bottom Navigation Bar with Active Circular Action Button & Video Module
 */
import React from 'react';
import { Image } from 'expo-image';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Video, Compass, Calendar, User, Circle } from 'lucide-react-native';
import { HomeScreen } from '../../modules/patient/home/HomeScreen';
import { VideoScreen } from '../../(patient)/VideoScreen';
import { DiscoverScreen } from '../../(patient)/DiscoverScreen';
import { AppointmentsScreen } from '../../(patient)/AppointmentsScreen';
import { ProfileScreen } from '../../(patient)/ProfileScreen';
import { FloatingBottomBar } from '../../components/BottomNavigation';
import { NavTabItem } from '../../components/BottomNavigation/constants';


import assets from '../../core/assets';

export type PatientTabParamList = {
  Home: undefined;
  Video: undefined;
  Discover: undefined;
  Appointments: undefined;
  Profile: undefined;
};

const TABS: NavTabItem[] = [
  {
    key: 'Home',
    name: 'Home',
    label: 'Home',
    iconName: 'home-outline',
    iconType: 'ionicons',
  },
  {
    key: 'Video',
    name: 'Video',
    label: 'Video',
    iconName: 'videocam-outline',
    iconType: 'ionicons',
  },
  {
    key: 'Discover',
    name: 'Discover',
    label: 'Discover',
    iconName: 'compass-outline',
    iconType: 'ionicons',
  },
  {
    key: 'Appointments',
    name: 'Appointments',
    label: 'Appointments',
    iconName: 'calendar-outline',
    iconType: 'ionicons',
  },
  {
    key: 'Profile',
    name: 'Profile',
    label: 'Profile',
    iconName: 'user',
    iconType: 'feather',
  },
];

function renderTabIcon(name: string, isFocused: boolean, size: number) {
  let iconSource;
  switch (name) {
    case 'Home':
      iconSource = isFocused ? assets.navBar.homeSelected : assets.navBar.home;
      break;
    case 'Video':
      iconSource = isFocused ? assets.navBar.videoSelected : assets.navBar.video;
      break;
    case 'Discover':
      iconSource = isFocused ? assets.navBar.discoverSelected : assets.navBar.discover;
      break;
    case 'Appointments':
      iconSource = isFocused ? assets.navBar.appointmentSelected : assets.navBar.appointment;
      break;
    case 'Profile':
      iconSource = isFocused ? assets.navBar.profileSelected : assets.navBar.profile;
      break;
    default:
      return <Circle size={size} color="#64748B" />;
  }

  let finalSize = name === 'Profile' ? Math.round(size * 1.15) : size;

  return (
    <Image
      source={iconSource}
      style={{ width: finalSize, height: finalSize }}
      contentFit="contain"
    />
  );
}

const Tab = createBottomTabNavigator<PatientTabParamList>();

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => (
        <FloatingBottomBar
          {...(props as any)}
          tabs={TABS}
          renderTabIcon={renderTabIcon}
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Video" component={VideoScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
