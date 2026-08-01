import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '@/components/auth/auth-shell';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { getSafeRedirect } from '@/lib/auth/safe-redirect';

export const metadata: Metadata = { title: 'Sign Up | Pickleball Club' };

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const nextValue = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = getSafeRedirect(nextValue);
  const loginHref = next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell
      title="Create Account"
      subtitle="Join Pickle-lo and make every club day easier to run."
      brandLead="Join the club."
      brandFinish="Play together."
      purpleBrand
      footer={
        <p>
          Already have an account?{' '}
          <Link className="auth-signup" href={loginHref}>
            Sign In
          </Link>
        </p>
      }
    >
      <SignUpForm next={next} />
    </AuthShell>
  );
}
