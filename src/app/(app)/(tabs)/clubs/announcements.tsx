import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminShell, FormActions, PermissionNotice, Section } from '@/components/layout/admin-shell';
import { AppText, Button, Card, ChoiceGroup, EmptyState, StatusBadge, TextField } from '@/components/ui';
import { BundleState } from '@/features/club/screen-helpers';
import type { AnnouncementStatus } from '@/features/club/club-data';
import { formatDateTime, hasRole, statusLabel, useActiveClub, useClubActions, useClubBundle } from '@/features/club/club-data';
import { spacing } from '@/theme';

const statusChoices: readonly { label: string; value: AnnouncementStatus }[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

export default function AnnouncementsManagementScreen() {
  const { activeClubId, activeRoles } = useActiveClub();
  const bundleQuery = useClubBundle(activeClubId);
  const bundle = bundleQuery.data;
  const actions = useClubActions();
  const canPublish = hasRole(activeRoles, ['administrator', 'event_organizer']);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<AnnouncementStatus>('published');
  const [eventId, setEventId] = useState('');

  const publish = () => {
    if (!activeClubId || !canPublish) return;
    actions.publishAnnouncement.mutate(
      { clubId: activeClubId, eventId: eventId.trim() || null, title, body, status },
      { onSuccess: () => { setTitle(''); setBody(''); setEventId(''); } },
    );
  };

  return (
    <AdminShell eyebrow="ANNOUNCEMENTS MANAGEMENT" title="Announcements" subtitle="Publish club-wide or event-specific updates.">
      <BundleState isLoading={bundleQuery.isLoading} error={bundleQuery.error} onRetry={() => bundleQuery.refetch()} />
      {bundle ? (
        <View style={styles.stack}>
          <PermissionNotice allowed={canPublish} message="Only administrators and event organizers can publish announcements." />
          <Section title="Publish announcement" subtitle="Messages are saved to announcements and can target an event id when needed.">
            <Card style={styles.form}>
              <TextField label="Title" value={title} onChangeText={setTitle} editable={canPublish} />
              <TextField label="Body" value={body} onChangeText={setBody} editable={canPublish} multiline />
              <View style={styles.eventChoices}>
                <Button label="Entire club" variant={!eventId ? 'primary' : 'secondary'} disabled={!canPublish} onPress={() => setEventId('')} />
                {bundle.events.map((event) => (
                  <Button key={event.id} label={event.name} variant={eventId === event.id ? 'primary' : 'secondary'} disabled={!canPublish} onPress={() => setEventId(event.id)} />
                ))}
              </View>
              <ChoiceGroup label="Status" value={status} choices={statusChoices} onChange={setStatus} disabled={!canPublish} />
              <FormActions error={actions.publishAnnouncement.error?.message} success={actions.publishAnnouncement.isSuccess ? 'Announcement saved.' : undefined} loading={actions.publishAnnouncement.isPending} onSubmit={publish} primaryLabel="Save announcement" />
            </Card>
          </Section>
          <Section title="Announcements" subtitle="Newest records first from Supabase.">
            {bundle.announcements.length ? bundle.announcements.map((announcement) => (
              <Card key={announcement.id} style={styles.announcementCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.copy}>
                    <StatusBadge label={statusLabel(announcement.status)} tone={announcement.status === 'published' ? 'success' : announcement.status === 'archived' ? 'warning' : 'info'} />
                    <AppText variant="heading3">{announcement.title}</AppText>
                  </View>
                  <AppText color="muted" variant="caption">{announcement.published_at ? formatDateTime(announcement.published_at) : 'Not published'}</AppText>
                </View>
                <AppText color="muted">{announcement.body}</AppText>
              </Card>
            )) : <EmptyState title="No announcements" message="Publish weather, schedule, court, or registration updates here." />}
          </Section>
        </View>
      ) : null}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[8] },
  form: { gap: spacing[4] },
  eventChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  announcementCard: { gap: spacing[3] },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing[4] },
  copy: { flex: 1, gap: spacing[2] },
});
