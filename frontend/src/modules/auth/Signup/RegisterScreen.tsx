/**
 * frontend/src/modules/auth/Signup/RegisterScreen.tsx
 * High-fidelity, premium "Create Account" signup screen.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { registerWithEmail } from '../../../features/auth/api';
import { theme } from '../../../core/theme';
import { FormInput } from '../../../core/components/FormInput';
import assets from '../../../core/assets';
import type { AuthStackParamList } from '../../../app/navigation/AuthNavigator';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const safeTopPadding = Math.max(insets.top, 36) + 12;

  function validate(): string | null {
    if (!fullName.trim()) return 'Enter your full name.';
    if (!EMAIL_REGEX.test(email.trim())) return 'Enter a valid email address.';
    if (!phone.trim()) return 'Enter your phone number.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!agreedToTerms) return 'Please agree to the Terms & Conditions to continue.';
    return null;
  }

  async function handleRegister() {
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await registerWithEmail({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role: 'patient',
        phone: phone.trim(),
      });

      setIsLoading(false);
      navigation.navigate('CheckEmail', { email: email.trim() });
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already registered')) {
        setErrorMessage('An account with this email already exists.');
      } else {
        setErrorMessage(msg);
      }
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.bottomStethoscope}>
        <Image source={assets.images.stethoscope} style={styles.stethoscopeImage} resizeMode="contain" />
      </View>

      <View style={[styles.waveformBackground, { bottom: 20 }]}>
        <View style={styles.heartbeatRow}>
          <View style={styles.line} />
          <MaterialCommunityIcons name="heart-flash" size={18} color="#00BCD4" style={styles.pulseIcon} />
          <View style={styles.line} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          { paddingTop: safeTopPadding, paddingBottom: insets.bottom + theme.spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={18} color="#0F2537" />
        </TouchableOpacity>

        <Image source={assets.logo.withName} style={styles.cardLogo} resizeMode="contain" />

        <View style={styles.greetingHeader}>
          <Text style={styles.titleText}>
            Create <Text style={styles.titleTextTeal}>Account</Text>
          </Text>
          <Text style={styles.subtitleText}>Join Doctors Vedika & take charge of your health</Text>
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>1</Text>
            </View>
            <Text style={[styles.stepLabel, styles.stepLabelActive]}>Basic Info</Text>
          </View>

          <View style={styles.stepDivider} />

          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={styles.stepLabel}>Verify</Text>
          </View>

          <View style={styles.stepDivider} />

          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Complete</Text>
          </View>
        </View>

        <View style={styles.signupCard}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <FormInput
            label=""
            icon="user"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.fieldLabel}>Email Address</Text>
          <FormInput
            label=""
            icon="mail"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.fieldLabel}>Phone Number</Text>
          <FormInput
            label=""
            icon="phone"
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.fieldLabel}>Password</Text>
          <FormInput
            label=""
            icon="lock"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.fieldLabel}>Confirm Password</Text>
          <FormInput
            label=""
            icon="lock"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.checkboxContainer}
            activeOpacity={0.8}
            onPress={() => setAgreedToTerms((v) => !v)}
          >
            <View style={[styles.box, agreedToTerms && styles.boxChecked]}>
              {agreedToTerms && <Feather name="check" size={12} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabelText}>
              I agree to the <Text style={styles.checkboxHighlight}>Terms of Service</Text> and{' '}
              <Text style={styles.checkboxHighlight}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={styles.signupButton}
            activeOpacity={0.85}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.signupButtonText}>Sign Up</Text>
                <View style={styles.arrowCircle}>
                  <Feather name="arrow-right" size={16} color="#00A8B5" />
                </View>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
              <Ionicons name="logo-google" size={20} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
              <Ionicons name="logo-apple" size={20} color="#000000" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginFooter}>
            <Text style={styles.loginFooterText}>
              Already have an account? <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#EBF1F5' },
  container: {
    paddingHorizontal: theme.spacing.lg,
    flexGrow: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: theme.spacing.sm,
  },
  cardLogo: {
    width: 253,
    height: 143,
    alignSelf: 'center',
    marginLeft: -12,
    marginTop: -31,
    marginBottom: -24,
  },
  bottomStethoscope: {
    position: 'absolute',
    bottom: -60,
    right: -40,
    opacity: 0.18,
    zIndex: 1,
  },
  stethoscopeImage: {
    width: 220,
    height: 220,
  },
  waveformBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    opacity: 0.08,
    alignItems: 'center',
  },
  heartbeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#00BCD4',
  },
  pulseIcon: {
    marginHorizontal: 8,
  },
  greetingHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    zIndex: 5,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F2537',
    textAlign: 'center',
  },
  titleTextTeal: {
    color: '#00A8B5',
  },
  subtitleText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    zIndex: 5,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#00A8B5',
  },
  stepNumber: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepNumberActive: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepLabelActive: {
    color: '#00A8B5',
  },
  stepDivider: {
    width: 40,
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginTop: -16,
  },
  signupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 5,
    marginBottom: theme.spacing.xl,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2537',
    marginBottom: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  boxChecked: {
    backgroundColor: '#00A8B5',
    borderColor: '#00A8B5',
  },
  checkboxLabelText: {
    fontSize: 12,
    color: '#64748B',
    flexShrink: 1,
    lineHeight: 16,
  },
  checkboxHighlight: {
    color: '#00A8B5',
    fontWeight: '700',
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.danger,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  signupButton: {
    height: 50,
    backgroundColor: '#00A8B5',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arrowCircle: {
    position: 'absolute',
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: theme.spacing.lg,
  },
  socialBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  loginFooter: {
    alignItems: 'center',
  },
  loginFooterText: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLink: {
    color: '#00A8B5',
    fontWeight: '700',
  },
});
