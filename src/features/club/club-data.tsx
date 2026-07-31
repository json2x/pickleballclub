import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';

import { useAuth } from '@/features/auth/auth-provider';
import { supabase } from '@/services/supabase/client';
import type { Enums, Tables, TablesInsert, TablesUpdate } from '@/types/database';

export type Profile = Tables<'profiles'>;
export type Club = Tables<'clubs'>;
export type Membership = Tables<'club_memberships'>;
export type RoleAssignment = Tables<'club_role_assignments'>;
export type PlayerProfile = Tables<'player_profiles'>;
export type Event = Tables<'events'>;
export type Registration = Tables<'event_registrations'>;
export type Court = Tables<'courts'>;
export type EventRound = Tables<'event_rounds'>;
export type Match = Tables<'matches'>;
export type MatchParticipant = Tables<'match_participants'>;
export type ScoreEvent = Tables<'score_events'>;
export type Announcement = Tables<'announcements'>;
export type RatingHistory = Tables<'rating_history'>;
export type ClubRole = Enums<'club_role'>;
export type EventFormat = Enums<'event_format'>;
export type EventStatus = Enums<'event_status'>;
export type AvailabilityStatus = Enums<'availability_status'>;
export type AnnouncementStatus = Enums<'announcement_status'>;

const eventFormats: readonly EventFormat[] = ['singles', 'doubles', 'mixed_doubles', 'open_play'];
const eventStatuses: readonly EventStatus[] = ['draft', 'published', 'check_in_open', 'active', 'paused', 'completed', 'cancelled'];
const clubRoles: readonly ClubRole[] = ['administrator', 'event_organizer', 'court_marshal', 'scorekeeper', 'member', 'guest'];
const announcementStatuses: readonly AnnouncementStatus[] = ['draft', 'published', 'archived'];
const playPreferences: readonly Enums<'play_preference'>[] = ['competitive', 'balanced', 'social'];
const preferredFormats: readonly Enums<'preferred_format'>[] = ['singles', 'doubles', 'either'];
const preferredSides: readonly Enums<'preferred_side'>[] = ['left', 'right', 'either'];

export type ActiveClubData = {
  profile: Profile;
  memberships: Membership[];
  clubs: Club[];
  roles: RoleAssignment[];
  playerProfiles: PlayerProfile[];
};

export type ClubBundle = {
  events: Event[];
  memberships: Membership[];
  roles: RoleAssignment[];
  playerProfiles: PlayerProfile[];
  registrations: Registration[];
  courts: Court[];
  rounds: EventRound[];
  matches: Match[];
  participants: MatchParticipant[];
  scoreEvents: ScoreEvent[];
  announcements: Announcement[];
  ratingHistory: RatingHistory[];
};

type ActiveClubContextValue = {
  profile: Profile | null;
  memberships: Membership[];
  clubs: Club[];
  roles: RoleAssignment[];
  playerProfiles: PlayerProfile[];
  activeClub: Club | null;
  activeMembership: Membership | null;
  activeRoles: ClubRole[];
  activeClubId: string | null;
  setActiveClubId: (clubId: string) => void;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

const ActiveClubContext = createContext<ActiveClubContextValue | null>(null);

export const queryKeys = {
  activeClubData: (userId: string | undefined) => ['active-club-data', userId] as const,
  clubBundle: (clubId: string | null | undefined) => ['club-bundle', clubId] as const,
};

function getClient() {
  if (!supabase) throw new Error('Supabase is not configured. Add the Expo public Supabase URL and publishable key.');
  return supabase;
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function byCreatedDesc(left: { created_at: string }, right: { created_at: string }) {
  return right.created_at.localeCompare(left.created_at);
}

function buildSlug(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug || `club-${Date.now()}`;
}

async function fetchActiveClubData(userId: string): Promise<ActiveClubData> {
  const client = getClient();
  const { data: profile, error: profileError } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();
  throwIfError(profileError);
  if (!profile) throw new Error('Your account profile is not ready yet. Sign out and sign in again to refresh it.');

  const { data: memberships, error: membershipError } = await client
    .from('club_memberships')
    .select('*')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false });
  throwIfError(membershipError);

  const safeMemberships = memberships ?? [];
  const membershipIds = safeMemberships.map((membership) => membership.id);
  const clubIds = Array.from(new Set(safeMemberships.map((membership) => membership.club_id)));

  const [rolesResult, clubsResult, playerProfilesResult] = await Promise.all([
    membershipIds.length
      ? client.from('club_role_assignments').select('*').in('membership_id', membershipIds)
      : Promise.resolve({ data: [] as RoleAssignment[], error: null }),
    clubIds.length
      ? client.from('clubs').select('*').in('id', clubIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as Club[], error: null }),
    membershipIds.length
      ? client.from('player_profiles').select('*').in('membership_id', membershipIds)
      : Promise.resolve({ data: [] as PlayerProfile[], error: null }),
  ]);

  throwIfError(rolesResult.error);
  throwIfError(clubsResult.error);
  throwIfError(playerProfilesResult.error);

  return {
    profile,
    memberships: safeMemberships,
    roles: rolesResult.data ?? [],
    clubs: clubsResult.data ?? [],
    playerProfiles: playerProfilesResult.data ?? [],
  };
}

async function fetchClubBundle(clubId: string): Promise<ClubBundle> {
  const client = getClient();
  const [eventsResult, membershipsResult, announcementsResult] = await Promise.all([
    client.from('events').select('*').eq('club_id', clubId).order('starts_at', { ascending: true }),
    client.from('club_memberships').select('*').eq('club_id', clubId).order('display_name', { ascending: true }),
    client.from('announcements').select('*').eq('club_id', clubId).order('created_at', { ascending: false }),
  ]);

  throwIfError(eventsResult.error);
  throwIfError(membershipsResult.error);
  throwIfError(announcementsResult.error);

  const events = eventsResult.data ?? [];
  const memberships = membershipsResult.data ?? [];
  const eventIds = events.map((event) => event.id);
  const membershipIds = memberships.map((membership) => membership.id);

  const [rolesResult, playerProfilesResult, registrationsResult, courtsResult, roundsResult, ratingResult] = await Promise.all([
    membershipIds.length
      ? client.from('club_role_assignments').select('*').eq('club_id', clubId).in('membership_id', membershipIds)
      : Promise.resolve({ data: [] as RoleAssignment[], error: null }),
    membershipIds.length
      ? client.from('player_profiles').select('*').in('membership_id', membershipIds)
      : Promise.resolve({ data: [] as PlayerProfile[], error: null }),
    eventIds.length
      ? client.from('event_registrations').select('*').in('event_id', eventIds).order('queue_priority', { ascending: true })
      : Promise.resolve({ data: [] as Registration[], error: null }),
    eventIds.length
      ? client.from('courts').select('*').in('event_id', eventIds).order('sort_order', { ascending: true })
      : Promise.resolve({ data: [] as Court[], error: null }),
    eventIds.length
      ? client.from('event_rounds').select('*').in('event_id', eventIds).order('round_number', { ascending: false })
      : Promise.resolve({ data: [] as EventRound[], error: null }),
    membershipIds.length
      ? client.from('rating_history').select('*').in('membership_id', membershipIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as RatingHistory[], error: null }),
  ]);

  throwIfError(rolesResult.error);
  throwIfError(playerProfilesResult.error);
  throwIfError(registrationsResult.error);
  throwIfError(courtsResult.error);
  throwIfError(roundsResult.error);
  throwIfError(ratingResult.error);

  const rounds = roundsResult.data ?? [];
  const roundIds = rounds.map((round) => round.id);
  const matchesResult = roundIds.length
    ? await client.from('matches').select('*').in('round_id', roundIds).order('match_number', { ascending: true })
    : { data: [] as Match[], error: null };
  throwIfError(matchesResult.error);

  const matches = matchesResult.data ?? [];
  const matchIds = matches.map((match) => match.id);
  const [participantsResult, scoreEventsResult] = await Promise.all([
    matchIds.length
      ? client.from('match_participants').select('*').in('match_id', matchIds).order('position', { ascending: true })
      : Promise.resolve({ data: [] as MatchParticipant[], error: null }),
    matchIds.length
      ? client.from('score_events').select('*').in('match_id', matchIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as ScoreEvent[], error: null }),
  ]);
  throwIfError(participantsResult.error);
  throwIfError(scoreEventsResult.error);

  return {
    events,
    memberships,
    roles: rolesResult.data ?? [],
    playerProfiles: playerProfilesResult.data ?? [],
    registrations: registrationsResult.data ?? [],
    courts: courtsResult.data ?? [],
    rounds,
    matches,
    participants: participantsResult.data ?? [],
    scoreEvents: scoreEventsResult.data ?? [],
    announcements: announcementsResult.data ?? [],
    ratingHistory: ratingResult.data ?? [],
  };
}

export function ActiveClubProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const activeQuery = useQuery({
    queryKey: queryKeys.activeClubData(userId),
    queryFn: () => fetchActiveClubData(userId ?? ''),
    enabled: Boolean(userId),
  });

  const clubs = useMemo(() => activeQuery.data?.clubs ?? [], [activeQuery.data?.clubs]);
  const memberships = useMemo(() => activeQuery.data?.memberships ?? [], [activeQuery.data?.memberships]);
  const roles = useMemo(() => activeQuery.data?.roles ?? [], [activeQuery.data?.roles]);
  const activeClubId = selectedClubId && clubs.some((club) => club.id === selectedClubId) ? selectedClubId : clubs[0]?.id ?? null;

  const value = useMemo<ActiveClubContextValue>(() => {
    const activeClub = clubs.find((club) => club.id === activeClubId) ?? null;
    const activeMembership = memberships.find((membership) => membership.club_id === activeClubId) ?? null;
    const activeRoles = activeMembership
      ? roles.filter((role) => role.membership_id === activeMembership.id).map((role) => role.role)
      : [];

    return {
      profile: activeQuery.data?.profile ?? null,
      memberships,
      clubs,
      roles,
      playerProfiles: activeQuery.data?.playerProfiles ?? [],
      activeClub,
      activeMembership,
      activeRoles,
      activeClubId,
      setActiveClubId: setSelectedClubId,
      loading: activeQuery.isLoading,
      error: activeQuery.error,
      refetch: () => {
        void activeQuery.refetch();
      },
    };
  }, [activeClubId, activeQuery, clubs, memberships, roles]);

  return <ActiveClubContext.Provider value={value}>{children}</ActiveClubContext.Provider>;
}

export function useActiveClub() {
  const value = useContext(ActiveClubContext);
  if (!value) throw new Error('useActiveClub must be used within ActiveClubProvider');
  return value;
}

export function useClubBundle(clubId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.clubBundle(clubId),
    queryFn: () => fetchClubBundle(clubId ?? ''),
    enabled: Boolean(clubId),
  });
}

function invalidateClubData(queryClient: ReturnType<typeof useQueryClient>, clubId: string | null | undefined, userId: string | undefined) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.activeClubData(userId) });
  if (clubId) void queryClient.invalidateQueries({ queryKey: queryKeys.clubBundle(clubId) });
}

export function hasRole(roles: ClubRole[], allowed: ClubRole[]) {
  return roles.some((role) => allowed.includes(role));
}

export function useClubActions() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { activeClubId } = useActiveClub();
  const userId = session?.user.id;

  const createClub = useMutation({
    mutationFn: async (input: { name: string; description: string; timezone: string; countryCode: string }) => {
      const client = getClient();
      const { data, error } = await client.rpc('create_club', {
        p_country_code: input.countryCode.trim().toUpperCase() || 'MY',
        p_description: input.description.trim() || undefined,
        p_name: input.name.trim(),
        p_slug: buildSlug(input.name),
        p_timezone: input.timezone.trim() || 'Asia/Kuala_Lumpur',
      });
      throwIfError(error);
      if (!data) throw new Error('Club creation did not return a club.');
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const updateClub = useMutation({
    mutationFn: async (input: { clubId: string; values: TablesUpdate<'clubs'> }) => {
      const client = getClient();
      const { data, error } = await client.from('clubs').update(input.values).eq('id', input.clubId).select('*').single();
      throwIfError(error);
      return data;
    },
    onSuccess: (_data, input) => invalidateClubData(queryClient, input.clubId, userId),
  });

  const createEvent = useMutation({
    mutationFn: async (input: Omit<TablesInsert<'events'>, 'created_by'>) => {
      if (!userId) throw new Error('You must be signed in to create an event.');
      const client = getClient();
      const { data, error } = await client.from('events').insert({ ...input, created_by: userId }).select('*').single();
      throwIfError(error);
      if (!data) throw new Error('Event creation did not return an event.');
      return data;
    },
    onSuccess: (_data, input) => invalidateClubData(queryClient, input.club_id, userId),
  });

  const updateEvent = useMutation({
    mutationFn: async (input: { eventId: string; values: TablesUpdate<'events'> }) => {
      const client = getClient();
      const { data, error } = await client.from('events').update(input.values).eq('id', input.eventId).select('*').single();
      throwIfError(error);
      if (!data) throw new Error('Event update did not return an event.');
      return data;
    },
    onSuccess: (data) => invalidateClubData(queryClient, data.club_id, userId),
  });

  const updateMembership = useMutation({
    mutationFn: async (input: { membershipId: string; values: TablesUpdate<'club_memberships'> }) => {
      const client = getClient();
      const { data, error } = await client
        .from('club_memberships')
        .update(input.values)
        .eq('id', input.membershipId)
        .select('*')
        .single();
      throwIfError(error);
      if (!data) throw new Error('Member update did not return a membership.');
      return data;
    },
    onSuccess: (data) => invalidateClubData(queryClient, data.club_id, userId),
  });

  const createMembership = useMutation({
    mutationFn: async (input: TablesInsert<'club_memberships'>) => {
      const client = getClient();
      const { data, error } = await client.from('club_memberships').insert(input).select('*').single();
      throwIfError(error);
      if (!data) throw new Error('Member creation did not return a membership.');
      return data;
    },
    onSuccess: (data) => invalidateClubData(queryClient, data.club_id, userId),
  });

  const addCourt = useMutation({
    mutationFn: async (input: TablesInsert<'courts'>) => {
      const client = getClient();
      const { data, error } = await client.from('courts').insert(input).select('*').single();
      throwIfError(error);
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const updateCourt = useMutation({
    mutationFn: async (input: { courtId: string; values: TablesUpdate<'courts'> }) => {
      const client = getClient();
      const { data, error } = await client.from('courts').update(input.values).eq('id', input.courtId).select('*').single();
      throwIfError(error);
      if (!data) throw new Error('Court update did not return a court.');
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const registerMember = useMutation({
    mutationFn: async (input: { eventId: string; membershipId: string }) => {
      const client = getClient();
      const { data, error } = await client.rpc('register_event_member', {
        p_event_id: input.eventId,
        p_membership_id: input.membershipId,
      });
      throwIfError(error);
      if (!data) throw new Error('Event registration did not return a registration.');
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const setRegistrationCheckIn = useMutation({
    mutationFn: async (input: { registrationId: string; checkedIn: boolean }) => {
      const client = getClient();
      const { data, error } = await client.rpc('set_registration_check_in', {
        p_checked_in: input.checkedIn,
        p_registration_id: input.registrationId,
      });
      throwIfError(error);
      if (!data) throw new Error('Check-in did not return a registration.');
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const setRegistrationAvailability = useMutation({
    mutationFn: async (input: { registrationId: string; availability: AvailabilityStatus }) => {
      const client = getClient();
      const { data, error } = await client.rpc('set_registration_availability', {
        p_availability: input.availability,
        p_registration_id: input.registrationId,
      });
      throwIfError(error);
      if (!data) throw new Error('Availability update did not return a registration.');
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const adjustRegistrationPriority = useMutation({
    mutationFn: async (input: { registrationId: string; delta: -1 | 1 }) => {
      const client = getClient();
      const { data, error } = await client.rpc('adjust_registration_priority', {
        p_delta: input.delta,
        p_registration_id: input.registrationId,
      });
      throwIfError(error);
      if (!data) throw new Error('Priority update did not return a registration.');
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const generateRound = useMutation({
    mutationFn: async (input: { eventId: string; strategy: string }) => {
      const client = getClient();
      const { data, error } = await client.rpc('generate_event_round', {
        p_event_id: input.eventId,
        p_strategy: input.strategy.trim() || 'balanced',
      });
      throwIfError(error);
      if (!data) throw new Error('Round generation did not return a round.');
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const recordPoint = useMutation({
    mutationFn: async (input: { matchId: string; team: number; delta: number; expectedVersion: number }) => {
      const client = getClient();
      const { data, error } = await client.rpc('record_match_point', {
        p_delta: input.delta,
        p_expected_version: input.expectedVersion,
        p_match_id: input.matchId,
        p_team: input.team,
      });
      throwIfError(error);
      if (!data) throw new Error('Score update did not return the match.');
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const submitMatch = useMutation({
    mutationFn: async (input: { matchId: string; expectedVersion: number }) => {
      const client = getClient();
      const { data, error } = await client.rpc('submit_match_result', {
        p_expected_version: input.expectedVersion,
        p_match_id: input.matchId,
      });
      throwIfError(error);
      if (!data) throw new Error('Match submission did not return the match.');
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const confirmMatch = useMutation({
    mutationFn: async (matchId: string) => {
      const client = getClient();
      const { data, error } = await client.rpc('confirm_match_result', { p_match_id: matchId });
      throwIfError(error);
      if (!data) throw new Error('Match confirmation did not return the match.');
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const disputeMatch = useMutation({
    mutationFn: async (input: { matchId: string; reason: string }) => {
      const client = getClient();
      const { data, error } = await client.rpc('dispute_match_result', {
        p_match_id: input.matchId,
        p_reason: input.reason.trim(),
      });
      throwIfError(error);
      if (!data) throw new Error('Match dispute did not return the match.');
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const resolveMatch = useMutation({
    mutationFn: async (input: { matchId: string; teamOneScore: number; teamTwoScore: number }) => {
      const client = getClient();
      const { data, error } = await client.rpc('resolve_match_dispute', {
        p_match_id: input.matchId,
        p_team_one_score: input.teamOneScore,
        p_team_two_score: input.teamTwoScore,
      });
      throwIfError(error);
      if (!data) throw new Error('Dispute resolution did not return the match.');
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const updateProfile = useMutation({
    mutationFn: async (input: { profileId: string; values: TablesUpdate<'profiles'> }) => {
      const client = getClient();
      const { data, error } = await client.from('profiles').update(input.values).eq('id', input.profileId).select('*').single();
      throwIfError(error);
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const updatePlayerProfile = useMutation({
    mutationFn: async (input: { membershipId: string; values: TablesUpdate<'player_profiles'> }) => {
      const client = getClient();
      const { data, error } = await client
        .from('player_profiles')
        .update(input.values)
        .eq('membership_id', input.membershipId)
        .select('*')
        .single();
      throwIfError(error);
      if (!data) throw new Error('Player preference update did not return a profile.');
      return data;
    },
    onSuccess: () => invalidateClubData(queryClient, activeClubId, userId),
  });

  const assignRole = useMutation({
    mutationFn: async (input: { clubId: string; membershipId: string; role: ClubRole }) => {
      const client = getClient();
      const { data, error } = await client
        .from('club_role_assignments')
        .insert({ club_id: input.clubId, membership_id: input.membershipId, role: input.role })
        .select('*')
        .single();
      throwIfError(error);
      return data;
    },
    onSuccess: (_data, input) => invalidateClubData(queryClient, input.clubId, userId),
  });

  const removeRole = useMutation({
    mutationFn: async (input: { clubId: string; assignmentId: string }) => {
      const client = getClient();
      const { error } = await client.from('club_role_assignments').delete().eq('id', input.assignmentId);
      throwIfError(error);
      return input;
    },
    onSuccess: (_data, input) => invalidateClubData(queryClient, input.clubId, userId),
  });

  const publishAnnouncement = useMutation({
    mutationFn: async (input: { clubId: string; eventId?: string | null; title: string; body: string; status: AnnouncementStatus }) => {
      if (!userId) throw new Error('You must be signed in to publish announcements.');
      const client = getClient();
      const publishedAt = input.status === 'published' ? new Date().toISOString() : null;
      const { data, error } = await client
        .from('announcements')
        .insert({
          body: input.body.trim(),
          club_id: input.clubId,
          created_by: userId,
          event_id: input.eventId ?? null,
          published_at: publishedAt,
          status: input.status,
          title: input.title.trim(),
        })
        .select('*')
        .single();
      throwIfError(error);
      return data;
    },
    onSuccess: (_data, input) => invalidateClubData(queryClient, input.clubId, userId),
  });

  return {
    createClub,
    updateClub,
    createEvent,
    updateEvent,
    createMembership,
    updateMembership,
    addCourt,
    updateCourt,
    registerMember,
    setRegistrationCheckIn,
    setRegistrationAvailability,
    adjustRegistrationPriority,
    generateRound,
    recordPoint,
    submitMatch,
    confirmMatch,
    disputeMatch,
    resolveMatch,
    updateProfile,
    updatePlayerProfile,
    assignRole,
    removeRole,
    publishAnnouncement,
  };
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function roleLabel(role: ClubRole) {
  return role.replace(/_/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

export function statusLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

export function sortByCreatedDesc<T extends { created_at: string }>(items: T[]) {
  return [...items].sort(byCreatedDesc);
}

function parseEnumValue<T extends string>(values: readonly T[], value: string, fallback: T) {
  const match = values.find((item) => item === value);
  return match ?? fallback;
}

export function parseEventFormat(value: string, fallback: EventFormat) {
  return parseEnumValue(eventFormats, value, fallback);
}

export function parseEventStatus(value: string, fallback: EventStatus) {
  return parseEnumValue(eventStatuses, value, fallback);
}

export function parseClubRole(value: string, fallback: ClubRole) {
  return parseEnumValue(clubRoles, value, fallback);
}

export function parseAnnouncementStatus(value: string, fallback: AnnouncementStatus) {
  return parseEnumValue(announcementStatuses, value, fallback);
}

export function parsePlayPreference(value: string, fallback: Enums<'play_preference'>) {
  return parseEnumValue(playPreferences, value, fallback);
}

export function parsePreferredFormat(value: string, fallback: Enums<'preferred_format'>) {
  return parseEnumValue(preferredFormats, value, fallback);
}

export function parsePreferredSide(value: string, fallback: Enums<'preferred_side'>) {
  return parseEnumValue(preferredSides, value, fallback);
}
