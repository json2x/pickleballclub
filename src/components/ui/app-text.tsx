import { Text, type TextProps, StyleSheet } from 'react-native';

import { lightColors, typography, type TypographyVariant } from '@/theme';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: 'default' | 'muted' | 'link' | 'error' | 'success';
};

const textColors = {
  default: lightColors.text,
  muted: lightColors.textMuted,
  link: lightColors.link,
  error: lightColors.errorText,
  success: lightColors.successText,
};

export function AppText({ variant = 'body', color = 'default', style, ...props }: AppTextProps) {
  return (
    <Text
      {...props}
      maxFontSizeMultiplier={1.5}
      style={[styles.base, typography[variant], { color: textColors[color] }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {},
});
