create type public.event_status as enum (
  'draft',
  'published',
  'check_in_open',
  'active',
  'paused',
  'completed',
  'cancelled'
);

create type public.event_format as enum ('singles', 'doubles', 'mixed_doubles', 'open_play');
create type public.registration_status as enum ('registered', 'waitlisted', 'checked_in', 'withdrawn', 'no_show');
create type public.availability_status as enum ('waiting', 'on_deck', 'playing', 'resting', 'unavailable', 'finished');
create type public.court_status as enum ('available', 'in_use', 'paused', 'unavailable');
create type public.round_status as enum ('draft', 'confirmed', 'active', 'completed', 'cancelled');
create type public.match_status as enum ('scheduled', 'in_progress', 'awaiting_confirmation', 'completed', 'disputed', 'cancelled');
create type public.announcement_status as enum ('draft', 'published', 'archived');

create table public.events (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 120),
  description text,
  venue text not null check (char_length(trim(venue)) between 2 and 160),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  format public.event_format not null default 'doubles',
  capacity integer not null default 32 check (capacity between 4 and 500),
  status public.event_status not null default 'draft',
  check_in_open boolean not null default false,
  current_round_number integer not null default 0 check (current_round_number >= 0),
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_time_order check (ends_at > starts_at)
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  membership_id uuid not null references public.club_memberships (id) on delete cascade,
  status public.registration_status not null default 'registered',
  availability public.availability_status not null default 'waiting',
  checked_in_at timestamptz,
  queue_priority integer not null default 0,
  games_played integer not null default 0 check (games_played >= 0),
  last_played_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, membership_id)
);

create table public.courts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 40),
  sort_order integer not null default 0,
  status public.court_status not null default 'available',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, name)
);

create table public.event_rounds (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  round_number integer not null check (round_number > 0),
  strategy text not null default 'balanced' check (strategy in ('balanced', 'random', 'variety', 'waiting', 'competitive', 'social')),
  status public.round_status not null default 'draft',
  quality_score integer check (quality_score between 0 and 100),
  explanation text,
  confirmed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, round_number)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  round_id uuid not null references public.event_rounds (id) on delete cascade,
  court_id uuid references public.courts (id) on delete set null,
  match_number integer not null check (match_number > 0),
  status public.match_status not null default 'scheduled',
  team_one_score integer not null default 0 check (team_one_score >= 0),
  team_two_score integer not null default 0 check (team_two_score >= 0),
  best_of integer not null default 1 check (best_of in (1, 3, 5)),
  serving_team smallint check (serving_team in (1, 2)),
  started_at timestamptz,
  submitted_at timestamptz,
  completed_at timestamptz,
  submitted_by uuid references public.profiles (id) on delete set null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (round_id, match_number)
);

create table public.match_participants (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  membership_id uuid not null references public.club_memberships (id) on delete cascade,
  team smallint not null check (team in (1, 2)),
  position smallint not null check (position in (1, 2)),
  confirmed_at timestamptz,
  disputed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (match_id, membership_id),
  unique (match_id, team, position)
);

create table public.score_events (
  id bigint generated always as identity primary key,
  match_id uuid not null references public.matches (id) on delete cascade,
  team smallint not null check (team in (1, 2)),
  delta smallint not null check (delta in (-1, 1)),
  score_one integer not null check (score_one >= 0),
  score_two integer not null check (score_two >= 0),
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  event_id uuid references public.events (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 120),
  body text not null check (char_length(trim(body)) between 2 and 2000),
  status public.announcement_status not null default 'draft',
  published_at timestamptz,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rating_history (
  id bigint generated always as identity primary key,
  membership_id uuid not null references public.club_memberships (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  format public.event_format not null,
  previous_rating numeric(7, 2) not null,
  new_rating numeric(7, 2) not null,
  delta numeric(7, 2) not null,
  created_at timestamptz not null default now(),
  unique (membership_id, match_id)
);

create index events_club_starts_idx on public.events (club_id, starts_at desc);
create index event_registrations_event_queue_idx on public.event_registrations (event_id, availability, queue_priority desc, checked_in_at);
create index courts_event_sort_idx on public.courts (event_id, sort_order);
create index event_rounds_event_number_idx on public.event_rounds (event_id, round_number desc);
create index matches_event_status_idx on public.matches (event_id, status);
create index matches_court_status_idx on public.matches (court_id, status) where court_id is not null;
create index match_participants_membership_idx on public.match_participants (membership_id, created_at desc);
create index score_events_match_created_idx on public.score_events (match_id, created_at desc);
create index announcements_club_published_idx on public.announcements (club_id, published_at desc);
create index rating_history_membership_created_idx on public.rating_history (membership_id, created_at desc);

create trigger events_set_updated_at before update on public.events
for each row execute function private.set_updated_at();
create trigger event_registrations_set_updated_at before update on public.event_registrations
for each row execute function private.set_updated_at();
create trigger courts_set_updated_at before update on public.courts
for each row execute function private.set_updated_at();
create trigger event_rounds_set_updated_at before update on public.event_rounds
for each row execute function private.set_updated_at();
create trigger matches_set_updated_at before update on public.matches
for each row execute function private.set_updated_at();
create trigger announcements_set_updated_at before update on public.announcements
for each row execute function private.set_updated_at();

create or replace function private.event_club_id(p_event_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select club_id from public.events where id = p_event_id;
$$;

create or replace function private.can_manage_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    private.has_club_role(
      private.event_club_id(p_event_id),
      array['administrator', 'event_organizer']::public.club_role[]
    ),
    false
  );
$$;

revoke all on function private.event_club_id(uuid) from public;
revoke all on function private.can_manage_event(uuid) from public;

create or replace function public.generate_event_round(
  p_event_id uuid,
  p_strategy text default 'balanced'
)
returns public.event_rounds
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_round public.event_rounds;
  selected_court record;
  created_match public.matches;
  registration_record record;
  next_round integer;
  player_offset integer := 0;
  eligible_count integer;
  court_count integer;
begin
  if not private.can_manage_event(p_event_id) then
    raise exception 'You do not have permission to generate this round.' using errcode = '42501';
  end if;
  if p_strategy not in ('balanced', 'random', 'variety', 'waiting', 'competitive', 'social') then
    raise exception 'Unknown matchmaking strategy.' using errcode = '22023';
  end if;

  select count(*) into eligible_count
  from public.event_registrations
  where event_id = p_event_id
    and status = 'checked_in'
    and availability in ('waiting', 'on_deck', 'resting');

  select count(*) into court_count
  from public.courts
  where event_id = p_event_id and status = 'available';

  if eligible_count < 4 then
    raise exception 'At least four checked-in available players are required.' using errcode = '23514';
  end if;
  if court_count < 1 then
    raise exception 'At least one available court is required.' using errcode = '23514';
  end if;

  select coalesce(max(round_number), 0) + 1 into next_round
  from public.event_rounds where event_id = p_event_id;

  insert into public.event_rounds (
    event_id, round_number, strategy, status, quality_score, explanation, confirmed_by
  ) values (
    p_event_id,
    next_round,
    p_strategy,
    'confirmed',
    82,
    case p_strategy
      when 'waiting' then 'Players with the longest wait were assigned first.'
      when 'variety' then 'Assignments prioritize fresh partners and opponents.'
      when 'competitive' then 'Assignments group players by current doubles rating.'
      when 'social' then 'Assignments favor broad participation and balanced court time.'
      when 'random' then 'Eligible players were randomized across available courts.'
      else 'Teams were arranged to keep rating differences small.'
    end,
    auth.uid()
  ) returning * into created_round;

  for selected_court in
    select id
    from public.courts
    where event_id = p_event_id and status = 'available'
    order by sort_order, name
    limit floor(eligible_count / 4.0)
  loop
    insert into public.matches (event_id, round_id, court_id, match_number)
    values (p_event_id, created_round.id, selected_court.id, player_offset / 4 + 1)
    returning * into created_match;

    for registration_record in
      select registration.id, registration.membership_id
      from public.event_registrations as registration
      join public.player_profiles as player on player.membership_id = registration.membership_id
      where registration.event_id = p_event_id
        and registration.status = 'checked_in'
        and registration.availability in ('waiting', 'on_deck', 'resting')
      order by
        case when p_strategy = 'random' then random() else 0 end,
        case when p_strategy = 'waiting' then extract(epoch from coalesce(registration.last_played_at, registration.checked_in_at, registration.created_at)) else 0 end,
        case when p_strategy in ('competitive', 'balanced') then player.doubles_rating else 0 end desc,
        registration.queue_priority desc,
        registration.checked_in_at nulls last
      offset player_offset
      limit 4
    loop
      insert into public.match_participants (match_id, membership_id, team, position)
      values (
        created_match.id,
        registration_record.membership_id,
        case when (select count(*) from public.match_participants where match_id = created_match.id) in (0, 3) then 1 else 2 end,
        case when (select count(*) from public.match_participants where match_id = created_match.id) < 2 then 1 else 2 end
      );
      update public.event_registrations
      set availability = 'on_deck'
      where id = registration_record.id;
    end loop;

    update public.courts set status = 'in_use' where id = selected_court.id;
    player_offset := player_offset + 4;
  end loop;

  update public.events
  set current_round_number = next_round, status = 'active'
  where id = p_event_id;

  return created_round;
end;
$$;

create or replace function private.can_score_match(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.matches as match
    where match.id = p_match_id
      and (
        private.has_club_role(
          private.event_club_id(match.event_id),
          array['administrator', 'event_organizer', 'court_marshal', 'scorekeeper']::public.club_role[]
        )
        or exists (
          select 1
          from public.match_participants as participant
          join public.club_memberships as membership on membership.id = participant.membership_id
          where participant.match_id = match.id and membership.profile_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.record_match_point(
  p_match_id uuid,
  p_team smallint,
  p_delta smallint,
  p_expected_version integer
)
returns public.matches
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_match public.matches;
begin
  if not private.can_score_match(p_match_id) then
    raise exception 'You do not have permission to score this match.' using errcode = '42501';
  end if;
  if p_team not in (1, 2) or p_delta not in (-1, 1) then
    raise exception 'Invalid score change.' using errcode = '22023';
  end if;

  update public.matches
  set
    team_one_score = case when p_team = 1 then greatest(0, team_one_score + p_delta) else team_one_score end,
    team_two_score = case when p_team = 2 then greatest(0, team_two_score + p_delta) else team_two_score end,
    status = case when status = 'scheduled' then 'in_progress' else status end,
    started_at = coalesce(started_at, now()),
    version = version + 1
  where id = p_match_id
    and version = p_expected_version
    and status in ('scheduled', 'in_progress')
  returning * into updated_match;

  if updated_match.id is null then
    raise exception 'The score changed on another device. Refresh and try again.' using errcode = '40001';
  end if;

  insert into public.score_events (match_id, team, delta, score_one, score_two, recorded_by)
  values (p_match_id, p_team, p_delta, updated_match.team_one_score, updated_match.team_two_score, auth.uid());

  return updated_match;
end;
$$;

create or replace function public.submit_match_result(
  p_match_id uuid,
  p_expected_version integer
)
returns public.matches
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_match public.matches;
begin
  if not private.can_score_match(p_match_id) then
    raise exception 'You do not have permission to submit this score.' using errcode = '42501';
  end if;
  update public.matches
  set status = 'awaiting_confirmation', submitted_at = now(), submitted_by = auth.uid(), version = version + 1
  where id = p_match_id
    and version = p_expected_version
    and status = 'in_progress'
    and greatest(team_one_score, team_two_score) >= 11
    and abs(team_one_score - team_two_score) >= 2
  returning * into updated_match;
  if updated_match.id is null then
    raise exception 'A winning score requires at least 11 points and a two-point lead.' using errcode = '23514';
  end if;
  return updated_match;
end;
$$;

revoke all on function public.generate_event_round(uuid, text) from public, anon;
revoke all on function public.record_match_point(uuid, smallint, smallint, integer) from public, anon;
revoke all on function public.submit_match_result(uuid, integer) from public, anon;
grant execute on function public.generate_event_round(uuid, text) to authenticated;
grant execute on function public.record_match_point(uuid, smallint, smallint, integer) to authenticated;
grant execute on function public.submit_match_result(uuid, integer) to authenticated;

alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.courts enable row level security;
alter table public.event_rounds enable row level security;
alter table public.matches enable row level security;
alter table public.match_participants enable row level security;
alter table public.score_events enable row level security;
alter table public.announcements enable row level security;
alter table public.rating_history enable row level security;

grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.event_registrations to authenticated;
grant select, insert, update, delete on public.courts to authenticated;
grant select, insert, update, delete on public.event_rounds to authenticated;
grant select, insert, update, delete on public.matches to authenticated;
grant select, insert, update, delete on public.match_participants to authenticated;
grant select on public.score_events to authenticated;
grant select, insert, update, delete on public.announcements to authenticated;
grant select on public.rating_history to authenticated;
grant usage, select on sequence public.score_events_id_seq to authenticated;
grant usage, select on sequence public.rating_history_id_seq to authenticated;

create policy events_select_member on public.events for select to authenticated
using (private.is_club_member(club_id));
create policy events_insert_organizer on public.events for insert to authenticated
with check (created_by = auth.uid() and private.has_club_role(club_id, array['administrator', 'event_organizer']::public.club_role[]));
create policy events_update_organizer on public.events for update to authenticated
using (private.has_club_role(club_id, array['administrator', 'event_organizer']::public.club_role[]))
with check (private.has_club_role(club_id, array['administrator', 'event_organizer']::public.club_role[]));
create policy events_delete_administrator on public.events for delete to authenticated
using (private.has_club_role(club_id, array['administrator']::public.club_role[]));

create policy registrations_select_member on public.event_registrations for select to authenticated
using (private.is_club_member(private.event_club_id(event_id)));
create policy registrations_insert_self_or_organizer on public.event_registrations for insert to authenticated
with check (
  private.can_manage_event(event_id)
  or exists (select 1 from public.club_memberships where id = membership_id and profile_id = auth.uid() and membership_status = 'active')
);
create policy registrations_update_self_or_organizer on public.event_registrations for update to authenticated
using (
  private.can_manage_event(event_id)
  or exists (select 1 from public.club_memberships where id = membership_id and profile_id = auth.uid())
)
with check (
  private.can_manage_event(event_id)
  or exists (select 1 from public.club_memberships where id = membership_id and profile_id = auth.uid())
);
create policy registrations_delete_self_or_organizer on public.event_registrations for delete to authenticated
using (
  private.can_manage_event(event_id)
  or exists (select 1 from public.club_memberships where id = membership_id and profile_id = auth.uid())
);

create policy courts_select_member on public.courts for select to authenticated
using (private.is_club_member(private.event_club_id(event_id)));
create policy courts_manage_organizer on public.courts for all to authenticated
using (private.can_manage_event(event_id)) with check (private.can_manage_event(event_id));

create policy rounds_select_member on public.event_rounds for select to authenticated
using (private.is_club_member(private.event_club_id(event_id)));
create policy rounds_manage_organizer on public.event_rounds for all to authenticated
using (private.can_manage_event(event_id)) with check (private.can_manage_event(event_id));

create policy matches_select_member on public.matches for select to authenticated
using (private.is_club_member(private.event_club_id(event_id)));
create policy matches_manage_organizer on public.matches for all to authenticated
using (private.can_manage_event(event_id)) with check (private.can_manage_event(event_id));

create policy participants_select_member on public.match_participants for select to authenticated
using (exists (select 1 from public.matches where id = match_id and private.is_club_member(private.event_club_id(event_id))));
create policy participants_manage_organizer on public.match_participants for all to authenticated
using (exists (select 1 from public.matches where id = match_id and private.can_manage_event(event_id)))
with check (exists (select 1 from public.matches where id = match_id and private.can_manage_event(event_id)));

create policy score_events_select_member on public.score_events for select to authenticated
using (exists (select 1 from public.matches where id = match_id and private.is_club_member(private.event_club_id(event_id))));

create policy announcements_select_member on public.announcements for select to authenticated
using (private.is_club_member(club_id) and (status = 'published' or private.has_club_role(club_id, array['administrator', 'event_organizer']::public.club_role[])));
create policy announcements_manage_organizer on public.announcements for all to authenticated
using (private.has_club_role(club_id, array['administrator', 'event_organizer']::public.club_role[]))
with check (created_by = auth.uid() and private.has_club_role(club_id, array['administrator', 'event_organizer']::public.club_role[]));

create policy rating_history_select_member on public.rating_history for select to authenticated
using (
  exists (
    select 1 from public.club_memberships
    where id = membership_id and private.is_club_member(club_id)
  )
);
