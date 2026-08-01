import { describe, expect, it } from 'vitest';

import {
  forgotPasswordSchema,
  invitationTokenSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from './validation';

describe('auth validation', () => {
  it('accepts normalized sign-in credentials', () => {
    const result = signInSchema.safeParse({
      email: '  coach@example.com ',
      password: 'password',
      next: '/club/dashboard',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('coach@example.com');
    }
  });

  it('rejects an invalid recovery email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
  });

  it('requires matching sign-up passwords and a display name', () => {
    const result = signUpSchema.safeParse({
      displayName: 'J',
      email: 'player@example.com',
      password: 'court-side-1',
      confirmPassword: 'court-side-2',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.displayName).toBeDefined();
      expect(result.error.flatten().fieldErrors.confirmPassword).toContain('Passwords do not match.');
    }
  });

  it('rejects weak reset passwords', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'short', confirmPassword: 'short' }).success,
    ).toBe(false);
  });

  it('rejects malformed invitation tokens without exposing their value', () => {
    const result = invitationTokenSchema.safeParse({ token: 'short' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('This invitation is not valid.');
      expect(result.error.message).not.toContain('short');
    }
  });
});
