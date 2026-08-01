'use client';

import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import type { ClubActionState } from '@/features/clubs/action-state';

export function ClubFormMessage({ state }: { state: ClubActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <div
      className={`club-form-message club-form-message-${state.status}`}
      role={state.status === 'error' ? 'alert' : 'status'}
    >
      {state.message}
    </div>
  );
}

export function ClubSubmitButton({ idle, pending }: { idle: string; pending: string }) {
  const { pending: isPending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={isPending} aria-disabled={isPending}>
      {isPending ? pending : idle}
    </Button>
  );
}
