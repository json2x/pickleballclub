import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export type MemberListItem = {
  user_id: string;
  display_name: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  membership_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending' | 'inactive';
  joined_at: string | null;
  skill_level: string;
  rating_points: number;
  rating_trend_30d: number;
  matches_played: number;
  wins: number;
  losses: number;
  preferred_side: string;
  bio: string | null;
  avatar_path: string | null;
};

export type MemberDetail = MemberListItem & {
  profile_created_at: string;
};

export type InvitationListItem = {
  id: string;
  email: string;
  role: 'admin' | 'member';
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  accepted_by: string | null;
  invited_by: string;
  invited_by_name: string | null;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
};

export async function getClubMembers(
  supabase: SupabaseClient<Database>,
  clubId: string,
  filters: {
    search?: string;
    status?: string;
    skill?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    pageSize?: number;
  }
) {
  const { data, error } = await supabase.rpc('get_club_members', {
    p_club_id: clubId,
    p_search: filters.search,
    p_status: filters.status,
    p_skill: filters.skill,
    p_role: filters.role,
    p_sort_by: filters.sortBy,
    p_sort_order: filters.sortOrder,
    p_page: filters.page,
    p_page_size: filters.pageSize,
  });

  if (error) {
    throw new Error('Unable to load club members.');
  }

  const result = (data as Record<string, unknown> | null) ?? {};

  return {
    members: (result.members as MemberListItem[]) ?? [],
    total: typeof result.total === 'number' ? result.total : 0,
    page: typeof result.page === 'number' ? result.page : 1,
    pageSize: typeof result.page_size === 'number' ? result.page_size : 50,
  };
}

export async function getClubMemberDetail(
  supabase: SupabaseClient<Database>,
  clubId: string,
  userId: string
): Promise<MemberDetail | null> {
  const { data, error } = await supabase.rpc('get_club_member_detail', {
    p_club_id: clubId,
    p_user_id: userId,
  });

  if (error || !data) {
    return null;
  }

  return data as unknown as MemberDetail;
}

export async function getClubInvitations(
  supabase: SupabaseClient<Database>,
  clubId: string,
  statusFilter?: string
): Promise<InvitationListItem[]> {
  const { data, error } = await supabase.rpc('get_club_invitations', {
    p_club_id: clubId,
    p_status_filter: statusFilter,
  });

  if (error || !data) {
    return [];
  }

  return data as unknown as InvitationListItem[];
}
