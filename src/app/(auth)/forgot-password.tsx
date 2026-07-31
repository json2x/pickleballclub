import { zodResolver } from '@hookform/resolvers/zod';
import * as Linking from 'expo-linking';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, TextField } from '@/components/ui';
import { AuthScaffold } from '@/features/auth/auth-scaffold';
import { emailSchema, type EmailValues } from '@/schemas/auth';
import { supabase } from '@/services/supabase/client';
import { lightColors, spacing } from '@/theme';

export default function ForgotPasswordScreen() {
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success'; message: string } | null>(null);
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const resetPassword = handleSubmit(async ({ email }) => {
    setFeedback(null);
    if (!supabase) {
      setFeedback({ tone: 'error', message: 'Authentication is not configured for this build.' });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: Linking.createURL('/reset-password'),
    });
    setFeedback(error
      ? { tone: 'error', message: 'Unable to send the reset link. Check your connection and try again.' }
      : { tone: 'success', message: 'Reset link sent. Check your email for the next step.' });
  });

  return (
    <AuthScaffold eyebrow="ACCOUNT RECOVERY" title="Reset your password" description="We will send a secure reset link to your account email.">
      <View style={styles.form}>
        <Controller control={control} name="email" render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <TextField label="Email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onBlur={onBlur} onChangeText={onChange} value={value} error={error?.message} required />
        )} />
        {feedback ? <AppText color={feedback.tone} accessibilityRole="alert">{feedback.message}</AppText> : null}
        <Button label="Send reset link" onPress={resetPassword} loading={isSubmitting} />
      </View>
      <Link href="/(auth)/sign-in" style={styles.link}>Back to sign in</Link>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing[4] },
  link: { color: lightColors.link, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
});
