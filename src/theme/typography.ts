import type { TextStyle } from 'react-native';

export const typography = {
  displayXl: { fontSize: 48, lineHeight: 56, fontFamily: 'Inter_700Bold' },
  displayLg: { fontSize: 40, lineHeight: 48, fontFamily: 'Inter_700Bold' },
  heading1: { fontSize: 32, lineHeight: 40, fontFamily: 'Inter_700Bold' },
  heading2: { fontSize: 26, lineHeight: 34, fontFamily: 'Inter_700Bold' },
  heading3: { fontSize: 22, lineHeight: 30, fontFamily: 'Inter_600SemiBold' },
  title: { fontSize: 18, lineHeight: 26, fontFamily: 'Inter_600SemiBold' },
  bodyLg: { fontSize: 17, lineHeight: 26, fontFamily: 'Inter_400Regular' },
  body: { fontSize: 15, lineHeight: 22, fontFamily: 'Inter_400Regular' },
  bodySm: { fontSize: 13, lineHeight: 19, fontFamily: 'Inter_400Regular' },
  label: { fontSize: 13, lineHeight: 16, fontFamily: 'Inter_600SemiBold' },
  caption: { fontSize: 11, lineHeight: 16, fontFamily: 'Inter_500Medium' },
  scoreXl: { fontSize: 72, lineHeight: 80, fontFamily: 'Inter_700Bold', fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
