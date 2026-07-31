import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/auth-provider';
import { AuthLoadingScreen } from '@/features/auth/auth-loading-screen';
import { ActiveClubProvider } from '@/features/club/club-data';

export default function AppLayout() {
  const { loading, session } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!session) return <Redirect href="/(auth)/sign-in" />;
  return (
    <ActiveClubProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ActiveClubProvider>
  );
}
