import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MemberListItem } from '@/features/members/queries';
import { MemberActionsMenu } from './member-actions-menu';

interface MemberDirectoryTableProps {
  members: MemberListItem[];
  clubSlug: string;
  totalMembers?: number;
  currentPage?: number;
  pageSize?: number;
  currentUserRole?: 'owner' | 'admin' | 'member';
  currentUserId?: string;
}

function getInitials(name: string) {
  return name.substring(0, 2).toUpperCase();
}

function formatSubtitle(role: string, skill: string) {
  if (role === 'owner') return 'Club Owner';
  if (role === 'admin') return 'Club Admin';
  switch (skill) {
    case 'beginner':
      return 'Beginner';
    case 'intermediate':
      return 'Intermediate';
    case 'advanced':
      return 'Advanced';
    case 'pro':
      return 'Pro Player';
    default:
      return 'Member';
  }
}

export function MemberDirectoryTable({
  members,
  clubSlug,
  totalMembers = members.length,
  currentPage = 1,
  pageSize = 20,
  currentUserRole = 'member',
  currentUserId = '',
}: MemberDirectoryTableProps) {
  if (!members || members.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <h3 className="text-lg font-headline-md text-slate-800 mb-2">No members found</h3>
        <p className="text-slate-500 font-body-md text-sm">
          Try adjusting your filters or invite new members to join the club.
        </p>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalMembers);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
      {/* Mobile Card Layout */}
      <div className="block md:hidden divide-y divide-slate-100">
        {members.map((member, index) => {
          const rank = startIndex + index;
          const winRate =
            member.matches_played > 0
              ? Math.round((member.wins / member.matches_played) * 100)
              : 0;

          return (
            <Link
              key={member.user_id}
              href={`/${clubSlug}/members/${member.user_id}`}
              className="block p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-slate-700 w-6">
                    #{rank}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold overflow-hidden border border-slate-200 shrink-0">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.display_name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(member.display_name)
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{member.display_name}</div>
                    <div className="text-xs text-slate-500">{formatSubtitle(member.role, member.skill_level)}</div>
                  </div>
                </div>
                {/* 30d Trend Pill */}
                {member.rating_trend_30d > 0 ? (
                  <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    <TrendingUp className="w-3 h-3" />+{member.rating_trend_30d}
                  </span>
                ) : member.rating_trend_30d < 0 ? (
                  <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    <TrendingDown className="w-3 h-3" />{member.rating_trend_30d}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    <Minus className="w-3 h-3" /> 0
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm pt-1">
                <div>
                  <div className="text-slate-400 text-xs font-medium">Rating DUPR</div>
                  <div className="font-semibold text-slate-800">{member.rating_points}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs font-medium">Win Rate</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">{winRate}%</span>
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#476800]" style={{ width: `${winRate}%` }} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-xs font-medium">Matches</div>
                  <div className="font-medium text-slate-700">{member.matches_played}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Desktop Table Layout (1:1 Stitch Parity with Image 1) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-200/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-4 w-16">Rank</th>
              <th className="px-6 py-4">Player</th>
              <th className="px-6 py-4">Rating DUPR</th>
              <th className="px-6 py-4">30d Trend</th>
              <th className="px-6 py-4">Matches</th>
              <th className="px-6 py-4">Win Rate</th>
              <th className="px-6 py-4">Last Played</th>
              <th className="px-6 py-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member, index) => {
              const rank = startIndex + index;
              const winRate =
                member.matches_played > 0
                  ? Math.round((member.wins / member.matches_played) * 100)
                  : 0;

              return (
                <tr key={member.user_id} className="hover:bg-slate-50/70 transition-colors group">
                  {/* Rank */}
                  <td className="px-6 py-4 font-semibold text-slate-800 text-sm">
                    #{rank}
                  </td>

                  {/* Player info (Avatar + Name + Subtitle) */}
                  <td className="px-6 py-4">
                    <Link href={`/${clubSlug}/members/${member.user_id}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center text-slate-500 font-semibold shrink-0">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.display_name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(member.display_name)
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm group-hover:text-[#476800] transition-colors">
                          {member.display_name}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {formatSubtitle(member.role, member.skill_level)}
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* Rating DUPR */}
                  <td className="px-6 py-4 font-semibold text-slate-800 text-sm">
                    {member.rating_points}
                  </td>

                  {/* 30d Trend (Pill Badge matching Stitch Image 1) */}
                  <td className="px-6 py-4">
                    {member.rating_trend_30d > 0 ? (
                      <div className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{member.rating_trend_30d}
                      </div>
                    ) : member.rating_trend_30d < 0 ? (
                      <div className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <TrendingDown className="w-3.5 h-3.5" />
                        {member.rating_trend_30d}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full text-xs font-medium">
                        <Minus className="w-3.5 h-3.5 text-slate-400" />
                        0
                      </div>
                    )}
                  </td>

                  {/* Matches */}
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {member.matches_played}
                  </td>

                  {/* Win Rate with Progress Bar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-medium text-slate-800 min-w-[36px]">{winRate}%</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#476800] transition-all rounded-full"
                          style={{ width: `${winRate}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Last Played */}
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">
                    {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'Today'}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 pr-6 text-right">
                    <MemberActionsMenu
                      member={{
                        user_id: member.user_id,
                        display_name: member.display_name,
                        role: member.role,
                        status: member.status,
                      }}
                      clubId={clubSlug}
                      currentUserRole={currentUserRole}
                      currentUserId={currentUserId}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (Stitch Screen Parity with Image 1) */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
        <span className="text-sm text-slate-500 font-medium">
          Showing {startIndex} to {endIndex} of {totalMembers} members
        </span>
        <div className="flex gap-2">
          <button
            disabled={currentPage <= 1}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={endIndex >= totalMembers}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
