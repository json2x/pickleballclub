import { CircleAlert, Inbox } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from './app-text';
import { Button } from './button';
import { lightColors, spacing } from '@/theme';

type FeedbackStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

function FeedbackState({ title, message, actionLabel, onAction, error = false }: FeedbackStateProps & { error?: boolean }) {
  const Icon = error ? CircleAlert : Inbox;
  return (
    <View style={styles.container}>
      <Icon size={40} color={error ? lightColors.errorText : lightColors.textMuted} />
      <AppText variant="heading3" style={styles.centered}>{title}</AppText>
      <AppText color="muted" style={styles.centered}>{message}</AppText>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

export function EmptyState(props: FeedbackStateProps) {
  return <FeedbackState {...props} />;
}

export function ErrorState(props: FeedbackStateProps) {
  return <FeedbackState {...props} error />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[10],
  },
  centered: {
    textAlign: 'center',
    maxWidth: 480,
  },
});
