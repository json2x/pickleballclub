import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from './login-form';

vi.mock('@/features/auth/actions', () => ({
  signInAction: vi.fn(),
}));

afterEach(cleanup);

describe('LoginForm state rendering', () => {
  it('associates server field errors with invalid inputs', () => {
    render(
      <LoginForm
        next="/"
        initialState={{
          status: 'error',
          message: 'Check the highlighted fields and try again.',
          fieldErrors: { email: ['Enter a valid email address.'] },
          values: { email: 'invalid' },
        }}
      />,
    );

    const email = screen.getByLabelText('Email address');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Enter a valid email address.');
    expect(email).toHaveValue('invalid');
  });

  it('renders generic credential feedback without provider details', () => {
    render(
      <LoginForm
        next="/"
        initialState={{ status: 'error', message: 'The email or password is incorrect.' }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('The email or password is incorrect.');
  });

  it('renders success feedback returned by a completed auth flow', () => {
    render(
      <LoginForm
        next="/"
        initialState={{
          status: 'success',
          message: 'Your password was updated. Sign in to continue.',
        }}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Your password was updated. Sign in to continue.',
    );
  });
});
