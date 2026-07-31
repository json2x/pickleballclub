import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { AppText } from './app-text';
import { lightColors, radius, spacing } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
};

const variants = StyleSheet.create({
  primary: { backgroundColor: lightColors.primary, borderColor: lightColors.primary },
  secondary: { backgroundColor: lightColors.surface, borderColor: lightColors.border },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  destructive: { backgroundColor: lightColors.errorText, borderColor: lightColors.errorText },
});

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon: Icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const lightText = variant === 'destructive';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variants[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={lightText ? lightColors.surface : lightColors.text} />
      ) : (
        <View style={styles.content}>
          {Icon ? <Icon size={20} color={lightText ? lightColors.surface : lightColors.text} /> : null}
          <AppText style={lightText && styles.lightText} variant="label">
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  pressed: {
    opacity: 0.78,
  },
  disabled: {
    opacity: 0.5,
  },
  lightText: {
    color: lightColors.surface,
  },
});
