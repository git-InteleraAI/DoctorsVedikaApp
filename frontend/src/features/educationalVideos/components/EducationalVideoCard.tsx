/**
 * frontend/src/features/educationalVideos/components/EducationalVideoCard.tsx
 * Premium Card UI component for YouTube Videos & Shorts with native app Deep-Linking.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import { EducationalVideo } from '../types';

interface EducationalVideoCardProps {
  video: EducationalVideo;
}

/**
 * Formats view count into readable string (e.g. 1.5K, 2.4M).
 */
function formatViews(views: number): string {
  if (!views || views === 0) return '0 views';
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }
  return `${views} views`;
}

/**
 * Formats published date string.
 */
function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export const EducationalVideoCard: React.FC<EducationalVideoCardProps> = ({ video }) => {
  const isShort = video.contentType === 'short';

  /**
   * Handles user tapping on video card.
   * Performs deep linking to native YouTube app with web fallback.
   */
  const handleOpenVideo = async () => {
    const videoId = video.externalId;

    let deepLinkUrl = '';
    let fallbackWebUrl = '';

    if (isShort) {
      deepLinkUrl = `youtube://shorts/${videoId}`;
      fallbackWebUrl = `https://youtube.com/shorts/${videoId}`;
    } else {
      deepLinkUrl = `youtube://watch?v=${videoId}`;
      fallbackWebUrl = `https://youtube.com/watch?v=${videoId}`;
    }

    try {
      const canOpenNative = await Linking.canOpenURL(deepLinkUrl);
      if (canOpenNative) {
        await Linking.openURL(deepLinkUrl);
      } else {
        await Linking.openURL(fallbackWebUrl);
      }
    } catch (error) {
      console.warn('[DeepLink Error] Could not open native app, opening fallback web URL:', error);
      try {
        await Linking.openURL(fallbackWebUrl);
      } catch (fallbackError) {
        Alert.alert('Error', 'Unable to open YouTube video link.');
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handleOpenVideo}
      activeOpacity={0.9}
    >
      {/* Thumbnail Container */}
      <View style={[styles.thumbnailContainer, isShort && styles.thumbnailContainerShort]}>
        <Image
          source={{ uri: video.thumbnailUrl }}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />

        {/* Content Type / Shorts Badge */}
        {isShort ? (
          <View style={styles.shortsBadge}>
            <FontAwesome name="bolt" size={12} color="#FFFFFF" />
            <Text style={styles.shortsBadgeText}>SHORT</Text>
          </View>
        ) : (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{video.duration || '00:00'}</Text>
          </View>
        )}

        {/* YouTube Official Branding Badge */}
        <View style={styles.youtubeBrandBadge}>
          <FontAwesome name="youtube-play" size={16} color="#FF0000" />
        </View>

        {/* Center Play Button Overlay */}
        <View style={styles.playOverlayButton}>
          <Ionicons name="play" size={24} color="#00A8B5" style={{ marginLeft: 2 }} />
        </View>
      </View>

      {/* Video Metadata Container */}
      <View style={styles.metaContainer}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title}
        </Text>

        <View style={styles.channelRow}>
          <View style={styles.channelBadge}>
            <Feather name="shield" size={12} color="#00A8B5" />
            <Text style={styles.channelName}>Doctors Vedika Official</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            {formatViews(video.viewsCount)} • {formatDate(video.publishedAt)}
          </Text>
          <View style={styles.watchNativeBtn}>
            <Text style={styles.watchNativeText}>Open in App</Text>
            <Feather name="external-link" size={12} color="#00A8B5" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#0F2537',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  thumbnailContainer: {
    height: 190,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F2537',
  },
  thumbnailContainerShort: {
    height: 220,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  shortsBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  shortsBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  youtubeBrandBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  playOverlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -26,
    marginTop: -26,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  metaContainer: {
    padding: 14,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2537',
    lineHeight: 21,
    marginBottom: 8,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  channelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  channelName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00838F',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statsText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  watchNativeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  watchNativeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A8B5',
  },
});
