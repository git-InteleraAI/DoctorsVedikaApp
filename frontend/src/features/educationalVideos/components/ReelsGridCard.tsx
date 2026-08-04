/**
 * frontend/src/features/educationalVideos/components/ReelsGridCard.tsx
 * Instagram Reels & Explore Dashboard inspired 3-column grid card item with Doctors Vedika logo.
 */
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { EducationalVideo } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const REELS_CARD_WIDTH = (SCREEN_WIDTH - 32 - 12) / 3;

interface ReelsGridCardProps {
  video: EducationalVideo;
}

export const ReelsGridCard: React.FC<ReelsGridCardProps> = ({ video }) => {
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
        Alert.alert('Error', 'Unable to open video.');
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleOpenVideo}
      activeOpacity={0.88}
    >
      <Image
        source={{ uri: video.thumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* Top Left Doctors Vedika Logo Badge */}
      <View style={styles.brandLogoBadge}>
        <Image
          source={require('../../../../assets/DoctorsVedika.png')}
          style={styles.brandLogoImage}
          resizeMode="contain"
        />
      </View>

      {/* Top Right Content Type Badge */}
      <View style={styles.topBadge}>
        {isShort ? (
          <FontAwesome name="bolt" size={10} color="#FFD700" />
        ) : (
          <Ionicons name="play" size={10} color="#FFFFFF" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: REELS_CARD_WIDTH,
    height: REELS_CARD_WIDTH * 1.55, // 9:14 Aspect Ratio
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#0F2537',
    position: 'relative',
    marginBottom: 6,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.25 }], // Scale image to crop any embedded letterbox side bars
  },
  brandLogoBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FFFFFF',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  brandLogoImage: {
    width: 12,
    height: 12,
  },
  topBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(15, 23, 55, 0.65)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
