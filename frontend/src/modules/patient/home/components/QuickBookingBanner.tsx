/**
 * frontend/src/modules/patient/home/components/QuickBookingBanner.tsx
 * Premium Quick Booking Banner matching reference design with 3D Booking Icon image.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { ArrowRight, ShieldCheck, Clock, Lock } from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

import assets from '../../../../core/assets';

interface QuickBookingBannerProps {
  onBookNow: () => void;
}

export function QuickBookingBanner({ onBookNow }: QuickBookingBannerProps) {
  return (
    <View className="rounded-3xl bg-[#0F224A] mb-5 overflow-hidden shadow-lg shadow-[#00A8B5]/20 elevation-5">
      {/* Background Graphic SVG Waves & Decorative Elements */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
          <Defs>
            <LinearGradient id="navyBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#0B2144" />
              <Stop offset="60%" stopColor="#0F2851" />
              <Stop offset="100%" stopColor="#071630" />
            </LinearGradient>

            <LinearGradient id="tealRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#00A8B5" stopOpacity="1" />
              <Stop offset="100%" stopColor="#006575" stopOpacity="1" />
            </LinearGradient>

            <LinearGradient id="rimHighlightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#80DEEA" stopOpacity="0.9" />
              <Stop offset="100%" stopColor="#00A8B5" stopOpacity="0.2" />
            </LinearGradient>
          </Defs>

          {/* Dark Navy Background Base */}
          <Path d="M 0 0 H 400 V 300 H 0 Z" fill="url(#navyBgGrad)" />

          {/* Top-Left Decorative Dot Matrix Grid */}
          <Circle cx="16" cy="18" r="1.5" fill="#00A8B5" opacity={0.3} />
          <Circle cx="24" cy="18" r="1.5" fill="#00A8B5" opacity={0.3} />
          <Circle cx="32" cy="18" r="1.5" fill="#00A8B5" opacity={0.3} />
          <Circle cx="40" cy="18" r="1.5" fill="#00A8B5" opacity={0.3} />
          <Circle cx="16" cy="26" r="1.5" fill="#00A8B5" opacity={0.25} />
          <Circle cx="24" cy="26" r="1.5" fill="#00A8B5" opacity={0.25} />
          <Circle cx="32" cy="26" r="1.5" fill="#00A8B5" opacity={0.25} />
          <Circle cx="40" cy="26" r="1.5" fill="#00A8B5" opacity={0.25} />
          <Circle cx="16" cy="34" r="1.5" fill="#00A8B5" opacity={0.2} />
          <Circle cx="24" cy="34" r="1.5" fill="#00A8B5" opacity={0.2} />
          <Circle cx="32" cy="34" r="1.5" fill="#00A8B5" opacity={0.2} />
          <Circle cx="40" cy="34" r="1.5" fill="#00A8B5" opacity={0.2} />

          {/* Parabolic Lens Layer 1: Solid Teal Parabolic Ribbon */}
          <Path
            d="M 260 0 
               C 195 75, 195 225, 260 300 
               H 290 
               C 225 225, 225 75, 290 0 Z"
            fill="url(#tealRibbonGrad)"
          />

          {/* Parabolic Lens Layer 2: White/Mint Parabolic Aperture Cutout (Right 35%) */}
          <Path
            d="M 280 0 
               C 215 75, 215 225, 280 300 
               H 400 V 0 Z"
            fill="#EAF7F8"
          />

          {/* Parabolic Lens Layer 3: Luminous Cyan Rim Light Arc */}
          <Path
            d="M 260 0 
               C 195 75, 195 225, 260 300"
            stroke="url(#rimHighlightGrad)"
            strokeWidth="3.5"
            fill="none"
          />

          {/* 3 Concentric Dotted Halo Circles Shifted to Top Middle */}
          <Circle
            cx="310"
            cy="100"
            r="72"
            stroke="#00A8B5"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            fill="none"
            opacity={0.35}
          />
          <Circle
            cx="310"
            cy="100"
            r="52"
            stroke="#00A8B5"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            fill="none"
            opacity={0.28}
          />
          <Circle
            cx="310"
            cy="100"
            r="32"
            stroke="#00A8B5"
            strokeWidth="1"
            strokeDasharray="3 3"
            fill="none"
            opacity={0.22}
          />
        </Svg>
      </View>

      {/* Main Content Layout */}
      <View className="flex-row p-4 pb-4">
        {/* Left Side Section */}
        <View className="flex-1 pr-2.5">
          {/* Title enforced strictly in a single line */}
          <Text
            className="text-[28px] font-extrabold color-white leading-8 mb-1.5 tracking-tight"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            Book <Text className="color-[#00A8B5]">Appointment</Text>
          </Text>

          {/* Subtitle */}
          <Text className="text-xs color-white/80 leading-4 mb-3">
            Consult with top doctors{'\n'}at your convenience
          </Text>

          {/* Book Now CTA Button */}
          <TouchableOpacity
            className="flex-row items-center self-start bg-[#00A8B5] rounded-full pl-5 pr-2 py-2 mb-3 shadow-md shadow-[#00A8B5]/30 elevation-4"
            activeOpacity={0.88}
            onPress={onBookNow}
          >
            {/* Label */}
            <Text className="text-sm font-bold color-white mr-3">Book Now</Text>

            {/* Right Arrow Icon Slot */}
            <View className="w-7 h-7 rounded-full bg-white items-center justify-center">
              <ArrowRight size={14} color="#00A8B5" />
            </View>
          </TouchableOpacity>

          {/* Bottom 3 Trust Pillars */}
          <View className="flex-row items-center gap-3 border-t border-white/10 pt-2">
            {/* Pillar 1 */}
            <View className="flex-row items-center gap-1">
              <View className="w-5 h-5 rounded-full bg-[#00A8B5]/20 items-center justify-center">
                <ShieldCheck size={12} color="#00A8B5" />
              </View>
              <View>
                <Text className="text-[9.5px] font-bold color-white">Trusted Doctors</Text>
                <Text className="text-[7.5px] color-white/60">Verified & Experienced</Text>
              </View>
            </View>

            {/* Pillar 2 */}
            <View className="flex-row items-center gap-1">
              <View className="w-5 h-5 rounded-full bg-[#00A8B5]/20 items-center justify-center">
                <Clock size={12} color="#00A8B5" />
              </View>
              <View>
                <Text className="text-[9.5px] font-bold color-white">Fast & Easy</Text>
                <Text className="text-[7.5px] color-white/60">Book in few taps</Text>
              </View>
            </View>

            {/* Pillar 3 */}
            <View className="flex-row items-center gap-1">
              <View className="w-5 h-5 rounded-full bg-[#00A8B5]/20 items-center justify-center">
                <Lock size={12} color="#00A8B5" />
              </View>
              <View>
                <Text className="text-[9.5px] font-bold color-white">Secure & Safe</Text>
                <Text className="text-[7.5px] color-white/60">Your data is protected</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Right Side 3D Booking Icon Image Asset centered */}
        <View className="w-[140px] items-center justify-center my-auto overflow-visible">
          <Image
            source={assets.images.booking}
            style={{ width: 150, height: 150 }}
            contentFit="contain"
          />
        </View>
      </View>
    </View>
  );
}

