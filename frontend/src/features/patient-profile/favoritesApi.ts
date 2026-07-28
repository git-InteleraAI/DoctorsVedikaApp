/**
 * src/features/patient-profile/favoritesApi.ts
 * Favorites management via Express API Gateway.
 */
import { apiClient } from '../../core/api/httpClient';

export async function getPatientFavorites(patientId: string): Promise<string[]> {
  try {
    return await apiClient<string[]>(`/patients/favorites/${patientId}`);
  } catch (err) {
    console.error('Error fetching favorites via Gateway:', err);
    return [];
  }
}

export async function togglePatientFavorite(
  patientId: string,
  doctorId: string,
  isCurrentlyFavorite: boolean
): Promise<boolean> {
  try {
    const res = await apiClient<{ isFavorite: boolean }>(`/patients/favorites/${patientId}`, {
      method: 'POST',
      body: JSON.stringify({ doctorId, isFavorite: isCurrentlyFavorite }),
    });
    return res.isFavorite;
  } catch (err) {
    console.error('Error in togglePatientFavorite via Gateway:', err);
    return isCurrentlyFavorite;
  }
}
