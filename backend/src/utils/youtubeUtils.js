/**
 * backend/src/utils/youtubeUtils.js
 * Utility helpers for YouTube video metadata processing and Shorts detection.
 */

/**
 * Parses YouTube ISO 8601 duration string (e.g., PT1M30S, PT45S, PT1H2M3S).
 * @param {string} isoDuration 
 * @returns {{ seconds: number, formattedDuration: string }}
 */
function parseIso8601Duration(isoDuration) {
  if (!isoDuration || typeof isoDuration !== 'string') {
    return { seconds: 0, formattedDuration: '00:00' };
  }

  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i;
  const matches = isoDuration.match(regex);

  if (!matches) {
    return { seconds: 0, formattedDuration: '00:00' };
  }

  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);
  const seconds = parseInt(matches[3] || '0', 10);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  let formatted = '';
  if (hours > 0) {
    const padM = String(minutes).padStart(2, '0');
    const padS = String(seconds).padStart(2, '0');
    formatted = `${hours}:${padM}:${padS}`;
  } else {
    const padM = String(minutes).padStart(2, '0');
    const padS = String(seconds).padStart(2, '0');
    formatted = `${padM}:${padS}`;
  }

  return { seconds: totalSeconds, formattedDuration: formatted };
}

/**
 * Accurately detects whether a YouTube video item is a Short:
 * 1. Checks HTTP HEAD response on https://www.youtube.com/shorts/{videoId} (200 = Short, 303 = Regular Video)
 * 2. Checks title for #shorts tag
 * 3. Fallback duration <= 180 seconds (YouTube 3-minute Shorts policy)
 * @param {string} videoId
 * @param {number} durationSeconds 
 * @param {string} title 
 * @returns {Promise<'short' | 'video'>}
 */
async function detectShort(videoId, durationSeconds, title) {
  const hasShortsTag = typeof title === 'string' && title.toLowerCase().includes('#shorts');
  if (hasShortsTag) {
    return 'short';
  }

  if (videoId) {
    try {
      const res = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
        method: 'HEAD',
        redirect: 'manual',
      });

      if (res.status === 200) {
        return 'short';
      }
      if (res.status === 301 || res.status === 302 || res.status === 303) {
        return 'video';
      }
    } catch (err) {
      console.warn(`[detectShort] HEAD check failed for ${videoId}, falling back to duration:`, err.message);
    }
  }

  // Fallback if HTTP check unavailable: YouTube Shorts are up to 3 minutes (180s)
  const isShortDuration = typeof durationSeconds === 'number' && durationSeconds > 0 && durationSeconds <= 180;
  return isShortDuration ? 'short' : 'video';
}

/**
 * Builds canonical YouTube web URL.
 * @param {string} videoId 
 * @param {'short' | 'video'} contentType 
 * @returns {string}
 */
function buildVideoUrl(videoId, contentType) {
  if (contentType === 'short') {
    return `https://www.youtube.com/shorts/${videoId}`;
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}

module.exports = {
  parseIso8601Duration,
  detectShort,
  buildVideoUrl,
};
