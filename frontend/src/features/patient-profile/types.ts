/**
 * src/features/patient-profile/types.ts
 * Types for updating patient profile and address.
 */

export interface UpdatePatientProfilePayload {
  full_name?: string;
  email?: string;
  gender?: string;
  date_of_birth?: string;
  blood_group?: string;
  profile_photo?: string;
  profile_photo_base64?: string;
}

export interface UpdateUserAddressPayload {
  address: string;
  locality?: string;
}
