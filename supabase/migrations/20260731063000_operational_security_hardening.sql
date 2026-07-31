create or replace function private.can_operate_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    private.has_club_role(
      private.event_club_id(p_event_id),
      array['administrator', 'event_organizer', 'court_marshal']::public.club_role[]
    ),
    false
  );
$$;

revoke all on function private.can_operate_event(uuid) from public;

create or replace function private.assert_event_membership_same_club()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.events as event
    join public.club_memberships as membership on membership.club_id = event.club_id
    where event.id = new.event_id and membership.id = new.membership_id
  ) then
    raise exception 'The member and event must belong to the same club.' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function private.assert_event_membership_same_club() from public;

create trigger event_registrations_same_club
before insert or update of event_id, membership_id on public.event_registrations
for each row execute function private.assert_event_membership_same_club();

create or replace function private.assert_match_participant_same_club()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.matches as match
    join public.events as event on event.id = match.event_id
    join public.club_memberships as membership on membership.club_id = event.club_id
    where match.id = new.match_id and membership.id = new.membership_id
  ) then
    raise exception 'The participant and match must belong to the same club.' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function private.assert_match_participant_same_club() from public;

create trigger match_participants_same_club
before insert or update of match_id, membership_id on public.match_participants
for each row execute function private.assert_match_participant_same_club();

revoke insert, update, delete on public.event_registrations from authenticated;
revoke insert, update, delete on public.event_rounds from authenticated;
revoke insert, update, delete on public.matches from authenticated;
revoke insert, update, delete on public.match_participants from authenticated;

drop policy registrations_insert_self_or_organizer on public.event_registrations;
drop policy registrations_update_self_or_organizer on public.event_registrations;
drop policy registrations_delete_self_or_organizer on public.event_registrations;

create or replace function public.register_event_member(
  p_event_id uuid,
  p_membership_id uuid
)
returns public.event_registrations
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_registration public.event_registrations;
  membership_record public.club_memberships;
  event_record public.events;
begin
  select * into membership_record from public.club_memberships where id = p_membership_id;
  select * into event_record from public.events where id = p_event_id;

  if membership_record.id is null or event_record.id is null then
    raise exception 'Event or membership not found.' using errcode = 'P0002';
  end if;
  if membership_record.club_id <> event_record.club_id then
    raise exception 'The member and event must belong to the same club.' using errcode = '23514';
  end if;
  if not private.can_manage_event(p_event_id)
    and membership_record.profile_id <> auth.uid() then
    raise exception 'You do not have permission to register this member.' using errcode = '42501';
  end if;
  if membership_record.membership_status <> 'active' then
    raise exception 'Only active club members can register.' using errcode = '23514';
  end if;

  insert into public.event_registrations (event_id, membership_id)
  values (p_event_id, p_membership_id)
  on conflict (event_id, membership_id) do update
  set status = 'registered', availability = 'waiting'
  returning * into created_registration;

  return created_registration;
end;
$$;

create or replace function public.set_registration_check_in(
  p_registration_id uuid,
  p_checked_in boolean
)
returns public.event_registrations
language plpgsql
security definer
set search_path = ''
as $$
declare
  registration_record public.event_registrations;
  event_record public.events;
  is_self boolean;
begin
  select * into registration_record from public.event_registrations where id = p_registration_id for update;
  if registration_record.id is null then
    raise exception 'Registration not found.' using errcode = 'P0002';
  end if;
  select * into event_record from public.events where id = registration_record.event_id;
  select exists (
    select 1 from public.club_memberships
    where id = registration_record.membership_id and profile_id = auth.uid()
  ) into is_self;

  if not private.can_operate_event(registration_record.event_id)
    and not (is_self and event_record.check_in_open) then
    raise exception 'Check-in is not available for this account.' using errcode = '42501';
  end if;

  update public.event_registrations
  set status = case when p_checked_in then 'checked_in' else 'registered' end,
      checked_in_at = case when p_checked_in then now() else null end,
      availability = case when p_checked_in then 'waiting' else 'unavailable' end
  where id = p_registration_id
  returning * into registration_record;

  return registration_record;
end;
$$;

create or replace function public.set_registration_availability(
  p_registration_id uuid,
  p_availability public.availability_status
)
returns public.event_registrations
language plpgsql
security definer
set search_path = ''
as $$
declare
  registration_record public.event_registrations;
  is_self boolean;
begin
  select * into registration_record from public.event_registrations where id = p_registration_id for update;
  if registration_record.id is null then
    raise exception 'Registration not found.' using errcode = 'P0002';
  end if;
  select exists (
    select 1 from public.club_memberships
    where id = registration_record.membership_id and profile_id = auth.uid()
  ) into is_self;
  if not private.can_operate_event(registration_record.event_id) and not is_self then
    raise exception 'You do not have permission to change availability.' using errcode = '42501';
  end if;
  if registration_record.status <> 'checked_in' then
    raise exception 'Only checked-in players can change availability.' using errcode = '23514';
  end if;

  update public.event_registrations
  set availability = p_availability
  where id = p_registration_id
  returning * into registration_record;
  return registration_record;
end;
$$;

create or replace function public.adjust_registration_priority(
  p_registration_id uuid,
  p_delta integer
)
returns public.event_registrations
language plpgsql
security definer
set search_path = ''
as $$
declare
  registration_record public.event_registrations;
begin
  select * into registration_record from public.event_registrations where id = p_registration_id for update;
  if registration_record.id is null then
    raise exception 'Registration not found.' using errcode = 'P0002';
  end if;
  if not private.can_operate_event(registration_record.event_id) then
    raise exception 'You do not have permission to reprioritize this queue.' using errcode = '42501';
  end if;
  if p_delta not in (-1, 1) then
    raise exception 'Priority changes must be one step at a time.' using errcode = '22023';
  end if;

  update public.event_registrations
  set queue_priority = queue_priority + p_delta
  where id = p_registration_id
  returning * into registration_record;
  return registration_record;
end;
$$;

revoke all on function public.register_event_member(uuid, uuid) from public, anon;
revoke all on function public.set_registration_check_in(uuid, boolean) from public, anon;
revoke all on function public.set_registration_availability(uuid, public.availability_status) from public, anon;
revoke all on function public.adjust_registration_priority(uuid, integer) from public, anon;
grant execute on function public.register_event_member(uuid, uuid) to authenticated;
grant execute on function public.set_registration_check_in(uuid, boolean) to authenticated;
grant execute on function public.set_registration_availability(uuid, public.availability_status) to authenticated;
grant execute on function public.adjust_registration_priority(uuid, integer) to authenticated;

drop policy courts_update_organizer on public.courts;
create policy courts_update_operator on public.courts for update to authenticated
using (private.can_operate_event(event_id)) with check (private.can_operate_event(event_id));

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
  assigned_count integer := 0;
  eligible_count integer;
  court_count integer;
  group_size integer;
  event_format public.event_format;
  assigned_memberships uuid[] := array[]::uuid[];
  participant_count integer;
begin
  if not private.can_manage_event(p_event_id) then
    raise exception 'You do not have permission to generate this round.' using errcode = '42501';
  end if;
  if p_strategy not in ('balanced', 'random', 'variety', 'waiting', 'competitive', 'social') then
    raise exception 'Unknown matchmaking strategy.' using errcode = '22023';
  end if;

  select format into event_format from public.events where id = p_event_id;
  group_size := case when event_format = 'singles' then 2 else 4 end;

  select count(*) into eligible_count
  from public.event_registrations
  where event_id = p_event_id and status = 'checked_in' and availability in ('waiting', 'on_deck', 'resting');
  select count(*) into court_count from public.courts where event_id = p_event_id and status = 'available';

  if eligible_count < group_size then
    raise exception 'There are not enough checked-in available players for this format.' using errcode = '23514';
  end if;
  if court_count < 1 then
    raise exception 'At least one available court is required.' using errcode = '23514';
  end if;

  select coalesce(max(round_number), 0) + 1 into next_round from public.event_rounds where event_id = p_event_id;
  insert into public.event_rounds (event_id, round_number, strategy, status, quality_score, explanation, confirmed_by)
  values (
    p_event_id,
    next_round,
    p_strategy,
    'confirmed',
    82,
    case p_strategy
      when 'waiting' then 'Players with the longest wait were assigned first.'
      when 'variety' then 'Assignments prioritize fresh partners and opponents.'
      when 'competitive' then 'Assignments group players by current rating.'
      when 'social' then 'Assignments favor broad participation and balanced court time.'
      when 'random' then 'Eligible players were randomized across available courts.'
      else 'Teams were arranged to keep rating differences small.'
    end,
    auth.uid()
  ) returning * into created_round;

  for selected_court in
    select id from public.courts
    where event_id = p_event_id and status = 'available'
    order by sort_order, name
    limit (eligible_count / group_size)
  loop
    insert into public.matches (event_id, round_id, court_id, match_number)
    values (p_event_id, created_round.id, selected_court.id, assigned_count / group_size + 1)
    returning * into created_match;

    participant_count := 0;
    for registration_record in
      select registration.id, registration.membership_id
      from public.event_registrations as registration
      join public.player_profiles as player on player.membership_id = registration.membership_id
      where registration.event_id = p_event_id
        and registration.status = 'checked_in'
        and registration.availability in ('waiting', 'on_deck', 'resting')
        and not (registration.membership_id = any(assigned_memberships))
      order by
        case when p_strategy = 'random' then random() else 0 end,
        case when p_strategy = 'waiting' then extract(epoch from coalesce(registration.last_played_at, registration.checked_in_at, registration.created_at)) else 0 end,
        case when p_strategy in ('competitive', 'balanced') and event_format = 'singles' then player.singles_rating else player.doubles_rating end desc,
        registration.queue_priority desc,
        registration.checked_in_at nulls last
      limit group_size
    loop
      insert into public.match_participants (match_id, membership_id, team, position)
      values (
        created_match.id,
        registration_record.membership_id,
        case
          when group_size = 2 then participant_count + 1
          when participant_count in (0, 3) then 1
          else 2
        end,
        case when group_size = 2 or participant_count < 2 then 1 else 2 end
      );
      assigned_memberships := array_append(assigned_memberships, registration_record.membership_id);
      update public.event_registrations set availability = 'on_deck' where id = registration_record.id;
      participant_count := participant_count + 1;
      assigned_count := assigned_count + 1;
    end loop;
    update public.courts set status = 'in_use' where id = selected_court.id;
  end loop;

  update public.events set current_round_number = next_round, status = 'active' where id = p_event_id;
  return created_round;
end;
$$;

create or replace function public.confirm_match_result(p_match_id uuid)
returns public.matches
language plpgsql
security definer
set search_path = ''
as $$
declare
  locked_match public.matches;
  actor_is_manager boolean;
begin
  select * into locked_match from public.matches where id = p_match_id for update;
  if locked_match.id is null then
    raise exception 'Match not found.' using errcode = 'P0002';
  end if;
  if not private.can_score_match(p_match_id) then
    raise exception 'You do not have permission to confirm this score.' using errcode = '42501';
  end if;
  if locked_match.status = 'completed' then
    return locked_match;
  end if;
  if locked_match.status <> 'awaiting_confirmation' then
    raise exception 'This score is not awaiting confirmation.' using errcode = '23514';
  end if;

  actor_is_manager := private.can_manage_event(locked_match.event_id);
  if locked_match.submitted_by = auth.uid() and not actor_is_manager then
    raise exception 'A different participant or organizer must confirm this score.' using errcode = '42501';
  end if;
  update public.matches set confirmed_by = auth.uid(), confirmed_at = now(), version = version + 1 where id = p_match_id;
  return private.finalize_match_result(p_match_id);
end;
$$;

alter table public.matches
  add constraint matches_dispute_reason_length
  check (dispute_reason is null or char_length(dispute_reason) <= 500);
