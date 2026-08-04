/**
 * frontend/src/features/educationalVideos/components/ShortsCard.tsx
 * Instagram Reels / YouTube Shorts styled 2-column vertical portrait card item with official Doctors Vedika shield logo.
 */
import React from 'react';
import {
  View,
  Text,
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
export const SHORTS_CARD_WIDTH = (SCREEN_WIDTH - 32 - 10) / 2;

interface ShortsCardProps {
  video: EducationalVideo;
}

export const ShortsCard: React.FC<ShortsCardProps> = ({ video }) => {
  const handleOpenVideo = async () => {
    const videoId = video.externalId;
    const deepLinkUrl = `youtube://shorts/${videoId}`;
    const fallbackWebUrl = `https://youtube.com/shorts/${videoId}`;

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
        Alert.alert('Error', 'Unable to open Shorts link.');
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handleOpenVideo}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: video.thumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* Shorts Top Left Tag */}
      <View style={styles.shortsBadge}>
        <FontAwesome name="bolt" size={10} color="#FFFFFF" />
        <Text style={styles.shortsBadgeText}>SHORT</Text>
      </View>

      {/* Official Doctors Vedika Shield Logo Badge Top Right */}
      <View style={styles.brandBadge}>
        <Image
          source={require('../../../../assets/DoctorsVedika.png')}
          style={styles.brandLogoImage}
          resizeMode="contain"
        />
      </View>

      {/* Center Play Overlay Icon */}
      <View style={styles.playOverlayBtn}>
        <Ionicons name="play" size={20} color="#00A8B5" style={{ marginLeft: 2 }} />
      </View>

      {/* Sleek Compact Bottom Shadow Layer Bar */}
      <View style={styles.overlayContent}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: SHORTS_CARD_WIDTH,
    height: SHORTS_CARD_WIDTH * 1.6, // 9:16 Aspect Ratio
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F2537',
    position: 'relative',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#0F2537',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.25 }], // Scale image to crop any embedded letterbox side bars
  },
  shortsBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    elevation: 2,
  },
  shortsBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  brandLogoImage: {
    width: 18,
    height: 18,
  },
  playOverlayBtn: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(15, 23, 55, 0.72)', // Reduced height sleek shadow layer bar
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 15,
  },
});
