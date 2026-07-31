import { Tabs } from 'expo-router';
import { CalendarDays, Home, Trophy, UserRound, UsersRound } from 'lucide-react-native';
import { useWindowDimensions } from 'react-native';

import { elevation, lightColors, radius, spacing } from '@/theme';

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: lightColors.link,
        tabBarInactiveTintColor: lightColors.textMuted,
        tabBarStyle: isDesktop
          ? { display: 'none' }
          : {
              minHeight: 72,
              paddingBottom: spacing[3],
              paddingTop: spacing[2],
              borderTopColor: lightColors.border,
              backgroundColor: lightColors.surface,
              borderTopLeftRadius: radius.lg,
              borderTopRightRadius: radius.lg,
              ...elevation[2],
            },
        tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold' },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="events" options={{ title: 'Events', tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }} />
      <Tabs.Screen name="clubs" options={{ title: 'Clubs', tabBarIcon: ({ color, size }) => <UsersRound color={color} size={size} /> }} />
      <Tabs.Screen name="rankings" options={{ title: 'Rankings', tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }} />
      <Tabs.Screen name="events/create" options={{ href: null }} />
      <Tabs.Screen name="events/[eventId]/index" options={{ href: null }} />
      <Tabs.Screen name="events/[eventId]/courts" options={{ href: null }} />
      <Tabs.Screen name="events/[eventId]/queue" options={{ href: null }} />
      <Tabs.Screen name="events/[eventId]/rounds" options={{ href: null }} />
      <Tabs.Screen name="events/[eventId]/matches/[matchId]" options={{ href: null }} />
      <Tabs.Screen name="clubs/members/index" options={{ href: null }} />
      <Tabs.Screen name="clubs/members/[membershipId]" options={{ href: null }} />
      <Tabs.Screen name="clubs/settings" options={{ href: null }} />
      <Tabs.Screen name="clubs/roles" options={{ href: null }} />
      <Tabs.Screen name="clubs/announcements" options={{ href: null }} />
    </Tabs>
  );
}
