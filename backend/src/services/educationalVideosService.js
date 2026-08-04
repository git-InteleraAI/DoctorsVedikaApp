/**
 * backend/src/services/educationalVideosService.js
 * Business logic service module for Educational Videos & Shorts.
 */
const youtubeService = require('./youtubeService');
const educationalVideosRepository = require('../repositories/educationalVideosRepository');

class EducationalVideosService {
  /**
   * Fetches videos from database cache by content type ('all', 'video', 'short').
   * @param {string} contentType 
   * @returns {Promise<Array<object>>}
   */
  async getVideos(contentType = 'all') {
    let videos = [];
    const type = (contentType || 'all').toLowerCase();

    if (type === 'video') {
      videos = await educationalVideosRepository.findByContentType('video');
    } else if (type === 'short') {
      videos = await educationalVideosRepository.findByContentType('short');
    } else {
      videos = await educationalVideosRepository.findAll();
    }

    // Map database records to DTO format if necessary
    return videos.map(this.transformToDto);
  }

  /**
   * Synchronizes videos from YouTube API to Supabase database cache.
   * Handles duplicate prevention and updates existing video metadata.
   * @returns {Promise<object>} Sync summary stats
   */
  async syncVideosFromYouTube() {
    const startTime = Date.now();
    console.log('[YouTube Sync] Sync Started...');

    try {
      const fetchedVideos = await youtubeService.fetchAndFormatLatestVideos(50);
      console.log(`[YouTube Sync] Videos Retrieved: ${fetchedVideos.length}`);

      if (fetchedVideos.length === 0) {
        const duration = Date.now() - startTime;
        console.log(`[YouTube Sync] Sync Completed. No videos found. Duration: ${duration}ms`);
        return {
          success: true,
          videosRetrieved: 0,
          videosInserted: 0,
          duplicatesSkipped: 0,
          durationMs: duration,
        };
      }

      // Upsert into Supabase database (uses ON CONFLICT (platform, external_id))
      const upserted = await educationalVideosRepository.bulkInsert(fetchedVideos);

      const duration = Date.now() - startTime;
      console.log(`[YouTube Sync] Videos Processed/Upserted: ${upserted.length}`);
      console.log(`[YouTube Sync] Sync Completed successfully in ${duration}ms.`);

      return {
        success: true,
        videosRetrieved: fetchedVideos.length,
        videosInserted: upserted.length,
        durationMs: duration,
      };
    } catch (error) {
      console.error('[YouTube Sync Error]', error.message);
      throw error;
    }
  }

  /**
   * Transforms raw database record to DTO model.
   * @param {object} record 
   * @returns {object}
   */
  transformToDto(record) {
    return {
      id: record.id,
      platform: record.platform || 'youtube',
      contentType: record.content_type,
      externalId: record.external_id,
      title: record.title,
      description: record.description || '',
      thumbnailUrl: record.thumbnail_url,
      videoUrl: record.video_url,
      duration: record.duration || '00:00',
      viewsCount: record.views_count ? Number(record.views_count) : 0,
      publishedAt: record.published_at,
      isActive: record.is_active,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}

module.exports = new EducationalVideosService();
