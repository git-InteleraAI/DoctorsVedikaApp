/**
 * src/contexts/AuthContext.tsx
 * Tracks the Supabase auth session and syncs state into Zustand (useSessionStore).
 * Provides useAuth() context for components.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import { useSessionStore } from '../stores/useSessionStore';
import {
  fetchUserProfile,
  fetchPatientProfile,
  signOutUser,
  updatePushToken,
} from '../features/auth/api';
import {
  registerPushNotificationToken,
  subscribeRealtimeNotifications,
} from '../features/notifications/api';
import type { UsersRow, PatientsRow } from '../types/database';

import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

interface AuthContextValue {
  session: Session | null;
  profile: UsersRow | null;
  patientProfile: PatientsRow | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { session, user: profile, patientProfile, isLoading, setSessionData, setLoading, clearSession } =
    useSessionStore();

  async function loadProfile(userId: string, currentSession: Session) {
    setLoading(true);
    const userRes = await fetchUserProfile(userId);
    let patientRes: PatientsRow | null = null;

    if (userRes?.role === 'patient') {
      patientRes = await fetchPatientProfile(userId);
    }

    setSessionData(currentSession, userRes, patientRes);
  }

  function verifiedSession(s: Session | null): Session | null {
    if (!s) return null;
    return s.user.email_confirmed_at ? s : null;
  }

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(async ({ data }) => {
      const verified = verifiedSession(data.session);
      if (verified?.user.id) {
        await loadProfile(verified.user.id, verified);
      } else {
        clearSession();
      }
    });

    // 2. Subscribe to auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      const verified = verifiedSession(newSession);
      if (verified?.user.id) {
        await loadProfile(verified.user.id, verified);
      } else {
        clearSession();
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Set up Push Token Registration & Realtime Notifications Listener
  useEffect(() => {
    if (!profile?.id) return;

    // Register push token
    registerPushNotificationToken(profile.id);

    // Subscribe to realtime notification alerts
    const unsubscribe = subscribeRealtimeNotifications(profile.id, async (notif) => {
      if (!isExpoGo) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: notif.title,
              body: notif.body,
              data: notif.data || {},
            },
            trigger: null,
          });
        } catch (e) {
          console.warn('[Push] Failed to trigger local notification banner:', e);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [profile?.id]);

  async function signOut() {
    await signOutUser();
    clearSession();
  }

  async function refreshProfile() {
    if (session?.user.id) {
      await loadProfile(session.user.id, session);
    }
  }

  return (
    <AuthContext.Provider
      value={{ session, profile, patientProfile, isLoading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
