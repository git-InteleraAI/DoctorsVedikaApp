/**
 * src/app/AppInitializer.tsx
 * Shows the branded pixel-perfect splash screen UI while AuthContext restores
 * the session from AsyncStorage on cold start.
 */
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SplashScreen } from '../components/SplashScreen';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
