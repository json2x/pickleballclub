'use client';

import { useActionState } from 'react';

import { forgotPasswordAction } from '@/features/auth/actions';
import {
  INITIAL_AUTH_ACTION_STATE,
  type AuthActionState,
} from '@/lib/auth/action-state';

import { AuthFormFeedback, AuthInputField, AuthSubmitButton } from './form-controls';

export function ForgotPasswordForm({
  initialState = INITIAL_AUTH_ACTION_STATE,
}: {
  initialState?: AuthActionState;
}) {
  const [state, formAction] = useActionState(forgotPasswordAction, initialState);

  return (
    <form className="auth-form" action={formAction} noValidate>
      <AuthFormFeedback state={state} />
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
      <div className="auth-submit-row">
        <AuthSubmitButton idle="Send Reset Link" pending="Sending Link…" />
      </div>
    </form>
  );
}
