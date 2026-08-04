/**
 * frontend/src/features/educationalVideos/components/CategoryTabs.tsx
 * Category tabs component for switching between All, Videos, and Shorts.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ContentType } from '../types';

interface CategoryTabsProps {
  activeTab: ContentType;
  onTabChange: (tab: ContentType) => void;
  counts?: {
    all?: number;
    video?: number;
    short?: number;
  };
}

const TABS: { id: ContentType; label: string; icon: string }[] = [
  { id: 'all', label: 'All Content', icon: 'grid' },
  { id: 'video', label: 'Videos', icon: 'video' },
  { id: 'short', label: 'Shorts', icon: 'play-circle' },
];

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeTab, onTabChange, counts }) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts ? counts[tab.id] : undefined;

        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.8}
          >
            {tab.id === 'short' ? (
              <MaterialCommunityIcons
                name="youtube-subscription"
                size={16}
                color={isActive ? '#FFFFFF' : '#64748B'}
              />
            ) : (
              <Feather
                name={tab.icon as any}
                size={15}
                color={isActive ? '#FFFFFF' : '#64748B'}
              />
            )}
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {count !== undefined && count > 0 && (
              <View style={[styles.badge, isActive && styles.badgeActive]}>
                <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#0F2537',
    shadowColor: '#0F2537',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
});
