import type { PropsWithChildren } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText, Card, Screen } from '@/components/ui';
import { lightColors, palette, radius, spacing } from '@/theme';

type AuthScaffoldProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
}>;

export function AuthScaffold({ eyebrow, title, description, children }: AuthScaffoldProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <Screen contentStyle={[styles.screen, isWide && styles.screenWide]}>
      <View style={[styles.brandPanel, isWide && styles.brandPanelWide]}>
        <View style={styles.courtMark} accessibilityElementsHidden>
          <View style={styles.courtLineHorizontal} />
          <View style={styles.courtLineVertical} />
          <View style={[styles.ballHole, styles.ballHoleOne]} />
          <View style={[styles.ballHole, styles.ballHoleTwo]} />
          <View style={[styles.ballHole, styles.ballHoleThree]} />
        </View>
        <AppText variant="label" style={styles.brandName}>PICKLEBALL CLUB</AppText>
        <AppText variant={isWide ? 'displayLg' : 'heading1'} style={styles.brandHeadline}>
          Club play, organized.
        </AppText>
        <AppText variant="bodyLg" style={styles.brandCopy}>
          Run fairer rounds, keep every court moving, and make the next match clear to everyone.
        </AppText>
      </View>

      <Card style={[styles.formCard, isWide && styles.formCardWide]}>
        <View style={styles.header}>
          <AppText variant="label" color="link">{eyebrow}</AppText>
          <AppText variant="heading2">{title}</AppText>
          <AppText color="muted">{description}</AppText>
        </View>
        {children}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    gap: spacing[6],
    maxWidth: 520,
  },
  screenWide: {
    maxWidth: 1120,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: spacing[10],
  },
  brandPanel: {
    overflow: 'hidden',
    minHeight: 240,
    justifyContent: 'flex-end',
    gap: spacing[3],
    padding: spacing[6],
    borderRadius: radius.xl,
    backgroundColor: palette.court[900],
  },
  brandPanelWide: {
    flex: 1.1,
    minHeight: 620,
    padding: spacing[10],
  },
  brandName: {
    color: palette.pickle[300],
    letterSpacing: 1.8,
  },
  brandHeadline: {
    color: lightColors.surface,
    maxWidth: 440,
  },
  brandCopy: {
    color: palette.court[100],
    maxWidth: 480,
  },
  formCard: {
    gap: spacing[6],
  },
  formCardWide: {
    flex: 0.9,
    justifyContent: 'center',
    padding: spacing[10],
    borderRadius: radius.xl,
  },
  header: {
    gap: spacing[2],
  },
  courtMark: {
    position: 'absolute',
    top: -72,
    right: -54,
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: palette.court[700],
    borderRadius: radius.full,
    backgroundColor: palette.pickle[500],
    opacity: 0.92,
  },
  courtLineHorizontal: {
    position: 'absolute',
    top: 128,
    left: 22,
    width: 216,
    height: 2,
    backgroundColor: palette.pickle[200],
  },
  courtLineVertical: {
    position: 'absolute',
    top: 22,
    left: 128,
    width: 2,
    height: 216,
    backgroundColor: palette.pickle[200],
  },
  ballHole: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: palette.court[900],
  },
  ballHoleOne: { left: 65, top: 75 },
  ballHoleTwo: { left: 165, top: 105 },
  ballHoleThree: { left: 104, top: 178 },
});
