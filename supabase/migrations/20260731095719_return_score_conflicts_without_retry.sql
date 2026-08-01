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
    team_one_score = case
      when p_team = 1 then greatest(0, team_one_score + p_delta)
      else team_one_score
    end,
    team_two_score = case
      when p_team = 2 then greatest(0, team_two_score + p_delta)
      else team_two_score
    end,
    status = case
      when status = 'scheduled' then 'in_progress'::public.match_status
      else status
    end,
    started_at = coalesce(started_at, now()),
    version = version + 1
  where id = p_match_id
    and version = p_expected_version
    and status in ('scheduled', 'in_progress')
  returning * into updated_match;

  if updated_match.id is null then
    raise exception 'The score changed on another device. Refresh and try again.' using errcode = 'PT409';
  end if;

  insert into public.score_events (
    match_id,
    team,
    delta,
    score_one,
    score_two,
    recorded_by
  )
  values (
    p_match_id,
    p_team,
    p_delta,
    updated_match.team_one_score,
    updated_match.team_two_score,
    auth.uid()
  );

  return updated_match;
end;
$$;;
