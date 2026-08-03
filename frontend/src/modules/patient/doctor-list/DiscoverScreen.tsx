/**
 * frontend/src/modules/patient/doctor-list/DiscoverScreen.tsx
 * Professional, premium "Find Doctors" screen.
 */
import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../core/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { searchDoctors } from '../../../features/doctor-discovery/api';
import { getPatientFavorites, togglePatientFavorite } from '../../../features/patient-profile/favoritesApi';
import { useAppNavigation } from '../../../navigation/navigationHelpers';
import type { DoctorSortOption } from '../../../features/doctor-discovery/types';
import type { DoctorsRow } from '../../../types/database';
import assets from '../../../core/assets';

interface SpecialtyCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const CATEGORIES = (active: string): SpecialtyCategory[] => [
  {
    id: 'All',
    name: 'All',
    icon: <Feather name="grid" size={24} color={active === 'All' ? theme.colors.textInverse : '#00A8B5'} />,
  },
  {
    id: 'Cardiology',
    name: 'Cardiology',
    icon: <Image source={assets.categories.cardiology} style={{ width: 48, height: 48, borderRadius: 24, resizeMode: 'cover' }} />,
  },
  {
    id: 'Gynecology',
    name: 'Gynecology',
    icon: <Image source={assets.categories.gynecology} style={{ width: 48, height: 48, borderRadius: 24, resizeMode: 'cover' }} />,
  },
  {
    id: 'Neurology',
    name: 'Neurology',
    icon: <Image source={assets.categories.neurology} style={{ width: 48, height: 48, borderRadius: 24, resizeMode: 'cover' }} />,
  },
  {
    id: 'Orthopedics',
    name: 'Orthopedics',
    icon: <Image source={assets.categories.orthopedics} style={{ width: 48, height: 48, borderRadius: 24, resizeMode: 'cover' }} />,
  },
  {
    id: 'Pediatrics',
    name: 'Pediatrics',
    icon: <Image source={assets.categories.pediatrics} style={{ width: 48, height: 48, borderRadius: 24, resizeMode: 'cover' }} />,
  },
  {
    id: 'More',
    name: 'More',
    icon: <Ionicons name="ellipsis-horizontal" size={24} color={active === 'More' ? theme.colors.textInverse : '#607D8B'} />,
  },
];

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const appNav = useAppNavigation();
  const route = useRoute<any>();
  const { profile } = useAuth();
  const searchInputRef = useRef<any>(null);

  const [doctors, setDoctors] = useState<DoctorsRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(route.params?.initialSearchQuery ?? '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favoriteDoctorIds, setFavoriteDoctorIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'fee_low' | 'exp_high'>('relevance');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    if (profile?.id) {
      getPatientFavorites(profile.id).then(setFavoriteDoctorIds);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (route.params?.initialSearchQuery !== undefined) {
      setSearchQuery(route.params.initialSearchQuery);
    }
  }, [route.params?.initialSearchQuery]);

  useEffect(() => {
    if (route.params?.autofocusSearch) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [route.params?.autofocusSearch]);

  useEffect(() => {
    let mounted = true;
    async function loadDoctors() {
      setIsLoading(true);
      setError(null);
      const res = await searchDoctors({});
      if (mounted) {
        setDoctors(res);
        setIsLoading(false);
      }
    }
    loadDoctors();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredAndSortedDoctors = useMemo(() => {
    let result = [...doctors];

    if (selectedCategory !== 'All' && selectedCategory !== 'More') {
      const catLower = selectedCategory.toLowerCase();
      result = result.filter((doc) => {
        const spec = (doc.doctor_specialization || '').toLowerCase();
        return (
          spec.includes(catLower) ||
          catLower.includes(spec) ||
          (catLower.startsWith('cardio') && spec.includes('cardio')) ||
          (catLower.startsWith('gynaec') && spec.includes('gyn')) ||
          (catLower.startsWith('gynec') && spec.includes('gyn')) ||
          (catLower.startsWith('neuro') && spec.includes('neuro')) ||
          (catLower.startsWith('pediat') && spec.includes('pediat')) ||
          (catLower.startsWith('ortho') && spec.includes('ortho'))
        );
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.doctor_name.toLowerCase().includes(q) ||
          doc.doctor_specialization?.toLowerCase().includes(q) ||
          doc.doctor_clinic_name?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'fee_low') {
      result.sort((a, b) => (a.doctor_consultation_fee ?? 0) - (b.doctor_consultation_fee ?? 0));
    } else if (sortBy === 'exp_high') {
      result.sort((a, b) => (b.doctor_experience ?? 0) - (a.doctor_experience ?? 0));
    }

    return result;
  }, [doctors, selectedCategory, searchQuery, sortBy]);

  const handleFeature = (feature: string) => {
    Alert.alert(feature, `${feature} is coming in a later module.`);
  };

  const getSortLabel = () => {
    if (sortBy === 'fee_low') return 'Fee: Low to High';
    if (sortBy === 'exp_high') return 'Experience';
    return 'Relevance';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.titleText}>Find Doctors</Text>
          <Text style={styles.subtitleText}>Search and book with trusted specialists</Text>
        </View>

        <TouchableOpacity style={styles.filterButton} onPress={() => handleFeature('Filters')}>
          <Ionicons name="funnel-outline" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Feather name="search" size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search by name, specialty, symptoms..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => handleFeature('Voice Search')} hitSlop={8}>
          <Feather name="mic" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesSection}>
        <FlatList
          data={CATEGORIES(selectedCategory)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesContainer}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.id;
            return (
              <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => setSelectedCategory(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryCircle, isActive && styles.categoryCircleActive]}>
                  {item.icon}
                </View>
                <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View style={styles.subHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.resultsCount}>
            {filteredAndSortedDoctors.length}+ Doctors Available
          </Text>
          <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 8, padding: 2 }}>
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: viewMode === 'list' ? '#0284C7' : 'transparent',
              }}
            >
              <Feather name="list" size={14} color={viewMode === 'list' ? '#FFF' : '#64748B'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setViewMode('map')}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: viewMode === 'map' ? '#0284C7' : 'transparent',
              }}
            >
              <Feather name="map" size={14} color={viewMode === 'map' ? '#FFF' : '#64748B'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sortWrapper}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortDropdown(!showSortDropdown)}
          >
            <Text style={styles.sortText}>Sort by: {getSortLabel()}</Text>
            <Feather name="chevron-down" size={14} color="#00BCD4" />
          </TouchableOpacity>

          {showSortDropdown && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSortBy('relevance');
                  setShowSortDropdown(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>Relevance</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSortBy('fee_low');
                  setShowSortDropdown(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>Fee: Low to High</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setSortBy('exp_high');
                  setShowSortDropdown(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>Experience</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {viewMode === 'map' ? (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 16 }}>
          <View style={{ flex: 1, backgroundColor: '#E2E8F0', borderRadius: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
            <Feather name="map-pin" size={32} color="#0284C7" />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 8 }}>Clinic Map View Active</Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center', paddingHorizontal: 20 }}>
              Showing {filteredAndSortedDoctors.length} clinic locations nearby
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
              {filteredAndSortedDoctors.map((doc) => (
                <TouchableOpacity
                  key={doc.doctor_id}
                  onPress={() => appNav.goToDoctorProfile(doc)}
                  style={{ backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginRight: 10, width: 220, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
                >
                  <Text style={{ fontWeight: '700', color: '#0F172A' }}>{doc.doctor_name}</Text>
                  <Text style={{ fontSize: 12, color: '#0284C7' }}>{doc.doctor_specialization}</Text>
                  <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>📍 {doc.doctor_clinic_name || 'Clinic'}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <Text style={{ fontWeight: '700', color: '#0F766E', fontSize: 13 }}>₹{doc.doctor_consultation_fee ?? 500}</Text>
                    <Text style={{ fontSize: 12, color: '#0284C7', fontWeight: '600' }}>Book Slot →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Searching specialists...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedDoctors}
          keyExtractor={(item) => item.doctor_id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + theme.spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isFav = favoriteDoctorIds.includes(item.doctor_id);
            const initials = item.doctor_name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <TouchableOpacity
                style={styles.doctorCard}
                activeOpacity={0.9}
                onPress={() => appNav.goToDoctorProfile(item)}
              >
                {/* Top Row: Avatar + Doctor Info + Favorite Button */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.avatarContainer}>
                    {item.doctor_profile_photo ? (
                      <Image source={{ uri: item.doctor_profile_photo }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarFallbackText}>{initials}</Text>
                      </View>
                    )}
                    <View style={styles.activeDot} />
                  </View>

                  <View style={styles.infoSection}>
                    <View style={styles.nameRow}>
                      <Text style={styles.doctorName} numberOfLines={1}>
                        Dr. {item.doctor_name}
                      </Text>
                      <MaterialCommunityIcons name="check-decagram" size={16} color="#00BCD4" style={styles.verifiedIcon} />
                    </View>

                    <Text style={styles.specializationText}>
                      {item.doctor_specialization ?? 'General Physician'}  •  {item.doctor_experience ?? 5}+ Yrs Exp
                    </Text>

                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color="#FFC107" />
                      <Text style={styles.ratingValue}>
                        {item.doctor_rating !== undefined && item.doctor_rating !== null ? item.doctor_rating : '4.9'}{' '}
                        <Text style={styles.reviewCount}>
                          ({item.doctor_reviews_count !== undefined && item.doctor_reviews_count !== null ? item.doctor_reviews_count : '120'} Reviews)
                        </Text>
                      </Text>
                    </View>

                    {item.doctor_clinic_name ? (
                      <View style={styles.clinicRow}>
                        <Feather name="map-pin" size={11} color="#64748B" />
                        <Text style={styles.clinicText} numberOfLines={1}>
                          {item.doctor_clinic_name}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={async () => {
                      if (profile?.id) {
                        const newFav = await togglePatientFavorite(profile.id, item.doctor_id, isFav);
                        setFavoriteDoctorIds((prev) =>
                          newFav ? [...prev, item.doctor_id] : prev.filter((id) => id !== item.doctor_id)
                        );
                      }
                    }}
                  >
                    <Ionicons
                      name={isFav ? 'heart' : 'heart-outline'}
                      size={18}
                      color={isFav ? '#EF4444' : '#94A3B8'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Tags Row */}
                <View style={styles.tagsContainer}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{item.doctor_qualification ?? 'MBBS, MD'}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{item.doctor_languages ?? 'General Specialist'}</Text>
                  </View>
                </View>

                {/* Footer Row: Consultation Fee & Book Now Button */}
                <View style={styles.cardFooterRow}>
                  <View style={styles.feeContainer}>
                    <Text style={styles.feeLabel}>CONSULTATION FEE</Text>
                    <Text style={styles.feeValue}>₹{item.doctor_consultation_fee ?? 500}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => (navigation as any).navigate('DoctorProfile', { doctor: item })}
                  >
                    <Text style={styles.bookButtonText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0E2229',
  },
  subtitleText: {
    fontSize: 12,
    color: '#6B7C80',
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: theme.spacing.lg,
    ...theme.shadow.card,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    padding: 0,
  },
  categoriesSection: {
    marginBottom: theme.spacing.md,
  },
  categoriesContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
  },
  categoryCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  categoryCircleActive: {
    backgroundColor: '#0d254c',
    borderColor: '#0d254c',
  },
  categoryLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: '#0d254c',
    fontWeight: '700',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    zIndex: 10,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  sortWrapper: {
    position: 'relative',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
  dropdown: {
    position: 'absolute',
    top: 24,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: 140,
    ...theme.shadow.card,
    zIndex: 100,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#00A8B5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 20,
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0E224A',
    maxWidth: '85%',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  specializationText: {
    fontSize: 12,
    color: '#00A8B5',
    fontWeight: '600',
    marginBottom: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  reviewCount: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  clinicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clinicText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E0F7FA',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00838F',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  feeContainer: {
    justifyContent: 'center',
  },
  feeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 1,
  },
  feeValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#00A8B5',
  },
  bookButton: {
    backgroundColor: '#0E224A',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
