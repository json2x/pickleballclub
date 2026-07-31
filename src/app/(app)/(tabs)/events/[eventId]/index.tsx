import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminShell, FormActions, PermissionNotice, ResponsiveGrid, Section, StatCard } from '@/components/layout/admin-shell';
import { AppText, Button, Card, ChoiceGroup, EmptyState, StatusBadge } from '@/components/ui';
import { BundleState, currentUserRegistration, memberName } from '@/features/club/screen-helpers';
import type { EventStatus } from '@/features/club/club-data';
import { formatDateTime, hasRole, statusLabel, useActiveClub, useClubActions, useClubBundle } from '@/features/club/club-data';
import { spacing } from '@/theme';

const statusChoices: readonly { label: string; value: EventStatus }[] = [
  { label: 'Published', value: 'published' },
  { label: 'Check-in open', value: 'check_in_open' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function EventOverviewScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { activeClubId, activeMembership, activeRoles } = useActiveClub();
  const bundleQuery = useClubBundle(activeClubId);
  const bundle = bundleQuery.data;
  const actions = useClubActions();
  const event = bundle?.events.find((item) => item.id === eventId);
  const registrations = bundle?.registrations.filter((registration) => registration.event_id === eventId) ?? [];
  const courts = bundle?.courts.filter((court) => court.event_id === eventId) ?? [];
  const rounds = bundle?.rounds.filter((round) => round.event_id === eventId) ?? [];
  const matches = bundle?.matches.filter((match) => match.event_id === eventId) ?? [];
  const myRegistration = currentUserRegistration(bundle, eventId, activeMembership?.id);
  const canManage = hasRole(activeRoles, ['administrator', 'event_organizer']);
  const canRegister = Boolean(activeMembership && !myRegistration);
  const [status, setStatus] = useState<EventStatus>('published');
  const [localError, setLocalError] = useState<string | null>(null);

  const updateStatus = () => {
    if (!event || !canManage) return;
    setLocalError(null);
    actions.updateEvent.mutate({ eventId: event.id, values: { status, check_in_open: status === 'check_in_open' } });
  };

  const register = () => {
    if (!event || !activeMembership) return;
    actions.registerMember.mutate({ eventId: event.id, membershipId: activeMembership.id });
  };

  const checkIn = () => {
    if (!myRegistration) return;
    actions.setRegistrationCheckIn.mutate({ registrationId: myRegistration.id, checkedIn: true });
  };

  return (
    <AdminShell eyebrow="EVENT OVERVIEW" title={event?.name ?? 'Event'} subtitle={event ? `${event.venue} · ${formatDateTime(event.starts_at)}` : 'Loading event details'}>
      <BundleState isLoading={bundleQuery.isLoading} error={bundleQuery.error} onRetry={() => bundleQuery.refetch()} />
      {bundle && !event ? <EmptyState title="Event not found" message="This event is not available to your active club or was removed." /> : null}
      {bundle && event ? (
        <View style={styles.stack}>
          <ResponsiveGrid>
            <StatCard label="Registered" value={`${registrations.length}/${event.capacity}`} detail="Confirmed member entries" />
            <StatCard label="Checked in" value={registrations.filter((registration) => registration.status === 'checked_in').length} detail="Ready to play" />
            <StatCard label="Courts" value={courts.length} detail="Configured for this event" />
            <StatCard label="Rounds" value={rounds.length} detail="Generated or completed" />
          </ResponsiveGrid>

          <Section title="Event controls" subtitle="Critical actions wait for Supabase confirmation before the UI reports success.">
            <Card style={styles.form}>
              <View style={styles.rowBetween}>
                <View style={styles.copy}>
                  <StatusBadge label={statusLabel(event.status)} tone={event.status === 'cancelled' ? 'error' : event.status === 'completed' ? 'success' : 'info'} />
                  <AppText variant="heading3">{event.name}</AppText>
                  <AppText color="muted">{event.description ?? 'No description provided.'}</AppText>
                </View>
                <View style={styles.actionsColumn}>
                  {canRegister ? <Button label="Register me" loading={actions.registerMember.isPending} onPress={register} /> : null}
                  {myRegistration && !myRegistration.checked_in_at ? <Button label="Check in" loading={actions.setRegistrationCheckIn.isPending} onPress={checkIn} /> : null}
                </View>
              </View>
              <PermissionNotice allowed={canManage} message="Only administrators and event organizers can change event status." />
              <View style={styles.row}>
                <ChoiceGroup label="Next status" value={status} choices={statusChoices} onChange={setStatus} disabled={!canManage} />
                <FormActions error={localError ?? actions.updateEvent.error?.message} success={actions.updateEvent.isSuccess ? 'Event updated.' : undefined} loading={actions.updateEvent.isPending} onSubmit={updateStatus} primaryLabel="Update status" />
              </View>
            </Card>
          </Section>

          <Section title="Operations" subtitle="Move through the event workflow without losing mobile tab navigation.">
            <View style={styles.linkGrid}>
              <Link href={{ pathname: '/(app)/(tabs)/events/[eventId]/courts', params: { eventId: event.id } }} asChild><Button label="Courts dashboard" variant="secondary" onPress={() => undefined} /></Link>
              <Link href={{ pathname: '/(app)/(tabs)/events/[eventId]/queue', params: { eventId: event.id } }} asChild><Button label="Queue management" variant="secondary" onPress={() => undefined} /></Link>
              <Link href={{ pathname: '/(app)/(tabs)/events/[eventId]/rounds', params: { eventId: event.id } }} asChild><Button label="Smart round generator" variant="secondary" onPress={() => undefined} /></Link>
            </View>
          </Section>

          <Section title="Players" subtitle="Organizers can register and check in members without bypassing server authorization.">
            {bundle.memberships.length ? bundle.memberships.map((membership) => {
              const registration = registrations.find((item) => item.membership_id === membership.id);
              return (
                <Card key={membership.id} style={styles.rowBetween}>
                  <View style={styles.copy}>
                    <AppText variant="title">{memberName(bundle.memberships, membership.id)}</AppText>
                    <AppText color="muted">
                      {registration
                        ? `Availability: ${statusLabel(registration.availability)} · Games: ${registration.games_played}`
                        : 'Not registered for this event'}
                    </AppText>
                  </View>
                  <View style={styles.actionsColumn}>
                    <StatusBadge
                      label={registration ? statusLabel(registration.status) : 'Not registered'}
                      tone={registration?.status === 'checked_in' ? 'success' : 'info'}
                    />
                    {canManage && !registration ? (
                      <Button
                        label="Register"
                        variant="secondary"
                        loading={actions.registerMember.isPending}
                        onPress={() => actions.registerMember.mutate({ eventId: event.id, membershipId: membership.id })}
                      />
                    ) : null}
                    {canManage && registration && registration.status !== 'checked_in' ? (
                      <Button
                        label="Check in"
                        variant="secondary"
                        loading={actions.setRegistrationCheckIn.isPending}
                        onPress={() => actions.setRegistrationCheckIn.mutate({ registrationId: registration.id, checkedIn: true })}
                      />
                    ) : null}
                  </View>
                </Card>
              );
            }) : <EmptyState title="No club members" message="Add members before opening organizer check-in." />}
          </Section>

          <Section title="Matches" subtitle="Open a scheduled match to score with 64px controls.">
            {matches.length ? matches.map((match) => (
              <Card key={match.id} style={styles.rowBetween}>
                <View style={styles.copy}>
                  <AppText variant="title">Match {match.match_number}</AppText>
                  <AppText color="muted">{match.team_one_score}–{match.team_two_score} · {statusLabel(match.status)}</AppText>
                </View>
                <Link href={{ pathname: '/(app)/(tabs)/events/[eventId]/matches/[matchId]', params: { eventId: event.id, matchId: match.id } }} asChild><Button label="Score" variant="secondary" onPress={() => undefined} /></Link>
              </Card>
            )) : <EmptyState title="No matches yet" message="Generate a round after players are checked in and courts are ready." />}
          </Section>
        </View>
      ) : null}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[8] },
  form: { gap: spacing[4] },
  copy: { flex: 1, gap: spacing[2] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4], alignItems: 'flex-start' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing[4], alignItems: 'flex-start' },
  actionsColumn: { gap: spacing[2], alignItems: 'flex-end' },
  linkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
});
