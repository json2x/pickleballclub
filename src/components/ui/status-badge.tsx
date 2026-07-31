import { StyleSheet, View } from 'react-native';

import { AppText } from './app-text';
import { lightColors, radius, spacing } from '@/theme';

type StatusTone = 'success' | 'warning' | 'info' | 'error';

const tones = StyleSheet.create({
  success: { backgroundColor: lightColors.successBackground },
  warning: { backgroundColor: lightColors.warningBackground },
  info: { backgroundColor: lightColors.infoBackground },
  error: { backgroundColor: lightColors.errorBackground },
});

const toneColors = {
  success: lightColors.successText,
  warning: lightColors.warningText,
  info: lightColors.infoText,
  error: lightColors.errorText,
};

export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <View accessibilityLabel={`Status: ${label}`} style={[styles.badge, tones[tone]]}>
      <View style={[styles.dot, { backgroundColor: toneColors[tone] }]} />
      <AppText variant="caption" style={{ color: toneColors[tone] }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minHeight: 28,
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
});
