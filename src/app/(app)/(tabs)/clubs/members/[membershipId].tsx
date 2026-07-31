import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminShell, FormActions, PermissionNotice, ResponsiveGrid, Section, StatCard } from '@/components/layout/admin-shell';
import { AppText, Card, EmptyState, StatusBadge, TextField } from '@/components/ui';
import { BundleState } from '@/features/club/screen-helpers';
import { hasRole, roleLabel, statusLabel, useActiveClub, useClubActions, useClubBundle } from '@/features/club/club-data';
import { spacing } from '@/theme';

export default function MemberProfileScreen() {
  const { membershipId } = useLocalSearchParams<{ membershipId: string }>();
  const { activeClubId, activeRoles } = useActiveClub();
  const bundleQuery = useClubBundle(activeClubId);
  const bundle = bundleQuery.data;
  const actions = useClubActions();
  const membership = bundle?.memberships.find((item) => item.id === membershipId);
  const playerProfile = bundle?.playerProfiles.find((item) => item.membership_id === membershipId);
  const ratingHistory = bundle?.ratingHistory.filter((item) => item.membership_id === membershipId) ?? [];
  const canEdit = hasRole(activeRoles, ['administrator']);
  const [draft, setDraft] = useState<{ sourceId: string; displayName: string; phone: string } | null>(null);
  const displayName = draft && draft.sourceId === membership?.id ? draft.displayName : membership?.display_name ?? '';
  const phone = draft && draft.sourceId === membership?.id ? draft.phone : membership?.phone ?? '';

  const updateDraft = (values: Partial<{ displayName: string; phone: string }>) => {
    if (!membership) return;
    setDraft({ sourceId: membership.id, displayName, phone, ...values });
  };

  const updateMember = () => {
    if (!membership) return;
    actions.updateMembership.mutate({ membershipId: membership.id, values: { display_name: displayName.trim() || membership.display_name, phone: phone.trim() || null } });
  };

  return (
    <AdminShell eyebrow="MEMBER PROFILE" title={membership?.display_name ?? 'Member profile'} subtitle="Player preferences, roles, and rating history.">
      <BundleState isLoading={bundleQuery.isLoading} error={bundleQuery.error} onRetry={() => bundleQuery.refetch()} />
      {bundle && !membership ? <EmptyState title="Member not found" message="This member is not part of the active club." /> : null}
      {bundle && membership ? (
        <View style={styles.stack}>
          <ResponsiveGrid>
            <StatCard label="Doubles" value={playerProfile?.doubles_rating ?? '—'} detail="Current rating" />
            <StatCard label="Singles" value={playerProfile?.singles_rating ?? '—'} detail="Current rating" />
            <StatCard label="Confidence" value={playerProfile?.rating_confidence ?? '—'} />
          </ResponsiveGrid>
          <Section title="Profile" subtitle="Administrative member updates are intentionally role-gated.">
            <PermissionNotice allowed={canEdit} message="Only administrators can update member records from this screen." />
            <Card style={styles.form}>
              <StatusBadge label={statusLabel(membership.membership_status)} tone={membership.membership_status === 'active' ? 'success' : 'warning'} />
              <TextField label="Display name" value={displayName} onChangeText={(value) => updateDraft({ displayName: value })} editable={canEdit} />
              <TextField label="Phone" value={phone} onChangeText={(value) => updateDraft({ phone: value })} editable={canEdit} />
              <AppText color="muted">Roles: {bundle.roles.filter((role) => role.membership_id === membership.id).map((role) => roleLabel(role.role)).join(', ') || 'Member'}</AppText>
              <FormActions error={actions.updateMembership.error?.message} success={actions.updateMembership.isSuccess ? 'Member saved.' : undefined} loading={actions.updateMembership.isPending} onSubmit={updateMember} primaryLabel="Save member" />
            </Card>
          </Section>
          <Section title="Rating history" subtitle="Confirmed match results update this table.">
            {ratingHistory.length ? ratingHistory.map((history) => (
              <Card key={history.id} style={styles.ratingRow}>
                <AppText variant="label">{statusLabel(history.format)} {history.delta >= 0 ? '+' : ''}{history.delta}</AppText>
                <AppText color="muted">{history.previous_rating} → {history.new_rating}</AppText>
              </Card>
            )) : <EmptyState title="No rating history" message="Completed submitted matches will create rating movement records." />}
          </Section>
        </View>
      ) : null}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[8] },
  form: { gap: spacing[4] },
  ratingRow: { gap: spacing[1] },
});
