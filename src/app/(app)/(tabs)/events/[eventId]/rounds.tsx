import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminShell, FormActions, PermissionNotice, Section } from '@/components/layout/admin-shell';
import { AppText, Button, Card, EmptyState, StatusBadge } from '@/components/ui';
import { BundleState, memberName } from '@/features/club/screen-helpers';
import { formatDateTime, hasRole, statusLabel, useActiveClub, useClubActions, useClubBundle } from '@/features/club/club-data';
import { spacing } from '@/theme';

const strategies = [
  { value: 'balanced', label: 'Most balanced' },
  { value: 'random', label: 'Most randomized' },
  { value: 'variety', label: 'Maximum variety' },
  { value: 'waiting', label: 'Shortest wait' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'social', label: 'Social' },
] as const;

export default function SmartRoundGeneratorScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { activeClubId, activeRoles } = useActiveClub();
  const bundleQuery = useClubBundle(activeClubId);
  const bundle = bundleQuery.data;
  const actions = useClubActions();
  const event = bundle?.events.find((item) => item.id === eventId);
  const rounds = (bundle?.rounds ?? []).filter((round) => round.event_id === eventId);
  const matches = (bundle?.matches ?? []).filter((match) => match.event_id === eventId);
  const canGenerate = hasRole(activeRoles, ['administrator', 'event_organizer']);
  const [strategy, setStrategy] = useState('balanced');

  return (
    <AdminShell eyebrow="SMART ROUND GENERATOR" title="Round generation" subtitle={event ? `Generate fair, confirmed rounds for ${event.name}.` : 'Generate fair rounds'}>
      <BundleState isLoading={bundleQuery.isLoading} error={bundleQuery.error} onRetry={() => bundleQuery.refetch()} />
      {bundle && event ? (
        <View style={styles.stack}>
          <PermissionNotice allowed={canGenerate} message="Only administrators and event organizers can generate rounds." />
          <Section title="Generate next round" subtitle="The RPC chooses pairings server-side and returns the saved round only after success.">
            <Card style={styles.form}>
              <View style={styles.strategyRow}>
                {strategies.map((item) => (
                  <Button
                    key={item.value}
                    label={item.label}
                    variant={strategy === item.value ? 'primary' : 'secondary'}
                    disabled={!canGenerate}
                    onPress={() => setStrategy(item.value)}
                  />
                ))}
              </View>
              <AppText color="muted" variant="bodySm">
                {strategies.find((item) => item.value === strategy)?.label} will be applied to checked-in players on available courts.
              </AppText>
              <FormActions error={actions.generateRound.error?.message} success={actions.generateRound.isSuccess ? 'Round generated and saved.' : undefined} loading={actions.generateRound.isPending} onSubmit={() => actions.generateRound.mutate({ eventId: event.id, strategy })} primaryLabel="Generate round" />
            </Card>
          </Section>
          <Section title="Rounds" subtitle="Draft, active, and completed rounds from event_rounds.">
            {rounds.length ? rounds.map((round) => {
              const roundMatches = matches.filter((match) => match.round_id === round.id);
              return (
                <Card key={round.id} style={styles.roundCard}>
                  <View style={styles.rowBetween}>
                    <View style={styles.copy}>
                      <StatusBadge label={statusLabel(round.status)} tone={round.status === 'completed' ? 'success' : 'info'} />
                      <AppText variant="heading3">Round {round.round_number}</AppText>
                      <AppText color="muted">{round.explanation ?? `Strategy: ${round.strategy}`} · {formatDateTime(round.created_at)}</AppText>
                    </View>
                    <AppText variant="heading3">{round.quality_score ?? '—'}</AppText>
                  </View>
                  {roundMatches.map((match) => {
                    const participants = bundle.participants.filter((participant) => participant.match_id === match.id);
                    return (
                      <Card key={match.id} style={styles.matchCard}>
                        <View style={styles.rowBetween}>
                          <View style={styles.copy}>
                            <AppText variant="title">Match {match.match_number}</AppText>
                            <AppText color="muted">Team 1: {participants.filter((participant) => participant.team === 1).map((participant) => memberName(bundle.memberships, participant.membership_id)).join(' / ') || 'TBD'}</AppText>
                            <AppText color="muted">Team 2: {participants.filter((participant) => participant.team === 2).map((participant) => memberName(bundle.memberships, participant.membership_id)).join(' / ') || 'TBD'}</AppText>
                          </View>
                          <Link href={{ pathname: '/(app)/(tabs)/events/[eventId]/matches/[matchId]', params: { eventId: event.id, matchId: match.id } }} asChild><AppText color="link" variant="label">Score</AppText></Link>
                        </View>
                      </Card>
                    );
                  })}
                </Card>
              );
            }) : <EmptyState title="No rounds yet" message="Generate a round after enough checked-in players and courts are available." />}
          </Section>
        </View>
      ) : null}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[8] },
  form: { gap: spacing[4] },
  strategyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  roundCard: { gap: spacing[4] },
  matchCard: { gap: spacing[2] },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing[4], alignItems: 'flex-start' },
  copy: { flex: 1, gap: spacing[2] },
});
