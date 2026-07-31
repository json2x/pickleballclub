import { Redirect } from 'expo-router';

import { useAuth } from '@/features/auth/auth-provider';
import { AuthLoadingScreen } from '@/features/auth/auth-loading-screen';

export default function Index() {
  const { loading, session } = useAuth();

  if (loading) return <AuthLoadingScreen />;

  return <Redirect href={session ? '/(app)/(tabs)/home' : '/(auth)/sign-in'} />;
}
