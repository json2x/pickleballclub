import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { InviteAcceptForm } from '@/components/auth/invite-accept-form';
import { getVerifiedIdentity } from '@/lib/auth/identity';
import { buildLoginRedirect } from '@/lib/auth/safe-redirect';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Club Invitation | Pickleball Club' };

type InvitationPageProps = {
  params: Promise<{ token: string }>;
};

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = await params;
  const invitePath = `/invite/${encodeURIComponent(token)}`;
  const supabase = await createClient();
  const identity = await getVerifiedIdentity(supabase);

  if (!identity) {
    redirect(buildLoginRedirect(invitePath));
  }

  return (
    <main className="system-state">
      <section className="system-state__panel invite-panel" aria-labelledby="invite-title">
        <p className="system-state__eyebrow">Club invitation</p>
        <h1 className="system-state__title" id="invite-title">
          You&apos;re invited to join the club.
        </h1>
        <p>
          Accepting adds your account to this club and takes you to its dashboard. Only continue if
          you expected this invitation.
        </p>
        <InviteAcceptForm token={token} />
      </section>
    </main>
  );
}
