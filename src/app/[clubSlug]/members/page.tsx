import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { InviteMemberModal } from '@/components/members/invite-member-modal';
import { MemberDirectoryTable } from '@/components/members/member-directory-table';
import { MemberFilters } from '@/components/members/member-filters';
import { MembersSubNav } from '@/components/members/members-sub-nav';
import { getClubWorkspace } from '@/features/clubs/services';
import { getClubMembers } from '@/features/members/queries';
import { memberFilterSchema } from '@/features/members/validation';
import { buildLoginRedirect } from '@/lib/auth/safe-redirect';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Member Directory | Pickle-lo',
  description: 'Manage your club community and player directory.',
};

type MembersPageProps = {
  params: Promise<{ clubSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MembersPage({ params, searchParams }: MembersPageProps) {
  const { clubSlug } = await params;
  const rawSearchParams = await searchParams;

  const workspaceResult = await getClubWorkspace(clubSlug);
  if (workspaceResult.status === 'unauthenticated') {
    redirect(buildLoginRedirect(`/${encodeURIComponent(clubSlug)}/members`));
  }
  if (workspaceResult.status === 'unauthorized') {
    notFound();
  }

  const filters = memberFilterSchema.parse({
    search: typeof rawSearchParams.search === 'string' ? rawSearchParams.search : undefined,
    status: typeof rawSearchParams.status === 'string' ? rawSearchParams.status : undefined,
    skill: typeof rawSearchParams.skill === 'string' ? rawSearchParams.skill : undefined,
    role: typeof rawSearchParams.role === 'string' ? rawSearchParams.role : undefined,
    sortBy: typeof rawSearchParams.sortBy === 'string' ? rawSearchParams.sortBy : undefined,
    sortOrder: typeof rawSearchParams.sortOrder === 'string' ? rawSearchParams.sortOrder : undefined,
    page: typeof rawSearchParams.page === 'string' ? rawSearchParams.page : undefined,
  });

  const supabase = await createClient();
  const { members, total, page, pageSize } = await getClubMembers(
    supabase,
    workspaceResult.workspace.club.id,
    filters
  );

  return (
    <div className="space-y-6">
      {/* Page Header (Replicated Dashboard Header Styling) */}
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Club directory</p>
          <h1>Members.</h1>
          <p>Manage your club community.</p>
        </div>

        <InviteMemberModal
          clubId={workspaceResult.workspace.club.id}
          clubSlug={clubSlug}
        />
      </header>

      {/* Directory / Invitations Navigation Tabs */}
      <MembersSubNav clubSlug={clubSlug} />

      {/* Filters & Search Bar */}
      <MemberFilters />

      {/* Member Directory Table */}
      <MemberDirectoryTable
        members={members}
        clubSlug={clubSlug}
        totalMembers={total}
        currentPage={page}
        pageSize={pageSize}
        currentUserRole={workspaceResult.workspace.membership.role}
        currentUserId={workspaceResult.workspace.identityId}
      />
    </div>
  );
}
