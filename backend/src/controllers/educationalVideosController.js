/**
 * backend/src/controllers/educationalVideosController.js
 * Controller handling HTTP requests for educational videos & Shorts.
 */
const educationalVideosService = require('../services/educationalVideosService');

class EducationalVideosController {
  /**
   * GET /api/v1/educational-videos
   * Query params: contentType ('all' | 'video' | 'short')
   */
  async getVideos(req, res, next) {
    try {
      const contentType = req.query.contentType || 'all';
      const videos = await educationalVideosService.getVideos(contentType);
      res.json({
        success: true,
        data: videos,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/educational-videos/sync
   * Triggers immediate synchronization with YouTube API.
   */
  async syncVideos(req, res, next) {
    try {
      const syncResult = await educationalVideosService.syncVideosFromYouTube();
      res.json({
        success: true,
        message: 'Educational videos YouTube sync completed successfully.',
        data: syncResult,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EducationalVideosController();
