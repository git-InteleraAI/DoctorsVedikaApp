/**
 * backend/src/cron/youtubeSyncCron.js
 * Automatic synchronization job for YouTube Educational Videos & Shorts.
 * Configured to run every 3 hours.
 */
const educationalVideosService = require('../services/educationalVideosService');

const SYNC_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 Hours in milliseconds

let cronTimer = null;

/**
 * Runs the sync process and logs detailed metrics.
 */
async function runYoutubeSync() {
  const startTime = Date.now();
  console.log('[YouTube Cron] ========================================');
  console.log('[YouTube Cron] Sync Started');
  console.log(`[YouTube Cron] Timestamp: ${new Date().toISOString()}`);

  try {
    const result = await educationalVideosService.syncVideosFromYouTube();
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`[YouTube Cron] Videos Retrieved: ${result.videosRetrieved}`);
    console.log(`[YouTube Cron] Videos Inserted/Updated: ${result.videosInserted}`);
    console.log(`[YouTube Cron] Duplicates Skipped: ${Math.max(0, result.videosRetrieved - result.videosInserted)}`);
    console.log(`[YouTube Cron] Sync Completed`);
    console.log(`[YouTube Cron] Duration: ${durationSec}s`);
    console.log('[YouTube Cron] ========================================');
    return result;
  } catch (error) {
    console.error('[YouTube Cron Error] Synchronization failed:', error.message);
    console.log('[YouTube Cron] ========================================');
  }
}

/**
 * Initializes and starts the 3-hour recurring synchronization timer.
 */
function initYoutubeSyncCron() {
  console.log('[YouTube Cron] Initializing YouTube Sync Cron (Interval: Every 3 hours)');

  // Run initial sync after server startup delay (10 seconds)
  setTimeout(() => {
    runYoutubeSync();
  }, 10000);

  // Set 3-hour recurring interval
  cronTimer = setInterval(() => {
    runYoutubeSync();
  }, SYNC_INTERVAL_MS);
}

/**
 * Stops the cron schedule timer if running.
 */
function stopYoutubeSyncCron() {
  if (cronTimer) {
    clearInterval(cronTimer);
    cronTimer = null;
    console.log('[YouTube Cron] Stopped YouTube Sync Cron.');
  }
}

module.exports = {
  runYoutubeSync,
  initYoutubeSyncCron,
  stopYoutubeSyncCron,
};
