/**
 * src/(auth)/SplashScreen.tsx
 * High-fidelity, pixel-perfect Splash Screen component for Auth Navigation stack.
 * Renders the custom Doctors Vedika Tailwind/SVG Splash UI and auto-navigates
 * to RoleSelect after 2.8s.
 */
import React, { useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { SplashScreen as PixelPerfectSplash } from '../components/SplashScreen';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('RoleSelect');
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return <PixelPerfectSplash />;
}
