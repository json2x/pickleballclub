begin;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
alter default privileges in schema private revoke execute on functions from public;

create type public.club_role as enum ('owner', 'admin', 'member');
create type public.club_membership_status as enum ('pending', 'active', 'inactive');
create type public.club_join_policy as enum ('open', 'approval', 'invite_only');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email extensions.citext,
  display_name text not null,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  timezone text not null default 'Asia/Manila',
  active_club_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length
    check (char_length(trim(display_name)) between 1 and 80),
  constraint profiles_first_name_length
    check (first_name is null or char_length(trim(first_name)) between 1 and 80),
  constraint profiles_last_name_length
    check (last_name is null or char_length(trim(last_name)) between 1 and 80),
  constraint profiles_timezone_not_blank check (char_length(trim(timezone)) > 0)
);

alter table public.profiles enable row level security;
revoke all on table public.profiles from public, anon, authenticated;

create table public.clubs (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  slug text not null,
  location text not null,
  description text,
  logo_path text,
  join_policy public.club_join_policy not null default 'approval',
  timezone text not null default 'Asia/Manila',
  currency text not null default 'PHP',
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clubs_name_length check (char_length(trim(name)) between 2 and 100),
  constraint clubs_slug_format
    check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint clubs_location_length check (char_length(trim(location)) between 1 and 160),
  constraint clubs_timezone_not_blank check (char_length(trim(timezone)) > 0),
  constraint clubs_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint clubs_slug_unique unique (slug)
);

create index clubs_created_by_idx on public.clubs (created_by);

alter table public.clubs enable row level security;
revoke all on table public.clubs from public, anon, authenticated;

create table public.club_memberships (
  id uuid primary key default extensions.gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.club_role not null default 'member',
  status public.club_membership_status not null default 'active',
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint club_memberships_club_user_unique unique (club_id, user_id),
  constraint club_memberships_joined_at_consistency
    check ((status = 'active' and joined_at is not null) or status <> 'active')
);

create unique index club_memberships_one_active_owner_idx
  on public.club_memberships (club_id)
  where role = 'owner' and status = 'active';
create index club_memberships_user_status_idx
  on public.club_memberships (user_id, status, club_id);
create index club_memberships_club_status_role_idx
  on public.club_memberships (club_id, status, role, user_id);

alter table public.club_memberships enable row level security;
revoke all on table public.club_memberships from public, anon, authenticated;

create table public.club_membership_role_audit (
  id uuid primary key default extensions.gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  membership_id uuid not null references public.club_memberships (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  previous_role public.club_role not null,
  new_role public.club_role not null,
  changed_by uuid not null references public.profiles (id) on delete restrict,
  reason text not null,
  created_at timestamptz not null default now(),
  constraint club_membership_role_audit_role_changed check (previous_role <> new_role),
  constraint club_membership_role_audit_reason_not_blank check (char_length(trim(reason)) > 0)
);

create index club_membership_role_audit_club_created_idx
  on public.club_membership_role_audit (club_id, created_at desc);
create index club_membership_role_audit_membership_idx
  on public.club_membership_role_audit (membership_id, created_at desc);
create index club_membership_role_audit_user_idx
  on public.club_membership_role_audit (user_id, created_at desc);

alter table public.club_membership_role_audit enable row level security;
revoke all on table public.club_membership_role_audit from public, anon, authenticated;

alter table public.profiles
  add constraint profiles_active_club_fk
  foreign key (active_club_id) references public.clubs (id) on delete set null;
create index profiles_active_club_id_idx
  on public.profiles (active_club_id)
  where active_club_id is not null;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger clubs_set_updated_at
before update on public.clubs
for each row execute function private.set_updated_at();

create trigger club_memberships_set_updated_at
before update on public.club_memberships
for each row execute function private.set_updated_at();

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

  insert into public.profiles (id, email, display_name, created_at, updated_at)
  values (
    new.id,
    nullif(lower(trim(new.email)), '')::extensions.citext,
    safe_display_name,
    coalesce(new.created_at, now()),
    coalesce(new.updated_at, new.created_at, now())
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

insert into public.profiles (id, email, display_name, created_at, updated_at)
select
  users.id,
  nullif(lower(trim(users.email)), '')::extensions.citext,
  left(
    coalesce(
      nullif(trim(users.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(users.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(split_part(coalesce(users.email, ''), '@', 1)), ''),
      'Player'
    ),
    80
  ),
  coalesce(users.created_at, now()),
  coalesce(users.updated_at, users.created_at, now())
from auth.users as users
on conflict (id) do nothing;

commit;
