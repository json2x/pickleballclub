'use client';

import { useActionState } from 'react';

import { resetPasswordAction } from '@/features/auth/actions';
import { INITIAL_AUTH_ACTION_STATE } from '@/lib/auth/action-state';

import { AuthFormFeedback, AuthInputField, AuthSubmitButton } from './form-controls';

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, INITIAL_AUTH_ACTION_STATE);

  return (
    <form className="auth-form" action={formAction} noValidate>
      <AuthFormFeedback state={state} />
      <AuthInputField
        label="New password"
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
        <AuthSubmitButton idle="Update Password" pending="Updating Password…" />
      </div>
    </form>
  );
}
