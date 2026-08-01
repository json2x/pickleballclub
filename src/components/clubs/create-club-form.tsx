'use client';

import { useActionState } from 'react';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { createClubAction } from '@/features/clubs/actions';
import { INITIAL_CLUB_ACTION_STATE } from '@/features/clubs/action-state';

import { ClubFormMessage, ClubSubmitButton } from './club-form-controls';

function describedBy(errorId: string, descriptionId?: string) {
  return descriptionId ? `${descriptionId} ${errorId}` : errorId;
}

export function CreateClubForm() {
  const [state, formAction] = useActionState(createClubAction, INITIAL_CLUB_ACTION_STATE);

  return (
    <form className="club-form" action={formAction} noValidate>
      <ClubFormMessage state={state} />

      <div className="club-form-grid">
        <Field>
          <FieldLabel htmlFor="name">Club name</FieldLabel>
          <Input
            id="name"
            name="name"
            autoComplete="organization"
            placeholder="Riverside Pickleball Club"
            defaultValue={state.values?.name}
            aria-invalid={Boolean(state.fieldErrors?.name) || undefined}
            aria-describedby={state.fieldErrors?.name ? 'name-error' : undefined}
            required
          />
          {state.fieldErrors?.name ? (
            <FieldError id="name-error">{state.fieldErrors.name.join(' ')}</FieldError>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <Input
            id="location"
            name="location"
            placeholder="Quezon City, Metro Manila"
            defaultValue={state.values?.location}
            aria-invalid={Boolean(state.fieldErrors?.location) || undefined}
            aria-describedby={state.fieldErrors?.location ? 'location-error' : undefined}
            required
          />
          {state.fieldErrors?.location ? (
            <FieldError id="location-error">{state.fieldErrors.location.join(' ')}</FieldError>
          ) : null}
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="slug">Club URL</FieldLabel>
        <div className="club-slug-control">
          <span aria-hidden="true">pickle-lo.club/</span>
          <Input
            id="slug"
            name="slug"
            placeholder="riverside-pickleball"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            defaultValue={state.values?.slug}
            aria-invalid={Boolean(state.fieldErrors?.slug) || undefined}
            aria-describedby={describedBy('slug-help', state.fieldErrors?.slug ? 'slug-error' : undefined)}
            required
          />
        </div>
        <FieldDescription id="slug-help">
          Lowercase letters, numbers, and single hyphens only.
        </FieldDescription>
        {state.fieldErrors?.slug ? (
          <FieldError id="slug-error">{state.fieldErrors.slug.join(' ')}</FieldError>
        ) : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="joinPolicy">How can players join?</FieldLabel>
        <select
          className="club-form-control"
          id="joinPolicy"
          name="joinPolicy"
          defaultValue={state.values?.joinPolicy ?? 'approval'}
          aria-invalid={Boolean(state.fieldErrors?.joinPolicy) || undefined}
          aria-describedby={state.fieldErrors?.joinPolicy ? 'join-policy-error' : undefined}
        >
          <option value="approval">Request approval</option>
          <option value="open">Join instantly</option>
          <option value="invite_only">Invitation only</option>
        </select>
        {state.fieldErrors?.joinPolicy ? (
          <FieldError id="join-policy-error">{state.fieldErrors.joinPolicy.join(' ')}</FieldError>
        ) : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
        <textarea
          className="club-form-control club-form-textarea"
          id="description"
          name="description"
          placeholder="Tell members what makes your club special."
          defaultValue={state.values?.description}
          aria-invalid={Boolean(state.fieldErrors?.description) || undefined}
          aria-describedby={state.fieldErrors?.description ? 'description-error' : undefined}
        />
        {state.fieldErrors?.description ? (
          <FieldError id="description-error">{state.fieldErrors.description.join(' ')}</FieldError>
        ) : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="timezone">Timezone (optional)</FieldLabel>
        <Input
          id="timezone"
          name="timezone"
          placeholder="Asia/Manila"
          autoComplete="off"
          defaultValue={state.values?.timezone}
          aria-invalid={Boolean(state.fieldErrors?.timezone) || undefined}
          aria-describedby={describedBy(
            'timezone-help',
            state.fieldErrors?.timezone ? 'timezone-error' : undefined,
          )}
        />
        <FieldDescription id="timezone-help">Use an IANA timezone such as Asia/Manila.</FieldDescription>
        {state.fieldErrors?.timezone ? (
          <FieldError id="timezone-error">{state.fieldErrors.timezone.join(' ')}</FieldError>
        ) : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="logo">Club logo (optional)</FieldLabel>
        <input
          className="club-file-input"
          id="logo"
          name="logo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-invalid={Boolean(state.fieldErrors?.logo) || undefined}
          aria-describedby={describedBy(
            'logo-help',
            state.fieldErrors?.logo ? 'logo-error' : undefined,
          )}
        />
        <FieldDescription id="logo-help">
          JPEG, PNG, or WebP. Maximum 5 MiB. The original filename is not stored.
        </FieldDescription>
        {state.fieldErrors?.logo ? (
          <FieldError id="logo-error">{state.fieldErrors.logo.join(' ')}</FieldError>
        ) : null}
      </Field>

      <div className="club-form-actions">
        <ClubSubmitButton idle="Create Club" pending="Creating Club…" />
      </div>
    </form>
  );
}
