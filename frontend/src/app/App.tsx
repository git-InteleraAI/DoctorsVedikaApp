/**
 * src/app/App.tsx
 * The real app composition root. The project-root App.tsx (created by
 * create-expo-app) just re-exports this file — keep all app logic here,
 * matching the predefined src/app/ folder.
 */
import React from 'react';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Providers } from './Providers';
import { AppInitializer } from './AppInitializer';
import { RootNavigator } from './RootNavigator';

// Suppress the SDK 53/54 Expo Go remote push token warning popup
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'remote notifications',
]);

export default function App() {
  return (
    <Providers>
      <AppInitializer>
        <StatusBar style="dark" />
        <RootNavigator />
      </AppInitializer>
    </Providers>
  );
}
