/**
 * src/features/doctor-discovery/types.ts
 * Types and fallback mock datasets for doctor discovery and profile views.
 */
import type { DoctorsRow } from '../../types/database';

export type DoctorSortOption = 'relevance' | 'fee_asc' | 'experience_desc' | 'rating_desc';

export interface DoctorFilters {
  specialization?: string;
  query?: string;
  sortBy?: DoctorSortOption;
}

export const FALLBACK_TOP_DOCTORS: DoctorsRow[] = [
  {
    doctor_id: 'mock-1',
    doctor_name: 'Sarah Johnson',
    doctor_specialization: 'Cardiologist',
    doctor_experience: 8,
    doctor_qualification: 'MD, FACC',
    doctor_consultation_fee: 1200,
    doctor_profile_photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    doctor_is_active: true,
    user_id: null,
    doctor_email: 'sarah.johnson@example.com',
    doctor_mobile: '+1 555-0192',
    doctor_registration_number: 'REG-88219',
    doctor_clinic_name: 'City Heart & Vascular Center',
    doctor_clinic_address: '742 Evergreen Terrace, Sector 4',
    doctor_languages: 'English, Hindi',
    doctor_verification_status: 'verified',
    doctor_description: 'Dr. Sarah Johnson is a renowned Cardiologist with over 8 years of clinical experience in non-invasive cardiology and preventative care.',
    doctor_quote: 'Your heart health is our top priority.',
    doctor_patients_treated: 1420,
    doctor_rating: 4.9,
    doctor_reviews_count: 128,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    doctor_id: 'mock-2',
    doctor_name: 'David Patel',
    doctor_specialization: 'Dermatologist',
    doctor_experience: 12,
    doctor_qualification: 'MBBS, MD (Derma)',
    doctor_consultation_fee: 900,
    doctor_profile_photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    doctor_is_active: true,
    user_id: null,
    doctor_email: 'david.patel@example.com',
    doctor_mobile: '+1 555-0193',
    doctor_registration_number: 'REG-77102',
    doctor_clinic_name: 'ClearSkin Dermatology Clinic',
    doctor_clinic_address: '108 Sunrise Blvd, Suite 201',
    doctor_languages: 'English, Gujarati',
    doctor_verification_status: 'verified',
    doctor_description: 'Expert dermatologist specializing in laser procedures, acne treatment, and clinical skincare.',
    doctor_quote: 'Healthy skin starts with compassionate care.',
    doctor_patients_treated: 2300,
    doctor_rating: 4.8,
    doctor_reviews_count: 94,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    doctor_id: 'mock-3',
    doctor_name: 'Emily Chen',
    doctor_specialization: 'Neurologist',
    doctor_experience: 10,
    doctor_qualification: 'MD, DM (Neuro)',
    doctor_consultation_fee: 1500,
    doctor_profile_photo: 'https://images.unsplash.com/photo-1594824813566-78a1ed6a210f?auto=format&fit=crop&q=80&w=200',
    doctor_is_active: true,
    user_id: null,
    doctor_email: 'emily.chen@example.com',
    doctor_mobile: '+1 555-0194',
    doctor_registration_number: 'REG-99410',
    doctor_clinic_name: 'NeuroCare Institute',
    doctor_clinic_address: '45 Park Avenue, Medical Hub',
    doctor_languages: 'English, Mandarin',
    doctor_verification_status: 'verified',
    doctor_description: 'Specialist in migraine management, epilepsy, and general neurological disorders.',
    doctor_quote: 'Empowering patients through advanced neurological care.',
    doctor_patients_treated: 1850,
    doctor_rating: 4.95,
    doctor_reviews_count: 210,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
