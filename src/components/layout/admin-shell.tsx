import type { LucideIcon } from 'lucide-react-native';
import {
  Bell,
  CalendarDays,
  Home,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  UsersRound,
} from 'lucide-react-native';
import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, usePathname, type Href } from 'expo-router';

import { AppText, Button, Card, EmptyState, ErrorState } from '@/components/ui';
import { CreateClubCard } from '@/features/club/create-club-card';
import { useActiveClub } from '@/features/club/club-data';
import { lightColors, radius, spacing } from '@/theme';

type NavigationItem = {
  label: string;
  href: Href;
  icon: LucideIcon;
  match: string;
};

const navigationItems: NavigationItem[] = [
  { label: 'Overview', href: '/(app)/(tabs)/home', icon: Home, match: '/home' },
  { label: 'Events', href: '/(app)/(tabs)/events', icon: CalendarDays, match: '/events' },
  { label: 'Members', href: '/clubs/members' as Href, icon: UsersRound, match: '/clubs/members' },
  { label: 'Rankings', href: '/(app)/(tabs)/rankings', icon: Trophy, match: '/rankings' },
  { label: 'Announcements', href: '/(app)/(tabs)/clubs/announcements', icon: Bell, match: '/clubs/announcements' },
  { label: 'Roles', href: '/(app)/(tabs)/clubs/roles', icon: ShieldCheck, match: '/clubs/roles' },
  { label: 'Settings', href: '/(app)/(tabs)/clubs/settings', icon: Settings, match: '/clubs/settings' },
  { label: 'Profile', href: '/(app)/(tabs)/profile', icon: UserRound, match: '/profile' },
];

type AdminShellProps = PropsWithChildren<{
  title: string;
  eyebrow?: string;
  subtitle?: string;
  action?: ReactNode;
  requireClub?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function AdminShell({ children, title, eyebrow, subtitle, action, requireClub = true, contentStyle }: AdminShellProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const { activeClub, clubs, error, loading, refetch } = useActiveClub();

  const header = (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        {eyebrow ? <AppText color="muted" variant="label">{eyebrow}</AppText> : null}
        <AppText variant={isDesktop ? 'heading1' : 'heading2'}>{title}</AppText>
        {subtitle ? <AppText color="muted" variant="bodyLg">{subtitle}</AppText> : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );

  let body = children;
  if (loading) {
    body = <LoadingPanel title="Loading club workspace" message="Fetching your club, roles, events, courts, and player data." />;
  } else if (error) {
    body = <ErrorState title="Could not load workspace" message={error.message} actionLabel="Try again" onAction={refetch} />;
  } else if (requireClub && !activeClub && clubs.length === 0) {
    body = <CreateClubCard />;
  } else if (requireClub && !activeClub) {
    body = <EmptyState title="Choose an active club" message="Select a club from the workspace switcher to continue." />;
  }

  if (!isDesktop) {
    return (
      <SafeAreaView style={styles.mobileSafeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.mobileScroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.mobileContent, contentStyle]}>
            {header}
            {body}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.desktopSafeArea} edges={['top', 'right', 'bottom', 'left']}>
      <View style={styles.desktopFrame}>
        <DesktopSidebar />
        <ScrollView contentContainerStyle={styles.desktopScroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.desktopContent, contentStyle]}>
            {header}
            {body}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function DesktopSidebar() {
  const pathname = usePathname();
  const { activeClub, clubs, setActiveClubId } = useActiveClub();

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandBlock}>
        <View style={styles.brandMark}><AppText variant="label">PB</AppText></View>
        <View style={styles.brandCopy}>
          <AppText variant="title">Court & Core</AppText>
          <AppText color="muted" variant="caption">Club command center</AppText>
        </View>
      </View>

      <Card style={styles.clubSwitcher}>
        <AppText color="muted" variant="caption">ACTIVE CLUB</AppText>
        <AppText variant="title">{activeClub?.name ?? 'No club yet'}</AppText>
        <View style={styles.clubList}>
          {clubs.map((club) => (
            <Pressable
              accessibilityRole="button"
              key={club.id}
              onPress={() => setActiveClubId(club.id)}
              style={[styles.clubPill, activeClub?.id === club.id && styles.clubPillActive]}
            >
              <AppText variant="caption">{club.name}</AppText>
            </Pressable>
          ))}
        </View>
      </Card>

      <View style={styles.navList}>
        {navigationItems.map((item) => {
          const isActive = pathname.includes(item.match);
          const Icon = item.icon;
          return (
            <Pressable
              accessibilityRole="link"
              key={item.label}
              onPress={() => router.push(item.href)}
              style={[styles.navItem, isActive && styles.navItemActive]}
            >
              <Icon color={isActive ? lightColors.text : lightColors.textMuted} size={20} />
              <AppText color={isActive ? 'default' : 'muted'} variant="label">{item.label}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function LoadingPanel({ title, message }: { title: string; message: string }) {
  return (
    <Card style={styles.loadingCard}>
      <View style={styles.loadingLineWide} />
      <View style={styles.loadingLine} />
      <AppText variant="heading3">{title}</AppText>
      <AppText color="muted">{message}</AppText>
    </Card>
  );
}

export function Section({ title, subtitle, action, children }: PropsWithChildren<{ title: string; subtitle?: string; action?: ReactNode }>) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerCopy}>
          <AppText variant="heading3">{title}</AppText>
          {subtitle ? <AppText color="muted">{subtitle}</AppText> : null}
        </View>
        {action ? <View>{action}</View> : null}
      </View>
      {children}
    </View>
  );
}

export function ResponsiveGrid({ children }: PropsWithChildren<{ minItemWidth?: number }>) {
  return <View style={styles.grid}>{children}</View>;
}

export function StatCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <Card style={styles.statCard}>
      <AppText color="muted" variant="caption">{label.toUpperCase()}</AppText>
      <AppText variant="heading2" style={styles.tabular}>{value}</AppText>
      {detail ? <AppText color="muted" variant="bodySm">{detail}</AppText> : null}
    </Card>
  );
}

export function PermissionNotice({ allowed, message }: { allowed: boolean; message: string }) {
  if (allowed) return null;
  return (
    <Card style={styles.permissionCard}>
      <AppText variant="label">Permission required</AppText>
      <AppText color="muted" variant="bodySm">{message}</AppText>
    </Card>
  );
}

export function FormActions({ error, success, primaryLabel, onSubmit, loading }: { error?: string; success?: string; primaryLabel: string; onSubmit: () => void; loading?: boolean }) {
  return (
    <View style={styles.formActions}>
      {error ? <AppText color="error" variant="bodySm">{error}</AppText> : null}
      {success ? <AppText color="success" variant="bodySm">{success}</AppText> : null}
      <Button label={primaryLabel} loading={loading} onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  mobileSafeArea: { flex: 1, backgroundColor: lightColors.background },
  desktopSafeArea: { flex: 1, backgroundColor: lightColors.background },
  mobileScroll: { flexGrow: 1, paddingBottom: spacing[20] },
  mobileContent: { width: '100%', paddingHorizontal: spacing[4], paddingVertical: spacing[6], gap: spacing[6] },
  desktopFrame: { flex: 1, flexDirection: 'row' },
  desktopScroll: { flexGrow: 1 },
  desktopContent: { width: '100%', maxWidth: 1240, alignSelf: 'center', paddingHorizontal: spacing[8], paddingVertical: spacing[8], gap: spacing[8] },
  sidebar: { width: 260, borderRightWidth: 1, borderRightColor: lightColors.border, backgroundColor: lightColors.surface, padding: spacing[5], gap: spacing[5] },
  brandBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  brandMark: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: lightColors.primary, alignItems: 'center', justifyContent: 'center' },
  brandCopy: { flex: 1 },
  clubSwitcher: { gap: spacing[3], padding: spacing[4] },
  clubList: { gap: spacing[2] },
  clubPill: { minHeight: 32, justifyContent: 'center', borderRadius: radius.full, paddingHorizontal: spacing[3], backgroundColor: lightColors.surfaceSubtle },
  clubPillActive: { backgroundColor: lightColors.infoBackground },
  navList: { gap: spacing[1] },
  navItem: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[3], borderRadius: radius.sm },
  navItemActive: { backgroundColor: lightColors.surfaceSubtle, borderWidth: 1, borderColor: lightColors.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing[4] },
  headerCopy: { flex: 1, gap: spacing[1] },
  action: { alignItems: 'flex-end' },
  section: { gap: spacing[4] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing[4] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4] },
  statCard: { flex: 1, minWidth: 180, gap: spacing[2] },
  tabular: { fontVariant: ['tabular-nums'] },
  permissionCard: { gap: spacing[2], backgroundColor: lightColors.warningBackground, borderColor: lightColors.warningText },
  formActions: { gap: spacing[2], alignItems: 'flex-start' },
  loadingCard: { gap: spacing[3] },
  loadingLineWide: { width: '70%', height: 12, borderRadius: radius.full, backgroundColor: lightColors.surfaceSubtle },
  loadingLine: { width: '44%', height: 12, borderRadius: radius.full, backgroundColor: lightColors.surfaceSubtle },
});
