import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Button } from '@/components/ui';
import { AuthScaffold } from '@/features/auth/auth-scaffold';
import { lightColors, spacing } from '@/theme';

export default function AcceptInviteScreen() {
  const { club } = useLocalSearchParams<{ club?: string }>();
  const router = useRouter();

  return (
    <AuthScaffold eyebrow="CLUB INVITATION" title={`Join ${club ?? 'your club'}`} description="Sign in with the invited email address to connect your membership.">
      <View style={styles.summary}>
        <MailCheck size={32} color={lightColors.successText} />
        <View style={styles.summaryCopy}>
          <AppText variant="title">Invitation ready</AppText>
          <AppText color="muted">Your role and membership will be confirmed securely after sign in.</AppText>
        </View>
      </View>
      <Button label="Continue to sign in" onPress={() => router.push('/(auth)/sign-in')} />
      <Link href="/(auth)/sign-up" style={styles.link}>Create an account instead</Link>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start' },
  summaryCopy: { flex: 1, gap: spacing[1] },
  link: { color: lightColors.link, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
});
