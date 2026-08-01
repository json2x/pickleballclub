'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { joinClubAction } from '@/features/clubs/actions';
import { INITIAL_CLUB_ACTION_STATE } from '@/features/clubs/action-state';

import { ClubFormMessage, ClubSubmitButton } from './club-form-controls';

type JoinClubFormProps = {
  slug?: string;
  compact?: boolean;
};

export function JoinClubForm({ slug = '', compact = false }: JoinClubFormProps) {
  const [state, formAction] = useActionState(joinClubAction, INITIAL_CLUB_ACTION_STATE);

  if (state.outcome === 'pending-approval') {
    return (
      <div className="join-pending-state">
        <ClubFormMessage state={state} />
        <Link className="onboarding-text-link" href="/onboarding">
          Return to club choices
        </Link>
      </div>
    );
  }

  return (
    <form className={compact ? 'join-action-form' : 'club-form'} action={formAction} noValidate>
      <ClubFormMessage state={state} />
      {compact ? (
        <input type="hidden" name="slug" value={slug} />
      ) : (
        <Field>
          <FieldLabel htmlFor="exact-club-slug">Exact club slug</FieldLabel>
          <Input
            id="exact-club-slug"
            name="slug"
            placeholder="riverside-pickleball"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            defaultValue={state.values?.slug ?? slug}
            aria-invalid={Boolean(state.fieldErrors?.slug) || undefined}
            aria-describedby={state.fieldErrors?.slug ? 'exact-club-slug-error' : undefined}
            required
          />
          {state.fieldErrors?.slug ? (
            <FieldError id="exact-club-slug-error">{state.fieldErrors.slug.join(' ')}</FieldError>
          ) : null}
        </Field>
      )}
      <ClubSubmitButton idle={compact ? 'Join Club' : 'Join by Slug'} pending="Joining…" />
    </form>
  );
}
