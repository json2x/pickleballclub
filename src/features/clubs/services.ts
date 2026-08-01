import type { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

import { getVerifiedIdentity } from '@/lib/auth/identity';
import {
  getClubDashboardDestination,
  getMostRecentActiveClubDestination,
} from '@/lib/auth/routing';
import { createClient } from '@/lib/supabase/server';
import type { Database, Enums, Tables } from '@/types/database.types';

import { CLUB_ASSET_BUCKET, CLUB_LOGO_SIGNED_URL_SECONDS } from './logo';

export type ClubChoice = Pick<Tables<'clubs'>, 'id' | 'name' | 'slug'> & {
  role: Enums<'club_role'>;
};

export type ClubWorkspace = {
  identityId: string;
  profile: Database['public']['Functions']['get_my_profile']['Returns'];
  club: Tables<'clubs'>;
  membership: Pick<Tables<'club_memberships'>, 'id' | 'role' | 'status'>;
  clubChoices: ClubChoice[];
  logoUrl: string | null;
};

export type ClubWorkspaceResult =
  | { status: 'unauthenticated' }
  | { status: 'unauthorized' }
  | { status: 'ready'; workspace: ClubWorkspace };

export type DashboardMetrics = {
  activeMemberCount: number;
  pendingMembershipCount?: number;
  outstandingInvitationCount?: number;
};

export function canManageClub(role: Enums<'club_role'>) {
  return role === 'owner' || role === 'admin';
}

export async function resolveOnboardingDestination(supabase: SupabaseClient<Database>) {
  const identity = await getVerifiedIdentity(supabase);

  if (!identity) {
    return { status: 'unauthenticated' as const };
  }

  const { data: profile, error } = await supabase.rpc('get_my_profile');

  const selectedDestination = !error && profile?.active_club_id
    ? await getClubDashboardDestination(supabase, identity.id, profile.active_club_id)
    : null;
  const destination =
    selectedDestination ?? (await getMostRecentActiveClubDestination(supabase, identity.id));

  if (destination) {
    return { status: 'selected-club' as const, destination };
  }

  if (error || !profile) {
    throw new Error('Unable to load onboarding profile.');
  }

  return { status: 'ready' as const, profile };
}

async function loadClubChoices(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ClubChoice[]> {
  const { data: memberships, error: membershipError } = await supabase
    .from('club_memberships')
    .select('club_id, role')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (membershipError) {
    throw new Error('Unable to load club memberships.');
  }

  if (!memberships.length) {
    return [];
  }

  const roleByClub = new Map(memberships.map((membership) => [membership.club_id, membership.role]));
  const { data: clubs, error: clubError } = await supabase
    .from('clubs')
    .select('id, name, slug')
    .in(
      'id',
      memberships.map((membership) => membership.club_id),
    );

  if (clubError) {
    throw new Error('Unable to load clubs.');
  }

  return clubs
    .flatMap((club) => {
      const role = roleByClub.get(club.id);
      return role ? [{ ...club, role }] : [];
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function getSignedClubLogoUrl(
  supabase: SupabaseClient<Database>,
  logoPath: string | null,
) {
  if (!logoPath) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(CLUB_ASSET_BUCKET)
    .createSignedUrl(logoPath, CLUB_LOGO_SIGNED_URL_SECONDS);

  return error || !data?.signedUrl ? null : data.signedUrl;
}

export const getClubWorkspace = cache(async (clubSlug: string): Promise<ClubWorkspaceResult> => {
  const supabase = await createClient();
  const identity = await getVerifiedIdentity(supabase);

  if (!identity) {
    return { status: 'unauthenticated' };
  }

  const [{ data: profile, error: profileError }, { data: club, error: clubError }] =
    await Promise.all([
      supabase.rpc('get_my_profile'),
      supabase.from('clubs').select('*').eq('slug', clubSlug).maybeSingle(),
    ]);

  if (clubError || !club) {
    return { status: 'unauthorized' };
  }

  if (profileError || !profile) {
    throw new Error('Unable to load club workspace.');
  }

  const { data: membership, error: membershipError } = await supabase
    .from('club_memberships')
    .select('id, role, status')
    .eq('club_id', club.id)
    .eq('user_id', identity.id)
    .eq('status', 'active')
    .maybeSingle();

  if (membershipError || !membership) {
    return { status: 'unauthorized' };
  }

  const [clubChoices, logoUrl] = await Promise.all([
    loadClubChoices(supabase, identity.id),
    getSignedClubLogoUrl(supabase, club.logo_path),
  ]);

  return {
    status: 'ready',
    workspace: {
      identityId: identity.id,
      profile,
      club,
      membership,
      clubChoices,
      logoUrl,
    },
  };
});

export async function searchJoinableClubs(query: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('search_joinable_clubs', {
    p_query: query || undefined,
  });

  return error
    ? { status: 'error' as const, clubs: [] }
    : { status: 'ready' as const, clubs: data ?? [] };
}

async function getCount(
  query: PromiseLike<{ count: number | null; error: { message: string } | null }>,
) {
  const { count, error } = await query;

  if (error) {
    throw new Error('Unable to load dashboard metrics.');
  }

  return count ?? 0;
}

export async function getDashboardMetrics(
  clubId: string,
  role: Enums<'club_role'>,
): Promise<DashboardMetrics> {
  const supabase = await createClient();
  const activeMemberCount = await getCount(
    supabase
      .from('club_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .eq('status', 'active'),
  );

  if (!canManageClub(role)) {
    return { activeMemberCount };
  }

  const [pendingMembershipCount, outstandingInvitationCount] = await Promise.all([
    getCount(
      supabase
        .from('club_memberships')
        .select('id', { count: 'exact', head: true })
        .eq('club_id', clubId)
        .eq('status', 'pending'),
    ),
    getCount(
      supabase
        .from('club_invitations')
        .select('id', { count: 'exact', head: true })
        .eq('club_id', clubId)
        .is('accepted_at', null)
        .is('revoked_at', null)
        .gt('expires_at', new Date().toISOString()),
    ),
  ]);

  return { activeMemberCount, pendingMembershipCount, outstandingInvitationCount };
}
