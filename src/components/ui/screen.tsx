import type { PropsWithChildren, ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { lightColors, spacing } from '@/theme';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  accessory?: ReactNode;
}>;

export function Screen({ children, scroll = true, contentStyle, accessory }: ScreenProps) {
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'bottom', 'left']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {accessory}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
  },
});
