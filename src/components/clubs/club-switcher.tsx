'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { switchClubAction } from '@/features/clubs/actions';
import { INITIAL_CLUB_ACTION_STATE } from '@/features/clubs/action-state';
import type { ClubChoice } from '@/features/clubs/services';

import { ClubFormMessage } from './club-form-controls';

type ClubSwitcherProps = {
  currentClubId: string;
  choices: ClubChoice[];
};

export function ClubSwitcher({ currentClubId, choices }: ClubSwitcherProps) {
  const [state, formAction, pending] = useActionState(switchClubAction, INITIAL_CLUB_ACTION_STATE);

  return (
    <form className="club-switcher" action={formAction}>
      <label htmlFor="active-club">Current club</label>
      <div className="club-switcher-control">
        <select id="active-club" name="clubId" defaultValue={currentClubId} disabled={pending}>
          {choices.map((club) => (
            <option value={club.id} key={club.id}>
              {club.name} · {club.role}
            </option>
          ))}
        </select>
        <Button type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? 'Switching…' : 'Switch'}
        </Button>
      </div>
      <ClubFormMessage state={state} />
    </form>
  );
}
