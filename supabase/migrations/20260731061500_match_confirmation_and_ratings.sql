alter table public.matches
  add column confirmed_by uuid references public.profiles (id) on delete set null,
  add column confirmed_at timestamptz,
  add column disputed_by uuid references public.profiles (id) on delete set null,
  add column disputed_at timestamptz,
  add column dispute_reason text,
  add column finalized_at timestamptz,
  add column winner_team smallint check (winner_team in (1, 2));

create index matches_confirmed_by_idx on public.matches (confirmed_by) where confirmed_by is not null;
create index matches_disputed_by_idx on public.matches (disputed_by) where disputed_by is not null;

create or replace function private.finalize_match_result(p_match_id uuid)
returns public.matches
language plpgsql
security definer
set search_path = ''
as $$
declare
  locked_match public.matches;
  event_format public.event_format;
  participant_record record;
  previous_rating numeric(7, 2);
  next_rating numeric(7, 2);
  rating_delta numeric(7, 2);
begin
  select * into locked_match
  from public.matches
  where id = p_match_id
  for update;

  if locked_match.id is null then
    raise exception 'Match not found.' using errcode = 'P0002';
  end if;
  if locked_match.finalized_at is not null then
    return locked_match;
  end if;
  if locked_match.status not in ('awaiting_confirmation', 'disputed') then
    raise exception 'Only submitted or disputed matches can be finalized.' using errcode = '23514';
  end if;
  if greatest(locked_match.team_one_score, locked_match.team_two_score) < 11
    or abs(locked_match.team_one_score - locked_match.team_two_score) < 2 then
    raise exception 'A final score requires at least 11 points and a two-point lead.' using errcode = '23514';
  end if;

  select format into event_format from public.events where id = locked_match.event_id;
  locked_match.winner_team := case when locked_match.team_one_score > locked_match.team_two_score then 1 else 2 end;

  for participant_record in
    select participant.membership_id, participant.team
    from public.match_participants as participant
    where participant.match_id = p_match_id
    order by participant.membership_id
  loop
    select
      case when event_format = 'singles' then singles_rating else doubles_rating end
    into previous_rating
    from public.player_profiles
    where membership_id = participant_record.membership_id
    for update;

    rating_delta := case when participant_record.team = locked_match.winner_team then 10 else -10 end;
    next_rating := greatest(0, least(3000, previous_rating + rating_delta));

    if event_format = 'singles' then
      update public.player_profiles
      set singles_rating = next_rating,
          rating_confidence = least(1, rating_confidence + 0.05)
      where membership_id = participant_record.membership_id;
    else
      update public.player_profiles
      set doubles_rating = next_rating,
          rating_confidence = least(1, rating_confidence + 0.05)
      where membership_id = participant_record.membership_id;
    end if;

    insert into public.rating_history (
      membership_id,
      match_id,
      format,
      previous_rating,
      new_rating,
      delta
    ) values (
      participant_record.membership_id,
      p_match_id,
      event_format,
      previous_rating,
      next_rating,
      next_rating - previous_rating
    ) on conflict (membership_id, match_id) do nothing;
  end loop;

  update public.matches
  set status = 'completed',
      completed_at = now(),
      finalized_at = now(),
      winner_team = locked_match.winner_team,
      version = version + 1
  where id = p_match_id
  returning * into locked_match;

  update public.event_registrations as registration
  set games_played = games_played + 1,
      last_played_at = now(),
      availability = 'resting'
  where registration.event_id = locked_match.event_id
    and exists (
      select 1 from public.match_participants as participant
      where participant.match_id = p_match_id
        and participant.membership_id = registration.membership_id
    );

  update public.courts set status = 'available'
  where id = locked_match.court_id;

  if not exists (
    select 1 from public.matches
    where round_id = locked_match.round_id
      and status not in ('completed', 'cancelled')
  ) then
    update public.event_rounds set status = 'completed'
    where id = locked_match.round_id;
  end if;

  return locked_match;
end;
$$;

revoke all on function private.finalize_match_result(uuid) from public;

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
  select * into locked_match
  from public.matches
  where id = p_match_id
  for update;

  if locked_match.id is null then
    raise exception 'Match not found.' using errcode = 'P0002';
  end if;
  if locked_match.status = 'completed' then
    return locked_match;
  end if;
  if locked_match.status <> 'awaiting_confirmation' then
    raise exception 'This score is not awaiting confirmation.' using errcode = '23514';
  end if;
  if not private.can_score_match(p_match_id) then
    raise exception 'You do not have permission to confirm this score.' using errcode = '42501';
  end if;

  actor_is_manager := private.can_manage_event(locked_match.event_id);
  if locked_match.submitted_by = auth.uid() and not actor_is_manager then
    raise exception 'A different participant or organizer must confirm this score.' using errcode = '42501';
  end if;

  update public.matches
  set confirmed_by = auth.uid(), confirmed_at = now(), version = version + 1
  where id = p_match_id;

  return private.finalize_match_result(p_match_id);
end;
$$;

create or replace function public.dispute_match_result(
  p_match_id uuid,
  p_reason text
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
    raise exception 'You do not have permission to dispute this score.' using errcode = '42501';
  end if;
  if char_length(trim(p_reason)) < 3 then
    raise exception 'Explain the score issue before submitting a dispute.' using errcode = '23514';
  end if;

  update public.matches
  set status = 'disputed',
      disputed_by = auth.uid(),
      disputed_at = now(),
      dispute_reason = trim(p_reason),
      version = version + 1
  where id = p_match_id and status = 'awaiting_confirmation'
  returning * into updated_match;

  if updated_match.id is null then
    raise exception 'Only a submitted score can be disputed.' using errcode = '23514';
  end if;
  return updated_match;
end;
$$;

create or replace function public.resolve_match_dispute(
  p_match_id uuid,
  p_team_one_score integer,
  p_team_two_score integer
)
returns public.matches
language plpgsql
security definer
set search_path = ''
as $$
declare
  locked_match public.matches;
begin
  select * into locked_match
  from public.matches
  where id = p_match_id
  for update;

  if locked_match.id is null then
    raise exception 'Match not found.' using errcode = 'P0002';
  end if;
  if not private.can_manage_event(locked_match.event_id) then
    raise exception 'Only an event organizer or administrator can resolve this dispute.' using errcode = '42501';
  end if;
  if locked_match.status <> 'disputed' then
    raise exception 'This match is not disputed.' using errcode = '23514';
  end if;

  update public.matches
  set team_one_score = p_team_one_score,
      team_two_score = p_team_two_score,
      confirmed_by = auth.uid(),
      confirmed_at = now(),
      version = version + 1
  where id = p_match_id;

  return private.finalize_match_result(p_match_id);
end;
$$;

revoke all on function public.confirm_match_result(uuid) from public, anon;
revoke all on function public.dispute_match_result(uuid, text) from public, anon;
revoke all on function public.resolve_match_dispute(uuid, integer, integer) from public, anon;
grant execute on function public.confirm_match_result(uuid) to authenticated;
grant execute on function public.dispute_match_result(uuid, text) to authenticated;
grant execute on function public.resolve_match_dispute(uuid, integer, integer) to authenticated;
