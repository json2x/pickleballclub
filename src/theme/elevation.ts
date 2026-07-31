import type { ViewStyle } from 'react-native';

export const elevation = {
  0: {} satisfies ViewStyle,
  1: { boxShadow: '0 1px 3px rgba(15, 23, 42, 0.10)' } satisfies ViewStyle,
  2: { boxShadow: '0 4px 10px rgba(15, 23, 42, 0.12)' } satisfies ViewStyle,
  3: { boxShadow: '0 10px 24px rgba(15, 23, 42, 0.16)' } satisfies ViewStyle,
  4: { boxShadow: '0 18px 40px rgba(15, 23, 42, 0.20)' } satisfies ViewStyle,
} as const;
