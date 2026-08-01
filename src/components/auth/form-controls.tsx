'use client';

import type { ComponentProps, ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

import type { AuthActionState } from '@/lib/auth/action-state';

type AuthInputFieldProps = ComponentProps<'input'> & {
  label: string;
  error?: string[];
  icon: 'email' | 'lock' | 'user';
  labelAside?: ReactNode;
};

function AuthInputIcon({ icon }: Pick<AuthInputFieldProps, 'icon'>) {
  if (icon === 'email') {
    return (
      <svg className="auth-input-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    );
  }

  if (icon === 'user') {
    return (
      <svg className="auth-input-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.34 0-10 1.68-10 5v3h20v-3c0-3.32-6.66-5-10-5z" />
      </svg>
    );
  }

  return (
    <svg className="auth-input-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

export function AuthInputField({ label, error, icon, labelAside, id, ...props }: AuthInputFieldProps) {
  const errorId = error?.length && id ? `${id}-error` : undefined;

  return (
    <div className="auth-field">
      <div className="auth-label-row">
        <label className="auth-label" htmlFor={id}>
          {label}
        </label>
        {labelAside}
      </div>
      <div className="auth-input-wrap">
        <AuthInputIcon icon={icon} />
        <input
          className="auth-input"
          id={id}
          aria-invalid={Boolean(error?.length) || undefined}
          aria-describedby={errorId}
          {...props}
        />
      </div>
      {error?.length ? (
        <p className="auth-field-error" id={errorId} role="alert">
          {error.join(' ')}
        </p>
      ) : null}
    </div>
  );
}

export function AuthFormFeedback({ state }: { state: AuthActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <div
      className={`auth-feedback auth-feedback-${state.status}`}
      role={state.status === 'error' ? 'alert' : 'status'}
    >
      {state.message}
    </div>
  );
}

export function AuthSubmitButton({ idle, pending }: { idle: string; pending: string }) {
  const { pending: isPending } = useFormStatus();

  return (
    <button className="auth-submit" type="submit" disabled={isPending} aria-disabled={isPending}>
      {isPending ? pending : idle}
    </button>
  );
}
