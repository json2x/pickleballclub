import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AdminShell, ResponsiveGrid, Section, StatCard } from '@/components/layout/admin-shell';
import { AppText, Button, Card, EmptyState } from '@/components/ui';
import { CreateClubCard } from '@/features/club/create-club-card';
import { BundleState } from '@/features/club/screen-helpers';
import { roleLabel, statusLabel, useActiveClub, useClubBundle } from '@/features/club/club-data';
import { lightColors, spacing } from '@/theme';

export default function ClubsScreen() {
  const { activeClub, activeClubId, activeRoles, clubs, setActiveClubId } = useActiveClub();
  const bundleQuery = useClubBundle(activeClubId);
  const bundle = bundleQuery.data;

  return (
    <AdminShell eyebrow="CLUB MANAGEMENT" title="Clubs" subtitle="Switch workspaces, inspect membership health, and create a new club." requireClub={false}>
      <View style={styles.stack}>
        {clubs.length ? (
          <Section title="Your clubs" subtitle="Only clubs connected to your authenticated profile are listed.">
            {clubs.map((club) => (
              <Card key={club.id} style={[styles.clubCard, activeClub?.id === club.id && styles.activeCard]}>
                <View style={styles.copy}>
                  <AppText variant="heading3">{club.name}</AppText>
                  <AppText color="muted">{club.description ?? 'No club description.'}</AppText>
                  <AppText color="muted" variant="caption">{club.timezone} · {statusLabel(club.status)}</AppText>
                </View>
                <Button label={activeClub?.id === club.id ? 'Active' : 'Use club'} variant="secondary" disabled={activeClub?.id === club.id} onPress={() => setActiveClubId(club.id)} />
              </Card>
            ))}
          </Section>
        ) : <EmptyState title="No clubs connected" message="Create your first club or accept an invitation to begin operations." />}

        {activeClub ? (
          <Section title="Active club snapshot" subtitle="Live counts from the hosted project.">
            <BundleState isLoading={bundleQuery.isLoading} error={bundleQuery.error} onRetry={() => bundleQuery.refetch()} />
            {bundle ? (
              <ResponsiveGrid>
                <StatCard label="Members" value={bundle.memberships.length} />
                <StatCard label="Events" value={bundle.events.length} />
                <StatCard label="Roles you hold" value={activeRoles.map(roleLabel).join(', ') || 'Member'} />
              </ResponsiveGrid>
            ) : null}
            <View style={styles.actions}>
              <Button label="Members" variant="secondary" onPress={() => router.push('/clubs/members' as Href)} />
              <Button label="Settings" variant="secondary" onPress={() => router.push('/(app)/(tabs)/clubs/settings')} />
              <Button label="Roles" variant="secondary" onPress={() => router.push('/(app)/(tabs)/clubs/roles')} />
            </View>
          </Section>
        ) : null}

        <CreateClubCard />
      </View>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[8] },
  clubCard: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing[4], alignItems: 'flex-start' },
  activeCard: { borderColor: lightColors.primary },
  copy: { flex: 1, gap: spacing[2] },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
});
