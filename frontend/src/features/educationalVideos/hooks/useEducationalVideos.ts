/**
 * frontend/src/features/educationalVideos/hooks/useEducationalVideos.ts
 * Hook managing educational videos data fetching, tab filtering, and state.
 */
import { useState, useEffect, useCallback } from 'react';
import { EducationalVideo, ContentType } from '../types';
import { fetchEducationalVideos, triggerVideosSync } from '../api/educationalVideosApi';

export function useEducationalVideos(initialTab: ContentType = 'all') {
  const [activeTab, setActiveTab] = useState<ContentType>(initialTab);
  const [videos, setVideos] = useState<EducationalVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = useCallback(async (tabToFetch?: ContentType) => {
    const targetTab = tabToFetch || activeTab;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEducationalVideos(targetTab);
      setVideos(data || []);
    } catch (err: any) {
      console.error('[useEducationalVideos Error]', err);
      setError(err.message || 'Failed to load educational videos.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadVideos(activeTab);
  }, [activeTab, loadVideos]);

  const triggerManualSync = async () => {
    setSyncing(true);
    try {
      await triggerVideosSync();
      await loadVideos(activeTab);
    } catch (err: any) {
      console.error('[Manual Sync Error]', err);
      setError(err.message || 'Failed to sync videos with YouTube.');
    } finally {
      setSyncing(false);
    }
  };

  return {
    videos,
    loading,
    syncing,
    error,
    activeTab,
    setActiveTab,
    loadVideos,
    triggerManualSync,
  };
}
