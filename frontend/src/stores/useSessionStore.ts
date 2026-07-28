/**
 * src/stores/useSessionStore.ts
 * Global Zustand store tracking app session, current authenticated user,
 * patient profile, and authentication state.
 */
import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { UsersRow, PatientsRow, UserRole } from '../types/database';

export interface SessionState {
  session: Session | null;
  user: UsersRow | null;
  role: UserRole | null;
  patientProfile: PatientsRow | null;
  isLoading: boolean;
  
  setSessionData: (
    session: Session | null,
    user: UsersRow | null,
    patientProfile: PatientsRow | null
  ) => void;
  setLoading: (isLoading: boolean) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  user: null,
  role: null,
  patientProfile: null,
  isLoading: true,

  setSessionData: (session, user, patientProfile) =>
    set({
      session,
      user,
      role: user?.role ?? null,
      patientProfile,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  clearSession: () =>
    set({
      session: null,
      user: null,
      role: null,
      patientProfile: null,
      isLoading: false,
    }),
}));
