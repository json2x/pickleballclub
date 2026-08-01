begin;

create schema legacy_backup_20260801 authorization postgres;
comment on schema legacy_backup_20260801 is
  'Pre-reset backup of the legacy pickleball application data created on 2026-08-01.';

revoke all on schema legacy_backup_20260801 from public, anon, authenticated, service_role;

create table legacy_backup_20260801.announcements as table public.announcements;
create table legacy_backup_20260801.club_invitations as table public.club_invitations;
create table legacy_backup_20260801.club_memberships as table public.club_memberships;
create table legacy_backup_20260801.club_role_assignments as table public.club_role_assignments;
create table legacy_backup_20260801.clubs as table public.clubs;
create table legacy_backup_20260801.courts as table public.courts;
create table legacy_backup_20260801.event_registrations as table public.event_registrations;
create table legacy_backup_20260801.event_rounds as table public.event_rounds;
create table legacy_backup_20260801.events as table public.events;
create table legacy_backup_20260801.match_participants as table public.match_participants;
create table legacy_backup_20260801.matches as table public.matches;
create table legacy_backup_20260801.player_profiles as table public.player_profiles;
create table legacy_backup_20260801.profiles as table public.profiles;
create table legacy_backup_20260801.rating_history as table public.rating_history;
create table legacy_backup_20260801.score_events as table public.score_events;

revoke all on all tables in schema legacy_backup_20260801
  from public, anon, authenticated, service_role;

do $$
declare
  table_name text;
  source_count bigint;
  backup_count bigint;
begin
  foreach table_name in array array[
    'announcements',
    'club_invitations',
    'club_memberships',
    'club_role_assignments',
    'clubs',
    'courts',
    'event_registrations',
    'event_rounds',
    'events',
    'match_participants',
    'matches',
    'player_profiles',
    'profiles',
    'rating_history',
    'score_events'
  ]
  loop
    execute format('select count(*) from public.%I', table_name) into source_count;
    execute format(
      'select count(*) from legacy_backup_20260801.%I',
      table_name
    ) into backup_count;

    if source_count <> backup_count then
      raise exception 'Backup row count mismatch for table %', table_name;
    end if;
  end loop;
end;
$$;

drop table
  public.announcements,
  public.club_invitations,
  public.club_memberships,
  public.club_role_assignments,
  public.clubs,
  public.courts,
  public.event_registrations,
  public.event_rounds,
  public.events,
  public.match_participants,
  public.matches,
  public.player_profiles,
  public.profiles,
  public.rating_history,
  public.score_events
cascade;

drop function if exists public.adjust_registration_priority(uuid, integer);
drop function if exists public.confirm_match_result(uuid);
drop function if exists public.create_club(text, text, text, text, text);
drop function if exists public.dispute_match_result(uuid, text);
drop function if exists public.generate_event_round(uuid, text);
drop function if exists public.record_match_point(uuid, smallint, smallint, integer);
drop function if exists public.register_event_member(uuid, uuid);
drop function if exists public.resolve_match_dispute(uuid, integer, integer);
drop function if exists public.set_registration_availability(uuid, public.availability_status);
drop function if exists public.set_registration_check_in(uuid, boolean);
drop function if exists public.submit_match_result(uuid, integer);

drop type if exists public.announcement_status cascade;
drop type if exists public.availability_status cascade;
drop type if exists public.club_role cascade;
drop type if exists public.club_status cascade;
drop type if exists public.court_status cascade;
drop type if exists public.dominant_hand cascade;
drop type if exists public.event_format cascade;
drop type if exists public.event_status cascade;
drop type if exists public.gender_category cascade;
drop type if exists public.match_status cascade;
drop type if exists public.membership_status cascade;
drop type if exists public.play_preference cascade;
drop type if exists public.preferred_format cascade;
drop type if exists public.preferred_side cascade;
drop type if exists public.registration_status cascade;
drop type if exists public.round_status cascade;
drop type if exists public.skill_level cascade;

drop schema private cascade;

commit;;
