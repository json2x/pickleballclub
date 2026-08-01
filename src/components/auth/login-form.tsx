'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { signInAction } from '@/features/auth/actions';
import {
  INITIAL_AUTH_ACTION_STATE,
  type AuthActionState,
} from '@/lib/auth/action-state';

import { AuthFormFeedback, AuthInputField, AuthSubmitButton } from './form-controls';

type LoginFormProps = {
  next: string;
  initialState?: AuthActionState;
};

export function LoginForm({ next, initialState = INITIAL_AUTH_ACTION_STATE }: LoginFormProps) {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form className="auth-form" action={formAction} noValidate>
      <input type="hidden" name="next" value={next} />
      <AuthFormFeedback state={state} />
      <AuthInputField
        label="Email address"
        icon="email"
        id="email"
        name="email"
        type="email"
        placeholder="coach@pickle-lo.club"
        autoComplete="email"
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
        placeholder="••••••••"
        autoComplete="current-password"
        error={state.fieldErrors?.password}
        labelAside={
          <Link className="auth-link" href="/forgot-password">
            Forgot password?
          </Link>
        }
        required
      />
      <div className="auth-submit-row">
        <AuthSubmitButton idle="Sign In" pending="Signing In…" />
      </div>
    </form>
  );
}
