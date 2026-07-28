/**
 * src/features/patient-profile/api.ts
 * Patient profile & address service layer routing through Express API Gateway.
 */
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { apiClient } from '../../core/api/httpClient';
import { supabase } from '../../lib/supabase';
import type { PatientsRow } from '../../types/database';
import type { UpdatePatientProfilePayload, UpdateUserAddressPayload } from './types';

export async function uploadPatientAvatar(
  userId: string,
  imageUri: string,
  base64Data?: string,
  patientName?: string
): Promise<string> {
  if (!imageUri || imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
    return imageUri;
  }

  try {
    const fileExt = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
    const sanitizedName = patientName
      ? patientName.trim().replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_')
      : 'Patient';
    const shortId = userId.substring(0, 8);
    const folderName = `${sanitizedName}_${shortId}`;
    const filePath = `${folderName}/profile_${Date.now()}.${fileExt}`;

    let base64 = base64Data;

    if (!base64) {
      // FileSystem.readAsStringAsync is the only safe path in React Native / Hermes.
      // FileReader is a Web API and is NOT available in the Hermes JS engine.
      try {
        base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: (FileSystem.EncodingType?.Base64 || 'base64') as any,
        });
      } catch (fsErr) {
        // Surface a clear error instead of attempting a web-only fallback.
        throw new Error('Could not read the selected image file. Please choose a different image.');
      }
    }

    const arrayBuffer = decode(base64);

    const { error: uploadError } = await supabase.storage
      .from('patient-profiles')
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
        upsert: true,
      });

    if (uploadError) {
      // Bucket creation must be a server-side / admin operation.
      // Clients must never be allowed to create storage infrastructure.
      const userMessage = uploadError.message?.toLowerCase().includes('bucket not found')
        ? 'Storage is not configured. Please contact support.'
        : 'Failed to upload profile picture.';
      throw new Error(userMessage);
    }

    const { data: publicUrlData } = supabase.storage
      .from('patient-profiles')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to upload profile picture to storage';
    console.error('[PatientProfileService] uploadPatientAvatar exception:', message);
    throw new Error(message);
  }
}

export async function updatePatientProfile(userId: string, payload: UpdatePatientProfilePayload) {
  let photoUrl = payload.profile_photo;
  if (payload.profile_photo && (payload.profile_photo.startsWith('file://') || payload.profile_photo.startsWith('content://'))) {
    photoUrl = await uploadPatientAvatar(userId, payload.profile_photo, payload.profile_photo_base64, payload.full_name);
  }

  return await apiClient<PatientsRow>(`/patients/profile/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...payload,
      profile_photo: photoUrl,
    }),
  });
}

export async function updateUserAddress(userId: string, payload: UpdateUserAddressPayload) {
  // Only include locality if it was explicitly provided.
  // Sending locality: null would overwrite an existing DB value for callers
  // that legitimately omit the field.
  const body: Record<string, unknown> = { address: payload.address };
  if (payload.locality !== undefined) {
    body.locality = payload.locality;
  }

  return await apiClient<PatientsRow>(`/patients/profile/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
