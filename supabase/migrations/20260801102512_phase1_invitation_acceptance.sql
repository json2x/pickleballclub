begin;

create table public.club_invitations (
  id uuid primary key default extensions.gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  email extensions.citext not null,
  role public.club_role not null default 'member',
  token_hash bytea not null,
  invited_by uuid not null references public.profiles (id) on delete restrict,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references public.profiles (id) on delete restrict,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint club_invitations_email_not_blank check (char_length(trim(email::text)) > 3),
  constraint club_invitations_role_allowed check (role in ('admin', 'member')),
  constraint club_invitations_token_sha256_length check (octet_length(token_hash) = 32),
  constraint club_invitations_expiry_after_creation check (expires_at > created_at),
  constraint club_invitations_acceptance_consistency check (
    (accepted_at is null and accepted_by is null)
    or (accepted_at is not null and accepted_by is not null)
  ),
  constraint club_invitations_terminal_state check (
    not (accepted_at is not null and revoked_at is not null)
  ),
  constraint club_invitations_token_hash_unique unique (token_hash)
);

create unique index club_invitations_pending_email_idx
  on public.club_invitations (club_id, email)
  where accepted_at is null and revoked_at is null;
create index club_invitations_club_state_idx
  on public.club_invitations (club_id, accepted_at, revoked_at, expires_at);
create index club_invitations_invited_by_idx
  on public.club_invitations (invited_by);
create index club_invitations_accepted_by_idx
  on public.club_invitations (accepted_by)
  where accepted_by is not null;

alter table public.club_invitations enable row level security;
revoke all on table public.club_invitations from public, anon, authenticated;

create or replace function private.prepare_club_invitation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.email := lower(trim(new.email::text))::extensions.citext;
  new.invited_by := (select auth.uid());

  if new.invited_by is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if new.role = 'owner' then
    raise exception 'Invitations cannot grant owner.' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.prepare_club_invitation() from public, anon, authenticated;

create trigger club_invitations_prepare
before insert on public.club_invitations
for each row execute function private.prepare_club_invitation();

create or replace function private.guard_club_invitation_terminal_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.club_id is distinct from old.club_id
     or new.email is distinct from old.email
     or new.role is distinct from old.role
     or new.token_hash is distinct from old.token_hash
     or new.invited_by is distinct from old.invited_by
     or new.created_at is distinct from old.created_at then
    raise exception 'Invitation identity cannot be changed.' using errcode = '22023';
  end if;

  if old.accepted_at is not null or old.revoked_at is not null then
    if new is distinct from old then
      raise exception 'Accepted and revoked invitations are terminal.' using errcode = '22023';
    end if;
  elsif old.accepted_at is distinct from new.accepted_at
        and new.accepted_at is null then
    raise exception 'Invitation acceptance cannot be cleared.' using errcode = '22023';
  elsif old.revoked_at is distinct from new.revoked_at
        and new.revoked_at is null then
    raise exception 'Invitation revocation cannot be cleared.' using errcode = '22023';
  end if;

  return new;
end;
$$;

revoke all on function private.guard_club_invitation_terminal_state()
from public, anon, authenticated;

create trigger club_invitations_guard_terminal_state
before update on public.club_invitations
for each row execute function private.guard_club_invitation_terminal_state();

create policy club_invitations_select_owner_admin
on public.club_invitations
for select
to authenticated
using ((select public.has_club_role(club_id, array['owner', 'admin']::public.club_role[])));

create policy club_invitations_update_owner_admin
on public.club_invitations
for update
to authenticated
using ((select public.has_club_role(club_id, array['owner', 'admin']::public.club_role[])))
with check (
  role in ('admin', 'member')
  and (select public.has_club_role(club_id, array['owner', 'admin']::public.club_role[]))
);

grant select (
  id,
  club_id,
  email,
  role,
  invited_by,
  expires_at,
  accepted_at,
  accepted_by,
  revoked_at,
  created_at
) on table public.club_invitations to authenticated;
grant update (expires_at, revoked_at) on table public.club_invitations to authenticated;

create or replace function public.issue_club_invitation(
  p_club_id uuid,
  p_email text,
  p_role public.club_role default 'member',
  p_expires_at timestamptz default now() + interval '7 days'
)
returns table (
  invitation_id uuid,
  raw_token text,
  invitation_expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  normalized_email extensions.citext := lower(trim(p_email))::extensions.citext;
  generated_token text;
  created_invitation public.club_invitations;
begin
  if actor_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if not public.has_club_role(
    p_club_id,
    array['owner', 'admin']::public.club_role[]
  ) then
    raise exception 'Owner or admin role is required.' using errcode = '42501';
  end if;
  if normalized_email is null or char_length(trim(normalized_email::text)) <= 3 then
    raise exception 'A valid invitation email is required.' using errcode = '22023';
  end if;
  if p_role is null or p_role not in ('admin', 'member') then
    raise exception 'Invitations cannot grant owner.' using errcode = '42501';
  end if;
  if p_expires_at is null or p_expires_at <= now() then
    raise exception 'Invitation expiry must be in the future.' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_club_id::text || ':' || normalized_email::text, 0)
  );

  update public.club_invitations
  set revoked_at = now()
  where club_id = p_club_id
    and email = normalized_email
    and accepted_at is null
    and revoked_at is null
    and expires_at <= now();

  if exists (
    select 1
    from public.club_invitations as invitation
    where invitation.club_id = p_club_id
      and invitation.email = normalized_email
      and invitation.accepted_at is null
      and invitation.revoked_at is null
  ) then
    raise exception 'An active invitation already exists for this email.'
      using errcode = '23505';
  end if;

  generated_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.club_invitations (
    club_id, email, role, token_hash, expires_at
  )
  values (
    p_club_id,
    normalized_email,
    p_role,
    extensions.digest(convert_to(generated_token, 'UTF8'), 'sha256'),
    p_expires_at
  )
  returning * into created_invitation;

  return query
  select created_invitation.id, generated_token, created_invitation.expires_at;
end;
$$;

create or replace function public.accept_club_invitation(p_token text)
returns public.club_memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_email extensions.citext;
  invitation public.club_invitations;
  created_membership public.club_memberships;
  existing_membership public.club_memberships;
begin
  if actor_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if nullif(p_token, '') is null then
    raise exception 'Invitation token is required.' using errcode = '22023';
  end if;

  select nullif(lower(trim(users.email)), '')::extensions.citext
  into actor_email
  from auth.users as users
  where users.id = actor_id;

  if actor_email is null then
    raise exception 'The signed-in account requires an email address.' using errcode = '42501';
  end if;

  select *
  into invitation
  from public.club_invitations as candidate
  where candidate.token_hash = extensions.digest(
    convert_to(p_token, 'UTF8'),
    'sha256'
  )
  for update;

  if invitation.id is null then
    raise exception 'Invitation is invalid.' using errcode = 'P0002';
  end if;
  if invitation.accepted_at is not null then
    raise exception 'Invitation has already been accepted.' using errcode = '23505';
  end if;
  if invitation.revoked_at is not null then
    raise exception 'Invitation has been revoked.' using errcode = '42501';
  end if;
  if invitation.expires_at <= now() then
    raise exception 'Invitation has expired.' using errcode = '22023';
  end if;
  if invitation.email <> actor_email then
    raise exception 'Invitation email does not match the signed-in account.' using errcode = '42501';
  end if;
  if invitation.role = 'owner' then
    raise exception 'Invitations cannot grant owner.' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(invitation.club_id::text || ':' || actor_id::text, 0)
  );

  select *
  into existing_membership
  from public.club_memberships as membership
  where membership.club_id = invitation.club_id
    and membership.user_id = actor_id
  for update;

  if existing_membership.id is null then
    insert into public.club_memberships (
      club_id, user_id, role, status, joined_at
    )
    values (
      invitation.club_id, actor_id, invitation.role, 'active', now()
    )
    returning * into created_membership;
  elsif existing_membership.status <> 'active' then
    if existing_membership.role = 'owner' then
      raise exception 'An inactive owner membership cannot accept an invitation.'
        using errcode = '23514';
    end if;

    perform set_config(
      'pickle_lo.role_change_reason',
      'Invitation acceptance',
      true
    );
    update public.club_memberships
    set role = invitation.role,
        status = 'active',
        joined_at = now()
    where id = existing_membership.id
    returning * into created_membership;
    perform set_config('pickle_lo.role_change_reason', '', true);
  elsif existing_membership.role = 'member' and invitation.role = 'admin' then
    perform set_config(
      'pickle_lo.role_change_reason',
      'Invitation acceptance',
      true
    );
    update public.club_memberships
    set role = 'admin'
    where id = existing_membership.id
    returning * into created_membership;
    perform set_config('pickle_lo.role_change_reason', '', true);
  else
    created_membership := existing_membership;
  end if;

  update public.club_invitations
  set accepted_at = now(), accepted_by = actor_id
  where id = invitation.id;

  update public.profiles
  set active_club_id = invitation.club_id
  where id = actor_id;

  return created_membership;
end;
$$;

revoke all on function public.issue_club_invitation(uuid, text, public.club_role, timestamptz)
from public, anon, authenticated;
revoke all on function public.accept_club_invitation(text) from public, anon, authenticated;
grant execute on function public.issue_club_invitation(uuid, text, public.club_role, timestamptz)
to authenticated;
grant execute on function public.accept_club_invitation(text) to authenticated;

commit;
