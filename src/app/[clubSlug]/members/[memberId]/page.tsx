import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { MemberActionsMenu } from '@/components/members/member-actions-menu';
import { MemberRoleBadge } from '@/components/members/member-role-badge';
import { getClubWorkspace } from '@/features/clubs/services';
import { getClubMemberDetail } from '@/features/members/queries';
import { buildLoginRedirect } from '@/lib/auth/safe-redirect';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Member Profile | Pickle-lo',
  description: 'View player profile and performance details.',
};

type MemberDetailPageProps = {
  params: Promise<{ clubSlug: string; memberId: string }>;
};

function formatSkill(skill: string) {
  switch (skill) {
    case 'beginner':
      return 'Beginner (2.0–3.0)';
    case 'intermediate':
      return 'Intermediate (3.5)';
    case 'advanced':
      return 'Advanced (4.0–4.5)';
    case 'pro':
      return 'Pro / Expert (5.0+)';
    default:
      return skill;
  }
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { clubSlug, memberId } = await params;

  const workspaceResult = await getClubWorkspace(clubSlug);
  if (workspaceResult.status === 'unauthenticated') {
    redirect(buildLoginRedirect(`/${encodeURIComponent(clubSlug)}/members/${memberId}`));
  }
  if (workspaceResult.status === 'unauthorized') {
    notFound();
  }

  const supabase = await createClient();
  const member = await getClubMemberDetail(
    supabase,
    workspaceResult.workspace.club.id,
    memberId
  );

  if (!member) {
    notFound();
  }

  const matches = member.matches_played;
  const wins = member.wins;
  const losses = member.losses;
  const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
  const currentUserRole = workspaceResult.workspace.membership.role;
  const currentUserId = workspaceResult.workspace.identityId;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back Link */}
      <div>
        <Link
          href={`/${clubSlug}/members`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-primary-fixed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Member Directory</span>
        </Link>
      </div>

      {/* Member Header Card */}
      <div className="glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-surface-container-low/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-surface-variant overflow-hidden border-2 border-primary-fixed/40 flex items-center justify-center text-on-surface-variant font-bold text-2xl shrink-0">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{member.display_name.substring(0, 2).toUpperCase()}</span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-headline-md text-3xl text-on-surface">
                {member.display_name}
              </h1>
              <MemberRoleBadge role={member.role} />
            </div>
            <p className="font-body-md text-sm text-on-surface-variant mt-1">
              {member.email || 'No public email'}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-label-md text-on-surface-variant">
              <span>Skill: {formatSkill(member.skill_level)}</span>
              <span>•</span>
              <span>
                Joined: {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Member Management Actions */}
        <MemberActionsMenu
          member={{
            user_id: member.user_id,
            display_name: member.display_name,
            role: member.role,
            status: member.status,
          }}
          clubId={workspaceResult.workspace.club.id}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
        />
      </div>

      {/* Player Performance Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-outline-variant/30 bg-surface-container-lowest text-center">
          <div className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-1">
            Rating Points
          </div>
          <div className="font-headline-md text-3xl text-primary-fixed">{member.rating_points}</div>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-outline-variant/30 bg-surface-container-lowest text-center">
          <div className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-1">
            Matches Played
          </div>
          <div className="font-headline-md text-3xl text-on-surface">{matches}</div>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-outline-variant/30 bg-surface-container-lowest text-center">
          <div className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-1">
            Record (W-L)
          </div>
          <div className="font-headline-md text-3xl text-on-surface">
            {wins} - {losses}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-outline-variant/30 bg-surface-container-lowest text-center">
          <div className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-1">
            Win Rate
          </div>
          <div className="font-headline-md text-3xl text-tertiary">{winRate}%</div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="glass-panel rounded-xl p-6 border border-outline-variant/30 bg-surface-container-low/30 space-y-4">
        <h3 className="font-headline-md text-xl text-on-surface">Player Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-body-md">
          <div>
            <span className="text-on-surface-variant font-medium">Preferred Court Side:</span>{' '}
            <span className="text-on-surface capitalize">{member.preferred_side || 'No preference'}</span>
          </div>
          <div>
            <span className="text-on-surface-variant font-medium">Membership Status:</span>{' '}
            <span className="text-on-surface capitalize">{member.status}</span>
          </div>
        </div>
        {member.bio && (
          <div className="pt-2 border-t border-outline-variant/20">
            <span className="text-on-surface-variant font-medium block mb-1">Bio:</span>
            <p className="text-on-surface text-sm">{member.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
