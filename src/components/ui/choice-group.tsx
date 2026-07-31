import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './app-text';
import { lightColors, radius, spacing } from '@/theme';

type Choice<T extends string> = {
  label: string;
  value: T;
};

export function ChoiceGroup<T extends string>({
  label,
  value,
  choices,
  onChange,
  disabled = false,
}: {
  label: string;
  value: T;
  choices: readonly Choice<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.group}>
      <AppText variant="label">{label}</AppText>
      <View accessibilityRole="radiogroup" style={styles.choices}>
        {choices.map((choice) => {
          const selected = choice.value === value;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              key={choice.value}
              onPress={() => onChange(choice.value)}
              style={({ pressed }) => [
                styles.choice,
                selected && styles.selected,
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
              ]}
            >
              <AppText variant="label">{choice.label}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing[2] },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  choice: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: radius.full,
    backgroundColor: lightColors.surface,
  },
  selected: { borderColor: lightColors.primary, backgroundColor: lightColors.surfaceSubtle },
  pressed: { borderColor: lightColors.focus },
  disabled: { opacity: 0.5 },
});
