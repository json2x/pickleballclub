import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminShell, FormActions, PermissionNotice } from '@/components/layout/admin-shell';
import { Card, ChoiceGroup, TextField } from '@/components/ui';
import type { EventFormat, EventStatus } from '@/features/club/club-data';
import { hasRole, useActiveClub, useClubActions } from '@/features/club/club-data';
import { spacing } from '@/theme';

const defaultStart = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
const defaultEnd = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();
const formatChoices: readonly { label: string; value: EventFormat }[] = [
  { label: 'Singles', value: 'singles' },
  { label: 'Doubles', value: 'doubles' },
  { label: 'Mixed doubles', value: 'mixed_doubles' },
  { label: 'Open play', value: 'open_play' },
];
const statusChoices: readonly { label: string; value: EventStatus }[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Check-in open', value: 'check_in_open' },
];

export default function CreateEventScreen() {
  const { activeClubId, activeRoles } = useActiveClub();
  const actions = useClubActions();
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState(defaultStart);
  const [endsAt, setEndsAt] = useState(defaultEnd);
  const [capacity, setCapacity] = useState('24');
  const [format, setFormat] = useState<EventFormat>('doubles');
  const [status, setStatus] = useState<EventStatus>('draft');
  const [localError, setLocalError] = useState<string | null>(null);
  const canManage = hasRole(activeRoles, ['administrator', 'event_organizer']);

  const submit = () => {
    if (!activeClubId) return;
    if (!canManage) {
      setLocalError('You do not have permission to create events.');
      return;
    }
    const numericCapacity = Number(capacity);
    const parsedStart = new Date(startsAt);
    const parsedEnd = new Date(endsAt);
    if (!name.trim() || !venue.trim() || !Number.isFinite(numericCapacity) || numericCapacity < 4) {
      setLocalError('Name, venue, and a capacity of at least four are required.');
      return;
    }
    if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime()) || parsedEnd <= parsedStart) {
      setLocalError('Enter valid ISO timestamps and ensure the end is after the start.');
      return;
    }
    setLocalError(null);
    actions.createEvent.mutate({
      capacity: numericCapacity,
      check_in_open: status === 'check_in_open',
      club_id: activeClubId,
      description: description.trim() || null,
      ends_at: parsedEnd.toISOString(),
      format,
      name: name.trim(),
      starts_at: parsedStart.toISOString(),
      status,
      venue: venue.trim(),
    }, { onSuccess: (event) => {
      if (!event) return;
      router.replace({ pathname: '/events/[eventId]', params: { eventId: event.id } });
    } });
  };

  return (
    <AdminShell eyebrow="CREATE EVENT" title="Create event" subtitle="Set the operational shape before opening registration and check-in.">
      <View style={styles.stack}>
        <PermissionNotice allowed={canManage} message="Only administrators and event organizers can create club events." />
        <Card style={styles.form}>
          <TextField label="Event name" required value={name} onChangeText={setName} placeholder="Saturday ladder league" editable={canManage} />
          <TextField label="Venue" required value={venue} onChangeText={setVenue} placeholder="Court 1–4, Sports Arena" editable={canManage} />
          <TextField label="Description" value={description} onChangeText={setDescription} multiline editable={canManage} />
          <View style={styles.row}>
            <TextField label="Starts at (ISO)" value={startsAt} onChangeText={setStartsAt} style={styles.field} editable={canManage} />
            <TextField label="Ends at (ISO)" value={endsAt} onChangeText={setEndsAt} style={styles.field} editable={canManage} />
          </View>
          <View style={styles.row}>
            <TextField label="Capacity" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" style={styles.shortField} editable={canManage} />
          </View>
          <ChoiceGroup label="Format" value={format} choices={formatChoices} onChange={setFormat} disabled={!canManage} />
          <ChoiceGroup label="Initial status" value={status} choices={statusChoices} onChange={setStatus} disabled={!canManage} />
          <FormActions error={localError ?? actions.createEvent.error?.message} loading={actions.createEvent.isPending} onSubmit={submit} primaryLabel="Create event" />
        </Card>
      </View>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[4] },
  form: { gap: spacing[4] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  field: { minWidth: 240 },
  shortField: { minWidth: 120 },
});
