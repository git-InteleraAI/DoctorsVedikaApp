/**
 * frontend/src/modules/patient/profile/ProfileScreen.tsx
 * Professional, premium Profile dashboard.
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../core/theme';
import { useAuth } from '../../../contexts/AuthContext';
import type { PatientsRow } from '../../../types/database';
import type { PatientStackParamList } from '../../../app/navigation/PatientNavigator';

type NavigationProp = NativeStackNavigationProp<PatientStackParamList, 'PatientTabs'>;

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  isDestructive?: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, isDestructive }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconContainer}>
        {icon}
      </View>
      <View style={styles.menuTextGroup}>
        <Text style={[styles.menuTitle, isDestructive && styles.destructiveText]}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { session, profile, patientProfile, signOut } = useAuth();
  const patientDetails: Partial<PatientsRow> = patientProfile ?? {};

  function handleAction(feature: string) {
    Alert.alert(feature, `${feature} is coming in a later module.`);
  }

  function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => signOut() },
      ]
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + theme.spacing.sm, paddingBottom: insets.bottom + theme.spacing.xl },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.avatarSection}>
          <Image
            source={{ uri: patientProfile?.profile_photo || session?.user?.user_metadata?.avatar_url || DEFAULT_AVATAR }}
            style={styles.avatarImage}
          />
          <TouchableOpacity style={styles.cameraBadge} onPress={() => navigation.navigate('EditProfile')}>
            <Feather name="camera" size={14} color={theme.colors.textInverse} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.nameText}>{profile?.full_name ?? 'John Doe'}</Text>
          <Text style={styles.emailText}>{profile?.email ?? 'john.doe@email.com'}</Text>
          <Text style={styles.phoneText}>{profile?.phone ?? 'Add phone number'}</Text>
        </View>
      </View>

      <View style={styles.metadataCard}>
        <View style={styles.metaColumn}>
          <Ionicons name="person-outline" size={18} color="#00A8B5" />
          <Text style={styles.metaValue}>
            {patientDetails.gender
              ? patientDetails.gender.charAt(0).toUpperCase() + patientDetails.gender.slice(1)
              : 'Male'}
          </Text>
          <Text style={styles.metaLabel}>Gender</Text>
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.metaColumn}>
          <Ionicons name="calendar-outline" size={18} color="#2196F3" />
          <Text style={styles.metaValue}>{patientDetails.date_of_birth ?? '28 Nov 1995'}</Text>
          <Text style={styles.metaLabel}>Date of Birth</Text>
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.metaColumn}>
          <Ionicons name="water-outline" size={18} color="#E91E63" />
          <Text style={styles.metaValue}>{patientDetails.blood_group ?? 'O+'}</Text>
          <Text style={styles.metaLabel}>Blood Group</Text>
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.metaColumn}>
          <Ionicons name="location-outline" size={18} color="#FF9800" />
          <Text style={styles.metaValue} numberOfLines={1}>{patientDetails.locality ?? 'Texas, USA'}</Text>
          <Text style={styles.metaLabel}>Location</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <MenuItem
          icon={<Feather name="user" size={18} color="#00A8B5" />}
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <View style={styles.menuDivider} />

        <MenuItem
          icon={<Feather name="map-pin" size={18} color="#2196F3" />}
          title="Addresses"
          subtitle="Manage your saved addresses"
          onPress={() => navigation.navigate('Address')}
        />
        <View style={styles.menuDivider} />

        <MenuItem
          icon={<Feather name="credit-card" size={18} color="#9C27B0" />}
          title="Payment Methods"
          subtitle="Manage cards and wallets"
          onPress={() => handleAction('Payment Methods')}
        />
        <View style={styles.menuDivider} />

        <MenuItem
          icon={<Feather name="clipboard" size={18} color="#00BCD4" />}
          title="Health Records"
          subtitle="View your medical history"
          onPress={() => handleAction('Health Records')}
        />
        <View style={styles.menuDivider} />

        <MenuItem
          icon={<MaterialCommunityIcons name="prescription" size={18} color="#4CAF50" />}
          title="Prescriptions"
          subtitle="View your prescriptions"
          onPress={() => handleAction('Prescriptions')}
        />
        <View style={styles.menuDivider} />

        <MenuItem
          icon={<Feather name="settings" size={18} color="#607D8B" />}
          title="Settings"
          subtitle="App preferences and general settings"
          onPress={() => handleAction('Settings')}
        />
        <View style={styles.menuDivider} />

        <MenuItem
          icon={<Feather name="headphones" size={18} color="#FF5722" />}
          title="Help & Support"
          subtitle="Get help and contact support"
          onPress={() => handleAction('Help & Support')}
        />
        <View style={styles.menuDivider} />

        <MenuItem
          icon={<Feather name="shield" size={18} color="#3F51B5" />}
          title="Privacy Policy"
          subtitle="Read our privacy policy"
          onPress={() => handleAction('Privacy Policy')}
        />
        <View style={styles.menuDivider} />

        <MenuItem
          icon={<Feather name="file-text" size={18} color="#FF9800" />}
          title="Terms & Conditions"
          subtitle="Read our terms and conditions"
          onPress={() => handleAction('Terms & Conditions')}
        />
        <View style={styles.menuDivider} />

        <MenuItem
          icon={<Feather name="log-out" size={18} color="#EF4444" />}
          title="Logout"
          subtitle="Sign out from your account"
          onPress={handleLogout}
          isDestructive
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  avatarSection: {
    position: 'relative',
    marginRight: theme.spacing.lg,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00A8B5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E2229',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#6B7C80',
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 14,
    color: '#6B7C80',
  },
  metadataCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...theme.shadow.card,
  },
  metaColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  metaDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: theme.spacing.xl,
    ...theme.shadow.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md - 2,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuTextGroup: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  destructiveText: {
    color: '#EF4444',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
