'use client';

import { useActionState } from 'react';

import { signUpAction } from '@/features/auth/actions';
import { INITIAL_AUTH_ACTION_STATE } from '@/lib/auth/action-state';

import { AuthFormFeedback, AuthInputField, AuthSubmitButton } from './form-controls';

export function SignUpForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signUpAction, INITIAL_AUTH_ACTION_STATE);

  return (
    <form className="auth-form auth-form-compact" action={formAction} noValidate>
      <input type="hidden" name="next" value={next} />
      <AuthFormFeedback state={state} />
      <AuthInputField
        label="Display name"
        icon="user"
        id="displayName"
        name="displayName"
        type="text"
        autoComplete="name"
        placeholder="Jordan Lee"
        defaultValue={state.values?.displayName}
        error={state.fieldErrors?.displayName}
        required
      />
      <AuthInputField
        label="Email address"
        icon="email"
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="coach@pickle-lo.club"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
        required
      />
      <AuthInputField
        label="Password"
        icon="lock"
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={state.fieldErrors?.password}
        required
      />
      <AuthInputField
        label="Confirm password"
        icon="lock"
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        error={state.fieldErrors?.confirmPassword}
        required
      />
      <div className="auth-submit-row">
        <AuthSubmitButton idle="Create Account" pending="Creating Account…" />
      </div>
    </form>
  );
}
