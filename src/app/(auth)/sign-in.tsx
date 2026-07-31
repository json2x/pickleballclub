import { zodResolver } from '@hookform/resolvers/zod';
import * as Linking from 'expo-linking';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, TextField } from '@/components/ui';
import { AuthScaffold } from '@/features/auth/auth-scaffold';
import { emailSchema, signInSchema, type SignInValues } from '@/schemas/auth';
import { isSupabaseConfigured, supabase } from '@/services/supabase/client';
import { lightColors, radius, spacing } from '@/theme';

export default function SignInScreen() {
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success'; message: string } | null>(null);
  const [magicLinkPending, setMagicLinkPending] = useState(false);
  const {
    control,
    handleSubmit,
    getValues,
    setError,
    formState: { isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const signIn = handleSubmit(async ({ email, password }) => {
    setFeedback(null);
    if (!supabase) {
      setFeedback({ tone: 'error', message: 'Authentication is not configured for this build.' });
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setFeedback({
        tone: 'error',
        message: error.name === 'AuthRetryableFetchError'
          ? 'Unable to reach the club service. Check your connection and try again.'
          : 'Email or password is incorrect.',
      });
    }
  });

  const sendMagicLink = async () => {
    setFeedback(null);
    const result = emailSchema.safeParse({ email: getValues('email') });
    if (!result.success) {
      setError('email', { message: result.error.issues[0].message });
      return;
    }
    if (!supabase) {
      setFeedback({ tone: 'error', message: 'Authentication is not configured for this build.' });
      return;
    }
    setMagicLinkPending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: result.data.email,
      options: { emailRedirectTo: Linking.createURL('/') },
    });
    setMagicLinkPending(false);
    setFeedback(error
      ? { tone: 'error', message: 'Unable to send the email link. Check your connection and try again.' }
      : { tone: 'success', message: 'Magic link sent. Check your email to continue.' });
  };

  return (
    <AuthScaffold
      eyebrow="WELCOME BACK"
      title="Sign in to your club"
      description="See your next event, court assignment, and club updates."
    >
      {!isSupabaseConfigured ? (
        <View style={styles.notice} accessibilityRole="alert">
          <AppText variant="label">Hosted Supabase configuration required</AppText>
          <AppText variant="bodySm">
            Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to enable authentication.
          </AppText>
        </View>
      ) : null}

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <TextField
              label="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={error?.message}
              required
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <TextField
              label="Password"
              autoComplete="current-password"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={error?.message}
              required
            />
          )}
        />
        <Link href="/(auth)/forgot-password" style={styles.inlineLink}>
          Forgot password?
        </Link>
        <Button label="Sign in" onPress={signIn} loading={isSubmitting} />
        <Button label="Email me a magic link" onPress={sendMagicLink} variant="secondary" loading={magicLinkPending} />
        {feedback ? (
          <AppText color={feedback.tone} accessibilityRole="alert">
            {feedback.message}
          </AppText>
        ) : null}
      </View>

      <AppText color="muted" style={styles.footer}>
        New to Pickleball Club?{' '}
        <Link href="/(auth)/sign-up" style={styles.inlineLink}>Create an account</Link>
      </AppText>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing[4] },
  notice: {
    gap: spacing[1],
    padding: spacing[3],
    borderRadius: radius.sm,
    backgroundColor: lightColors.warningBackground,
  },
  inlineLink: {
    color: lightColors.link,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: { textAlign: 'center' },
});
