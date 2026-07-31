import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminShell, Section } from '@/components/layout/admin-shell';
import { AppText, Card, ChoiceGroup, EmptyState, StatusBadge } from '@/components/ui';
import { BundleState } from '@/features/club/screen-helpers';
import { useActiveClub, useClubBundle } from '@/features/club/club-data';
import { lightColors, radius, spacing } from '@/theme';

type RankingFormat = 'singles' | 'doubles';
const formatChoices: readonly { label: string; value: RankingFormat }[] = [
  { label: 'Singles', value: 'singles' },
  { label: 'Doubles', value: 'doubles' },
];

export default function RankingsScreen() {
  const { activeClubId } = useActiveClub();
  const bundleQuery = useClubBundle(activeClubId);
  const bundle = bundleQuery.data;
  const [format, setFormat] = useState<RankingFormat>('doubles');
  const rows = (bundle?.memberships ?? [])
    .map((membership) => ({
      membership,
      profile: bundle?.playerProfiles.find((player) => player.membership_id === membership.id),
      history: bundle?.ratingHistory.filter((item) => item.membership_id === membership.id && (format === 'singles' ? item.format === 'singles' : item.format !== 'singles')) ?? [],
    }))
    .sort((left, right) => {
      const rightRating = format === 'singles' ? right.profile?.singles_rating : right.profile?.doubles_rating;
      const leftRating = format === 'singles' ? left.profile?.singles_rating : left.profile?.doubles_rating;
      return (rightRating ?? 0) - (leftRating ?? 0);
    });

  return (
    <AdminShell eyebrow="RANKINGS LEADERBOARD" title="Rankings" subtitle="Current player ratings and rating movement from completed matches.">
      <BundleState isLoading={bundleQuery.isLoading} error={bundleQuery.error} onRetry={() => bundleQuery.refetch()} />
      {bundle ? (
        <Section title={`${format === 'singles' ? 'Singles' : 'Doubles'} leaderboard`} subtitle="Confirmed results update ratings only after score confirmation.">
          <ChoiceGroup label="Format" value={format} choices={formatChoices} onChange={setFormat} />
          {rows.length ? rows.map((row, index) => (
            <Card key={row.membership.id} style={styles.rankRow}>
              <View style={styles.rankBadge}><AppText variant="label">{index + 1}</AppText></View>
              <View style={styles.copy}>
                <AppText variant="title">{row.membership.display_name}</AppText>
                <AppText color="muted">{row.profile?.play_preference ?? 'balanced'} · {row.history.length} confirmed matches</AppText>
                {(row.profile?.rating_confidence ?? 0) < 0.5 ? <StatusBadge label="Provisional" tone="warning" /> : null}
              </View>
              <View style={styles.ratingCopy}>
                <AppText variant="heading2" style={styles.tabular}>{format === 'singles' ? row.profile?.singles_rating ?? '—' : row.profile?.doubles_rating ?? '—'}</AppText>
                {row.history[0] ? <AppText color={row.history[0].delta >= 0 ? 'success' : 'error'} variant="label">{row.history[0].delta >= 0 ? '+' : ''}{row.history[0].delta}</AppText> : null}
              </View>
            </Card>
          )) : <EmptyState title="No ranked players" message="Player ratings appear after active members receive player profiles and match results." />}
        </Section>
      ) : null}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  rankRow: { flexDirection: 'row', gap: spacing[4], alignItems: 'center' },
  rankBadge: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: lightColors.surfaceSubtle, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: spacing[1] },
  ratingCopy: { alignItems: 'flex-end', gap: spacing[1] },
  tabular: { fontVariant: ['tabular-nums'] },
});
