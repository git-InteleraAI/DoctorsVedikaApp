/**
 * frontend/src/features/educationalVideos/components/InstagramComingSoon.tsx
 * Ultra-sleek Instagram Reels Preview & Coming Soon Card component styled with 3D Instagram Icon.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export const InstagramComingSoon: React.FC = () => {
  const handleFollowInstagram = async () => {
    const instagramAppUrl = 'instagram://user?username=doctors_vedika';
    const instagramWebUrl = 'https://www.instagram.com/doctors_vedika?igsh=Y3dlNnFneWhkbTlv';

    try {
      const canOpen = await Linking.canOpenURL(instagramAppUrl);
      if (canOpen) {
        await Linking.openURL(instagramAppUrl);
      } else {
        await Linking.openURL(instagramWebUrl);
      }
    } catch {
      try {
        await Linking.openURL(instagramWebUrl);
      } catch {
        Alert.alert('Error', 'Unable to open Instagram.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* 3D Instagram Icon Container */}
      <View style={styles.iconCircle}>
        <Image
          source={require('../../../../assets/social-media-icons/instagram-3d-icon.jpg')}
          style={styles.large3dIcon}
          resizeMode="cover"
        />
      </View>

      <View style={styles.comingSoonPill}>
        <View style={styles.dot} />
        <Text style={styles.comingSoonPillText}>INSTAGRAM REELS • COMING SOON</Text>
      </View>

      <Text style={styles.title}>Doctors Vedika Instagram Feed</Text>
      <Text style={styles.description}>
        We are building direct Instagram Reels integration! Soon you will be able to browse, watch, and save official Instagram health reels and doctor posts directly within the app.
      </Text>

      {/* Feature Teasers */}
      <View style={styles.featureRow}>
        <View style={styles.featureBadge}>
          <Text style={styles.featureText}>✨ HD Video Reels</Text>
        </View>
        <View style={styles.featureBadge}>
          <Text style={styles.featureText}>⚡ Daily Health Tips</Text>
        </View>
        <View style={styles.featureBadge}>
          <Text style={styles.featureText}>👨‍⚕️ Verified Doctor Posts</Text>
        </View>
      </View>

      {/* Follow Action Button */}
      <TouchableOpacity
        style={styles.followButton}
        onPress={handleFollowInstagram}
        activeOpacity={0.85}
      >
        <Image
          source={require('../../../../assets/social-media-icons/instagram-3d-icon.jpg')}
          style={styles.button3dIcon}
          resizeMode="cover"
        />
        <Text style={styles.followButtonText}>Follow us on Instagram</Text>
        <Feather name="external-link" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#0F2537',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  large3dIcon: {
    width: 54,
    height: 54,
    borderRadius: 14,
  },
  button3dIcon: {
    width: 20,
    height: 20,
    borderRadius: 5,
  },
  comingSoonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A8B5',
  },
  comingSoonPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00838F',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2537',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  featureBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A8B5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    elevation: 3,
    shadowColor: '#00A8B5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
