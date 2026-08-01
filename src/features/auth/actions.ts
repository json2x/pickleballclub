'use server';

import { redirect } from 'next/navigation';

import type { AuthActionState } from '@/lib/auth/action-state';
import { getAuthCallbackUrl } from '@/lib/auth/callback-url';
import { getSafeRedirect } from '@/lib/auth/safe-redirect';
import {
  forgotPasswordSchema,
  getFieldErrors,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '@/lib/auth/validation';
import { createActionClient } from '@/lib/supabase/server';

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const values = {
    email: getText(formData, 'email'),
    password: getText(formData, 'password'),
    next: getText(formData, 'next'),
  };
  const parsed = signInSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: getFieldErrors(parsed.error),
      values: { email: values.email },
    };
  }

  const supabase = await createActionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: 'error',
      message: 'The email or password is incorrect.',
      values: { email: parsed.data.email },
    };
  }

  redirect(getSafeRedirect(parsed.data.next));
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const values = {
    displayName: getText(formData, 'displayName'),
    email: getText(formData, 'email'),
    password: getText(formData, 'password'),
    confirmPassword: getText(formData, 'confirmPassword'),
    next: getText(formData, 'next'),
  };
  const parsed = signUpSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: getFieldErrors(parsed.error),
      values: { displayName: values.displayName, email: values.email },
    };
  }

  const next = getSafeRedirect(parsed.data.next);
  const supabase = await createActionClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: getAuthCallbackUrl(next),
    },
  });

  if (error) {
    return {
      status: 'error',
      message: 'We could not create your account. Try again in a moment.',
      values: { displayName: parsed.data.displayName, email: parsed.data.email },
    };
  }

  if (data.session) {
    redirect(next);
  }

  return {
    status: 'success',
    message: 'Check your email to confirm your account, then return here to sign in.',
    values: { displayName: parsed.data.displayName, email: parsed.data.email },
  };
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const values = { email: getText(formData, 'email') };
  const parsed = forgotPasswordSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Enter a valid email address.',
      fieldErrors: getFieldErrors(parsed.error),
      values,
    };
  }

  const supabase = await createActionClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: getAuthCallbackUrl('/reset-password'),
  });

  return {
    status: 'success',
    message: 'If an account matches that email, a password reset link is on its way.',
    values: { email: parsed.data.email },
  };
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: getText(formData, 'password'),
    confirmPassword: getText(formData, 'confirmPassword'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  const supabase = await createActionClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return {
      status: 'error',
      message: 'This reset link is invalid or expired. Request a new one.',
    };
  }

  await supabase.auth.signOut({ scope: 'local' });
  redirect('/login?message=password-updated');
}

export async function signOutAction() {
  const supabase = await createActionClient();
  await supabase.auth.signOut({ scope: 'local' });
  redirect('/login');
}
