import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AdminShell, PermissionNotice, Section } from '@/components/layout/admin-shell';
import { AppText, Button, Card, EmptyState, StatusBadge } from '@/components/ui';
import { BundleState, memberName } from '@/features/club/screen-helpers';
import type { AvailabilityStatus } from '@/features/club/club-data';
import { hasRole, statusLabel, useActiveClub, useClubActions, useClubBundle } from '@/features/club/club-data';
import { spacing } from '@/theme';

const nextAvailability: AvailabilityStatus[] = ['waiting', 'on_deck', 'resting', 'unavailable', 'finished'];

export default function QueueManagementScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { activeClubId, activeRoles } = useActiveClub();
  const bundleQuery = useClubBundle(activeClubId);
  const bundle = bundleQuery.data;
  const actions = useClubActions();
  const event = bundle?.events.find((item) => item.id === eventId);
  const registrations = (bundle?.registrations ?? [])
    .filter((registration) => registration.event_id === eventId)
    .sort((left, right) => right.queue_priority - left.queue_priority || left.created_at.localeCompare(right.created_at));
  const canManage = hasRole(activeRoles, ['administrator', 'event_organizer', 'court_marshal']);

  return (
    <AdminShell eyebrow="QUEUE MANAGEMENT" title="Player queue" subtitle={event ? `Availability and readiness for ${event.name}` : 'Availability and readiness'}>
      <BundleState isLoading={bundleQuery.isLoading} error={bundleQuery.error} onRetry={() => bundleQuery.refetch()} />
      {bundle && event ? (
        <View style={styles.stack}>
          <PermissionNotice allowed={canManage} message="Queue availability can be changed by administrators, organizers, or court marshals." />
          <Section title="Availability lanes" subtitle="Changes are confirmed by Supabase before the row updates.">
            {registrations.length ? registrations.map((registration) => (
              <Card key={registration.id} style={styles.queueRow}>
                <View style={styles.copy}>
                  <AppText variant="title">{memberName(bundle.memberships, registration.membership_id)}</AppText>
                  <AppText color="muted">Priority {registration.queue_priority} · Games {registration.games_played} · {registration.checked_in_at ? 'Checked in' : 'Not checked in'}</AppText>
                </View>
                <StatusBadge label={statusLabel(registration.availability)} tone={registration.availability === 'waiting' || registration.availability === 'on_deck' ? 'success' : registration.availability === 'unavailable' ? 'error' : 'info'} />
                <View style={styles.actions}>
                  <Button
                    label="Lower priority"
                    variant="secondary"
                    disabled={!canManage}
                    loading={actions.adjustRegistrationPriority.isPending}
                    onPress={() => actions.adjustRegistrationPriority.mutate({ registrationId: registration.id, delta: -1 })}
                  />
                  <Button
                    label="Prioritize"
                    variant="secondary"
                    disabled={!canManage}
                    loading={actions.adjustRegistrationPriority.isPending}
                    onPress={() => actions.adjustRegistrationPriority.mutate({ registrationId: registration.id, delta: 1 })}
                  />
                  {nextAvailability.map((availability) => (
                    <Button
                      key={availability}
                      label={statusLabel(availability)}
                      variant={registration.availability === availability ? 'primary' : 'secondary'}
                      disabled={!canManage || registration.availability === availability}
                      loading={actions.setRegistrationAvailability.isPending}
                      onPress={() => actions.setRegistrationAvailability.mutate({ registrationId: registration.id, availability })}
                    />
                  ))}
                </View>
              </Card>
            )) : <EmptyState title="No queued players" message="Checked-in and registered members appear here when they join this event." />}
          </Section>
        </View>
      ) : null}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[8] },
  queueRow: { gap: spacing[4] },
  copy: { gap: spacing[1] },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
});
