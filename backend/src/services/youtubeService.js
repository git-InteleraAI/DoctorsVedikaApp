/**
 * backend/src/services/youtubeService.js
 * YouTube Data API v3 integration service module.
 * Responsible ONLY for communicating with YouTube Data API v3.
 */
const config = require('../config');
const { parseIso8601Duration, detectShort, buildVideoUrl } = require('../utils/youtubeUtils');

class YoutubeService {
  constructor() {
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  /**
   * Gets API key from config.
   * @returns {string}
   */
  getApiKey() {
    const key = config.youtube?.apiKey || process.env.YOUTUBE_API_KEY;
    if (!key) {
      throw new Error('YOUTUBE_API_KEY environment variable is missing.');
    }
    return key;
  }

  /**
   * Resolves raw channel ID or handle into channelId for YouTube API.
   * Supports raw channel ID (UC...), @handle, or full channel URL.
   * @param {string} rawInput 
   * @returns {Promise<string>}
   */
  async resolveChannelId(rawInput) {
    const apiKey = this.getApiKey();
    let input = (rawInput || config.youtube?.channelId || config.youtube?.channelUrl || process.env.YOUTUBE_CHANNEL_ID || '').trim();

    if (!input) {
      throw new Error('YOUTUBE_CHANNEL_ID environment variable is missing.');
    }

    // Extract handle if full URL passed
    if (input.includes('youtube.com/')) {
      const matchHandle = input.match(/youtube\.com\/@([^\/\?]+)/i);
      const matchChannel = input.match(/youtube\.com\/channel\/([^\/\?]+)/i);
      if (matchHandle) {
        input = `@${matchHandle[1]}`;
      } else if (matchChannel) {
        return matchChannel[1];
      }
    }

    // Direct channel ID starts with UC
    if (input.startsWith('UC') && input.length >= 20) {
      return input;
    }

    // If handle starts with @
    if (input.startsWith('@')) {
      const handleClean = input.replace(/^@/, '');
      const handleUrl = `${this.baseUrl}/channels?part=id&forHandle=${encodeURIComponent(handleClean)}&key=${apiKey}`;
      const response = await fetch(handleUrl);
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        return data.items[0].id;
      }
    }

    // Fallback search channel by query
    const searchUrl = `${this.baseUrl}/search?part=snippet&type=channel&q=${encodeURIComponent(input)}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    if (searchData.items && searchData.items.length > 0) {
      return searchData.items[0].id.channelId;
    }

    return input;
  }

  /**
   * Step 1: Fetch latest video items from channel.
   * @param {number} maxResults 
   * @returns {Promise<Array<object>>}
   */
  async fetchLatestVideos(maxResults = 50) {
    const apiKey = this.getApiKey();
    const channelId = await this.resolveChannelId();

    const url = `${this.baseUrl}/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || `YouTube Search API failed with status ${response.status}`;
      throw new Error(`YouTube API Error: ${msg}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  /**
   * Step 2: Fetch detailed statistics and contentDetails for batch of video IDs.
   * @param {Array<string>} videoIds 
   * @returns {Promise<Array<object>>}
   */
  async fetchVideoDetails(videoIds) {
    if (!videoIds || videoIds.length === 0) return [];
    const apiKey = this.getApiKey();

    // YouTube API accepts up to 50 video IDs per request
    const idsString = videoIds.join(',');
    const url = `${this.baseUrl}/videos?part=contentDetails,statistics,snippet&id=${idsString}&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || `YouTube Videos API failed with status ${response.status}`;
      throw new Error(`YouTube API Error: ${msg}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  /**
   * Detects short format.
   * @param {string} videoId
   * @param {number} durationSeconds 
   * @param {string} title 
   * @returns {Promise<'short' | 'video'>}
   */
  async detectShort(videoId, durationSeconds, title) {
    return await detectShort(videoId, durationSeconds, title);
  }

  /**
   * Merges search items and detailed video items into standardized video object.
   * @param {Array<object>} searchItems 
   * @param {Array<object>} detailItems 
   * @returns {Promise<Array<object>>}
   */
  async mergeResponses(searchItems = [], detailItems = []) {
    const detailsMap = new Map();
    for (const detail of detailItems) {
      detailsMap.set(detail.id, detail);
    }

    const formattedVideos = await Promise.all(
      searchItems.map(async (searchItem) => {
        const videoId = searchItem.id?.videoId;
        if (!videoId) return null;

        const detail = detailsMap.get(videoId);
        const snippet = searchItem.snippet || {};
        const detailSnippet = detail?.snippet || snippet;
        const contentDetails = detail?.contentDetails || {};
        const statistics = detail?.statistics || {};

        const title = detailSnippet.title || snippet.title || 'Untitled Video';
        const description = detailSnippet.description || snippet.description || '';

        const isoDuration = contentDetails.duration || 'PT0S';
        const { seconds, formattedDuration } = parseIso8601Duration(isoDuration);

        const contentType = await this.detectShort(videoId, seconds, title);
        const videoUrl = buildVideoUrl(videoId, contentType);

        // For Shorts, use YouTube's unletterboxed oardefault (Original Aspect Ratio) thumbnail
        let thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/oardefault.jpg`;
        if (contentType === 'video') {
          const thumbnails = detailSnippet.thumbnails || snippet.thumbnails || {};
          thumbnailUrl =
            thumbnails.maxres?.url ||
            thumbnails.high?.url ||
            thumbnails.medium?.url ||
            thumbnails.default?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        }

        const viewsCount = parseInt(statistics.viewCount || '0', 10);
        const publishedAt =
          detailSnippet.publishedAt || snippet.publishedAt || new Date().toISOString();

        return {
          platform: 'youtube',
          external_id: videoId,
          title,
          description,
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl,
          content_type: contentType,
          duration: formattedDuration,
          views_count: viewsCount,
          published_at: publishedAt,
          is_active: true,
        };
      })
    );

    return formattedVideos.filter(Boolean);
  }

  /**
   * Helper method: Executes complete fetch, details retrieval, and merge workflow.
   * @param {number} maxResults 
   * @returns {Promise<Array<object>>}
   */
  async fetchAndFormatLatestVideos(maxResults = 50) {
    const searchItems = await this.fetchLatestVideos(maxResults);
    const videoIds = searchItems.map((item) => item.id?.videoId).filter(Boolean);

    if (videoIds.length === 0) {
      return [];
    }

    const detailItems = await this.fetchVideoDetails(videoIds);
    return await this.mergeResponses(searchItems, detailItems);
  }
}

module.exports = new YoutubeService();
