create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
alter default privileges in schema private revoke execute on functions from public;

create type public.club_status as enum ('active', 'archived');
create type public.membership_status as enum ('invited', 'active', 'inactive', 'suspended');
create type public.club_role as enum (
  'administrator',
  'event_organizer',
  'court_marshal',
  'scorekeeper',
  'member',
  'guest'
);
create type public.gender_category as enum ('female', 'male', 'non_binary', 'prefer_not_to_say');
create type public.skill_level as enum ('beginner', 'novice', 'intermediate', 'advanced', 'expert');
create type public.preferred_side as enum ('left', 'right', 'either');
create type public.play_preference as enum ('competitive', 'balanced', 'social');
create type public.dominant_hand as enum ('left', 'right', 'ambidextrous');
create type public.preferred_format as enum ('singles', 'doubles', 'either');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  email text not null,
  avatar_url text,
  timezone text not null default 'UTC' check (char_length(trim(timezone)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 100),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  logo_url text,
  description text,
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  timezone text not null check (char_length(trim(timezone)) > 0),
  status public.club_status not null default 'active',
  owner_user_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.club_memberships (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  member_number text,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  email text,
  phone text,
  gender_category public.gender_category,
  membership_status public.membership_status not null default 'invited',
  is_guest boolean not null default false,
  joined_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, club_id),
  constraint guest_profile_consistency check (not is_guest or profile_id is null)
);

create unique index club_memberships_club_profile_key
  on public.club_memberships (club_id, profile_id)
  where profile_id is not null;
create unique index club_memberships_member_number_key
  on public.club_memberships (club_id, member_number)
  where member_number is not null;
create index club_memberships_profile_id_idx on public.club_memberships (profile_id);
create index club_memberships_club_status_idx
  on public.club_memberships (club_id, membership_status);

create table public.club_role_assignments (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null,
  membership_id uuid not null,
  role public.club_role not null,
  granted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (membership_id, club_id)
    references public.club_memberships (id, club_id)
    on delete cascade,
  unique (membership_id, role)
);

create index club_role_assignments_club_role_idx
  on public.club_role_assignments (club_id, role);

create table public.player_profiles (
  membership_id uuid primary key references public.club_memberships (id) on delete cascade,
  singles_rating numeric(7, 2) not null default 1200 check (singles_rating between 0 and 3000),
  doubles_rating numeric(7, 2) not null default 1200 check (doubles_rating between 0 and 3000),
  initial_skill_level public.skill_level not null default 'intermediate',
  preferred_side public.preferred_side not null default 'either',
  play_preference public.play_preference not null default 'balanced',
  dominant_hand public.dominant_hand,
  preferred_format public.preferred_format not null default 'either',
  rating_confidence numeric(4, 3) not null default 0 check (rating_confidence between 0 and 1),
  updated_at timestamptz not null default now()
);

create table public.club_invitations (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  email text not null check (char_length(trim(email)) > 3),
  role public.club_role not null default 'member',
  token_hash text not null unique,
  invited_by uuid not null references public.profiles (id) on delete restrict,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint invitation_expiry_after_creation check (expires_at > created_at),
  constraint invitation_acceptance_consistency check (
    (accepted_at is null and accepted_by is null)
    or (accepted_at is not null and accepted_by is not null)
  )
);

create unique index club_invitations_pending_email_key
  on public.club_invitations (club_id, lower(email))
  where accepted_at is null;
create index club_invitations_club_id_idx on public.club_invitations (club_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger clubs_set_updated_at
before update on public.clubs
for each row execute function private.set_updated_at();

create trigger club_memberships_set_updated_at
before update on public.club_memberships
for each row execute function private.set_updated_at();

create trigger player_profiles_set_updated_at
before update on public.player_profiles
for each row execute function private.set_updated_at();

create or replace function private.create_player_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.player_profiles (membership_id)
  values (new.id);
  return new;
end;
$$;

revoke all on function private.create_player_profile() from public;

create trigger club_memberships_create_player_profile
after insert on public.club_memberships
for each row execute function private.create_player_profile();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_display_name text;
begin
  safe_display_name := left(
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(split_part(coalesce(new.email, ''), '@', 1)), ''),
      'Player'
    ),
    80
  );

  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    safe_display_name,
    coalesce(nullif(trim(new.email), ''), '')
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

insert into public.profiles (id, display_name, email, created_at, updated_at)
select
  users.id,
  left(
    coalesce(
      nullif(trim(users.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(users.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(split_part(coalesce(users.email, ''), '@', 1)), ''),
      'Player'
    ),
    80
  ),
  coalesce(nullif(trim(users.email), ''), ''),
  users.created_at,
  coalesce(users.updated_at, users.created_at)
from auth.users as users
on conflict (id) do nothing;

create or replace function private.is_club_member(p_club_id uuid)
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
      and membership.profile_id = (select auth.uid())
      and membership.membership_status = 'active'
  );
$$;

create or replace function private.has_club_role(
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
    join public.club_role_assignments as assignment
      on assignment.membership_id = membership.id
      and assignment.club_id = membership.club_id
    where membership.club_id = p_club_id
      and membership.profile_id = (select auth.uid())
      and membership.membership_status = 'active'
      and assignment.role = any (p_roles)
  );
$$;

revoke all on function private.is_club_member(uuid) from public;
revoke all on function private.has_club_role(uuid, public.club_role[]) from public;
grant execute on function private.is_club_member(uuid) to authenticated;
grant execute on function private.has_club_role(uuid, public.club_role[]) to authenticated;

create or replace function private.set_role_granted_by()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.granted_by = (select auth.uid());
  return new;
end;
$$;

revoke all on function private.set_role_granted_by() from public;

create trigger club_role_assignments_set_granted_by
before insert on public.club_role_assignments
for each row execute function private.set_role_granted_by();

create or replace function private.set_invitation_invited_by()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.invited_by = (select auth.uid());
  new.email = lower(trim(new.email));
  return new;
end;
$$;

revoke all on function private.set_invitation_invited_by() from public;

create trigger club_invitations_set_invited_by
before insert on public.club_invitations
for each row execute function private.set_invitation_invited_by();

create or replace function public.create_club(
  p_name text,
  p_slug text,
  p_country_code text,
  p_timezone text,
  p_description text default null
)
returns public.clubs
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile public.profiles;
  created_club public.clubs;
  created_membership public.club_memberships;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select * into current_profile
  from public.profiles
  where id = (select auth.uid());

  if current_profile.id is null then
    raise exception 'Complete your profile before creating a club.' using errcode = '23503';
  end if;

  insert into public.clubs (
    name,
    slug,
    description,
    country_code,
    timezone,
    owner_user_id
  )
  values (
    trim(p_name),
    lower(trim(p_slug)),
    nullif(trim(p_description), ''),
    upper(trim(p_country_code)),
    trim(p_timezone),
    current_profile.id
  )
  returning * into created_club;

  insert into public.club_memberships (
    club_id,
    profile_id,
    display_name,
    email,
    membership_status,
    joined_at
  )
  values (
    created_club.id,
    current_profile.id,
    current_profile.display_name,
    current_profile.email,
    'active',
    current_date
  )
  returning * into created_membership;

  insert into public.club_role_assignments (
    club_id,
    membership_id,
    role,
    granted_by
  )
  values (
    created_club.id,
    created_membership.id,
    'administrator',
    current_profile.id
  );

  return created_club;
end;
$$;

revoke all on function public.create_club(text, text, text, text, text) from public, anon;
grant execute on function public.create_club(text, text, text, text, text) to authenticated;

create or replace function private.assert_club_owner_admin_lifecycle()
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
  elsif tg_op = 'INSERT' then
    checked_club_ids := array[new.club_id];
  elsif tg_op = 'DELETE' then
    checked_club_ids := array[old.club_id];
  else
    checked_club_ids := array[old.club_id, new.club_id];
  end if;

  foreach checked_club_id in array checked_club_ids loop
    continue when checked_club_id is null;
    continue when not exists (
      select 1 from public.clubs where id = checked_club_id
    );

    if not exists (
      select 1
      from public.clubs as club
      join public.club_memberships as membership
        on membership.club_id = club.id
        and membership.profile_id = club.owner_user_id
        and membership.membership_status = 'active'
      join public.club_role_assignments as assignment
        on assignment.club_id = membership.club_id
        and assignment.membership_id = membership.id
        and assignment.role = 'administrator'
      where club.id = checked_club_id
    ) then
      raise exception 'Club owner must retain an active administrator membership.'
        using errcode = '23514';
    end if;
  end loop;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke all on function private.assert_club_owner_admin_lifecycle() from public;

create constraint trigger clubs_owner_admin_lifecycle
after insert or update or delete on public.clubs
deferrable initially deferred
for each row execute function private.assert_club_owner_admin_lifecycle();

create constraint trigger club_memberships_owner_admin_lifecycle
after insert or update or delete on public.club_memberships
deferrable initially deferred
for each row execute function private.assert_club_owner_admin_lifecycle();

create constraint trigger club_role_assignments_owner_admin_lifecycle
after insert or update or delete on public.club_role_assignments
deferrable initially deferred
for each row execute function private.assert_club_owner_admin_lifecycle();

alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.club_memberships enable row level security;
alter table public.club_role_assignments enable row level security;
alter table public.player_profiles enable row level security;
alter table public.club_invitations enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.clubs from anon, authenticated;
revoke all on table public.club_memberships from anon, authenticated;
revoke all on table public.club_role_assignments from anon, authenticated;
revoke all on table public.player_profiles from anon, authenticated;
revoke all on table public.club_invitations from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url, timezone) on table public.profiles to authenticated;
grant select, delete on table public.clubs to authenticated;
grant update (name, slug, logo_url, description, country_code, timezone, status)
  on table public.clubs to authenticated;
grant select, delete on table public.club_memberships to authenticated;
grant insert (
  club_id,
  profile_id,
  member_number,
  display_name,
  email,
  phone,
  gender_category,
  membership_status,
  is_guest,
  joined_at
) on table public.club_memberships to authenticated;
grant update (
  member_number,
  display_name,
  email,
  phone,
  gender_category,
  membership_status,
  is_guest,
  joined_at
) on table public.club_memberships to authenticated;
grant select, delete on table public.club_role_assignments to authenticated;
grant insert (club_id, membership_id, role)
  on table public.club_role_assignments to authenticated;
grant update (role) on table public.club_role_assignments to authenticated;
grant select on table public.player_profiles to authenticated;
grant update (preferred_side, play_preference, dominant_hand, preferred_format)
  on table public.player_profiles to authenticated;
grant select (
  id,
  club_id,
  email,
  role,
  invited_by,
  expires_at,
  accepted_at,
  accepted_by,
  created_at
) on table public.club_invitations to authenticated;
grant insert (club_id, email, role, token_hash, expires_at)
  on table public.club_invitations to authenticated;
grant update (expires_at) on table public.club_invitations to authenticated;
grant delete on table public.club_invitations to authenticated;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy clubs_select_member
on public.clubs
for select
to authenticated
using (
  owner_user_id = (select auth.uid())
  or (select private.is_club_member(id))
);

create policy clubs_update_administrator
on public.clubs
for update
to authenticated
using ((select private.has_club_role(id, array['administrator']::public.club_role[])))
with check ((select private.has_club_role(id, array['administrator']::public.club_role[])));

create policy clubs_delete_administrator
on public.clubs
for delete
to authenticated
using ((select private.has_club_role(id, array['administrator']::public.club_role[])));

create policy club_memberships_select_member
on public.club_memberships
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or (select private.is_club_member(club_id))
);

create policy club_memberships_insert_administrator
on public.club_memberships
for insert
to authenticated
with check ((select private.has_club_role(club_id, array['administrator']::public.club_role[])));

create policy club_memberships_update_administrator
on public.club_memberships
for update
to authenticated
using ((select private.has_club_role(club_id, array['administrator']::public.club_role[])))
with check ((select private.has_club_role(club_id, array['administrator']::public.club_role[])));

create policy club_memberships_delete_administrator
on public.club_memberships
for delete
to authenticated
using ((select private.has_club_role(club_id, array['administrator']::public.club_role[])));

create policy club_role_assignments_select_member
on public.club_role_assignments
for select
to authenticated
using ((select private.is_club_member(club_id)));

create policy club_role_assignments_insert_administrator
on public.club_role_assignments
for insert
to authenticated
with check ((select private.has_club_role(club_id, array['administrator']::public.club_role[])));

create policy club_role_assignments_update_administrator
on public.club_role_assignments
for update
to authenticated
using ((select private.has_club_role(club_id, array['administrator']::public.club_role[])))
with check ((select private.has_club_role(club_id, array['administrator']::public.club_role[])));

create policy club_role_assignments_delete_administrator
on public.club_role_assignments
for delete
to authenticated
using ((select private.has_club_role(club_id, array['administrator']::public.club_role[])));

create policy player_profiles_select_member
on public.player_profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.club_memberships as membership
    where membership.id = membership_id
      and (
        membership.profile_id = (select auth.uid())
        or (select private.is_club_member(membership.club_id))
      )
  )
);

create policy player_profiles_update_self
on public.player_profiles
for update
to authenticated
using (
  exists (
    select 1
    from public.club_memberships as membership
    where membership.id = membership_id
      and membership.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.club_memberships as membership
    where membership.id = membership_id
      and membership.profile_id = (select auth.uid())
  )
);

create policy club_invitations_select_administrator
on public.club_invitations
for select
to authenticated
using ((select private.has_club_role(club_id, array['administrator']::public.club_role[])));

create policy club_invitations_insert_administrator
on public.club_invitations
for insert
to authenticated
with check (
  invited_by = (select auth.uid())
  and (select private.has_club_role(club_id, array['administrator']::public.club_role[]))
);

create policy club_invitations_update_administrator
on public.club_invitations
for update
to authenticated
using ((select private.has_club_role(club_id, array['administrator']::public.club_role[])))
with check ((select private.has_club_role(club_id, array['administrator']::public.club_role[])));

create policy club_invitations_delete_administrator
on public.club_invitations
for delete
to authenticated
using ((select private.has_club_role(club_id, array['administrator']::public.club_role[])));
