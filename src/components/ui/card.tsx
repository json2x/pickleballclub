import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { lightColors, radius, spacing } from '@/theme';

export function Card({ children, style, ...props }: PropsWithChildren<ViewProps>) {
  return (
    <View {...props} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing[5],
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: radius.md,
    backgroundColor: lightColors.surface,
  },
});
