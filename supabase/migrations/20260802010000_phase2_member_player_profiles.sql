-- Phase 2: Club Player Profiles
-- Creates the club_player_profiles table for per-club player data,
-- enums for skill level and court side preference,
-- RLS policies, auto-creation trigger, and management RPCs.

-- ─── Enums ──────────────────────────────────────────────────────────────

create type public.skill_level as enum ('beginner', 'intermediate', 'advanced', 'pro');
create type public.court_side as enum ('left', 'right', 'both', 'no_preference');

-- ─── Table ──────────────────────────────────────────────────────────────

create table public.club_player_profiles (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.clubs(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  skill_level public.skill_level not null default 'beginner',
  rating_points integer not null default 0 constraint rating_points_non_negative check (rating_points >= 0),
  rating_trend_30d integer not null default 0,
  matches_played integer not null default 0 constraint matches_played_non_negative check (matches_played >= 0),
  wins        integer not null default 0 constraint wins_non_negative check (wins >= 0),
  losses      integer not null default 0 constraint losses_non_negative check (losses >= 0),
  preferred_side public.court_side not null default 'no_preference',
  bio         text default null constraint bio_length check (bio is null or char_length(bio) <= 500),
  avatar_path text default null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint club_player_profiles_club_user_unique unique (club_id, user_id)
);

comment on table public.club_player_profiles is 'Per-club player profile with stats, ratings, and preferences.';

-- ─── Indexes ────────────────────────────────────────────────────────────

create index club_player_profiles_club_id_idx on public.club_player_profiles(club_id);
create index club_player_profiles_user_id_idx on public.club_player_profiles(user_id);
create index club_player_profiles_club_rating_idx on public.club_player_profiles(club_id, rating_points desc);
create index club_player_profiles_club_skill_idx on public.club_player_profiles(club_id, skill_level);

-- ─── Updated-at trigger ─────────────────────────────────────────────────

create trigger club_player_profiles_set_updated_at
  before update on public.club_player_profiles
  for each row execute function private.set_updated_at();

-- ─── Auto-create player profile on active membership ────────────────────

create or replace function private.auto_create_player_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'active' then
    insert into public.club_player_profiles (club_id, user_id)
    values (new.club_id, new.user_id)
    on conflict (club_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger club_memberships_auto_create_player_profile
  after insert or update of status on public.club_memberships
  for each row execute function private.auto_create_player_profile();

-- ─── RLS ────────────────────────────────────────────────────────────────

alter table public.club_player_profiles enable row level security;

revoke all on public.club_player_profiles from public, anon, authenticated;
grant select on public.club_player_profiles to authenticated;
grant update (skill_level, preferred_side, bio, avatar_path) on public.club_player_profiles to authenticated;

-- Active members can read all player profiles in their club
create policy "club_player_profiles_select_active_members"
  on public.club_player_profiles for select to authenticated
  using (public.is_club_member(club_id));

-- Users can update their own player profile
create policy "club_player_profiles_update_own"
  on public.club_player_profiles for update to authenticated
  using (user_id = auth.uid() and public.is_club_member(club_id))
  with check (user_id = auth.uid() and public.is_club_member(club_id));

-- ─── RPC: Get club members (paginated, filterable) ─────────────────────

create or replace function public.get_club_members(
  p_club_id uuid,
  p_search text default null,
  p_status text default null,
  p_role text default null,
  p_skill text default null,
  p_sort_by text default 'display_name',
  p_sort_order text default 'asc',
  p_page integer default 1,
  p_page_size integer default 20
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_offset integer;
  v_total integer;
  v_members json;
begin
  -- Verify caller is active member
  if not public.is_club_member(p_club_id) then
    raise exception 'Not an active member of this club';
  end if;

  v_offset := (coalesce(p_page, 1) - 1) * coalesce(p_page_size, 20);

  -- Count total matching members
  select count(*)
  into v_total
  from public.club_memberships cm
  join public.profiles p on p.id = cm.user_id
  left join public.club_player_profiles cpp on cpp.club_id = cm.club_id and cpp.user_id = cm.user_id
  where cm.club_id = p_club_id
    and (p_status is null or cm.status = p_status::public.club_membership_status)
    and (p_role is null or cm.role = p_role::public.club_role)
    and (p_skill is null or cpp.skill_level = p_skill::public.skill_level)
    and (p_search is null or p_search = '' or
         p.display_name ilike '%' || p_search || '%' or
         p.email::text ilike '%' || p_search || '%' or
         p.first_name ilike '%' || p_search || '%' or
         p.last_name ilike '%' || p_search || '%');

  -- Fetch paginated members with dynamic sort
  select json_agg(row_to_json(t))
  into v_members
  from (
    select
      p.id as user_id,
      p.display_name,
      p.email,
      p.first_name,
      p.last_name,
      p.avatar_url,
      cm.id as membership_id,
      cm.role,
      cm.status,
      cm.joined_at,
      coalesce(cpp.skill_level::text, 'beginner') as skill_level,
      coalesce(cpp.rating_points, 0) as rating_points,
      coalesce(cpp.rating_trend_30d, 0) as rating_trend_30d,
      coalesce(cpp.matches_played, 0) as matches_played,
      coalesce(cpp.wins, 0) as wins,
      coalesce(cpp.losses, 0) as losses,
      coalesce(cpp.preferred_side::text, 'no_preference') as preferred_side,
      cpp.bio,
      cpp.avatar_path
    from public.club_memberships cm
    join public.profiles p on p.id = cm.user_id
    left join public.club_player_profiles cpp on cpp.club_id = cm.club_id and cpp.user_id = cm.user_id
    where cm.club_id = p_club_id
      and (p_status is null or cm.status = p_status::public.club_membership_status)
      and (p_role is null or cm.role = p_role::public.club_role)
      and (p_skill is null or cpp.skill_level = p_skill::public.skill_level)
      and (p_search is null or p_search = '' or
           p.display_name ilike '%' || p_search || '%' or
           p.email::text ilike '%' || p_search || '%' or
           p.first_name ilike '%' || p_search || '%' or
           p.last_name ilike '%' || p_search || '%')
    order by
      case when p_sort_by = 'display_name' and p_sort_order = 'asc' then p.display_name end asc,
      case when p_sort_by = 'display_name' and p_sort_order = 'desc' then p.display_name end desc,
      case when p_sort_by = 'rating_points' and p_sort_order = 'asc' then coalesce(cpp.rating_points, 0) end asc,
      case when p_sort_by = 'rating_points' and p_sort_order = 'desc' then coalesce(cpp.rating_points, 0) end desc,
      case when p_sort_by = 'joined_at' and p_sort_order = 'asc' then cm.joined_at end asc,
      case when p_sort_by = 'joined_at' and p_sort_order = 'desc' then cm.joined_at end desc,
      case when p_sort_by = 'matches_played' and p_sort_order = 'asc' then coalesce(cpp.matches_played, 0) end asc,
      case when p_sort_by = 'matches_played' and p_sort_order = 'desc' then coalesce(cpp.matches_played, 0) end desc,
      p.display_name asc
    limit p_page_size
    offset v_offset
  ) t;

  return json_build_object(
    'members', coalesce(v_members, '[]'::json),
    'total', v_total,
    'page', coalesce(p_page, 1),
    'page_size', coalesce(p_page_size, 20)
  );
end;
$$;

-- ─── RPC: Get single member detail ─────────────────────────────────────

create or replace function public.get_club_member_detail(
  p_club_id uuid,
  p_user_id uuid
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result json;
begin
  if not public.is_club_member(p_club_id) then
    raise exception 'Not an active member of this club';
  end if;

  select row_to_json(t)
  into v_result
  from (
    select
      p.id as user_id,
      p.display_name,
      p.email,
      p.first_name,
      p.last_name,
      p.avatar_url,
      p.created_at as profile_created_at,
      cm.id as membership_id,
      cm.role,
      cm.status,
      cm.joined_at,
      coalesce(cpp.skill_level::text, 'beginner') as skill_level,
      coalesce(cpp.rating_points, 0) as rating_points,
      coalesce(cpp.rating_trend_30d, 0) as rating_trend_30d,
      coalesce(cpp.matches_played, 0) as matches_played,
      coalesce(cpp.wins, 0) as wins,
      coalesce(cpp.losses, 0) as losses,
      coalesce(cpp.preferred_side::text, 'no_preference') as preferred_side,
      cpp.bio,
      cpp.avatar_path
    from public.club_memberships cm
    join public.profiles p on p.id = cm.user_id
    left join public.club_player_profiles cpp on cpp.club_id = cm.club_id and cpp.user_id = cm.user_id
    where cm.club_id = p_club_id
      and cm.user_id = p_user_id
    limit 1
  ) t;

  return v_result;
end;
$$;

-- ─── RPC: Update own player profile ────────────────────────────────────

create or replace function public.update_player_profile(
  p_club_id uuid,
  p_skill_level text default null,
  p_preferred_side text default null,
  p_bio text default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_result json;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_club_member(p_club_id) then
    raise exception 'Not an active member of this club';
  end if;

  update public.club_player_profiles
  set
    skill_level = coalesce(p_skill_level::public.skill_level, skill_level),
    preferred_side = coalesce(p_preferred_side::public.court_side, preferred_side),
    bio = case when p_bio is not null then p_bio else bio end
  where club_id = p_club_id and user_id = v_user_id
  returning row_to_json(club_player_profiles.*) into v_result;

  return v_result;
end;
$$;

-- ─── RPC: Update member role (owner/admin only) ────────────────────────

create or replace function public.update_member_role(
  p_club_id uuid,
  p_user_id uuid,
  p_new_role text,
  p_reason text default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid := auth.uid();
  v_new_role public.club_role;
  v_result json;
begin
  if v_caller_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Validate role
  begin
    v_new_role := p_new_role::public.club_role;
  exception when invalid_text_representation then
    raise exception 'Invalid role: %', p_new_role;
  end;

  -- Cannot assign owner role via this function
  if v_new_role = 'owner' then
    raise exception 'Cannot assign owner role. Use transfer_club_ownership instead.';
  end if;

  -- Caller must be owner or admin
  if not public.has_club_role(p_club_id, array['owner'::public.club_role, 'admin'::public.club_role]) then
    raise exception 'Insufficient permissions';
  end if;

  -- Cannot change own role
  if v_caller_id = p_user_id then
    raise exception 'Cannot change your own role';
  end if;

  -- Admin cannot change another admin's role
  if not public.has_club_role(p_club_id, array['owner'::public.club_role]) then
    -- Caller is admin, check target is not admin or owner
    perform 1 from public.club_memberships
    where club_id = p_club_id and user_id = p_user_id and status = 'active'
      and role in ('owner', 'admin');
    if found then
      raise exception 'Admins cannot change the role of owners or other admins';
    end if;
  end if;

  update public.club_memberships
  set role = v_new_role
  where club_id = p_club_id and user_id = p_user_id and status = 'active'
  returning json_build_object('membership_id', id, 'role', role, 'user_id', user_id) into v_result;

  if v_result is null then
    raise exception 'Member not found or not active';
  end if;

  return v_result;
end;
$$;

-- ─── RPC: Deactivate member (owner/admin only) ─────────────────────────

create or replace function public.deactivate_member(
  p_club_id uuid,
  p_user_id uuid,
  p_reason text default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid := auth.uid();
  v_target_role public.club_role;
  v_result json;
begin
  if v_caller_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Caller must be owner or admin
  if not public.has_club_role(p_club_id, array['owner'::public.club_role, 'admin'::public.club_role]) then
    raise exception 'Insufficient permissions';
  end if;

  -- Cannot deactivate self
  if v_caller_id = p_user_id then
    raise exception 'Cannot deactivate yourself';
  end if;

  -- Get target member role
  select role into v_target_role
  from public.club_memberships
  where club_id = p_club_id and user_id = p_user_id and status = 'active';

  if v_target_role is null then
    raise exception 'Member not found or already inactive';
  end if;

  -- Cannot deactivate owner
  if v_target_role = 'owner' then
    raise exception 'Cannot deactivate the club owner. Transfer ownership first.';
  end if;

  -- Admin cannot deactivate another admin
  if v_target_role = 'admin' and not public.has_club_role(p_club_id, array['owner'::public.club_role]) then
    raise exception 'Admins cannot deactivate other admins';
  end if;

  update public.club_memberships
  set status = 'inactive'
  where club_id = p_club_id and user_id = p_user_id and status = 'active'
  returning json_build_object('membership_id', id, 'status', status, 'user_id', user_id) into v_result;

  return v_result;
end;
$$;
