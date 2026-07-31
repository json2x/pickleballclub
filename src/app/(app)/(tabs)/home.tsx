import { LogOut, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminShell, ResponsiveGrid, Section, StatCard } from '@/components/layout/admin-shell';
import { AppText, Button, Card, EmptyState } from '@/components/ui';
import { BundleState, EventSummaryCard } from '@/features/club/screen-helpers';
import { formatDateTime, hasRole, useActiveClub, useClubBundle } from '@/features/club/club-data';
import { supabase } from '@/services/supabase/client';
import { spacing } from '@/theme';

export default function HomeScreen() {
  const { activeClub, activeClubId, activeRoles } = useActiveClub();
  const bundleQuery = useClubBundle(activeClubId);
  const bundle = bundleQuery.data;
  const [now] = useState(() => Date.now());
  const canCreateEvents = hasRole(activeRoles, ['administrator', 'event_organizer']);
  const upcomingEvents = (bundle?.events ?? []).filter((event) => new Date(event.ends_at).getTime() >= now).slice(0, 3);
  const activeEvents = (bundle?.events ?? []).filter((event) => event.status === 'active' || event.status === 'check_in_open');
  const checkedIn = (bundle?.registrations ?? []).filter((registration) => registration.status === 'checked_in').length;
  const availableCourts = (bundle?.courts ?? []).filter((court) => court.status === 'available').length;

  return (
    <AdminShell
      eyebrow="CLUB OVERVIEW DASHBOARD"
      title={activeClub ? activeClub.name : 'Club dashboard'}
      subtitle="Live operations, player readiness, courts, announcements, and ranking health in one responsive workspace."
      action={<Button label="Sign out" onPress={() => supabase?.auth.signOut()} variant="ghost" icon={LogOut} />}
    >
      <BundleState isLoading={bundleQuery.isLoading} error={bundleQuery.error} onRetry={() => bundleQuery.refetch()} />
      {bundle ? (
        <View style={styles.stack}>
          <ResponsiveGrid>
            <StatCard label="Active events" value={activeEvents.length} detail="Check-in/open play now" />
            <StatCard label="Members" value={bundle.memberships.length} detail="Active club roster" />
            <StatCard label="Checked in" value={checkedIn} detail="Ready for assignment" />
            <StatCard label="Available courts" value={availableCourts} detail="Outdoor-ready capacity" />
          </ResponsiveGrid>

          <Section
            title="Next sessions"
            subtitle="Only confirmed Supabase events are shown here."
            action={canCreateEvents ? <Button label="Create event" icon={Plus} onPress={() => router.push('/(app)/(tabs)/events/create')} /> : null}
          >
            {upcomingEvents.length ? upcomingEvents.map((event) => (
              <EventSummaryCard
                key={event.id}
                event={event}
                registrations={bundle.registrations.filter((registration) => registration.event_id === event.id)}
                courts={bundle.courts.filter((court) => court.event_id === event.id).length}
                matches={bundle.matches.filter((match) => match.event_id === event.id)}
                action={<Button label="Open" variant="secondary" onPress={() => router.push({ pathname: '/events/[eventId]/index', params: { eventId: event.id } })} />}
              />
            )) : <EmptyState title="No upcoming sessions" message="Create an event to start registration, court setup, queueing, and smart round generation." />}
          </Section>

          <Section title="Latest announcements" subtitle="Published messages are ready for members and event displays.">
            {bundle.announcements.slice(0, 3).map((announcement) => (
              <Card key={announcement.id} style={styles.cardStack}>
                <AppText variant="title">{announcement.title}</AppText>
                <AppText color="muted">{announcement.body}</AppText>
                <AppText color="muted" variant="caption">{announcement.published_at ? `Published ${formatDateTime(announcement.published_at)}` : 'Draft announcement'}</AppText>
              </Card>
            ))}
            {!bundle.announcements.length ? <EmptyState title="No announcements" message="Publish operational updates for weather, court changes, or event reminders." /> : null}
          </Section>
        </View>
      ) : null}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[8] },
  cardStack: { gap: spacing[2] },
});
