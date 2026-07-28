/**
 * frontend/src/modules/patient/video/VideoScreen.tsx
 * Premium Medical Video Consultations & Health Education Module
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../core/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type VideoCategory = 'All' | 'Cardiology' | 'Wellness' | 'Pediatrics' | 'Dermatology';

interface VideoItem {
  id: string;
  title: string;
  doctorName: string;
  specialty: string;
  duration: string;
  views: string;
  thumbnail: string;
  category: VideoCategory;
}

const CATEGORIES: VideoCategory[] = ['All', 'Cardiology', 'Wellness', 'Pediatrics', 'Dermatology'];

const MOCK_VIDEOS: VideoItem[] = [
  {
    id: '1',
    title: 'Understanding Heart Health & Daily Cardio Care',
    doctorName: 'Dr. Rajesh Sharma',
    specialty: 'Cardiologist',
    duration: '12:45',
    views: '4.2k views',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    category: 'Cardiology',
  },
  {
    id: '2',
    title: '5 Essential Skin Care Habits Recommended by Doctors',
    doctorName: 'Dr. Ananya Roy',
    specialty: 'Dermatologist',
    duration: '08:30',
    views: '8.9k views',
    thumbnail: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    category: 'Dermatology',
  },
  {
    id: '3',
    title: 'Child Nutrition & Immunity Boosting Tips',
    doctorName: 'Dr. Vikram Patel',
    specialty: 'Pediatrician',
    duration: '15:10',
    views: '6.1k views',
    thumbnail: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    category: 'Pediatrics',
  },
  {
    id: '4',
    title: 'Managing Mental Stress & Sleep Wellness Hygiene',
    doctorName: 'Dr. Meera Nambiar',
    specialty: 'Wellness Specialist',
    duration: '10:20',
    views: '12.4k views',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    category: 'Wellness',
  },
];

export function VideoScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('All');

  const filteredVideos = selectedCategory === 'All'
    ? MOCK_VIDEOS
    : MOCK_VIDEOS.filter((v) => v.category === selectedCategory);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Video Consult & Health Library</Text>
          <Text style={styles.headerSubtitle}>Watch verified medical guidance & talks</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.8}>
          <Feather name="search" size={20} color="#00A8B5" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerContent}>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTagText}>LIVE VIDEO CONSULT</Text>
            </View>
            <Text style={styles.bannerTitle}>Connect 1-on-1 with Top Doctors via HD Video</Text>
            <Text style={styles.bannerSub}>Book instant video calls & digital prescriptions</Text>
            <TouchableOpacity style={styles.bannerActionBtn} activeOpacity={0.85}>
              <Ionicons name="videocam" size={16} color="#FFFFFF" />
              <Text style={styles.bannerActionText}>Start Video Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Horizontal Scroll */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Browse Health Topics</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Video List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recommended Doctor Talks</Text>
        </View>

        {filteredVideos.map((item) => (
          <TouchableOpacity key={item.id} style={styles.videoCard} activeOpacity={0.9}>
            <View style={styles.thumbnailContainer}>
              <Image source={{ uri: item.thumbnail }} style={styles.thumbnailImage} />
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{item.duration}</Text>
              </View>
              <View style={styles.playOverlayButton}>
                <Ionicons name="play" size={24} color="#00A8B5" style={{ marginLeft: 2 }} />
              </View>
            </View>

            <View style={styles.videoMeta}>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.docRow}>
                <Feather name="user-check" size={14} color="#00A8B5" />
                <Text style={styles.docName}>
                  {item.doctorName} • <Text style={styles.docSpec}>{item.specialty}</Text>
                </Text>
              </View>
              <View style={styles.statsRow}>
                <Ionicons name="eye-outline" size={14} color="#94A3B8" />
                <Text style={styles.statsText}>{item.views}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2537',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  bannerCard: {
    backgroundColor: '#0F224A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#00A8B5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  bannerContent: {
    gap: 8,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F87171',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  bannerSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  bannerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#00A8B5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  bannerActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2537',
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#0d254c',
    borderColor: '#0d254c',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  thumbnailContainer: {
    height: 180,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  playOverlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  videoMeta: {
    padding: 14,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 20,
    marginBottom: 8,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  docName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F2537',
  },
  docSpec: {
    color: '#64748B',
    fontWeight: '400',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
