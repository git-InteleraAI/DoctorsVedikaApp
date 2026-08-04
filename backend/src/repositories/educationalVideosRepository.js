/**
 * backend/src/repositories/educationalVideosRepository.js
 * Database repository layer for educational_videos table in Supabase PostgreSQL.
 */
const { supabase } = require('../database/supabase/client');

class EducationalVideosRepository {
  /**
   * Insert a single video record.
   * @param {object} videoData 
   * @returns {Promise<object>}
   */
  async create(videoData) {
    const { data, error } = await supabase
      .from('educational_videos')
      .insert(videoData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Upsert/Bulk insert multiple video records with conflict resolution on (platform, external_id).
   * @param {Array<object>} videosArray 
   * @returns {Promise<Array<object>>}
   */
  async bulkInsert(videosArray) {
    if (!videosArray || videosArray.length === 0) return [];

    const { data, error } = await supabase
      .from('educational_videos')
      .upsert(videosArray, {
        onConflict: 'platform,external_id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) throw error;
    return data || [];
  }

  /**
   * Check if a video exists by platform and external_id.
   * @param {string} platform 
   * @param {string} externalId 
   * @returns {Promise<boolean>}
   */
  async exists(platform, externalId) {
    const { data, error } = await supabase
      .from('educational_videos')
      .select('id')
      .eq('platform', platform)
      .eq('external_id', externalId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  /**
   * Fetch all active videos ordered by published_at DESC.
   * @param {object} options 
   * @returns {Promise<Array<object>>}
   */
  async findAll(options = {}) {
    const limit = options.limit || 100;
    const { data, error } = await supabase
      .from('educational_videos')
      .select('*')
      .eq('is_active', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Fetch active videos filtered by content_type ('video' or 'short').
   * @param {string} contentType 
   * @param {object} options 
   * @returns {Promise<Array<object>>}
   */
  async findByContentType(contentType, options = {}) {
    const limit = options.limit || 100;
    const { data, error } = await supabase
      .from('educational_videos')
      .select('*')
      .eq('is_active', true)
      .eq('content_type', contentType)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Fetch latest videos up to limit.
   * @param {number} limit 
   * @returns {Promise<Array<object>>}
   */
  async findLatest(limit = 10) {
    return this.findAll({ limit });
  }

  /**
   * Update video record by ID.
   * @param {string} id 
   * @param {object} updateData 
   * @returns {Promise<object>}
   */
  async update(id, updateData) {
    const { data, error } = await supabase
      .from('educational_videos')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Soft delete video record by ID (setting is_active = false).
   * @param {string} id 
   * @returns {Promise<boolean>}
   */
  async softDelete(id) {
    const { error } = await supabase
      .from('educational_videos')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

module.exports = new EducationalVideosRepository();
