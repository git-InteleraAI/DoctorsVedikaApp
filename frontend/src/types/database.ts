/**
 * src/types/database.ts
 *
 * Shared Supabase database contract across Patient and Doctor modules.
 */

export type UserRole = 'patient' | 'doctor' | 'admin' | 'assistant';

export type UsersRow = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  role: UserRole;
  status: 'active' | 'suspended';
  push_token: string | null;
  created_at: string;
  updated_at: string;
};

export type DoctorsRow = {
  doctor_id: string;
  user_id: string | null;
  doctor_name: string;
  doctor_email: string | null;
  doctor_mobile: string | null;
  doctor_registration_number: string | null;
  doctor_specialization: string | null;
  doctor_qualification: string | null;
  doctor_experience: number | null;
  doctor_clinic_name: string | null;
  doctor_clinic_address: string | null;
  doctor_consultation_fee: number | null;
  doctor_languages: string | null;
  doctor_profile_photo: string | null;
  doctor_verification_status: string | null;
  doctor_is_active: boolean | null;
  doctor_description: string | null;
  doctor_quote: string | null;
  doctor_patients_treated: number | null;
  doctor_rating: number | null;
  doctor_reviews_count: number | null;
  created_at: string;
  updated_at: string;
};

export type PatientsRow = {
  id: string;
  user_id: string | null;
  date_of_birth: string | null;
  gender: string | null;
  email: string | null;
  blood_group: string | null;
  locality: string | null;
  address: string | null;
  onboarding_completed: boolean | null;
  profile_photo: string | null;
  created_at: string;
  updated_at: string;
};

export type AppointmentsRow = {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string; // ISO date string (YYYY-MM-DD)
  appointment_time: string; // e.g. "09:30 AM"
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_method: 'pay_at_clinic';
  payment_status: 'pending' | 'paid';
  reason: string | null;
  created_at: string;
  updated_at: string;
};

export type QuestionsRow = {
  id: string;
  patient_id: string;
  doctor_id: string;
  question_text: string;
  answer_text: string | null;
  status: 'pending' | 'answered';
  report_url: string | null;
  created_at: string;
  answered_at: string | null;
  updated_at: string;
};

export type PatientFavoritesRow = {
  id: string;
  patient_id: string;
  doctor_id: string;
  created_at: string;
};

export type NotificationsRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'booking' | 'reminder' | 'reply' | 'system';
  is_read: boolean;
  data: Record<string, any> | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UsersRow;
        Insert: {
          id: string;
          email?: string | null;
          phone?: string | null;
          full_name?: string | null;
          role?: UserRole;
          status?: 'active' | 'suspended';
          push_token?: string | null;
        };
        Update: Partial<{
          full_name: string | null;
          phone: string | null;
          status: 'active' | 'suspended';
          push_token: string | null;
        }>;
        Relationships: [];
      };
      patients: {
        Row: PatientsRow;
        Insert: {
          user_id: string;
          email?: string | null;
          gender?: string | null;
          date_of_birth?: string | null;
          blood_group?: string | null;
          locality?: string | null;
          address?: string | null;
          onboarding_completed?: boolean | null;
          profile_photo?: string | null;
        };
        Update: Partial<{
          email: string | null;
          gender: string | null;
          date_of_birth: string | null;
          blood_group: string | null;
          locality: string | null;
          address: string | null;
          onboarding_completed: boolean | null;
          profile_photo: string | null;
        }>;
        Relationships: [];
      };
      doctors: {
        Row: DoctorsRow;
        Insert: Partial<DoctorsRow> & { doctor_name: string };
        Update: Partial<DoctorsRow>;
        Relationships: [];
      };
      appointments: {
        Row: AppointmentsRow;
        Insert: Partial<AppointmentsRow> & { patient_id: string; doctor_id: string; appointment_date: string; appointment_time: string };
        Update: Partial<AppointmentsRow>;
        Relationships: [];
      };
      questions: {
        Row: QuestionsRow;
        Insert: Partial<QuestionsRow> & { patient_id: string; doctor_id: string; question_text: string; report_url?: string | null };
        Update: Partial<QuestionsRow>;
        Relationships: [];
      };
      patient_favorites: {
        Row: PatientFavoritesRow;
        Insert: { patient_id: string; doctor_id: string };
        Update: Partial<PatientFavoritesRow>;
        Relationships: [];
      };
      notifications: {
        Row: NotificationsRow;
        Insert: Partial<NotificationsRow> & { user_id: string; title: string; body: string; type: 'booking' | 'reminder' | 'reply' | 'system' };
        Update: Partial<NotificationsRow>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      book_appointment: {
        Args: {
          p_patient_id: string;
          p_doctor_id: string;
          p_date: string;
          p_time: string;
          p_reason?: string | null;
          p_payment_method?: string;
        };
        Returns: Record<string, any>;
      };
      cancel_appointment: {
        Args: {
          p_appointment_id: string;
        };
        Returns: void;
      };
    };
  };
};
