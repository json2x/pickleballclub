import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminShell, FormActions, Section } from '@/components/layout/admin-shell';
import { Card, ChoiceGroup, TextField } from '@/components/ui';
import type { Enums } from '@/types/database';
import { useActiveClub, useClubActions } from '@/features/club/club-data';
import { spacing } from '@/theme';

type PlayPreference = Enums<'play_preference'>;
type PreferredFormat = Enums<'preferred_format'>;
type PreferredSide = Enums<'preferred_side'>;

const playChoices: readonly { label: string; value: PlayPreference }[] = [
  { label: 'Competitive', value: 'competitive' },
  { label: 'Balanced', value: 'balanced' },
  { label: 'Social', value: 'social' },
];
const formatChoices: readonly { label: string; value: PreferredFormat }[] = [
  { label: 'Singles', value: 'singles' },
  { label: 'Doubles', value: 'doubles' },
  { label: 'Either', value: 'either' },
];
const sideChoices: readonly { label: string; value: PreferredSide }[] = [
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
  { label: 'Either', value: 'either' },
];

export default function ProfileScreen() {
  const { profile, activeMembership, playerProfiles } = useActiveClub();
  const actions = useClubActions();
  const playerProfile = playerProfiles.find((item) => item.membership_id === activeMembership?.id);
  const [accountDraft, setAccountDraft] = useState<{ sourceId: string; displayName: string; timezone: string } | null>(null);
  const [preferenceDraft, setPreferenceDraft] = useState<{
    sourceId: string;
    playPreference: PlayPreference;
    preferredFormat: PreferredFormat;
    preferredSide: PreferredSide;
  } | null>(null);
  const displayName = accountDraft && accountDraft.sourceId === profile?.id ? accountDraft.displayName : profile?.display_name ?? '';
  const timezone = accountDraft && accountDraft.sourceId === profile?.id ? accountDraft.timezone : profile?.timezone ?? 'Asia/Kuala_Lumpur';
  const preferenceSourceId = activeMembership?.id ?? '';
  const playPreference = preferenceDraft?.sourceId === preferenceSourceId ? preferenceDraft.playPreference : playerProfile?.play_preference ?? 'balanced';
  const preferredFormat = preferenceDraft?.sourceId === preferenceSourceId ? preferenceDraft.preferredFormat : playerProfile?.preferred_format ?? 'doubles';
  const preferredSide = preferenceDraft?.sourceId === preferenceSourceId ? preferenceDraft.preferredSide : playerProfile?.preferred_side ?? 'either';

  const updateAccountDraft = (values: Partial<{ displayName: string; timezone: string }>) => {
    if (!profile) return;
    setAccountDraft({ sourceId: profile.id, displayName, timezone, ...values });
  };

  const updatePreferenceDraft = (values: Partial<{ playPreference: PlayPreference; preferredFormat: PreferredFormat; preferredSide: PreferredSide }>) => {
    if (!activeMembership) return;
    setPreferenceDraft({ sourceId: activeMembership.id, playPreference, preferredFormat, preferredSide, ...values });
  };

  const saveProfile = () => {
    if (!profile) return;
    actions.updateProfile.mutate({ profileId: profile.id, values: { display_name: displayName.trim() || profile.display_name, timezone: timezone.trim() || profile.timezone } });
  };

  const savePreferences = () => {
    if (!activeMembership) return;
    actions.updatePlayerProfile.mutate({
      membershipId: activeMembership.id,
      values: {
        play_preference: playPreference,
        preferred_format: preferredFormat,
        preferred_side: preferredSide,
      },
    });
  };

  return (
    <AdminShell eyebrow="PROFILE" title="Profile" subtitle="Account details and player preferences for your active club.">
      <View style={styles.stack}>
        <Section title="Account" subtitle="Saved to profiles after Supabase confirms the update.">
          <Card style={styles.form}>
            <TextField label="Display name" value={displayName} onChangeText={(value) => updateAccountDraft({ displayName: value })} />
            <TextField label="Timezone" value={timezone} onChangeText={(value) => updateAccountDraft({ timezone: value })} />
            <FormActions error={actions.updateProfile.error?.message} success={actions.updateProfile.isSuccess ? 'Profile saved.' : undefined} loading={actions.updateProfile.isPending} onSubmit={saveProfile} primaryLabel="Save profile" />
          </Card>
        </Section>
        <Section title="Player preferences" subtitle="Used by event organizers and round generation context.">
          <Card style={styles.form}>
            <ChoiceGroup label="Play preference" value={playPreference} choices={playChoices} onChange={(value) => updatePreferenceDraft({ playPreference: value })} disabled={!activeMembership} />
            <ChoiceGroup label="Preferred format" value={preferredFormat} choices={formatChoices} onChange={(value) => updatePreferenceDraft({ preferredFormat: value })} disabled={!activeMembership} />
            <ChoiceGroup label="Preferred side" value={preferredSide} choices={sideChoices} onChange={(value) => updatePreferenceDraft({ preferredSide: value })} disabled={!activeMembership} />
            <FormActions error={actions.updatePlayerProfile.error?.message} success={actions.updatePlayerProfile.isSuccess ? 'Player preferences saved.' : undefined} loading={actions.updatePlayerProfile.isPending} onSubmit={savePreferences} primaryLabel="Save preferences" />
          </Card>
        </Section>
      </View>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[8] },
  form: { gap: spacing[4] },
});
