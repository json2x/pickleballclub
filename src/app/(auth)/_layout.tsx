import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/auth-provider';
import { AuthLoadingScreen } from '@/features/auth/auth-loading-screen';

export default function AuthLayout() {
  const { loading, session } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (session) return <Redirect href="/(app)/(tabs)/home" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
