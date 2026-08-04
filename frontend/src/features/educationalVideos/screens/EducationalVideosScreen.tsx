/**
 * frontend/src/features/educationalVideos/screens/EducationalVideosScreen.tsx
 * World-class Instagram Reels & Explore Dashboard inspired Educational Videos Screen.
 * Supports Multi-Platform (YouTube Live + Instagram Coming Soon).
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEducationalVideos } from '../hooks/useEducationalVideos';
import { useRefreshVideos } from '../hooks/useRefreshVideos';
import { CategoryTabs } from '../components/CategoryTabs';
import { PlatformTabs } from '../components/PlatformTabs';
import { InstagramComingSoon } from '../components/InstagramComingSoon';
import { ReelsGridCard } from '../components/ReelsGridCard';
import { ShortsCard } from '../components/ShortsCard';
import { StandardVideoCard } from '../components/StandardVideoCard';
import { ContentType, PlatformType, EducationalVideo } from '../types';

export function EducationalVideosScreen() {
  const insets = useSafeAreaInsets();
  const {
    videos,
    loading,
    syncing,
    error,
    activeTab,
    setActiveTab,
    loadVideos,
    triggerManualSync,
  } = useEducationalVideos('all');

  const { refreshing, onRefresh } = useRefreshVideos(loadVideos);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlatform, setActivePlatform] = useState<PlatformType>('all');

  // Filter videos by platform & search query
  const filteredVideos = videos.filter((video) => {
    // Platform filter
    if (activePlatform === 'youtube' && video.platform !== 'youtube') {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = video.title.toLowerCase().includes(q);
      const matchDesc = video.description && video.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const renderHeader = () => (
    <View>
      {/* Banner / Info Header */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerBadgeRow}>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTagText}>OFFICIAL CHANNEL</Text>
          </View>
          <View style={styles.ytTag}>
            <MaterialCommunityIcons name="youtube" size={14} color="#FF0000" />
            <Text style={styles.ytTagText}>Verified Channel</Text>
          </View>
        </View>

        <Text style={styles.bannerTitle}>Doctors Vedika Health Education</Text>
        <Text style={styles.bannerSub}>
          Explore doctor-verified medical awareness shorts, surgery guides, and health tips.
        </Text>
      </View>

      {/* Platform Switcher Bar (All, YouTube, Instagram Coming Soon) */}
      <PlatformTabs
        activePlatform={activePlatform}
        onPlatformChange={(platform: PlatformType) => setActivePlatform(platform)}
      />

      {/* Show Content Category Tabs only if not on Instagram Preview */}
      {activePlatform !== 'instagram' && (
        <CategoryTabs
          activeTab={activeTab}
          onTabChange={(tab: ContentType) => setActiveTab(tab)}
        />
      )}

      {/* Error Banner */}
      {error && activePlatform !== 'instagram' && (
        <View style={styles.errorCard}>
          <Feather name="alert-circle" size={18} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadVideos()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="video-off-outline" size={48} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No Videos Found</Text>
        <Text style={styles.emptySub}>
          {searchQuery
            ? `No results matching "${searchQuery}".`
            : activeTab === 'short'
            ? 'No Shorts available at this time.'
            : activeTab === 'video'
            ? 'No full-length videos available at this time.'
            : 'No educational videos available.'}
        </Text>
        <TouchableOpacity style={styles.syncButton} onPress={triggerManualSync} activeOpacity={0.8}>
          <Feather name="refresh-cw" size={16} color="#FFFFFF" />
          <Text style={styles.syncButtonText}>Sync Channel Now</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Determine grid columns & rendering based on activeTab
  const getGridConfig = () => {
    if (activeTab === 'all') {
      return {
        numColumns: 3,
        key: 'grid-3-all',
        columnWrapperStyle: styles.threeColumnWrapper,
        renderItem: ({ item }: { item: EducationalVideo }) => <ReelsGridCard video={item} />,
      };
    }
    if (activeTab === 'short') {
      return {
        numColumns: 2,
        key: 'grid-2-short',
        columnWrapperStyle: styles.twoColumnWrapper,
        renderItem: ({ item }: { item: EducationalVideo }) => <ShortsCard video={item} />,
      };
    }
    // Default 'video' tab: 1-column widescreen feed
    return {
      numColumns: 1,
      key: 'grid-1-video',
      columnWrapperStyle: undefined,
      renderItem: ({ item }: { item: EducationalVideo }) => (
        <View style={styles.singleColumnItemWrapper}>
          <StandardVideoCard video={item} />
        </View>
      ),
    };
  };

  const gridConfig = getGridConfig();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Educational Videos</Text>
          <Text style={styles.headerSubtitle}>Verified Doctor Talks & Shorts</Text>
        </View>

        <TouchableOpacity
          style={styles.syncIconBtn}
          onPress={triggerManualSync}
          disabled={syncing}
          activeOpacity={0.8}
        >
          {syncing ? (
            <ActivityIndicator size="small" color="#00A8B5" />
          ) : (
            <Feather name="refresh-cw" size={18} color="#00A8B5" />
          )}
        </TouchableOpacity>
      </View>

      {/* Real-time Search Input Bar */}
      {activePlatform !== 'instagram' && (
        <View style={styles.searchBarContainer}>
          <Feather name="search" size={16} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medical videos, shorts & topics..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* If Instagram platform selected, display Instagram Coming Soon Showcase */}
      {activePlatform === 'instagram' ? (
        <View style={styles.instagramWrapper}>
          {renderHeader()}
          <InstagramComingSoon />
        </View>
      ) : loading && !refreshing && videos.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A8B5" />
          <Text style={styles.loadingText}>Loading Educational Videos...</Text>
        </View>
      ) : (
        <FlatList<EducationalVideo>
          key={`${gridConfig.key}-${activePlatform}`}
          data={filteredVideos}
          keyExtractor={(item) => item.id || item.externalId}
          numColumns={gridConfig.numColumns}
          columnWrapperStyle={gridConfig.columnWrapperStyle}
          renderItem={gridConfig.renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#00A8B5']}
              tintColor="#00A8B5"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleContainer: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2537',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  syncIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F2537',
    padding: 0,
  },
  listContent: {
    paddingBottom: 100,
  },
  instagramWrapper: {
    flex: 1,
  },
  bannerCard: {
    backgroundColor: '#0F2537',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 16,
    padding: 16,
  },
  bannerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 168, 181, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A8B5',
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00A8B5',
    letterSpacing: 0.5,
  },
  ytTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  ytTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '500',
  },
  retryBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  retryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 8,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A8B5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  syncButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  threeColumnWrapper: {
    gap: 6,
    paddingHorizontal: 16,
  },
  twoColumnWrapper: {
    gap: 10,
    paddingHorizontal: 16,
  },
  singleColumnItemWrapper: {
    paddingHorizontal: 16,
  },
});
