import { zodResolver } from '@hookform/resolvers/zod';
import * as Linking from 'expo-linking';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, TextField } from '@/components/ui';
import { AuthScaffold } from '@/features/auth/auth-scaffold';
import { signInSchema, type SignInValues } from '@/schemas/auth';
import { supabase } from '@/services/supabase/client';
import { lightColors, spacing } from '@/theme';

export default function SignUpScreen() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState: { isSubmitting, errors } } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUp = handleSubmit(async ({ email, password }) => {
    setFeedback(null);
    if (!supabase) {
      setError('root', { message: 'Authentication is not configured for this build.' });
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: Linking.createURL('/') },
    });
    if (error) {
      setError('root', { message: 'We could not create this account. Check the details and try again.' });
    } else if (!data.session) {
      setFeedback('Account created. Check your email to confirm your address, then sign in.');
    }
  });

  return (
    <AuthScaffold eyebrow="JOIN THE CLUB" title="Create your account" description="Use the email your club administrator invited, or create a new player account.">
      <View style={styles.form}>
        <Controller control={control} name="email" render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <TextField label="Email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onBlur={onBlur} onChangeText={onChange} value={value} error={error?.message} required />
        )} />
        <Controller control={control} name="password" render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <TextField label="Password" autoComplete="new-password" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} error={error?.message} helperText="Use at least 8 characters." required />
        )} />
        {errors.root?.message ? <AppText color="error">{errors.root.message}</AppText> : null}
        {feedback ? <AppText color="success" accessibilityRole="alert">{feedback}</AppText> : null}
        <Button label="Create account" onPress={signUp} loading={isSubmitting} />
      </View>
      <AppText color="muted" style={styles.footer}>
        Already have an account? <Link href="/(auth)/sign-in" style={styles.link}>Sign in</Link>
      </AppText>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing[4] },
  footer: { textAlign: 'center' },
  link: { color: lightColors.link, fontFamily: 'Inter_600SemiBold' },
});
