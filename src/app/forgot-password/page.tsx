import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '@/components/auth/auth-shell';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import type { AuthActionState } from '@/lib/auth/action-state';

export const metadata: Metadata = { title: 'Forgot Password | Pickleball Club' };

type ForgotPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const initialState: AuthActionState =
    error === 'invalid-link'
      ? {
          status: 'error',
          message: 'That reset link is invalid or expired. Request a new one.',
        }
      : { status: 'idle' };

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your account email and we’ll send you a secure reset link."
      brandLead="Reset quickly."
      brandFinish="Get back in."
      footer={
        <p>
          Remembered your password?{' '}
          <Link className="auth-signup" href="/login">
            Sign In
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm initialState={initialState} />
    </AuthShell>
  );
}
