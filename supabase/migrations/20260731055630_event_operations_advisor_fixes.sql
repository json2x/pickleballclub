create index announcements_created_by_idx on public.announcements (created_by);
create index announcements_event_id_idx on public.announcements (event_id) where event_id is not null;
create index event_registrations_membership_id_idx on public.event_registrations (membership_id);
create index event_rounds_confirmed_by_idx on public.event_rounds (confirmed_by) where confirmed_by is not null;
create index events_created_by_idx on public.events (created_by);
create index matches_submitted_by_idx on public.matches (submitted_by) where submitted_by is not null;
create index rating_history_match_id_idx on public.rating_history (match_id);
create index score_events_recorded_by_idx on public.score_events (recorded_by);

drop policy events_insert_organizer on public.events;
create policy events_insert_organizer on public.events for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_club_role(club_id, array['administrator', 'event_organizer']::public.club_role[])
);

drop policy registrations_insert_self_or_organizer on public.event_registrations;
create policy registrations_insert_self_or_organizer on public.event_registrations for insert to authenticated
with check (
  private.can_manage_event(event_id)
  or exists (
    select 1 from public.club_memberships
    where id = membership_id
      and profile_id = (select auth.uid())
      and membership_status = 'active'
  )
);

drop policy registrations_update_self_or_organizer on public.event_registrations;
create policy registrations_update_self_or_organizer on public.event_registrations for update to authenticated
using (
  private.can_manage_event(event_id)
  or exists (
    select 1 from public.club_memberships
    where id = membership_id and profile_id = (select auth.uid())
  )
)
with check (
  private.can_manage_event(event_id)
  or exists (
    select 1 from public.club_memberships
    where id = membership_id and profile_id = (select auth.uid())
  )
);

drop policy registrations_delete_self_or_organizer on public.event_registrations;
create policy registrations_delete_self_or_organizer on public.event_registrations for delete to authenticated
using (
  private.can_manage_event(event_id)
  or exists (
    select 1 from public.club_memberships
    where id = membership_id and profile_id = (select auth.uid())
  )
);

drop policy courts_manage_organizer on public.courts;
create policy courts_insert_organizer on public.courts for insert to authenticated
with check (private.can_manage_event(event_id));
create policy courts_update_organizer on public.courts for update to authenticated
using (private.can_manage_event(event_id)) with check (private.can_manage_event(event_id));
create policy courts_delete_organizer on public.courts for delete to authenticated
using (private.can_manage_event(event_id));

drop policy rounds_manage_organizer on public.event_rounds;
create policy rounds_insert_organizer on public.event_rounds for insert to authenticated
with check (private.can_manage_event(event_id));
create policy rounds_update_organizer on public.event_rounds for update to authenticated
using (private.can_manage_event(event_id)) with check (private.can_manage_event(event_id));
create policy rounds_delete_organizer on public.event_rounds for delete to authenticated
using (private.can_manage_event(event_id));

drop policy matches_manage_organizer on public.matches;
create policy matches_insert_organizer on public.matches for insert to authenticated
with check (private.can_manage_event(event_id));
create policy matches_update_organizer on public.matches for update to authenticated
using (private.can_manage_event(event_id)) with check (private.can_manage_event(event_id));
create policy matches_delete_organizer on public.matches for delete to authenticated
using (private.can_manage_event(event_id));

drop policy participants_manage_organizer on public.match_participants;
create policy participants_insert_organizer on public.match_participants for insert to authenticated
with check (exists (select 1 from public.matches where id = match_id and private.can_manage_event(event_id)));
create policy participants_update_organizer on public.match_participants for update to authenticated
using (exists (select 1 from public.matches where id = match_id and private.can_manage_event(event_id)))
with check (exists (select 1 from public.matches where id = match_id and private.can_manage_event(event_id)));
create policy participants_delete_organizer on public.match_participants for delete to authenticated
using (exists (select 1 from public.matches where id = match_id and private.can_manage_event(event_id)));

drop policy announcements_manage_organizer on public.announcements;
create policy announcements_insert_organizer on public.announcements for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.has_club_role(club_id, array['administrator', 'event_organizer']::public.club_role[])
);
create policy announcements_update_organizer on public.announcements for update to authenticated
using (private.has_club_role(club_id, array['administrator', 'event_organizer']::public.club_role[]))
with check (private.has_club_role(club_id, array['administrator', 'event_organizer']::public.club_role[]));
create policy announcements_delete_organizer on public.announcements for delete to authenticated
using (private.has_club_role(club_id, array['administrator', 'event_organizer']::public.club_role[]));
