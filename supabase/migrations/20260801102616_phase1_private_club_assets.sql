begin;

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'club-assets',
  'club-assets',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.clubs
  add constraint clubs_logo_path_format
  check (
    logo_path is null
    or logo_path ~ (
      '^' || id::text ||
      '/logo/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpe?g|png|webp)$'
    )
  );

create or replace function public.club_asset_path_is_valid(p_name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_name ~
    '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/logo/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpe?g|png|webp)$';
$$;

create or replace function public.club_asset_club_id(p_name text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  if not public.club_asset_path_is_valid(p_name) then
    return null;
  end if;
  return split_part(p_name, '/', 1)::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

revoke all on function public.club_asset_path_is_valid(text) from public, anon, authenticated;
revoke all on function public.club_asset_club_id(text) from public, anon, authenticated;
grant execute on function public.club_asset_path_is_valid(text) to authenticated;
grant execute on function public.club_asset_club_id(text) to authenticated;

create policy club_assets_select_active_members
on storage.objects
for select
to authenticated
using (
  bucket_id = 'club-assets'
  and (select public.club_asset_path_is_valid(name))
  and (select public.is_club_member(public.club_asset_club_id(name)))
);

create policy club_assets_insert_owner_admin
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'club-assets'
  and (select public.club_asset_path_is_valid(name))
  and (select public.has_club_role(
    public.club_asset_club_id(name),
    array['owner', 'admin']::public.club_role[]
  ))
);

create policy club_assets_update_owner_admin
on storage.objects
for update
to authenticated
using (
  bucket_id = 'club-assets'
  and (select public.club_asset_path_is_valid(name))
  and (select public.has_club_role(
    public.club_asset_club_id(name),
    array['owner', 'admin']::public.club_role[]
  ))
)
with check (
  bucket_id = 'club-assets'
  and (select public.club_asset_path_is_valid(name))
  and (select public.has_club_role(
    public.club_asset_club_id(name),
    array['owner', 'admin']::public.club_role[]
  ))
);

create policy club_assets_delete_owner_admin
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'club-assets'
  and (select public.club_asset_path_is_valid(name))
  and (select public.has_club_role(
    public.club_asset_club_id(name),
    array['owner', 'admin']::public.club_role[]
  ))
);

create or replace function private.block_club_delete_with_assets()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from storage.objects as object
    where object.bucket_id = 'club-assets'
      and object.name like old.id::text || '/%'
  ) then
    raise exception 'Club assets must be removed through the Storage API before deleting the club.'
      using errcode = '23503';
  end if;

  return old;
end;
$$;

revoke all on function private.block_club_delete_with_assets()
from public, anon, authenticated;

create trigger clubs_block_delete_with_assets
before delete on public.clubs
for each row execute function private.block_club_delete_with_assets();

commit;
