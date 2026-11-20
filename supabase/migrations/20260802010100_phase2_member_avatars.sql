-- Phase 2: Member Avatars Storage
-- Creates the private member-avatars bucket with RLS policies.

-- ─── Storage bucket ─────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'member-avatars',
  'member-avatars',
  false,
  2097152,  -- 2 MiB
  array['image/jpeg', 'image/png', 'image/webp']
);

-- ─── Path validation ────────────────────────────────────────────────────

create or replace function public.member_avatar_path_is_valid(object_path text)
returns boolean
language plpgsql
immutable
as $$
begin
  -- Expected path: {club_id}/{user_id}/{filename}.{ext}
  return object_path ~ '^[0-9a-f\-]{36}/[0-9a-f\-]{36}/[0-9a-f\-]{36}\.(jpg|jpeg|png|webp)$';
end;
$$;

create or replace function public.member_avatar_club_id(object_path text)
returns uuid
language plpgsql
immutable
as $$
begin
  return (string_to_array(object_path, '/'))[1]::uuid;
end;
$$;

create or replace function public.member_avatar_user_id(object_path text)
returns uuid
language plpgsql
immutable
as $$
begin
  return (string_to_array(object_path, '/'))[2]::uuid;
end;
$$;

-- ─── Storage RLS policies ───────────────────────────────────────────────

-- Active club members can read avatars in their club
create policy "member_avatars_select_active_members"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'member-avatars'
    and public.member_avatar_path_is_valid(name)
    and public.is_club_member(public.member_avatar_club_id(name))
  );

-- Users can upload their own avatar
create policy "member_avatars_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'member-avatars'
    and public.member_avatar_path_is_valid(name)
    and public.is_club_member(public.member_avatar_club_id(name))
    and public.member_avatar_user_id(name) = auth.uid()
  );

-- Users can update their own avatar
create policy "member_avatars_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'member-avatars'
    and public.member_avatar_path_is_valid(name)
    and public.member_avatar_user_id(name) = auth.uid()
  );

-- Users can delete their own avatar
create policy "member_avatars_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'member-avatars'
    and public.member_avatar_path_is_valid(name)
    and public.member_avatar_user_id(name) = auth.uid()
  );
