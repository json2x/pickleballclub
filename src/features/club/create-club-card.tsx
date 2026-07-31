import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, TextField } from '@/components/ui';
import { useClubActions } from '@/features/club/club-data';
import { spacing } from '@/theme';

export function CreateClubCard() {
  const actions = useClubActions();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kuala_Lumpur');
  const [countryCode, setCountryCode] = useState('MY');
  const [localError, setLocalError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  const submit = () => {
    if (!name.trim()) {
      setLocalError('Club name is required.');
      return;
    }
    setLocalError(null);
    setCreated(false);
    actions.createClub.mutate(
      { name, description, timezone, countryCode },
      { onSuccess: () => setCreated(true) },
    );
  };

  return (
    <Card style={styles.card}>
      <View style={styles.copy}>
        <AppText color="muted" variant="label">NO ACTIVE CLUB</AppText>
        <AppText variant="heading2">Create your club workspace</AppText>
        <AppText color="muted">This calls the hosted create_club RPC, then reloads your membership and role context from Supabase.</AppText>
      </View>
      <View style={styles.form}>
        <TextField label="Club name" required value={name} onChangeText={setName} placeholder="Damansara Pickleball Club" />
        <TextField label="Description" value={description} onChangeText={setDescription} placeholder="Friendly competitive play every week" multiline />
        <View style={styles.row}>
          <TextField label="Timezone" value={timezone} onChangeText={setTimezone} style={styles.field} />
          <TextField label="Country" value={countryCode} onChangeText={setCountryCode} maxLength={2} style={styles.shortField} />
        </View>
        <View style={styles.actions}>
          {localError ?? actions.createClub.error?.message ? <AppText color="error" variant="bodySm">{localError ?? actions.createClub.error?.message}</AppText> : null}
          {created ? <AppText color="success" variant="bodySm">Club created. Loading your workspace now.</AppText> : null}
          <Button label="Create club" loading={actions.createClub.isPending} onPress={submit} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing[6] },
  copy: { gap: spacing[2] },
  form: { gap: spacing[4] },
  row: { flexDirection: 'row', gap: spacing[3], flexWrap: 'wrap' },
  field: { minWidth: 220 },
  shortField: { minWidth: 96 },
  actions: { gap: spacing[2], alignItems: 'flex-start' },
});
