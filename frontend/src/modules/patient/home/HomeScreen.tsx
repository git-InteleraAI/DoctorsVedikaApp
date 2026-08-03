/**
 * frontend/src/modules/patient/home/HomeScreen.tsx
 * Professional, premium patient home dashboard.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Search,
  SlidersHorizontal,
  MessageCircle,
  Video,
  FileText,
  Pill,
  Bell,
  HelpCircle,
  BadgeCheck,
  Star,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../core/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getTopDoctors, subscribeDoctorUpdates } from '../../../features/doctor-discovery/api';
import { getNotifications } from '../../../features/notifications/api';
import type { DoctorsRow } from '../../../types/database';
import type { PatientStackParamList } from '../../../app/navigation/PatientNavigator';
import { QuickBookingBanner } from './components/QuickBookingBanner';

import assets from '../../../core/assets';

type NavProp = NativeStackNavigationProp<PatientStackParamList>;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function comingSoon(feature: string) {
  Alert.alert(feature, `${feature} is coming in a later module.`);
}

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { profile, patientProfile, session } = useAuth();
  const greeting = useMemo(getGreeting, []);
  const firstName = profile?.full_name?.split(' ')[0] ?? 'John';

  const [topDoctors, setTopDoctors] = useState<DoctorsRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const avatarUrl = patientProfile?.profile_photo || (session?.user?.user_metadata?.avatar_url as string | undefined);

  const initials = (profile?.full_name ?? 'John Doe')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  useEffect(() => {
    async function checkUnread() {
      if (profile?.id) {
        try {
          const notifs = await getNotifications(profile.id);
          setHasUnreadNotifications(notifs.some((n) => !n.is_read));
        } catch (err) {
          console.warn('[HomeScreen] Unread notifications check failed:', err);
        }
      }
    }

    checkUnread();

    const unsubscribe = navigation.addListener('focus', () => {
      setSearchQuery('');
      checkUnread();
    });
    return unsubscribe;
  }, [navigation, profile?.id]);

  useEffect(() => {
    let mounted = true;
    async function loadDoctors() {
      const data = await getTopDoctors(3);
      if (mounted) {
        setTopDoctors(data);
      }
    }
    loadDoctors();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeDoctorUpdates((updatedDoctor) => {
      setTopDoctors((prev) =>
        prev.map((d) =>
          d.doctor_id === updatedDoctor.doctor_id ? updatedDoctor : d
        )
      );
    });

    return unsubscribe;
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-[#F5FAFA]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        {
          paddingHorizontal: 20,
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 90,
        },
      ]}
    >
      {/* Header Row */}
      <View className="flex-row justify-between items-center mb-5">
        <TouchableOpacity
          className="flex-row items-center"
          activeOpacity={0.8}
          onPress={() => (navigation as any).navigate('Profile')}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="w-12 h-12 rounded-full mr-3 bg-slate-200" contentFit="cover" />
          ) : (
            <View className="w-12 h-12 rounded-full bg-[#0284C7] items-center justify-center mr-3">
              <Text className="color-white font-bold text-base">{initials}</Text>
            </View>
          )}
          <View className="justify-center">
            <Text className="text-2xl font-bold color-[#0F224A]">Hi, {firstName} 👋</Text>
            <Text className="text-xs color-[#6B7C93] mt-0.5">Take care and stay healthy!</Text>
          </View>
        </TouchableOpacity>

        <View className="flex-row gap-2.5">
          <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center relative border border-slate-100 shadow-sm" onPress={() => navigation.navigate('Notification')}>
            <Image source={assets.icons.notificationBell3d} style={{ width: 24, height: 24 }} contentFit="contain" />
            {hasUnreadNotifications && <View className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />}
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center border border-slate-100 shadow-sm" onPress={() => comingSoon('Chat')}>
            <MessageCircle size={20} color="#334155" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Row */}
      <View className="flex-row gap-2.5 mb-5">
        <TouchableOpacity
          className="flex-1 flex-row items-center bg-white rounded-full px-4 py-3 border border-slate-200 shadow-sm"
          activeOpacity={0.8}
          onPress={() => (navigation as any).navigate('Discover', { autofocusSearch: true })}
        >
          <Search size={18} color="#94A3B8" />
          <Text className="flex-1 text-sm color-[#94A3B8] ml-2.5" numberOfLines={1}>
            Search doctors, specialties, symptoms...
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-12 h-12 rounded-full bg-[#E0F7FA] items-center justify-center border border-slate-200 shadow-sm" onPress={() => (navigation as any).navigate('Discover')}>
          <SlidersHorizontal size={18} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* Quick Booking Banner */}
      <QuickBookingBanner onBookNow={() => (navigation as any).navigate('Discover')} />
      
      {/* Custom Bento Grid Layout (Uniform Compact Height matching Row 3) */}
      <View style={{ marginBottom: 18, gap: 10 }}>
        {/* ROW 1: Find Doctors (Wide 62%) + Educational Videos (Square 38%) */}
        <View style={{ flexDirection: 'row', gap: 10, height: 82 }}>
          {/* Card 1: Find Doctors (Wide Card) */}
          <TouchableOpacity
            style={{
              flex: 1.6,
              backgroundColor: '#E3F6F5',
              borderRadius: 20,
              paddingLeft: 10,
              paddingRight: 12,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              overflow: 'hidden',
              position: 'relative',
            }}
            activeOpacity={0.88}
            onPress={() => (navigation as any).navigate('Discover')}
          >
            <Image
              source={assets.bento.findDoctor}
              style={{ width: 75, height: 82, position: 'absolute', left: 0, bottom: 0 }}
              contentFit="cover"
              contentPosition="bottom left"
            />
            <View style={{ flex: 1, marginLeft: 68, justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#0E224A', lineHeight: 17 }}>
                Find Doctors
              </Text>
              <Text style={{ fontSize: 10, color: '#457A7C', fontWeight: '500', marginTop: 1, lineHeight: 13 }}>
                Consult specialists
              </Text>
            </View>
          </TouchableOpacity>

          {/* Card 2: Educational Videos (Square Card) */}
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#EAF2FF',
              borderRadius: 20,
              paddingHorizontal: 6,
              paddingVertical: 4,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
            activeOpacity={0.88}
            onPress={() => (navigation as any).navigate('Video')}
          >
            <Image
              source={assets.bento.educationalVideos}
              style={{ width: 66, height: 66 }}
              contentFit="contain"
            />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#0E224A', marginLeft: 2, flexShrink: 1, lineHeight: 14 }}>
              Educational{'\n'}Videos
            </Text>
          </TouchableOpacity>
        </View>

        {/* ROW 2: Health Records (Square 38%) + Prescriptions (Wide 62%) */}
        <View style={{ flexDirection: 'row', gap: 10, height: 82 }}>
          {/* Card 3: Health Records (Square Card) */}
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#EEEEFF',
              borderRadius: 20,
              paddingHorizontal: 6,
              paddingVertical: 4,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
            activeOpacity={0.88}
            onPress={() => comingSoon('Health Records')}
          >
            <Image
              source={assets.bento.healthRecords}
              style={{ width: 66, height: 66 }}
              contentFit="contain"
            />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#0E224A', marginLeft: 2, flexShrink: 1, lineHeight: 14 }}>
              Health{'\n'}Records
            </Text>
          </TouchableOpacity>

          {/* Card 4: Prescriptions (Wide Card) */}
          <TouchableOpacity
            style={{
              flex: 1.6,
              backgroundColor: '#EAF6EC',
              borderRadius: 20,
              paddingLeft: 8,
              paddingRight: 10,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
              overflow: 'hidden',
            }}
            activeOpacity={0.88}
            onPress={() => comingSoon('Prescriptions')}
          >
            <Image
              source={assets.bento.prescriptions}
              style={{ width: 68, height: 68, marginRight: 6 }}
              contentFit="contain"
            />
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#1B5E20', lineHeight: 17 }}>
                Prescriptions
              </Text>
              <Text style={{ fontSize: 10, color: '#3A7A42', fontWeight: '500', marginTop: 1, lineHeight: 13 }}>
                Digital Rx
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ROW 3: Reminders (Half 50%) + Ask a Doctor (Half 50%) */}
        <View style={{ flexDirection: 'row', gap: 10, height: 82 }}>
          {/* Card 5: Reminders */}
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#FFF3E0',
              borderRadius: 20,
              paddingHorizontal: 8,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
              overflow: 'hidden',
            }}
            activeOpacity={0.88}
            onPress={() => comingSoon('Reminders')}
          >
            <Image
              source={assets.bento.reminders}
              style={{ width: 66, height: 66 }}
              contentFit="contain"
            />
            <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#5D4037', marginLeft: 3 }}>
              Reminders
            </Text>
          </TouchableOpacity>

          {/* Card 6: Ask a Doctor */}
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#FDEEEE',
              borderRadius: 20,
              paddingHorizontal: 8,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
              overflow: 'hidden',
            }}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('AskDoctor')}
          >
            <Image
              source={assets.bento.askDoctor}
              style={{ width: 66, height: 66 }}
              contentFit="contain"
            />
            <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#5C1D1D', marginLeft: 2 }}>
              Ask a Doctor
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Doctors Section Header */}
      <View className="flex-row justify-between items-center mb-3.5">
        <Text className="text-xl font-bold color-[#0F224A]">Top Doctors</Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Discover')}>
          <Text className="text-sm font-semibold color-[#00BCD4]">View all</Text>
        </TouchableOpacity>
      </View>

      {/* Doctor Cards */}
      <View className="gap-3">
        {topDoctors.map((doctor) => {
          const docInitials = doctor.doctor_name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

          return (
            <TouchableOpacity
              key={doctor.doctor_id}
              className="flex-row items-center bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
              activeOpacity={0.9}
              onPress={() => navigation.navigate('DoctorProfile', { doctor })}
            >
              <View className="relative mr-3.5">
                {doctor.doctor_profile_photo ? (
                  <Image source={{ uri: doctor.doctor_profile_photo }} className="w-14 h-14 rounded-full bg-slate-200" contentFit="cover" />
                ) : (
                  <View className="w-14 h-14 rounded-full bg-[#00BCD4] items-center justify-center">
                    <Text className="color-white font-bold text-lg">{docInitials}</Text>
                  </View>
                )}
                <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#4CAF50] border-2 border-white" />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center mb-0.5">
                  <Text className="text-base font-bold color-[#0F224A]" numberOfLines={1}>
                    Dr. {doctor.doctor_name}
                  </Text>
                  <BadgeCheck size={16} color="#00BCD4" className="ml-1" />
                </View>
                <Text className="text-xs color-[#6B7C93] mb-1">
                  {doctor.doctor_specialization ?? 'General Physician'} • {doctor.doctor_experience ?? 5} Years Exp
                </Text>
                <View className="flex-row items-center gap-1">
                  <Star size={14} color="#FFC107" fill="#FFC107" />
                  <Text className="text-xs font-semibold color-[#334155]">
                    {doctor.doctor_rating !== undefined && doctor.doctor_rating !== null ? doctor.doctor_rating : '4.9'}{' '}
                    <Text className="color-[#94A3B8] font-normal">
                      ({doctor.doctor_reviews_count !== undefined && doctor.doctor_reviews_count !== null ? doctor.doctor_reviews_count : '120'} Reviews)
                    </Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                className="bg-[#0d254c] border border-[#0d254c] rounded-full px-5 py-2 shadow-sm shadow-[#00A8B5]/20"
                onPress={() => navigation.navigate('DoctorProfile', { doctor })}
              >
                <Text className="text-sm font-bold color-white">Book</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}


