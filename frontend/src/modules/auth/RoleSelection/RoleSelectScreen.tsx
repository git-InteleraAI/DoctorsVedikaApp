/**
 * frontend/src/modules/auth/RoleSelection/RoleSelectScreen.tsx
 * "Who are you?" screen — lets the user choose between Doctor and Patient.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../app/navigation/AuthNavigator';
import { Heart, Stethoscope, Lock, User, ChevronRight, Activity } from 'lucide-react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import assets from '../../../core/assets';

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelect'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function RoleSelectScreen({ navigation }: Props) {
  function handleDoctorPress() {
    Alert.alert(
      'Doctor Portal Coming Soon',
      'The Doctor portal is currently under development. Please select Patient to proceed.',
      [{ text: 'Got it' }]
    );
  }

  function handlePatientPress() {
    navigation.navigate('Login');
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5FAFA]" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 2, paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Row: Top Right Cyan Dots */}
        <View className="flex-row justify-end items-center mb-0">
          <View className="w-20 h-12 justify-center items-end">
            <Svg height="50" width="80" viewBox="0 0 80 50">
              <Circle cx="60" cy="8" r="3.5" fill="#4DD0E1" opacity="0.7" />
              <Circle cx="72" cy="16" r="4.5" fill="#00ACC1" opacity="0.8" />
              <Circle cx="48" cy="20" r="2.5" fill="#80DEEA" opacity="0.6" />
              <Circle cx="58" cy="30" r="4.0" fill="#26C6DA" opacity="0.7" />
              <Circle cx="70" cy="38" r="3.0" fill="#80DEEA" opacity="0.8" />
              <Circle cx="42" cy="42" r="3.5" fill="#4DD0E1" opacity="0.5" />
            </Svg>
          </View>
        </View>

        {/* Brand Logo & Title Header */}
        <View className="items-center mt-0 mb-3">
          <Image
            source={assets.logo.withName}
            style={{ width: 330, height: 110, marginLeft: -16 }}
            contentFit="contain"
          />
          <Text className="text-3xl font-extrabold color-[#0F224A] text-center tracking-tight -mt-3">Who Are You?</Text>
          <Text className="text-sm color-[#6B7C93] text-center mt-0.5 mb-2.5">Choose an option to continue</Text>

          {/* Heart Divider Line */}
          <View className="flex-row items-center w-[70%] self-center">
            <View className="flex-1 h-[1px] bg-[#E1F0F2]" />
            <View className="w-7 h-7 rounded-full bg-[#00A8B5] justify-center items-center mx-2.5 shadow-sm">
              <Heart size={13} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <View className="flex-1 h-[1px] bg-[#E1F0F2]" />
          </View>
        </View>

        {/* Doctor Card */}
        <TouchableOpacity
          className="bg-white rounded-3xl h-[210px] mb-5 flex-row border border-[#E6F4F5] overflow-hidden relative"
          style={{
            shadowColor: '#00A8B5',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 14,
            elevation: 6,
          }}
          activeOpacity={0.88}
          onPress={handleDoctorPress}
        >
          <View className="absolute top-4 right-4 bg-[#EBF0F2] px-2.5 py-1 rounded-md z-20">
            <Text className="text-[9.5px] font-bold color-[#78909C] tracking-wider">COMING SOON</Text>
          </View>

          <View className="flex-[1.15] px-5 pt-5 pb-5 justify-between z-10">
            <View className="w-12 h-12 rounded-full bg-[#EBF0F2] items-center justify-center">
              <Stethoscope size={22} color="#78909C" />
            </View>

            <Text className="text-2xl font-bold color-[#0F224A] mt-1">Doctor</Text>
            <Text className="text-xs color-[#6B7C93] leading-4 mt-0.5 mb-2 pr-2">
              Join as a doctor to manage appointments and consult with patients.
            </Text>

            <View className="flex-row items-center self-start bg-[#EBF0F2] pl-3.5 pr-4 py-1.5 rounded-full border border-[#D5DFE3]">
              <Lock size={12} color="#78909C" className="mr-1.5" />
              <Text className="color-[#607D8B] text-xs font-semibold">Coming Soon</Text>
            </View>
          </View>

          <View className="flex-1 relative justify-end items-end overflow-hidden">
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject} viewBox="0 0 160 200" preserveAspectRatio="none">
              <Path
                d="M 40 0 C 10 60, 20 140, 0 200 L 160 200 L 160 0 Z"
                fill="#E2F4F6"
                opacity="0.8"
              />
              <Path
                d="M 70 0 C 40 70, 50 150, 30 200 L 160 200 L 160 0 Z"
                fill="#F0F9FA"
                opacity="0.6"
              />
            </Svg>

            <View className="absolute top-4 right-4 z-1" pointerEvents="none">
              <Svg height="45" width="45" viewBox="0 0 45 45">
                {[0, 12, 24].map((x) =>
                  [0, 12, 24].map((y) => (
                    <Circle key={`doc-${x}-${y}`} cx={x + 4} cy={y + 4} r="2" fill="#B0BEC5" opacity="0.4" />
                  ))
                )}
              </Svg>
            </View>

            <Image
              source={assets.images.doctor}
              style={{ width: 170, height: 210, position: 'absolute', bottom: 0, right: 22 }}
              contentFit="contain"
            />
          </View>
        </TouchableOpacity>

        {/* Patient Card */}
        <TouchableOpacity
          className="bg-white rounded-3xl h-[210px] mb-5 flex-row border border-[#E6F4F5] overflow-hidden relative"
          style={{
            shadowColor: '#00A8B5',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 14,
            elevation: 6,
          }}
          activeOpacity={0.92}
          onPress={handlePatientPress}
        >
          <View className="flex-[1.15] px-5 pt-5 pb-5 justify-between z-10">
            <View className="w-12 h-12 rounded-full bg-[#E0F7FA] items-center justify-center">
              <User size={22} color="#00A8B5" />
            </View>

            <Text className="text-2xl font-bold color-[#0F224A] mt-1">Patient</Text>
            <Text className="text-xs color-[#6B7C93] leading-4 mt-0.5 mb-2 pr-2">
              Join as a patient to book appointments and consult with doctors.
            </Text>

            <View className="flex-row items-center self-start bg-[#00A8B5] pl-4 pr-1.5 py-1.5 rounded-full shadow-md shadow-[#00A8B5]/30">
              <Text className="color-white text-sm font-bold mr-2.5">Select</Text>
              <View className="w-6 h-6 rounded-full bg-white items-center justify-center">
                <ChevronRight size={14} color="#00A8B5" />
              </View>
            </View>
          </View>

          <View className="flex-1 relative justify-end items-end overflow-hidden">
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject} viewBox="0 0 160 200" preserveAspectRatio="none">
              <Path
                d="M 40 0 C 10 60, 20 140, 0 200 L 160 200 L 160 0 Z"
                fill="#D5F3F6"
              />
              <Path
                d="M 70 0 C 40 70, 50 150, 30 200 L 160 200 L 160 0 Z"
                fill="#E8F9FA"
                opacity="0.6"
              />
            </Svg>

            <View className="absolute top-4 right-4 z-1" pointerEvents="none">
              <Svg height="45" width="45" viewBox="0 0 45 45">
                {[0, 12, 24].map((x) =>
                  [0, 12, 24].map((y) => (
                    <Circle key={`pat-${x}-${y}`} cx={x + 4} cy={y + 4} r="2" fill="#80DEEA" opacity="0.6" />
                  ))
                )}
              </Svg>
            </View>

            <View className="absolute right-3 top-[65px] w-8 h-8 rounded-full bg-white border border-[#B2EBF2] justify-center items-center z-20 shadow-sm">
              <Activity size={16} color="#00A8B5" />
            </View>

            <Image
              source={assets.images.patient}
              style={{ width: 170, height: 210, position: 'absolute', bottom: 0, right: 22 }}
              contentFit="contain"
            />
          </View>
        </TouchableOpacity>

        <View className="h-4" />
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 h-[160px]" pointerEvents="none">
        <Svg
          height="160"
          width={SCREEN_WIDTH}
          viewBox={`0 0 ${SCREEN_WIDTH} 160`}
          style={StyleSheet.absoluteFillObject}
        >
          <Defs>
            <LinearGradient id="cyanWaveGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#4DD0E1" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#00B4D8" stopOpacity="0.9" />
            </LinearGradient>
          </Defs>

          <Path
            d={`M 0 60 Q ${SCREEN_WIDTH * 0.25} 20, ${SCREEN_WIDTH * 0.55} 70 T ${SCREEN_WIDTH} 40 V 160 H 0 Z`}
            fill="#80DEEA"
            opacity={0.45}
          />

          <Path
            d={`M 0 85 Q ${SCREEN_WIDTH * 0.35} 45, ${SCREEN_WIDTH * 0.7} 95 T ${SCREEN_WIDTH} 65 V 160 H 0 Z`}
            fill="url(#cyanWaveGrad)"
          />

          <Path
            d={`M 0 110 Q ${SCREEN_WIDTH * 0.4} 85, ${SCREEN_WIDTH * 0.75} 120 T ${SCREEN_WIDTH} 95 V 160 H 0 Z`}
            fill="#0B2545"
          />
        </Svg>
      </View>
    </SafeAreaView>
  );
}


