import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminShell, FormActions, PermissionNotice, Section } from '@/components/layout/admin-shell';
import { AppText, Button, Card, EmptyState, StatusBadge, TextField } from '@/components/ui';
import { BundleState } from '@/features/club/screen-helpers';
import { hasRole, roleLabel, statusLabel, useActiveClub, useClubActions, useClubBundle } from '@/features/club/club-data';
import { spacing } from '@/theme';

export default function MembersManagementScreen() {
  const { activeClubId, activeRoles } = useActiveClub();
  const bundleQuery = useClubBundle(activeClubId);
  const bundle = bundleQuery.data;
  const actions = useClubActions();
  const canManage = hasRole(activeRoles, ['administrator']);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  const addMember = () => {
    if (!activeClubId || !displayName.trim() || !canManage) return;
    actions.createMembership.mutate({
      club_id: activeClubId,
      display_name: displayName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      is_guest: isGuest,
      joined_at: new Date().toISOString().slice(0, 10),
      membership_status: 'active',
    }, { onSuccess: () => { setDisplayName(''); setEmail(''); setPhone(''); setIsGuest(false); } });
  };

  return (
    <AdminShell eyebrow="MEMBERS MANAGEMENT" title="Members" subtitle="Roster, roles, player preferences, and member status.">
      <BundleState isLoading={bundleQuery.isLoading} error={bundleQuery.error} onRetry={() => bundleQuery.refetch()} />
      {bundle ? (
        <View style={styles.stack}>
          <PermissionNotice allowed={canManage} message="Only administrators can add or edit member records." />
          <Section title="Add member" subtitle="Create a roster member or event-scoped guest with a server-generated player profile.">
            <Card style={styles.form}>
              <TextField label="Display name" value={displayName} onChangeText={setDisplayName} editable={canManage} required />
              <View style={styles.fieldsRow}>
                <TextField label="Email" value={email} onChangeText={setEmail} editable={canManage} style={styles.field} />
                <TextField label="Phone" value={phone} onChangeText={setPhone} editable={canManage} style={styles.field} />
              </View>
              <Button label={isGuest ? 'Guest member' : 'Club member'} variant="secondary" disabled={!canManage} onPress={() => setIsGuest((value) => !value)} />
              <FormActions error={actions.createMembership.error?.message} success={actions.createMembership.isSuccess ? 'Member added.' : undefined} loading={actions.createMembership.isPending} onSubmit={addMember} primaryLabel="Add member" />
            </Card>
          </Section>
          <Section title="Roster" subtitle="No placeholder members are shown; this is the live club_memberships table.">
            {bundle.memberships.length ? bundle.memberships.map((membership) => {
            const roles = bundle.roles.filter((role) => role.membership_id === membership.id).map((role) => roleLabel(role.role));
            const player = bundle.playerProfiles.find((profile) => profile.membership_id === membership.id);
            return (
              <Card key={membership.id} style={styles.memberCard}>
                <View style={styles.copy}>
                  <StatusBadge label={statusLabel(membership.membership_status)} tone={membership.membership_status === 'active' ? 'success' : 'warning'} />
                  <AppText variant="heading3">{membership.display_name}</AppText>
                  <AppText color="muted">{membership.email ?? 'No email'} · {roles.join(', ') || 'Member'}</AppText>
                  <AppText color="muted" variant="bodySm">Doubles {player?.doubles_rating ?? '—'} · Singles {player?.singles_rating ?? '—'}</AppText>
                </View>
                <Button label="Profile" variant="secondary" onPress={() => router.push(`/clubs/members/${membership.id}` as Href)} />
              </Card>
            );
            }) : <EmptyState title="No members yet" message="Add a member or guest to start the club roster." />}
          </Section>
        </View>
      ) : null}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[8] },
  form: { gap: spacing[4] },
  fieldsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  field: { minWidth: 220 },
  memberCard: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing[4], alignItems: 'flex-start' },
  copy: { flex: 1, gap: spacing[2] },
});
