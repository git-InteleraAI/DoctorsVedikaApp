/**
 * frontend/src/modules/auth/OTP/CheckEmailScreen.tsx
 * Shown right after signup. Prompts the user to confirm their email.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../core/theme';
import { PrimaryButton } from '../../../core/components/PrimaryButton';
import type { AuthStackParamList } from '../../../app/navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'CheckEmail'>;

export function CheckEmailScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleResend() {
    setIsResending(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    setIsResending(false);
    setMessage(error ? error.message : 'Confirmation email resent.');
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.body}>
        We sent a confirmation link to{'\n'}
        <Text style={styles.emailText}>{email}</Text>
        {'\n\n'}Tap the link in that email, then come back and log in.
      </Text>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.spacer} />
      <PrimaryButton title="Resend Email" onPress={handleResend} isLoading={isResending} />
      <View style={styles.smallSpacer} />
      <PrimaryButton title="Back to Login" onPress={() => navigation.replace('Login')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailText: { ...theme.typography.bodyBold, color: theme.colors.textPrimary },
  message: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  spacer: { height: theme.spacing.xl },
  smallSpacer: { height: theme.spacing.sm },
});
