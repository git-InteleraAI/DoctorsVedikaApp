/**
 * src/features/auth/types.ts
 * Auth payload and response types.
 */
import type { UserRole, UsersRow, PatientsRow } from '../../types/database';

export interface AuthRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UsersRow | null;
  patientProfile: PatientsRow | null;
  error?: string;
}
