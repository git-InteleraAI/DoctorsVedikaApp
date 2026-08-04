/**
 * frontend/src/features/educationalVideos/components/PlatformTabs.tsx
 * Multi-Platform Selection Tabs Component with 3D Social Media Icons.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PlatformType } from '../types';

interface PlatformTabsProps {
  activePlatform: PlatformType;
  onPlatformChange: (platform: PlatformType) => void;
}

export const PlatformTabs: React.FC<PlatformTabsProps> = ({
  activePlatform,
  onPlatformChange,
}) => {
  return (
    <View style={styles.container}>
      {/* All Platforms */}
      <TouchableOpacity
        style={[styles.chip, activePlatform === 'all' && styles.chipActive]}
        onPress={() => onPlatformChange('all')}
        activeOpacity={0.8}
      >
        <Feather
          name="globe"
          size={14}
          color={activePlatform === 'all' ? '#FFFFFF' : '#64748B'}
        />
        <Text style={[styles.chipText, activePlatform === 'all' && styles.chipTextActive]}>
          All Platforms
        </Text>
      </TouchableOpacity>

      {/* YouTube Platform */}
      <TouchableOpacity
        style={[styles.chip, activePlatform === 'youtube' && styles.chipActive]}
        onPress={() => onPlatformChange('youtube')}
        activeOpacity={0.8}
      >
        <Image
          source={require('../../../../assets/social-media-icons/youtube-3d-icon.png')}
          style={styles.tabIcon}
          resizeMode="contain"
        />
        <Text style={[styles.chipText, activePlatform === 'youtube' && styles.chipTextActive]}>
          YouTube
        </Text>
      </TouchableOpacity>

      {/* Instagram Platform */}
      <TouchableOpacity
        style={[styles.chip, activePlatform === 'instagram' && styles.chipActive]}
        onPress={() => onPlatformChange('instagram')}
        activeOpacity={0.8}
      >
        <Image
          source={require('../../../../assets/social-media-icons/instagram-3d-icon.jpg')}
          style={[styles.tabIcon, { borderRadius: 4 }]}
          resizeMode="cover"
        />
        <Text style={[styles.chipText, activePlatform === 'instagram' && styles.chipTextActive]}>
          Instagram
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  chipActive: {
    backgroundColor: '#0F2537',
    borderColor: '#0F2537',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabIcon: {
    width: 18,
    height: 18,
  },
});
