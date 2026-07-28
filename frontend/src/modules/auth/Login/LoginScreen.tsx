/**
 * frontend/src/modules/auth/Login/LoginScreen.tsx
 * High-fidelity, premium "Welcome Back" login screen.
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
import { loginWithEmail } from '../../../features/auth/api';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../core/theme';
import { FormInput } from '../../../core/components/FormInput';
import assets from '../../../core/assets';
import type { AuthStackParamList } from '../../../app/navigation/AuthNavigator';
import { Feather, Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleLogin() {
    setErrorMessage(null);
    setShowResend(false);

    if (!email.trim() || !password) {
      setErrorMessage('Enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail({ email: email.trim(), password });
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setErrorMessage('Please confirm your email before logging in.');
        setShowResend(true);
      } else if (msg.toLowerCase().includes('invalid login credentials')) {
        setErrorMessage('Incorrect email or password.');
      } else {
        setErrorMessage(msg);
      }
    }
  }

  async function handleResendConfirmation() {
    setIsResending(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
    setIsResending(false);
    if (error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage('Confirmation email resent. Check your inbox.');
      setShowResend(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topCurveDecoration} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          { paddingTop: SCREEN_HEIGHT * 0.12, paddingBottom: insets.bottom + theme.spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRightStethoscope} pointerEvents="none">
          <Image source={assets.images.stethoscope} style={styles.stethoscopeImage} resizeMode="contain" />
        </View>

        <Image source={assets.logo.withName} style={styles.cardLogo} resizeMode="contain" />

        <View style={styles.greetingHeader}>
          <Text style={styles.titleText}>
            Welcome <Text style={styles.titleTextTeal}>Back</Text>
          </Text>
          <Text style={styles.subtitleText}>Glad to see you again!</Text>
        </View>

        <View style={styles.loginCard}>
          <Text style={styles.cardTitle}>Login to your account</Text>
          <Text style={styles.cardSubtitle}>Continue your healthcare journey</Text>

          <FormInput
            label=""
            icon="mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email Address"
          />

          <FormInput
            label=""
            icon="lock"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
          />

          <TouchableOpacity style={styles.forgotBtn} onPress={() => handleResendConfirmation()}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {showResend ? (
            <TouchableOpacity style={styles.resendBtn} onPress={handleResendConfirmation} disabled={isResending}>
              <Text style={styles.resendText}>
                {isResending ? 'Resending...' : 'Resend confirmation email'}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Login</Text>
                <View style={styles.arrowCircle}>
                  <Feather name="arrow-right" size={16} color="#00A8B5" />
                </View>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
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

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.signupFooter}>
            <Text style={styles.signupFooterText}>
              Don't have an account? <Text style={styles.signupLink}>Sign up</Text>
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
  cardLogo: {
    width: 253,
    height: 143,
    alignSelf: 'flex-start',
    marginLeft: -34,
    marginTop: -31,
    marginBottom: -28,
  },
  topRightStethoscope: {
    position: 'absolute',
    top: 10,
    right: -15,
    zIndex: 2,
    opacity: 0.5,
  },
  stethoscopeImage: {
    width: 200,
    height: 200,
  },
  topCurveDecoration: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.08,
    left: -SCREEN_WIDTH * 0.1,
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_HEIGHT * 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderBottomLeftRadius: SCREEN_WIDTH * 0.6,
    borderBottomRightRadius: SCREEN_WIDTH * 0.6,
    transform: [{ rotate: '-12deg' }],
  },
  greetingHeader: {
    marginBottom: theme.spacing.lg,
    zIndex: 5,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F2537',
  },
  titleTextTeal: {
    color: theme.colors.primary,
  },
  subtitleText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: theme.spacing.lg + 4,
    paddingVertical: theme.spacing.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 5,
    marginBottom: theme.spacing.xl,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0E2229',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: theme.spacing.lg + 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  forgotText: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.danger,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  resendBtn: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 13,
    color: theme.colors.accent,
    textDecorationLine: 'underline',
  },
  loginButton: {
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: theme.spacing.xl,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arrowCircle: {
    position: 'absolute',
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
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
    gap: 16,
    marginBottom: theme.spacing.xl,
  },
  socialBtn: {
    width: SCREEN_WIDTH * 0.22,
    height: 48,
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
  signupFooter: {
    alignItems: 'center',
    marginTop: 4,
  },
  signupFooterText: {
    fontSize: 13,
    color: '#64748B',
  },
  signupLink: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
