create or replace function private.is_event_club_member(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    private.is_club_member(private.event_club_id(p_event_id)),
    false
  );
$$;

revoke all on function private.is_event_club_member(uuid) from public, anon;
grant execute on function private.is_event_club_member(uuid) to authenticated;

grant execute on function private.can_manage_event(uuid) to authenticated;
grant execute on function private.can_operate_event(uuid) to authenticated;

drop policy registrations_select_member on public.event_registrations;
create policy registrations_select_member
on public.event_registrations
for select
to authenticated
using (private.is_event_club_member(event_id));

drop policy courts_select_member on public.courts;
create policy courts_select_member
on public.courts
for select
to authenticated
using (private.is_event_club_member(event_id));

drop policy rounds_select_member on public.event_rounds;
create policy rounds_select_member
on public.event_rounds
for select
to authenticated
using (private.is_event_club_member(event_id));

drop policy matches_select_member on public.matches;
create policy matches_select_member
on public.matches
for select
to authenticated
using (private.is_event_club_member(event_id));

drop policy participants_select_member on public.match_participants;
create policy participants_select_member
on public.match_participants
for select
to authenticated
using (
  exists (
    select 1
    from public.matches
    where id = match_id
      and private.is_event_club_member(event_id)
  )
);

drop policy score_events_select_member on public.score_events;
create policy score_events_select_member
on public.score_events
for select
to authenticated
using (
  exists (
    select 1
    from public.matches
    where id = match_id
      and private.is_event_club_member(event_id)
  )
);;
