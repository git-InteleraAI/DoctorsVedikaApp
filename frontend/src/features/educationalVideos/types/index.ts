/**
 * frontend/src/features/educationalVideos/types/index.ts
 * Type definitions for Educational Videos & Shorts module.
 */

export type ContentType = 'all' | 'video' | 'short';

export type PlatformType = 'all' | 'youtube' | 'instagram';

export interface EducationalVideo {
  id: string;
  platform: string;
  contentType: 'video' | 'short';
  externalId: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  viewsCount: number;
  publishedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SyncResult {
  videosRetrieved: number;
  videosInserted: number;
  durationMs: number;
}
