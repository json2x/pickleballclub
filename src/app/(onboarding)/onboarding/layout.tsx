import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { signOutAction } from '@/features/auth/actions';
import { resolveOnboardingDestination } from '@/features/clubs/services';
import { buildLoginRedirect } from '@/lib/auth/safe-redirect';
import { createClient } from '@/lib/supabase/server';

export default async function OnboardingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const access = await resolveOnboardingDestination(supabase);

  if (access.status === 'unauthenticated') {
    redirect(buildLoginRedirect('/onboarding'));
  }

  if (access.status === 'selected-club') {
    redirect(access.destination);
  }

  return (
    <div className="onboarding-shell">
      <header className="onboarding-topbar">
        <Link className="onboarding-logo-link" href="/onboarding" aria-label="Pickle-lo club setup">
          <Image
            src="/brand-assets/logo-pickle-lo-primary.png"
            width={1725}
            height={912}
            alt="Pickle-lo"
            className="onboarding-logo"
            priority
          />
        </Link>
        <div className="onboarding-progress" aria-label="Club setup progress">
          <span className="onboarding-progress-dot onboarding-progress-dot-active" />
          <span className="onboarding-progress-line" />
          <span className="onboarding-progress-dot" />
          <span className="onboarding-progress-line" />
          <span className="onboarding-progress-dot" />
          <span className="sr-only">Choose, set up, and enter your club</span>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </header>
      <div className="onboarding-canvas">{children}</div>
      <footer className="onboarding-footer">
        A club is required to open club management. You can return to these choices at any time.
      </footer>
    </div>
  );
}
