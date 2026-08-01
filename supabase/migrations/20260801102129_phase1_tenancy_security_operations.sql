begin;

create or replace function public.is_club_member(p_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.club_memberships as membership
    where membership.club_id = p_club_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
  );
$$;

create or replace function public.has_club_role(
  p_club_id uuid,
  p_roles public.club_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.club_memberships as membership
    where membership.club_id = p_club_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and membership.role = any (p_roles)
  );
$$;

revoke all on function public.is_club_member(uuid) from public, anon, authenticated;
revoke all on function public.has_club_role(uuid, public.club_role[]) from public, anon, authenticated;
grant execute on function public.is_club_member(uuid) to authenticated;
grant execute on function public.has_club_role(uuid, public.club_role[]) to authenticated;

create policy profiles_select_visible_to_club_members
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1
    from public.club_memberships as own_membership
    join public.club_memberships as visible_membership
      on visible_membership.club_id = own_membership.club_id
     and visible_membership.user_id = profiles.id
     and visible_membership.status = 'active'
    where own_membership.user_id = (select auth.uid())
      and own_membership.status = 'active'
  )
);

create policy profiles_update_self
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy clubs_select_members
on public.clubs
for select
to authenticated
using ((select public.is_club_member(id)));

create policy clubs_update_owner_admin
on public.clubs
for update
to authenticated
using ((select public.has_club_role(id, array['owner', 'admin']::public.club_role[])))
with check ((select public.has_club_role(id, array['owner', 'admin']::public.club_role[])));

create policy clubs_delete_owner
on public.clubs
for delete
to authenticated
using ((select public.has_club_role(id, array['owner']::public.club_role[])));

create policy club_memberships_select_club_members
on public.club_memberships
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select public.is_club_member(club_id))
);

create policy club_memberships_update_owner_admin
on public.club_memberships
for update
to authenticated
using ((select public.has_club_role(club_id, array['owner', 'admin']::public.club_role[])))
with check ((select public.has_club_role(club_id, array['owner', 'admin']::public.club_role[])));

create policy club_memberships_delete_owner_admin
on public.club_memberships
for delete
to authenticated
using ((select public.has_club_role(club_id, array['owner', 'admin']::public.club_role[])));

create policy club_membership_role_audit_select_club_members
on public.club_membership_role_audit
for select
to authenticated
using ((select public.is_club_member(club_id)));

grant select (id, display_name, first_name, last_name, avatar_url)
  on table public.profiles to authenticated;
grant update (display_name, first_name, last_name, avatar_url, phone, timezone) on table public.profiles to authenticated;
grant select on table public.clubs to authenticated;
grant update (name, slug, location, description, logo_path, join_policy, timezone, currency) on table public.clubs to authenticated;
grant delete on table public.clubs to authenticated;
grant select on table public.club_memberships to authenticated;
grant update (role, status) on table public.club_memberships to authenticated;
grant delete on table public.club_memberships to authenticated;
grant select on table public.club_membership_role_audit to authenticated;

create or replace function private.guard_membership_change()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  actor_role public.club_role;
begin
  if tg_op = 'UPDATE'
     and (
       new.club_id is distinct from old.club_id
       or new.user_id is distinct from old.user_id
     ) then
    raise exception 'Membership club and user cannot be changed.' using errcode = '22023';
  end if;

  if current_user = pg_catalog.pg_get_userbyid(
    (
      select relation.relowner
      from pg_catalog.pg_class as relation
      where relation.oid = 'public.club_memberships'::regclass
    )
  ) then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE'
     and not exists (
       select 1
       from public.clubs as club
       where club.id = old.club_id
     ) then
    return old;
  end if;

  select membership.role
  into actor_role
  from public.club_memberships as membership
  where membership.club_id = coalesce(new.club_id, old.club_id)
    and membership.user_id = (select auth.uid())
    and membership.status = 'active';

  if actor_role is null or actor_role not in ('owner', 'admin') then
    raise exception 'Owner or admin role is required.' using errcode = '42501';
  end if;

  if old.role = 'owner'
     or (tg_op = 'UPDATE' and new.role = 'owner') then
    raise exception 'Ownership can change only through transfer_club_ownership.'
      using errcode = '42501';
  end if;

  if actor_role = 'admin'
     and (old.role = 'owner' or (tg_op = 'UPDATE' and new.role = 'owner')) then
    raise exception 'Admins cannot modify the owner.' using errcode = '42501';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function private.guard_membership_change() from public, anon, authenticated;

create trigger club_memberships_guard_change
before update or delete on public.club_memberships
for each row execute function private.guard_membership_change();

create or replace function private.maintain_active_club_after_membership_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'active'
     and (
       tg_op = 'DELETE'
       or new.status is distinct from 'active'::public.club_membership_status
     ) then
    update public.profiles
    set active_club_id = null
    where id = old.user_id
      and active_club_id = old.club_id;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function private.maintain_active_club_after_membership_change()
from public, anon, authenticated;

create trigger club_memberships_maintain_active_club
after update of status or delete on public.club_memberships
for each row execute function private.maintain_active_club_after_membership_change();

create or replace function private.check_exactly_one_active_owner(p_club_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_owner_count integer;
begin
  if not exists (select 1 from public.clubs where id = p_club_id) then
    return;
  end if;

  select count(*)
  into active_owner_count
  from public.club_memberships as membership
  where membership.club_id = p_club_id
    and membership.role = 'owner'
    and membership.status = 'active';

  if active_owner_count <> 1 then
    raise exception 'A club must have exactly one active owner.' using errcode = '23514';
  end if;
end;
$$;

revoke all on function private.check_exactly_one_active_owner(uuid)
from public, anon, authenticated;

create or replace function private.assert_exactly_one_active_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  checked_club_id uuid;
  checked_club_ids uuid[];
begin
  if tg_table_name = 'clubs' then
    checked_club_ids := array[coalesce(new.id, old.id)];
  elsif tg_op = 'UPDATE' then
    checked_club_ids := array[old.club_id, new.club_id];
  else
    checked_club_ids := array[coalesce(new.club_id, old.club_id)];
  end if;

  foreach checked_club_id in array checked_club_ids loop
    continue when checked_club_id is null;
    if current_setting('pickle_lo.owner_transition_club_id', true)
       is distinct from checked_club_id::text then
      perform private.check_exactly_one_active_owner(checked_club_id);
    end if;
  end loop;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function private.assert_exactly_one_active_owner() from public, anon, authenticated;

create constraint trigger club_memberships_exactly_one_active_owner
after insert or update or delete on public.club_memberships
deferrable initially deferred
for each row execute function private.assert_exactly_one_active_owner();

create constraint trigger clubs_exactly_one_active_owner
after insert or update on public.clubs
deferrable initially deferred
for each row execute function private.assert_exactly_one_active_owner();

create or replace function private.audit_membership_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  audit_reason text := coalesce(
    nullif(trim(current_setting('pickle_lo.role_change_reason', true)), ''),
    'Membership role changed'
  );
begin
  if old.role is distinct from new.role then
    if actor_id is null then
      raise exception 'Authentication is required to change a membership role.'
        using errcode = '42501';
    end if;

    insert into public.club_membership_role_audit (
      club_id,
      membership_id,
      user_id,
      previous_role,
      new_role,
      changed_by,
      reason
    )
    values (
      new.club_id,
      new.id,
      new.user_id,
      old.role,
      new.role,
      actor_id,
      audit_reason
    );
  end if;

  return new;
end;
$$;

revoke all on function private.audit_membership_role_change()
  from public, anon, authenticated;

create trigger club_memberships_audit_role_change
after update of role on public.club_memberships
for each row execute function private.audit_membership_role_change();

create or replace function public.get_my_profile()
returns public.profiles
language sql
stable
security definer
set search_path = ''
as $$
  select profile.*
  from public.profiles as profile
  where profile.id = (select auth.uid());
$$;

create or replace function public.search_joinable_clubs(p_query text default null)
returns table (
  id uuid,
  name text,
  slug text,
  location text,
  logo_path text,
  join_policy public.club_join_policy
)
language sql
stable
security definer
set search_path = ''
as $$
  select club.id, club.name, club.slug, club.location, club.logo_path, club.join_policy
  from public.clubs as club
  where (select auth.uid()) is not null
    and club.join_policy <> 'invite_only'
    and (
      nullif(trim(p_query), '') is null
      or club.name ilike '%' || trim(p_query) || '%'
      or club.location ilike '%' || trim(p_query) || '%'
      or club.slug = lower(trim(p_query))
    )
  order by club.name, club.id;
$$;

create or replace function public.create_club(
  p_name text,
  p_slug text,
  p_location text,
  p_join_policy public.club_join_policy default 'approval',
  p_description text default null,
  p_timezone text default 'Asia/Manila'
)
returns public.clubs
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  created_club_id uuid := extensions.gen_random_uuid();
  created_club public.clubs;
begin
  if actor_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if not exists (select 1 from public.profiles where id = actor_id) then
    raise exception 'A profile is required.' using errcode = '23503';
  end if;

  perform set_config(
    'pickle_lo.owner_transition_club_id',
    created_club_id::text,
    true
  );

  insert into public.clubs (
    id, name, slug, location, description, join_policy, timezone, created_by
  )
  values (
    created_club_id,
    trim(p_name),
    lower(trim(p_slug)),
    trim(p_location),
    nullif(trim(p_description), ''),
    p_join_policy,
    trim(p_timezone),
    actor_id
  )
  returning * into created_club;

  insert into public.club_memberships (
    club_id, user_id, role, status, joined_at
  )
  values (created_club.id, actor_id, 'owner', 'active', now());

  perform set_config('pickle_lo.owner_transition_club_id', '', true);
  perform private.check_exactly_one_active_owner(created_club.id);

  update public.profiles
  set active_club_id = created_club.id
  where id = actor_id;

  return created_club;
end;
$$;

create or replace function public.join_club_by_slug(p_slug text)
returns public.club_memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_club public.clubs;
  created_membership public.club_memberships;
  membership_status public.club_membership_status;
begin
  if actor_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select *
  into target_club
  from public.clubs as club
  where club.slug = lower(trim(p_slug))
  for update;

  if target_club.id is null then
    raise exception 'Club not found.' using errcode = 'P0002';
  end if;

  if target_club.join_policy = 'invite_only' then
    raise exception 'This club requires an invitation.' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(target_club.id::text || ':' || actor_id::text, 0)
  );

  membership_status := case target_club.join_policy
    when 'open' then 'active'::public.club_membership_status
    else 'pending'::public.club_membership_status
  end;

  insert into public.club_memberships (
    club_id, user_id, role, status, joined_at
  )
  values (
    target_club.id,
    actor_id,
    'member',
    membership_status,
    case when membership_status = 'active' then now() else null end
  )
  returning * into created_membership;

  if membership_status = 'active' then
    update public.profiles
    set active_club_id = target_club.id
    where id = actor_id;
  end if;

  return created_membership;
end;
$$;

create or replace function public.approve_club_membership(p_membership_id uuid)
returns public.club_memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_membership public.club_memberships;
begin
  if actor_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select *
  into target_membership
  from public.club_memberships as membership
  where membership.id = p_membership_id
  for update;

  if target_membership.id is null then
    raise exception 'Membership not found.' using errcode = 'P0002';
  end if;
  if not public.has_club_role(
    target_membership.club_id,
    array['owner', 'admin']::public.club_role[]
  ) then
    raise exception 'Owner or admin role is required.' using errcode = '42501';
  end if;
  if target_membership.status <> 'pending' then
    raise exception 'Only a pending membership can be approved.' using errcode = '22023';
  end if;

  update public.club_memberships
  set status = 'active', joined_at = now()
  where id = target_membership.id
  returning * into target_membership;

  return target_membership;
end;
$$;

create or replace function public.set_active_club(p_club_id uuid)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  updated_profile public.profiles;
begin
  if actor_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.club_memberships as membership
    where membership.club_id = p_club_id
      and membership.user_id = actor_id
      and membership.status = 'active'
  ) then
    raise exception 'Active club membership is required.' using errcode = '42501';
  end if;

  update public.profiles
  set active_club_id = p_club_id
  where id = actor_id
  returning * into updated_profile;

  return updated_profile;
end;
$$;

create or replace function public.transfer_club_ownership(
  p_club_id uuid,
  p_new_owner_user_id uuid,
  p_confirm boolean,
  p_reason text
)
returns public.club_memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  old_owner_membership public.club_memberships;
  new_owner_membership public.club_memberships;
begin
  if actor_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if p_confirm is distinct from true then
    raise exception 'Ownership transfer requires explicit confirmation.' using errcode = '22023';
  end if;
  if nullif(trim(p_reason), '') is null then
    raise exception 'Ownership transfer reason is required.' using errcode = '22023';
  end if;
  if actor_id = p_new_owner_user_id then
    raise exception 'The owner already owns this club.' using errcode = '22023';
  end if;

  perform 1 from public.clubs where id = p_club_id for update;
  if not found then
    raise exception 'Club not found.' using errcode = 'P0002';
  end if;

  select *
  into old_owner_membership
  from public.club_memberships as membership
  where membership.club_id = p_club_id
    and membership.user_id = actor_id
    and membership.role = 'owner'
    and membership.status = 'active'
  for update;

  if old_owner_membership.id is null then
    raise exception 'Only the active owner can transfer ownership.' using errcode = '42501';
  end if;

  select *
  into new_owner_membership
  from public.club_memberships as membership
  where membership.club_id = p_club_id
    and membership.user_id = p_new_owner_user_id
    and membership.status = 'active'
  for update;

  if new_owner_membership.id is null then
    raise exception 'The new owner must be an active club member.' using errcode = '23503';
  end if;

  perform set_config('pickle_lo.role_change_reason', trim(p_reason), true);
  perform set_config('pickle_lo.owner_transition_club_id', p_club_id::text, true);

  update public.club_memberships
  set role = 'admin'
  where id = old_owner_membership.id;

  update public.club_memberships
  set role = 'owner'
  where id = new_owner_membership.id;

  perform set_config('pickle_lo.role_change_reason', '', true);
  perform set_config('pickle_lo.owner_transition_club_id', '', true);
  perform private.check_exactly_one_active_owner(p_club_id);

  select *
  into new_owner_membership
  from public.club_memberships
  where id = new_owner_membership.id;

  return new_owner_membership;
end;
$$;

revoke all on function public.search_joinable_clubs(text) from public, anon, authenticated;
revoke all on function public.get_my_profile() from public, anon, authenticated;
revoke all on function public.create_club(text, text, text, public.club_join_policy, text, text) from public, anon, authenticated;
revoke all on function public.join_club_by_slug(text) from public, anon, authenticated;
revoke all on function public.approve_club_membership(uuid) from public, anon, authenticated;
revoke all on function public.set_active_club(uuid) from public, anon, authenticated;
revoke all on function public.transfer_club_ownership(uuid, uuid, boolean, text) from public, anon, authenticated;

grant execute on function public.search_joinable_clubs(text) to authenticated;
grant execute on function public.get_my_profile() to authenticated;
grant execute on function public.create_club(text, text, text, public.club_join_policy, text, text) to authenticated;
grant execute on function public.join_club_by_slug(text) to authenticated;
grant execute on function public.approve_club_membership(uuid) to authenticated;
grant execute on function public.set_active_club(uuid) to authenticated;
grant execute on function public.transfer_club_ownership(uuid, uuid, boolean, text) to authenticated;

commit;
