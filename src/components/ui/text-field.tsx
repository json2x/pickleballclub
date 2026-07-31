import { forwardRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from './app-text';
import { lightColors, radius, spacing, typography } from '@/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, helperText, required, style, ...props },
  ref,
) {
  const description = error ?? helperText;

  return (
    <View style={styles.group}>
      <AppText variant="label">
        {label}
        {required ? ' *' : ''}
      </AppText>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={description}
        aria-invalid={Boolean(error)}
        placeholderTextColor={lightColors.textMuted}
        {...props}
        style={[styles.input, error && styles.inputError, style]}
      />
      {description ? (
        <AppText color={error ? 'error' : 'muted'} variant="bodySm">
          {description}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  group: {
    gap: spacing[2],
  },
  input: {
    ...typography.body,
    minHeight: 48,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: radius.sm,
    backgroundColor: lightColors.surface,
    color: lightColors.text,
  },
  inputError: {
    borderColor: lightColors.errorText,
  },
});
