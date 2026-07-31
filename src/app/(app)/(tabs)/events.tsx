import { AppText, EmptyState, Screen } from '@/components/ui';

export default function EventsScreen() {
  return <Screen><AppText variant="heading1">Events</AppText><EmptyState title="No events yet" message="Upcoming club sessions and your registration status will appear here." /></Screen>;
}
