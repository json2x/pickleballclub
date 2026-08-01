import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import type { AuthActionState } from '@/lib/auth/action-state';
import { getSafeRedirect } from '@/lib/auth/safe-redirect';

export const metadata: Metadata = { title: 'Sign In | Pickleball Club' };

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = getSafeRedirect(firstValue(params.next));
  const message = firstValue(params.message);
  const error = firstValue(params.error);
  let initialState: AuthActionState = { status: 'idle' };

  if (message === 'password-updated') {
    initialState = { status: 'success', message: 'Your password was updated. Sign in to continue.' };
  } else if (error === 'callback') {
    initialState = {
      status: 'error',
      message: 'That sign-in link is invalid or expired. Try signing in again.',
    };
  }

  const signUpHref = next === '/' ? '/sign-up' : `/sign-up?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell
      title="Sign In"
      subtitle="Welcome back to the premier league management tool."
      footer={
        <p>
          Don&apos;t have an account?{' '}
          <Link className="auth-signup" href={signUpHref}>
            Sign Up
          </Link>
        </p>
      }
    >
      <LoginForm next={next} initialState={initialState} />
    </AuthShell>
  );
}
