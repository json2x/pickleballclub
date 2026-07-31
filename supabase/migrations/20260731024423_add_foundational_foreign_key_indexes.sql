create index clubs_owner_user_id_idx
  on public.clubs (owner_user_id);

create index club_role_assignments_membership_club_idx
  on public.club_role_assignments (membership_id, club_id);

create index club_role_assignments_granted_by_idx
  on public.club_role_assignments (granted_by);

create index club_invitations_invited_by_idx
  on public.club_invitations (invited_by);

create index club_invitations_accepted_by_idx
  on public.club_invitations (accepted_by)
  where accepted_by is not null;
