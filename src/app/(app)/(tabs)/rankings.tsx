import { AppText, EmptyState, Screen } from '@/components/ui';

export default function RankingsScreen() {
  return <Screen><AppText variant="heading1">Rankings</AppText><EmptyState title="No ranked matches" message="Rankings will appear after completed, confirmed matches." /></Screen>;
}
