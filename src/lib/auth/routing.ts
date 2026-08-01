import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database.types';

import { getVerifiedIdentity } from './identity';

type RootRouteState = {
  authenticated: boolean;
  activeClubSlug?: string | null;
};

type ActiveMembershipReference = { club_id: string };
type VisibleClubReference = { id: string; slug: string };

export function getRootDestination({ authenticated, activeClubSlug }: RootRouteState) {
  if (!authenticated) {
    return '/login';
  }

  if (activeClubSlug) {
    return `/${encodeURIComponent(activeClubSlug)}/dashboard`;
  }

  return '/onboarding';
}

export function getFirstVisibleClubSlug(
  orderedMemberships: ActiveMembershipReference[],
  visibleClubs: VisibleClubReference[],
) {
  const slugByClubId = new Map(visibleClubs.map((club) => [club.id, club.slug]));

  for (const membership of orderedMemberships) {
    const slug = slugByClubId.get(membership.club_id);

    if (slug) {
      return slug;
    }
  }

  return null;
}

export async function getMostRecentActiveClubDestination(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data: memberships, error: membershipError } = await supabase
    .from('club_memberships')
    .select('club_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('joined_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: true });

  if (membershipError || !memberships.length) {
    return null;
  }

  const { data: clubs, error: clubError } = await supabase
    .from('clubs')
    .select('id, slug')
    .in(
      'id',
      memberships.map((membership) => membership.club_id),
    );

  if (clubError) {
    return null;
  }

  const slug = getFirstVisibleClubSlug(memberships, clubs);
  return slug ? getRootDestination({ authenticated: true, activeClubSlug: slug }) : null;
}

export async function getClubDashboardDestination(
  supabase: SupabaseClient<Database>,
  userId: string,
  clubId: string,
) {
  const { data: membership, error: membershipError } = await supabase
    .from('club_memberships')
    .select('club_id')
    .eq('user_id', userId)
    .eq('club_id', clubId)
    .eq('status', 'active')
    .maybeSingle();

  if (membershipError || !membership) {
    return null;
  }

  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .select('slug')
    .eq('id', membership.club_id)
    .maybeSingle();

  return clubError || !club ? null : getRootDestination({ authenticated: true, activeClubSlug: club.slug });
}

export async function resolveRootDestination(supabase: SupabaseClient<Database>) {
  const identity = await getVerifiedIdentity(supabase);

  if (!identity) {
    return getRootDestination({ authenticated: false });
  }

  const { data: profile, error: profileError } = await supabase.rpc('get_my_profile');

  const dashboard =
    !profileError && profile?.active_club_id
      ? await getClubDashboardDestination(supabase, identity.id, profile.active_club_id)
      : null;

  const fallbackDashboard = dashboard
    ? null
    : await getMostRecentActiveClubDestination(supabase, identity.id);

  return dashboard ?? fallbackDashboard ?? getRootDestination({ authenticated: true });
}
