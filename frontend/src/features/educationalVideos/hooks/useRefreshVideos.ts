/**
 * frontend/src/features/educationalVideos/hooks/useRefreshVideos.ts
 * Custom hook managing pull-to-refresh state and cached video reloading.
 */
import { useState, useCallback } from 'react';

export function useRefreshVideos(fetchVideos: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchVideos();
    } catch (err) {
      console.warn('[useRefreshVideos] Error during refresh:', err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchVideos]);

  return {
    refreshing,
    onRefresh,
  };
}
