import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AdminShell, FormActions, PermissionNotice } from '@/components/layout/admin-shell';
import { Card, TextField } from '@/components/ui';
import { hasRole, useActiveClub, useClubActions } from '@/features/club/club-data';
import { spacing } from '@/theme';

export default function ClubSettingsScreen() {
  const { activeClub, activeRoles } = useActiveClub();
  const actions = useClubActions();
  const canEdit = hasRole(activeRoles, ['administrator']);
  const [draft, setDraft] = useState<{ sourceId: string; name: string; description: string; timezone: string; countryCode: string } | null>(null);
  const name = draft && draft.sourceId === activeClub?.id ? draft.name : activeClub?.name ?? '';
  const description = draft && draft.sourceId === activeClub?.id ? draft.description : activeClub?.description ?? '';
  const timezone = draft && draft.sourceId === activeClub?.id ? draft.timezone : activeClub?.timezone ?? 'Asia/Kuala_Lumpur';
  const countryCode = draft && draft.sourceId === activeClub?.id ? draft.countryCode : activeClub?.country_code ?? 'MY';

  const updateDraft = (values: Partial<{ name: string; description: string; timezone: string; countryCode: string }>) => {
    if (!activeClub) return;
    setDraft({ sourceId: activeClub.id, name, description, timezone, countryCode, ...values });
  };

  const save = () => {
    if (!activeClub || !canEdit) return;
    actions.updateClub.mutate({
      clubId: activeClub.id,
      values: {
        name: name.trim() || activeClub.name,
        description: description.trim() || activeClub.description,
        timezone: timezone.trim() || activeClub.timezone,
        country_code: countryCode.trim().toUpperCase() || activeClub.country_code,
      },
    });
  };

  return (
    <AdminShell eyebrow="CLUB SETTINGS" title="Club settings" subtitle="Club metadata, timezone, and operating region.">
      <View style={styles.stack}>
        <PermissionNotice allowed={canEdit} message="Only administrators can update club settings." />
        <Card style={styles.form}>
          <TextField label="Club name" value={name} onChangeText={(value) => updateDraft({ name: value })} editable={canEdit} />
          <TextField label="Description" value={description} onChangeText={(value) => updateDraft({ description: value })} editable={canEdit} multiline />
          <View style={styles.row}>
            <TextField label="Timezone" value={timezone} onChangeText={(value) => updateDraft({ timezone: value })} editable={canEdit} style={styles.field} />
            <TextField label="Country code" value={countryCode} onChangeText={(value) => updateDraft({ countryCode: value })} editable={canEdit} maxLength={2} style={styles.shortField} />
          </View>
          <FormActions error={actions.updateClub.error?.message} success={actions.updateClub.isSuccess ? 'Club settings saved.' : undefined} loading={actions.updateClub.isPending} onSubmit={save} primaryLabel="Save settings" />
        </Card>
      </View>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[4] },
  form: { gap: spacing[4] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  field: { minWidth: 240 },
  shortField: { minWidth: 120 },
});
