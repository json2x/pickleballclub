import { CalendarDays, LogOut, MapPin } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Screen, StatusBadge } from '@/components/ui';
import { supabase } from '@/services/supabase/client';
import { spacing } from '@/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headingCopy}>
          <AppText color="muted" variant="label">CLUB DASHBOARD</AppText>
          <AppText variant="heading1">Ready to play?</AppText>
          <AppText color="muted" variant="bodyLg">Your club activity will appear here.</AppText>
        </View>
        <Button label="Sign out" onPress={() => supabase?.auth.signOut()} variant="ghost" icon={LogOut} />
      </View>

      <Card style={styles.heroCard}>
        <StatusBadge label="No active event" tone="info" />
        <View style={styles.eventHeading}>
          <CalendarDays size={24} />
          <AppText variant="heading3">Your next event</AppText>
        </View>
        <AppText color="muted">When you register or receive a court assignment, the important details will stay at the top of this screen.</AppText>
        <View style={styles.metadata}>
          <MapPin size={18} />
          <AppText variant="bodySm">Venue details will appear here</AppText>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing[4], marginBottom: spacing[8] },
  headingCopy: { flex: 1, gap: spacing[1] },
  heroCard: { gap: spacing[4] },
  eventHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  metadata: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
});
