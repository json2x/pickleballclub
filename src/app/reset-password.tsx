import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { AuthLoadingScreen } from '@/features/auth/auth-loading-screen';
import { AuthScaffold } from '@/features/auth/auth-scaffold';
import { resetPasswordSchema, type ResetPasswordValues } from '@/schemas/auth';
import { supabase } from '@/services/supabase/client';
import { spacing } from '@/theme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { deepLinkError, loading, session } = useAuth();
  const [updated, setUpdated] = useState(false);
  const { control, handleSubmit, setError, formState: { isSubmitting, errors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  if (loading) return <AuthLoadingScreen />;

  const updatePassword = handleSubmit(async ({ password }) => {
    if (!supabase || !session) {
      setError('root', { message: 'Open the latest reset email link before choosing a new password.' });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError('root', { message: 'Unable to update the password. Request a new reset link and try again.' });
    else setUpdated(true);
  });

  return (
    <AuthScaffold
      eyebrow="ACCOUNT RECOVERY"
      title="Choose a new password"
      description="Use at least 8 characters and keep this password unique to your account."
    >
      <View style={styles.form}>
        <Controller control={control} name="password" render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <TextField label="New password" autoComplete="new-password" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} error={error?.message} required />
        )} />
        <Controller control={control} name="confirmPassword" render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <TextField label="Confirm password" autoComplete="new-password" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} error={error?.message} required />
        )} />
        {deepLinkError ? <AppText color="error" accessibilityRole="alert">{deepLinkError}</AppText> : null}
        {errors.root?.message ? <AppText color="error" accessibilityRole="alert">{errors.root.message}</AppText> : null}
        {updated ? (
          <>
            <AppText color="success" accessibilityRole="alert">Password updated. You can continue to your club.</AppText>
            <Button label="Continue to app" onPress={() => router.replace('/')} />
          </>
        ) : (
          <Button label="Update password" onPress={updatePassword} loading={isSubmitting} />
        )}
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing[4] },
});
