/**
 * src/features/auth/api.ts
 * Supabase Service calls for authentication and user profiles.
 */
import { supabase } from '../../lib/supabase';
import type { UsersRow, PatientsRow } from '../../types/database';
import type { AuthLoginPayload, AuthRegisterPayload } from './types';

export async function fetchUserProfile(userId: string): Promise<UsersRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[AuthService] fetchUserProfile error:', error.message);
    return null;
  }
  return data;
}

export async function fetchPatientProfile(userId: string): Promise<PatientsRow | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[AuthService] fetchPatientProfile error:', error.message);
    return null;
  }
  return data;
}

export async function loginWithEmail({ email, password }: AuthLoginPayload) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function registerWithEmail({ email, password, fullName, role }: AuthRegisterPayload) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function updatePushToken(userId: string, token: string) {
  const { error } = await supabase
    .from('users')
    .update({ push_token: token })
    .eq('id', userId);

  if (error) {
    console.warn('[AuthService] updatePushToken failed:', error.message);
  }
}
