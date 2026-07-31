import { AppText, EmptyState, Screen } from '@/components/ui';

export default function ClubsScreen() {
  return <Screen><AppText variant="heading1">Clubs</AppText><EmptyState title="No clubs connected" message="Accept a club invitation or create a club to start organizing play." /></Screen>;
}
