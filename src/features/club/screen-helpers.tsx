import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, ErrorState, StatusBadge } from '@/components/ui';
import type { ClubBundle, Event, Match, Membership, Registration } from '@/features/club/club-data';
import { formatDateTime, statusLabel } from '@/features/club/club-data';
import { lightColors, radius, spacing } from '@/theme';

export function BundleState({ isLoading, error, onRetry }: { isLoading: boolean; error: Error | null; onRetry: () => void }) {
  if (isLoading) {
    return (
      <Card style={styles.stateCard}>
        <View style={styles.skeletonWide} />
        <View style={styles.skeletonNarrow} />
        <AppText variant="heading3">Loading live club data</AppText>
        <AppText color="muted">Fetching the latest events, courts, queue, scoring, and announcement records.</AppText>
      </Card>
    );
  }
  if (error) return <ErrorState title="Could not load club data" message={error.message} actionLabel="Try again" onAction={onRetry} />;
  return null;
}

export function RowCard({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return <Card style={[styles.rowCard, accent && styles.accentCard]}>{children}</Card>;
}

export function KeyValue({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <View style={styles.keyValue}>
      <AppText color="muted" variant="caption">{label.toUpperCase()}</AppText>
      <AppText variant="label">{value ?? '—'}</AppText>
    </View>
  );
}

export function EventSummaryCard({ event, registrations, courts, matches, action }: { event: Event; registrations: Registration[]; courts: number; matches: Match[]; action?: ReactNode }) {
  const checkedIn = registrations.filter((registration) => registration.status === 'checked_in').length;
  const activeMatches = matches.filter((match) => match.status === 'in_progress').length;
  return (
    <RowCard accent={event.status === 'active' || event.status === 'check_in_open'}>
      <View style={styles.rowHeader}>
        <View style={styles.rowCopy}>
          <StatusBadge label={statusLabel(event.status)} tone={event.status === 'cancelled' ? 'error' : event.status === 'completed' ? 'success' : 'info'} />
          <AppText variant="heading3">{event.name}</AppText>
          <AppText color="muted">{event.venue} · {formatDateTime(event.starts_at)}</AppText>
        </View>
        {action}
      </View>
      <View style={styles.metricRow}>
        <KeyValue label="Registered" value={`${registrations.length}/${event.capacity}`} />
        <KeyValue label="Checked in" value={checkedIn} />
        <KeyValue label="Courts" value={courts} />
        <KeyValue label="Live matches" value={activeMatches} />
      </View>
    </RowCard>
  );
}

export function memberName(memberships: Membership[], membershipId: string) {
  return memberships.find((membership) => membership.id === membershipId)?.display_name ?? 'Unknown member';
}

export function currentUserRegistration(bundle: ClubBundle | undefined, eventId: string, activeMembershipId: string | null | undefined) {
  if (!activeMembershipId || !bundle) return null;
  return bundle.registrations.find((registration) => registration.event_id === eventId && registration.membership_id === activeMembershipId) ?? null;
}

const styles = StyleSheet.create({
  stateCard: { gap: spacing[3] },
  skeletonWide: { width: '72%', height: 12, borderRadius: radius.full, backgroundColor: lightColors.surfaceSubtle },
  skeletonNarrow: { width: '42%', height: 12, borderRadius: radius.full, backgroundColor: lightColors.surfaceSubtle },
  rowCard: { gap: spacing[4] },
  accentCard: { borderColor: lightColors.primary },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing[4] },
  rowCopy: { flex: 1, gap: spacing[2] },
  metricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4] },
  keyValue: { minWidth: 120, gap: spacing[1] },
});
