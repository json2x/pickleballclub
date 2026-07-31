import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { lightColors } from '@/theme';

export function AuthLoadingScreen() {
  return (
    <View accessibilityLabel="Loading account" style={styles.container}>
      <ActivityIndicator color={lightColors.primaryPressed} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightColors.background,
  },
});
