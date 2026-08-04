/**
 * frontend/src/features/educationalVideos/components/StandardVideoCard.tsx
 * Premium 16:9 Widescreen Doctor Talk Video Card Component.
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

interface StandardVideoCardProps {
  video: EducationalVideo;
}

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

export const StandardVideoCard: React.FC<StandardVideoCardProps> = ({ video }) => {
  const isShort = video.contentType === 'short';

  const handleOpenVideo = async () => {
    const videoId = video.externalId;
    const deepLinkUrl = isShort
      ? `youtube://shorts/${videoId}`
      : `youtube://watch?v=${videoId}`;
    const fallbackWebUrl = isShort
      ? `https://youtube.com/shorts/${videoId}`
      : `https://youtube.com/watch?v=${videoId}`;

    try {
      const canOpen = await Linking.canOpenURL(deepLinkUrl);
      if (canOpen) {
        await Linking.openURL(deepLinkUrl);
      } else {
        await Linking.openURL(fallbackWebUrl);
      }
    } catch {
      try {
        await Linking.openURL(fallbackWebUrl);
      } catch {
        Alert.alert('Error', 'Unable to open video link.');
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handleOpenVideo}
      activeOpacity={0.9}
    >
      {/* 16:9 Widescreen Thumbnail Container */}
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />

        {/* Duration Badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration || '00:00'}</Text>
        </View>

        {/* YouTube Brand Badge */}
        <View style={styles.brandBadge}>
          <Image
            source={require('../../../../assets/social-media-icons/youtube-3d-icon.png')}
            style={{ width: 18, height: 18 }}
            resizeMode="contain"
          />
        </View>

        {/* Play Button Overlay */}
        <View style={styles.playBtn}>
          <Ionicons name="play" size={24} color="#00A8B5" style={{ marginLeft: 2 }} />
        </View>
      </View>

      {/* Video Info Meta */}
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
          <Text style={styles.statsText}>{formatDate(video.publishedAt)}</Text>
          <View style={styles.watchActionBtn}>
            <Text style={styles.watchActionText}>Watch Talk</Text>
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
  thumbnail: {
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
  brandBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
  },
  playBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statsText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  watchActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  watchActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A8B5',
  },
});
