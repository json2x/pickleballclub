import { Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminShell, PermissionNotice, Section } from '@/components/layout/admin-shell';
import { Button, ChoiceGroup, EmptyState } from '@/components/ui';
import { BundleState, EventSummaryCard } from '@/features/club/screen-helpers';
import { hasRole, useActiveClub, useClubBundle } from '@/features/club/club-data';
import { spacing } from '@/theme';

type EventFilter = 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled';

const filterChoices: readonly { label: string; value: EventFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function EventsScreen() {
  const { activeClub, activeClubId, activeRoles } = useActiveClub();
  const bundleQuery = useClubBundle(activeClubId);
  const bundle = bundleQuery.data;
  const canManage = hasRole(activeRoles, ['administrator', 'event_organizer']);
  const [filter, setFilter] = useState<EventFilter>('upcoming');
  const [now] = useState(() => Date.now());
  const events = (bundle?.events ?? []).filter((event) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(event.ends_at).getTime() >= now && !['active', 'check_in_open', 'completed', 'cancelled'].includes(event.status);
    if (filter === 'active') return event.status === 'active' || event.status === 'check_in_open';
    return event.status === filter;
  });

  return (
    <AdminShell
      eyebrow="EVENTS MANAGEMENT"
      title="Events"
      subtitle={activeClub ? `Plan, publish, and operate sessions for ${activeClub.name}.` : 'Plan and operate club sessions.'}
      action={canManage ? <Button label="Create event" icon={Plus} onPress={() => router.push('/(app)/(tabs)/events/create')} /> : null}
    >
      <BundleState isLoading={bundleQuery.isLoading} error={bundleQuery.error} onRetry={() => bundleQuery.refetch()} />
      {bundle ? (
        <View style={styles.stack}>
          <PermissionNotice allowed={canManage} message="Only administrators and event organizers can create or update events. Members can still view event details and registration state." />
          <ChoiceGroup label="Filter events" value={filter} choices={filterChoices} onChange={setFilter} />
          <Section title="All events" subtitle="Sorted by scheduled start time from the hosted database.">
            {events.length ? events.map((event) => (
              <EventSummaryCard
                key={event.id}
                event={event}
                registrations={bundle.registrations.filter((registration) => registration.event_id === event.id)}
                courts={bundle.courts.filter((court) => court.event_id === event.id).length}
                matches={bundle.matches.filter((match) => match.event_id === event.id)}
                action={<Button label="Open" variant="secondary" onPress={() => router.push({ pathname: '/events/[eventId]', params: { eventId: event.id } })} />}
              />
            )) : <EmptyState title="No matching events" message="Change the filter or create a session to enable registration, courts, queues, smart rounds, and scoring." />}
          </Section>
        </View>
      ) : null}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[8] },
});
