/**
 * frontend/src/features/educationalVideos/api/educationalVideosApi.ts
 * API service for educational videos module routing requests through Express API gateway.
 */
import { apiClient } from '../../../core/api/httpClient';
import { EducationalVideo, ContentType, SyncResult } from '../types';

/**
 * Fetches educational videos & shorts from Express backend.
 * @param contentType 'all' | 'video' | 'short'
 */
export async function fetchEducationalVideos(contentType: ContentType = 'all'): Promise<EducationalVideo[]> {
  const queryParam = contentType !== 'all' ? `?contentType=${contentType}` : '';
  const response = await apiClient<EducationalVideo[]>(`/educational-videos${queryParam}`);
  return response;
}

/**
 * Triggers manual synchronization with YouTube API.
 */
export async function triggerVideosSync(): Promise<SyncResult> {
  const response = await apiClient<SyncResult>('/educational-videos/sync', {
    method: 'POST',
  });
  return response;
}
