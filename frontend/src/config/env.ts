/**
 * frontend/src/config/env.ts
 * Central place that reads and validates environment variables.
 * Automatically resolves the computer's host IP for physical devices & emulators in Expo Go.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let rawBackendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1';

// Auto-detect computer host IP from Expo bundler connection (e.g. 192.168.x.x)
const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
const devHostIp = hostUri ? hostUri.split(':')[0] : null;

if (rawBackendUrl.includes('localhost') || rawBackendUrl.includes('127.0.0.1')) {
  if (devHostIp) {
    // Physical Phone / Expo Go: Replace 'localhost' with actual computer IP on local Wi-Fi
    rawBackendUrl = rawBackendUrl.replace('localhost', devHostIp).replace('127.0.0.1', devHostIp);
  } else if (Platform.OS === 'android') {
    // Android Emulator Fallback
    rawBackendUrl = rawBackendUrl.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }
}

console.log('[ENV Config] Resolved Backend Gateway URL:', rawBackendUrl);

function assertEnv(value: string | undefined, name: string): string {
  if (!value || value.includes('YOUR-')) {
    throw new Error(
      `[env] Missing or placeholder value for ${name}. ` +
        `Set it in frontend/.env before running the app.`
    );
  }
  return value;
}

export const env = {
  SUPABASE_URL: assertEnv(SUPABASE_URL, 'EXPO_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: assertEnv(SUPABASE_ANON_KEY, 'EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  BACKEND_URL: rawBackendUrl,
} as const;