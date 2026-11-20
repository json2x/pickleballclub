import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { InvitationsTable } from '@/components/members/invitations-table';
import { InviteMemberModal } from '@/components/members/invite-member-modal';
import { MembersSubNav } from '@/components/members/members-sub-nav';
import { getClubWorkspace } from '@/features/clubs/services';
import { getClubInvitations } from '@/features/members/queries';
import { buildLoginRedirect } from '@/lib/auth/safe-redirect';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Club Invitations | Pickle-lo',
  description: 'View and manage invitations issued for your pickleball club.',
};

type InvitationsPageProps = {
  params: Promise<{ clubSlug: string }>;
};

export default async function InvitationsPage({ params }: InvitationsPageProps) {
  const { clubSlug } = await params;

  const workspaceResult = await getClubWorkspace(clubSlug);
  if (workspaceResult.status === 'unauthenticated') {
    redirect(buildLoginRedirect(`/${encodeURIComponent(clubSlug)}/members/invitations`));
  }
  if (workspaceResult.status === 'unauthorized') {
    notFound();
  }

  const supabase = await createClient();
  const invitations = await getClubInvitations(supabase, workspaceResult.workspace.club.id);

  return (
    <div className="space-y-6">
      {/* Page Header (Dashboard Header Parity) */}
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Club invitations</p>
          <h1>Invitations.</h1>
          <p>Track and manage pending and accepted member invitations.</p>
        </div>

        <InviteMemberModal
          clubId={workspaceResult.workspace.club.id}
          clubSlug={clubSlug}
        />
      </header>

      {/* Sub navigation (Directory vs Invitations) */}
      <MembersSubNav clubSlug={clubSlug} />

      {/* Invitations Table */}
      <InvitationsTable
        invitations={invitations}
        clubId={workspaceResult.workspace.club.id}
        clubSlug={clubSlug}
      />
    </div>
  );
}
