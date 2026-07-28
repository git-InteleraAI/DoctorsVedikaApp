/**
 * frontend/src/components/BottomNavigation/AnimatedWave.tsx
 * Clean, solid rounded floating bar background (Notch-free)
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NAV_DESIGN_TOKENS } from './constants';

interface AnimatedWaveProps {
  width: number;
  height: number;
  notchCx?: number;
}

export function AnimatedWave({ width, height }: AnimatedWaveProps) {
  if (width <= 0 || height <= 0) return null;

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: NAV_DESIGN_TOKENS.barBackground,
          borderRadius: NAV_DESIGN_TOKENS.borderRadius,
        },
      ]}
    />
  );
}

export const WaveBackground = AnimatedWave;
