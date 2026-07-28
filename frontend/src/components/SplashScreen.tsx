/**
 * src/components/SplashScreen.tsx
 * Pixel-perfect implementation of Doctors Vedika Splash Screen
 * Uses Logo.png & DoctorsVedika.png assets with SVG background graphics.
 */
import React from 'react';
import { View, Text, Image, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LOGO_EMBLEM = require('../../assets/Logo.png');
const BRAND_NAME = require('../../assets/DoctorsVedika.png');
const STETHOSCOPE_IMG = require('../../assets/Stetescope.png');

export function SplashScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Background Dot Matrix Wave Pattern */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Svg height="100%" width="100%" viewBox={`0 0 ${SCREEN_WIDTH} 800`}>
          <G opacity={0.65}>
            <Circle cx={SCREEN_WIDTH * 0.95} cy={30} r={6} fill="#00B4D8" />
            <Circle cx={SCREEN_WIDTH * 0.90} cy={45} r={5.5} fill="#00B4D8" />
            <Circle cx={SCREEN_WIDTH * 0.85} cy={60} r={5} fill="#00B4D8" />
            <Circle cx={SCREEN_WIDTH * 0.80} cy={75} r={4.5} fill="#00B4D8" />

            <Circle cx={SCREEN_WIDTH * 0.98} cy={65} r={6.5} fill="#00B4D8" />
            <Circle cx={SCREEN_WIDTH * 0.92} cy={85} r={5.5} fill="#00B4D8" opacity={0.9} />
            <Circle cx={SCREEN_WIDTH * 0.86} cy={105} r={4.8} fill="#00B4D8" opacity={0.8} />
            <Circle cx={SCREEN_WIDTH * 0.80} cy={125} r={4.2} fill="#00B4D8" opacity={0.7} />
            <Circle cx={SCREEN_WIDTH * 0.74} cy={145} r={3.6} fill="#00B4D8" opacity={0.6} />

            <Circle cx={SCREEN_WIDTH * 0.95} cy={120} r={6} fill="#00B4D8" opacity={0.85} />
            <Circle cx={SCREEN_WIDTH * 0.89} cy={145} r={5} fill="#00B4D8" opacity={0.75} />
            <Circle cx={SCREEN_WIDTH * 0.83} cy={170} r={4.2} fill="#00B4D8" opacity={0.65} />
            <Circle cx={SCREEN_WIDTH * 0.77} cy={190} r={3.5} fill="#00B4D8" opacity={0.5} />
            <Circle cx={SCREEN_WIDTH * 0.70} cy={205} r={3.0} fill="#00B4D8" opacity={0.4} />

            <Circle cx={SCREEN_WIDTH * 0.92} cy={180} r={5.5} fill="#00B4D8" opacity={0.7} />
            <Circle cx={SCREEN_WIDTH * 0.86} cy={210} r={4.5} fill="#00B4D8" opacity={0.6} />
            <Circle cx={SCREEN_WIDTH * 0.80} cy={235} r={3.8} fill="#00B4D8" opacity={0.45} />
            <Circle cx={SCREEN_WIDTH * 0.73} cy={255} r={3.0} fill="#00B4D8" opacity={0.35} />

            <Circle cx={40} cy={180} r={36} fill="#00B4D8" opacity={0.06} />
            <Circle cx={40} cy={620} r={24} fill="#00B4D8" opacity={0.35} />
            <Circle cx={SCREEN_WIDTH * 0.78} cy={300} r={10} fill="#00B4D8" opacity={0.25} />
          </G>
        </Svg>
      </View>


      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Shield Logo Emblem (Logo.png) */}
        <View style={styles.logoContainer}>
          <Image
            source={LOGO_EMBLEM}
            style={styles.logoEmblem}
            resizeMode="contain"
          />
        </View>

        {/* Brand Text Image (DoctorsVedika.png) */}
        <View style={styles.brandTextContainer}>
          <Image
            source={BRAND_NAME}
            style={styles.brandNameImg}
            resizeMode="contain"
          />
        </View>

        {/* Divider with Center Heart Pulse Badge */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <View style={styles.heartPulseBadge}>
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
                fill="white"
              />
              <Path
                d="M7 12H9.5L11 9L13 15L14.5 12H17"
                stroke="#00B4D8"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={styles.dividerLine} />
        </View>

        {/* Tagline */}
        <Text style={styles.taglineText}>Your Health, Our Priority</Text>

        {/* Three Outlined Sub-feature Circular Badges */}
        <View style={styles.badgesRow}>
          {/* Badge 1: Shield Pulse */}
          <View style={styles.shadowBadge}>
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2L4 5V11C4 16.55 7.41 21.74 12 23C16.59 21.74 20 16.55 20 11V5L12 2Z"
                stroke="#00B4D8"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <Path
                d="M8 12H10L11.5 9.5L13 14.5L14.5 12H16"
                stroke="#00B4D8"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          {/* Badge 2: Heart Pulse */}
          <View style={styles.shadowBadge}>
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <Path
                d="M20.84 4.61A5.5 5.5 0 0 0 13 4.86L12 5.89L10.97 4.86A5.5 5.5 0 0 0 3.13 12.67L12 21.5L20.87 12.67A5.5 5.5 0 0 0 20.84 4.61Z"
                stroke="#00B4D8"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <Path
                d="M7.5 12H9.5L11 9.5L13 14.5L14.5 12H16.5"
                stroke="#00B4D8"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          {/* Badge 3: Stethoscope */}
          <View style={styles.shadowBadge}>
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <Path
                d="M4.8 2.5V8.5C4.8 12.42 7.98 15.6 11.9 15.6C15.82 15.6 19 12.42 19 8.5V2.5"
                stroke="#00B4D8"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <Path
                d="M11.9 15.6V18.5C11.9 20.16 13.24 21.5 14.9 21.5H16.5"
                stroke="#00B4D8"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <Circle cx="18.5" cy="21.5" r="2" stroke="#00B4D8" strokeWidth="2" />
              <Circle cx="4.8" cy="2.5" r="1.5" fill="#00B4D8" />
              <Circle cx="19" cy="2.5" r="1.5" fill="#00B4D8" />
            </Svg>
          </View>
        </View>
      </View>

      {/* Bottom Layered Liquid Waves Graphic & 3D Stethoscope */}
      <View style={styles.bottomWaveContainer}>
        <Svg height="210" width={SCREEN_WIDTH} viewBox={`0 0 ${SCREEN_WIDTH} 210`} style={StyleSheet.absoluteFillObject}>
          <Defs>
            <LinearGradient id="cyanWaveGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#4DD0E1" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#00B4D8" stopOpacity="0.9" />
            </LinearGradient>
          </Defs>

          <Path
            d={`M 0 90 Q ${SCREEN_WIDTH * 0.25} 40, ${SCREEN_WIDTH * 0.55} 100 T ${SCREEN_WIDTH} 60 V 210 H 0 Z`}
            fill="#80DEEA"
            opacity={0.45}
          />

          <Path
            d={`M 0 120 Q ${SCREEN_WIDTH * 0.35} 70, ${SCREEN_WIDTH * 0.7} 130 T ${SCREEN_WIDTH} 90 V 210 H 0 Z`}
            fill="url(#cyanWaveGrad)"
          />

          <Path
            d={`M 0 150 Q ${SCREEN_WIDTH * 0.4} 120, ${SCREEN_WIDTH * 0.75} 160 T ${SCREEN_WIDTH} 130 V 210 H 0 Z`}
            fill="#0B2545"
          />
        </Svg>

        <Image
          source={STETHOSCOPE_IMG}
          style={styles.stethoscopeImg}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5FBFD',
    justifyContent: 'space-between',
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  plusContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  haloRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F7FA',
    opacity: 0.6,
  },
  shadowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00B4D8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoEmblem: {
    width: 120,
    height: 120,
  },
  brandTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  brandNameImg: {
    width: 250,
    height: 54,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    width: 240,
    justifyContent: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  heartPulseBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00B4D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  taglineText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
    letterSpacing: 0.5,
    marginBottom: 28,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 4,
  },
  shadowBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#00B4D8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00B4D8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  bottomWaveContainer: {
    width: '100%',
    position: 'relative',
    height: 210,
    justifyContent: 'flex-end',
  },
  stethoscopeImg: {
    position: 'absolute',
    right: 0,
    bottom: -5,
    width: SCREEN_WIDTH * 0.52,
    height: 260,
  },
});
