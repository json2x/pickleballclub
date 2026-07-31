import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminShell, PermissionNotice, Section } from '@/components/layout/admin-shell';
import { AppText, Button, Card, EmptyState, StatusBadge, TextField } from '@/components/ui';
import { BundleState, memberName } from '@/features/club/screen-helpers';
import { hasRole, statusLabel, useActiveClub, useClubActions, useClubBundle } from '@/features/club/club-data';
import { lightColors, radius, spacing } from '@/theme';

export default function MatchScoringScreen() {
  const { eventId, matchId } = useLocalSearchParams<{ eventId: string; matchId: string }>();
  const { activeClubId, activeMembership, activeRoles } = useActiveClub();
  const bundleQuery = useClubBundle(activeClubId);
  const bundle = bundleQuery.data;
  const actions = useClubActions();
  const event = bundle?.events.find((item) => item.id === eventId);
  const match = bundle?.matches.find((item) => item.id === matchId);
  const participants = bundle?.participants.filter((participant) => participant.match_id === matchId) ?? [];
  const scoreEvents = bundle?.scoreEvents.filter((eventItem) => eventItem.match_id === matchId) ?? [];
  const isParticipant = participants.some((participant) => participant.membership_id === activeMembership?.id);
  const canManage = hasRole(activeRoles, ['administrator', 'event_organizer']);
  const canScore = isParticipant || hasRole(activeRoles, ['administrator', 'event_organizer', 'court_marshal', 'scorekeeper']);
  const scoreIsEditable = match?.status === 'scheduled' || match?.status === 'in_progress';
  const [disputeReason, setDisputeReason] = useState('');

  const record = (team: number, delta: number) => {
    if (!match || !canScore) return;
    actions.recordPoint.mutate({ matchId: match.id, team, delta, expectedVersion: match.version });
  };

  return (
    <AdminShell eyebrow="MATCH SCORING" title={match ? `Match ${match.match_number}` : 'Match scoring'} subtitle={event ? event.name : 'Court-side scoring'}>
      <BundleState isLoading={bundleQuery.isLoading} error={bundleQuery.error} onRetry={() => bundleQuery.refetch()} />
      {bundle && !match ? <EmptyState title="Match not found" message="This match is unavailable for the active club." /> : null}
      {bundle && match ? (
        <View style={styles.stack}>
          <PermissionNotice allowed={canScore} message="Scoring requires scorekeeper, marshal, organizer, or administrator permission." />
          <Card style={styles.scoreboard}>
            <StatusBadge label={statusLabel(match.status)} tone={match.status === 'completed' ? 'success' : match.status === 'disputed' ? 'error' : 'info'} />
            <View style={styles.teams}>
              <ScoreTeam title="Team 1" score={match.team_one_score} names={participants.filter((participant) => participant.team === 1).map((participant) => memberName(bundle.memberships, participant.membership_id))} onAdd={() => record(1, 1)} onUndo={() => record(1, -1)} loading={actions.recordPoint.isPending} disabled={!canScore || !scoreIsEditable} />
              <ScoreTeam title="Team 2" score={match.team_two_score} names={participants.filter((participant) => participant.team === 2).map((participant) => memberName(bundle.memberships, participant.membership_id))} onAdd={() => record(2, 1)} onUndo={() => record(2, -1)} loading={actions.recordPoint.isPending} disabled={!canScore || !scoreIsEditable} />
            </View>
            <View style={styles.submitRow}>
              {actions.recordPoint.error ? <AppText color="error">{actions.recordPoint.error.message}</AppText> : null}
              {actions.submitMatch.error ? <AppText color="error">{actions.submitMatch.error.message}</AppText> : null}
              {actions.submitMatch.isSuccess ? <AppText color="success">Match submitted and awaiting confirmation.</AppText> : null}
              {actions.confirmMatch.error ? <AppText color="error">{actions.confirmMatch.error.message}</AppText> : null}
              {actions.disputeMatch.error ? <AppText color="error">{actions.disputeMatch.error.message}</AppText> : null}
              {actions.resolveMatch.error ? <AppText color="error">{actions.resolveMatch.error.message}</AppText> : null}
              {match.status === 'in_progress' ? (
                <Button label="Submit final score" loading={actions.submitMatch.isPending} disabled={!canScore} onPress={() => actions.submitMatch.mutate({ matchId: match.id, expectedVersion: match.version })} />
              ) : null}
              {match.status === 'awaiting_confirmation' ? (
                <View style={styles.confirmationPanel}>
                  <AppText variant="title">Score confirmation</AppText>
                  <AppText color="muted">A different participant or event manager confirms the result before ratings change.</AppText>
                  <View style={styles.confirmationActions}>
                    <Button label="Confirm result" loading={actions.confirmMatch.isPending} disabled={!canScore} onPress={() => actions.confirmMatch.mutate(match.id)} />
                    <TextField label="Dispute reason" value={disputeReason} onChangeText={setDisputeReason} placeholder="Explain what is incorrect" style={styles.disputeField} />
                    <Button label="Dispute score" variant="destructive" loading={actions.disputeMatch.isPending} disabled={!canScore || disputeReason.trim().length < 3} onPress={() => actions.disputeMatch.mutate({ matchId: match.id, reason: disputeReason })} />
                  </View>
                </View>
              ) : null}
              {match.status === 'disputed' ? (
                <View style={styles.confirmationPanel}>
                  <AppText color="error" variant="title">Score disputed</AppText>
                  <AppText>{match.dispute_reason ?? 'A participant disputed this score.'}</AppText>
                  {canManage ? <Button label="Resolve with displayed score" loading={actions.resolveMatch.isPending} onPress={() => actions.resolveMatch.mutate({ matchId: match.id, teamOneScore: match.team_one_score, teamTwoScore: match.team_two_score })} /> : null}
                </View>
              ) : null}
              {match.status === 'completed' ? <AppText color="success">Result confirmed. Ratings and player queue state are finalized.</AppText> : null}
            </View>
          </Card>

          <Section title="Score events" subtitle="Undo and scoring history is stored in score_events.">
            {scoreEvents.length ? scoreEvents.map((scoreEvent) => (
              <Card key={scoreEvent.id} style={styles.eventRow}>
                <AppText variant="label">Team {scoreEvent.team} {scoreEvent.delta > 0 ? 'scored' : 'undo'}</AppText>
                <AppText color="muted">Score became {scoreEvent.score_one}–{scoreEvent.score_two}</AppText>
              </Card>
            )) : <EmptyState title="No score events" message="Score changes will appear after the first confirmed point." />}
          </Section>
        </View>
      ) : null}
    </AdminShell>
  );
}

function ScoreTeam({ title, score, names, onAdd, onUndo, loading, disabled }: { title: string; score: number; names: string[]; onAdd: () => void; onUndo: () => void; loading: boolean; disabled: boolean }) {
  return (
    <View style={styles.teamCard}>
      <AppText variant="title">{title}</AppText>
      <AppText color="muted">{names.join(' / ') || 'Players pending'}</AppText>
      <AppText variant="scoreXl" style={styles.score}>{score}</AppText>
      <View style={styles.scoreActions}>
        <Button label="Undo" variant="secondary" loading={loading} disabled={disabled || score <= 0} onPress={onUndo} />
        <Button label="+ Point" loading={loading} disabled={disabled} onPress={onAdd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[8] },
  scoreboard: { gap: spacing[5] },
  teams: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4] },
  teamCard: { flex: 1, minWidth: 260, alignItems: 'center', gap: spacing[3], padding: spacing[5], borderWidth: 1, borderColor: lightColors.border, borderRadius: radius.md, backgroundColor: lightColors.surfaceSubtle },
  score: { fontVariant: ['tabular-nums'] },
  scoreActions: { flexDirection: 'row', gap: spacing[3], minHeight: 64, alignItems: 'center' },
  submitRow: { gap: spacing[2], alignItems: 'flex-start' },
  confirmationPanel: { width: '100%', gap: spacing[3], paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: lightColors.border },
  confirmationActions: { width: '100%', gap: spacing[3], alignItems: 'flex-start' },
  disputeField: { minWidth: 280 },
  eventRow: { gap: spacing[1] },
});
