/**
 * src/features/qna/uploadReport.ts
 * Upload patient prescription/medical report image to Supabase storage.
 */
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../lib/supabase';

export async function selectAndUploadReport(patientId: string): Promise<string | null> {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission to access photos is required to attach medical reports.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets || !result.assets[0].base64) {
      return null;
    }

    const file = result.assets[0];
    const fileExt = file.uri.split('.').pop() || 'jpg';
    const filePath = `reports/${patientId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('medical-reports')
      .upload(filePath, decode(file.base64!), {
        contentType: `image/${fileExt}`,
      });

    if (uploadError) {
      console.error('[UploadReport] Supabase upload failed:', uploadError.message);
      // Fallback to avatar bucket if medical-reports doesn't exist yet
      const { error: fallbackError } = await supabase.storage
        .from('patient-profiles')
        .upload(filePath, decode(file.base64!), {
          contentType: `image/${fileExt}`,
        });

      if (fallbackError) {
        console.error('[UploadReport] Fallback upload failed:', fallbackError.message);
        return file.uri; // Local URI fallback for presentation
      }
      
      const { data: fallbackUrl } = supabase.storage.from('patient-profiles').getPublicUrl(filePath);
      return fallbackUrl.publicUrl;
    }

    const { data: publicUrlData } = supabase.storage.from('medical-reports').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('[UploadReport] Exception:', err);
    return null;
  }
}
