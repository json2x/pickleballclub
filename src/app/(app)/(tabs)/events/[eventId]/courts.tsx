import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminShell, FormActions, PermissionNotice, Section } from '@/components/layout/admin-shell';
import { AppText, Button, Card, EmptyState, StatusBadge, TextField } from '@/components/ui';
import { BundleState } from '@/features/club/screen-helpers';
import type { Court } from '@/features/club/club-data';
import { hasRole, statusLabel, useActiveClub, useClubActions, useClubBundle } from '@/features/club/club-data';
import { spacing } from '@/theme';

const courtStatuses: Court['status'][] = ['available', 'paused', 'unavailable'];

export default function CourtsDashboardScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { activeClubId, activeRoles } = useActiveClub();
  const bundleQuery = useClubBundle(activeClubId);
  const bundle = bundleQuery.data;
  const event = bundle?.events.find((item) => item.id === eventId);
  const courts = bundle?.courts.filter((court) => court.event_id === eventId) ?? [];
  const matches = bundle?.matches.filter((match) => match.event_id === eventId) ?? [];
  const actions = useClubActions();
  const canCreate = hasRole(activeRoles, ['administrator', 'event_organizer']);
  const canManage = hasRole(activeRoles, ['administrator', 'event_organizer', 'court_marshal']);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  const addCourt = () => {
    if (!canCreate || !event || !name.trim()) return;
    actions.addCourt.mutate({ event_id: event.id, name: name.trim(), notes: notes.trim() || null, sort_order: courts.length + 1 }, { onSuccess: () => { setName(''); setNotes(''); } });
  };

  return (
    <AdminShell eyebrow="COURTS DASHBOARD" title="Courts" subtitle={event ? `Court state for ${event.name}` : 'Court state'}>
      <BundleState isLoading={bundleQuery.isLoading} error={bundleQuery.error} onRetry={() => bundleQuery.refetch()} />
      {bundle && event ? (
        <View style={styles.stack}>
          <PermissionNotice allowed={canManage} message="Court setup and updates require organizer, marshal, or administrator permission." />
          <Section title="Add court" subtitle="Courts are persisted immediately before appearing in round generation.">
            <Card style={styles.form}>
              <PermissionNotice allowed={canCreate} message="Only administrators and event organizers can add courts. Marshals can update existing court state." />
              <View style={styles.row}>
                <TextField label="Court name" value={name} onChangeText={setName} editable={canCreate} style={styles.field} />
                <TextField label="Notes" value={notes} onChangeText={setNotes} editable={canCreate} style={styles.field} />
              </View>
              <FormActions error={actions.addCourt.error?.message} success={actions.addCourt.isSuccess ? 'Court added.' : undefined} loading={actions.addCourt.isPending} onSubmit={addCourt} primaryLabel="Add court" />
            </Card>
          </Section>
          <Section title="Court grid" subtitle="High-contrast status cards for outdoor displays and tablet operations.">
            {courts.length ? courts.map((court) => {
              const courtMatches = matches.filter((match) => match.court_id === court.id && match.status === 'in_progress');
              return (
                <Card key={court.id} style={styles.courtCard}>
                  <View style={styles.rowBetween}>
                    <AppText variant="heading3">{court.name}</AppText>
                    <StatusBadge label={statusLabel(court.status)} tone={court.status === 'available' ? 'success' : court.status === 'paused' ? 'warning' : 'info'} />
                  </View>
                  <AppText color="muted">{court.notes ?? 'No court notes.'}</AppText>
                  <AppText variant="scoreXl" style={styles.score}>{courtMatches.length}</AppText>
                  <AppText color="muted" variant="caption">LIVE MATCHES</AppText>
                  <View style={styles.statusActions}>
                    {courtStatuses.map((status) => (
                      <Button
                        key={status}
                        label={statusLabel(status)}
                        variant={court.status === status ? 'primary' : 'secondary'}
                        disabled={!canManage || court.status === status || court.status === 'in_use'}
                        loading={actions.updateCourt.isPending}
                        onPress={() => actions.updateCourt.mutate({ courtId: court.id, values: { status } })}
                      />
                    ))}
                  </View>
                </Card>
              );
            }) : <EmptyState title="No courts configured" message="Add courts before generating playable rounds." />}
          </Section>
        </View>
      ) : null}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[8] },
  form: { gap: spacing[4] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing[3], alignItems: 'center' },
  field: { minWidth: 220 },
  courtCard: { minWidth: 240, flex: 1, gap: spacing[3] },
  score: { textAlign: 'center' },
  statusActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
});
