import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { getClubWorkspace } from '@/features/clubs/services';
import { buildLoginRedirect } from '@/lib/auth/safe-redirect';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Member Profile | Pickle-lo',
  description: 'View player profile and performance details.',
};

type MemberDetailPageProps = {
  params: Promise<{ clubSlug: string; memberId: string }>;
};

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

  // Fetch member profile details
  const { data: memberProfile } = await supabase
    .from('profiles')
    .select('id, display_name, email, avatar_url, first_name, last_name, created_at')
    .eq('id', memberId)
    .maybeSingle();

  if (!memberProfile) {
    notFound();
  }

  // Fetch club membership
  const { data: membership } = await supabase
    .from('club_memberships')
    .select('id, role, status, joined_at')
    .eq('club_id', workspaceResult.workspace.club.id)
    .eq('user_id', memberId)
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  // Fetch player profile stats
  const { data: playerStats } = await supabase
    .from('club_player_profiles')
    .select('skill_level, rating_points, rating_trend_30d, matches_played, wins, losses, preferred_side, bio')
    .eq('club_id', workspaceResult.workspace.club.id)
    .eq('user_id', memberId)
    .maybeSingle();

  const rating = Number(playerStats?.rating_points) || 1200;
  const matches = Number(playerStats?.matches_played) || 0;
  const wins = Number(playerStats?.wins) || 0;
  const losses = Number(playerStats?.losses) || 0;
  const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
  const skill = playerStats?.skill_level || 'Intermediate (3.5)';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back Link */}
      <div>
        <Link
          href={`/${clubSlug}/members`}
          className="inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant hover:text-primary-fixed transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to Member Directory</span>
        </Link>
      </div>

      {/* Member Header Card */}
      <div className="glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-surface-container-low/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-surface-variant overflow-hidden border-2 border-primary-fixed/40 flex items-center justify-center text-on-surface-variant font-bold text-2xl">
          {memberProfile.avatar_url ? (
            <img
              src={memberProfile.avatar_url}
              alt={memberProfile.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{memberProfile.display_name.substring(0, 2).toUpperCase()}</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-md text-3xl text-on-surface">
              {memberProfile.display_name}
            </h1>
            <span className="capitalize text-xs font-semibold px-3 py-1 rounded-full bg-primary-fixed/20 text-primary-fixed border border-primary-fixed/30">
              {membership.role}
            </span>
          </div>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            {memberProfile.email || 'No public email'}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs font-label-md text-on-surface-variant">
            <span>Skill: {skill}</span>
            <span>•</span>
            <span>
              Joined: {membership.joined_at ? new Date(membership.joined_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Player Performance Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-outline-variant/30 bg-surface-container-lowest text-center">
          <div className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-1">
            Rating Points
          </div>
          <div className="font-headline-md text-3xl text-primary-fixed">{rating}</div>
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
            <span className="text-on-surface capitalize">{playerStats?.preferred_side || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-on-surface-variant font-medium">Membership Status:</span>{' '}
            <span className="text-on-surface capitalize">{membership.status}</span>
          </div>
        </div>
        {playerStats?.bio && (
          <div className="pt-2 border-t border-outline-variant/20">
            <span className="text-on-surface-variant font-medium block mb-1">Bio:</span>
            <p className="text-on-surface text-sm">{playerStats.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
