import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminShell, FormActions, PermissionNotice, Section } from '@/components/layout/admin-shell';
import { AppText, Button, Card, ChoiceGroup, EmptyState } from '@/components/ui';
import { BundleState } from '@/features/club/screen-helpers';
import type { ClubRole } from '@/features/club/club-data';
import { hasRole, roleLabel, useActiveClub, useClubActions, useClubBundle } from '@/features/club/club-data';
import { spacing } from '@/theme';

const roleChoices: readonly { label: string; value: ClubRole }[] = [
  { label: 'Administrator', value: 'administrator' },
  { label: 'Event organizer', value: 'event_organizer' },
  { label: 'Court marshal', value: 'court_marshal' },
  { label: 'Scorekeeper', value: 'scorekeeper' },
  { label: 'Member', value: 'member' },
  { label: 'Guest', value: 'guest' },
];

export default function RolesPermissionsScreen() {
  const { activeClubId, activeRoles } = useActiveClub();
  const bundleQuery = useClubBundle(activeClubId);
  const bundle = bundleQuery.data;
  const actions = useClubActions();
  const canAssign = hasRole(activeRoles, ['administrator']);
  const [membershipId, setMembershipId] = useState('');
  const [role, setRole] = useState<ClubRole>('member');

  const assign = () => {
    if (!activeClubId || !canAssign || !membershipId.trim()) return;
    actions.assignRole.mutate({ clubId: activeClubId, membershipId: membershipId.trim(), role });
  };

  return (
    <AdminShell eyebrow="ROLES & PERMISSIONS SETTINGS" title="Roles and permissions" subtitle="Grant operational roles; server RLS still enforces access.">
      <BundleState isLoading={bundleQuery.isLoading} error={bundleQuery.error} onRetry={() => bundleQuery.refetch()} />
      {bundle ? (
        <View style={styles.stack}>
          <PermissionNotice allowed={canAssign} message="Only administrators can assign club roles." />
          <Section title="Assign role" subtitle="Choose a member and grant one operational role.">
            <Card style={styles.form}>
              <View style={styles.choiceRow}>
                {bundle.memberships.map((membership) => (
                  <Button
                    key={membership.id}
                    label={membership.display_name}
                    variant={membershipId === membership.id ? 'primary' : 'secondary'}
                    disabled={!canAssign}
                    onPress={() => setMembershipId(membership.id)}
                  />
                ))}
              </View>
              <ChoiceGroup label="Role" value={role} choices={roleChoices} onChange={setRole} disabled={!canAssign} />
              <FormActions error={actions.assignRole.error?.message} success={actions.assignRole.isSuccess ? 'Role assigned.' : undefined} loading={actions.assignRole.isPending} onSubmit={assign} primaryLabel="Assign role" />
            </Card>
          </Section>
          <Section title="Current assignments" subtitle="Visible assignments for the active club.">
            {bundle.memberships.length ? bundle.memberships.map((membership) => {
              const roles = bundle.roles.filter((assignment) => assignment.membership_id === membership.id);
              return (
                <Card key={membership.id} style={styles.roleRow}>
                  <View style={styles.copy}>
                    <AppText variant="title">{membership.display_name}</AppText>
                    <AppText color="muted" selectable>{membership.id}</AppText>
                  </View>
                   <View style={styles.roleActions}>
                     {roles.length ? roles.map((assignment) => (
                       <Button
                         key={assignment.id}
                         label={`Remove ${roleLabel(assignment.role)}`}
                         variant="secondary"
                         disabled={!canAssign}
                         loading={actions.removeRole.isPending}
                         onPress={() => activeClubId && actions.removeRole.mutate({ clubId: activeClubId, assignmentId: assignment.id })}
                       />
                     )) : <AppText variant="label">Member</AppText>}
                   </View>
                </Card>
              );
            }) : <EmptyState title="No members" message="Role assignments require active club members." />}
          </Section>
        </View>
      ) : null}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[8] },
  form: { gap: spacing[4] },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing[4], alignItems: 'flex-start' },
  copy: { flex: 1, gap: spacing[1] },
  roleActions: { maxWidth: 520, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: spacing[2] },
});
