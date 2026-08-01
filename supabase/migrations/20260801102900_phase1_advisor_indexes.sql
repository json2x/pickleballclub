begin;

create index if not exists club_membership_role_audit_changed_by_idx
  on public.club_membership_role_audit (changed_by);

commit;
