begin;

create or replace function pg_temp.assert_true(p_condition boolean, p_message text)
returns void
language plpgsql
as $$
begin
  if p_condition is distinct from true then
    raise exception 'assertion failed: %', p_message;
  end if;
end;
$$;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  user_id,
  'authenticated',
  'authenticated',
  email,
  '',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('display_name', display_name),
  now(),
  now()
from (values
  ('51111111-1111-4111-8111-111111111111'::uuid, 'owner-assets@example.test', 'Asset Owner'),
  ('52222222-2222-4222-8222-222222222222'::uuid, 'admin-assets@example.test', 'Asset Admin'),
  ('53333333-3333-4333-8333-333333333333'::uuid, 'member-assets@example.test', 'Asset Member'),
  ('54444444-4444-4444-8444-444444444444'::uuid, 'outsider-assets@example.test', 'Asset Outsider'),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'owner-other@example.test', 'Other Owner')
) as fixture(user_id, email, display_name);

set local role authenticated;
select set_config('request.jwt.claim.sub', '51111111-1111-4111-8111-111111111111', true);
select public.create_club('Asset Club', 'asset-club', 'Pasig', 'open', null, 'Asia/Manila');
select set_config(
  'pickle_lo.test_asset_club_id',
  (select id::text from public.clubs where slug = 'asset-club'),
  true
);

select set_config('request.jwt.claim.sub', '55555555-5555-4555-8555-555555555555', true);
select public.create_club('Other Asset Club', 'other-asset-club', 'Davao', 'open', null, 'Asia/Manila');

select set_config('request.jwt.claim.sub', '52222222-2222-4222-8222-222222222222', true);
select public.join_club_by_slug('asset-club');
select set_config('request.jwt.claim.sub', '53333333-3333-4333-8333-333333333333', true);
select public.join_club_by_slug('asset-club');

select set_config('request.jwt.claim.sub', '51111111-1111-4111-8111-111111111111', true);
update public.club_memberships
set role = 'admin'
where club_id = (select id from public.clubs where slug = 'asset-club')
  and user_id = '52222222-2222-4222-8222-222222222222';

insert into storage.objects (bucket_id, name)
select
  'club-assets',
  club.id::text || '/logo/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png'
from public.clubs as club
where club.slug = 'asset-club';

select set_config('request.jwt.claim.sub', '52222222-2222-4222-8222-222222222222', true);
insert into storage.objects (bucket_id, name)
select
  'club-assets',
  club.id::text || '/logo/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.webp'
from public.clubs as club
where club.slug = 'asset-club';

select set_config('request.jwt.claim.sub', '53333333-3333-4333-8333-333333333333', true);
select pg_temp.assert_true(
  (select count(*) = 2
   from storage.objects
   where bucket_id = 'club-assets'),
  'an active member can read valid logo objects in their club'
);

do $$
begin
  begin
    insert into storage.objects (bucket_id, name)
    select
      'club-assets',
      club.id::text || '/logo/cccccccc-cccc-4ccc-8ccc-cccccccccccc.jpg'
    from public.clubs as club
    where club.slug = 'asset-club';
    raise exception 'expected member storage write rejection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

do $$
declare
  changed_rows integer;
begin
  update storage.objects
  set name = replace(name, '.png', '.jpeg')
  where bucket_id = 'club-assets'
    and name like '%/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 0 then
    raise exception 'member unexpectedly updated a club asset';
  end if;

  -- Mirrors Storage API-internal deletion authorization; RLS still applies.
  perform set_config('storage.allow_delete_query', 'true', true);
  delete from storage.objects
  where bucket_id = 'club-assets'
    and name like '%/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.webp';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 0 then
    raise exception 'member unexpectedly deleted a club asset';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '52222222-2222-4222-8222-222222222222', true);
update storage.objects
set name = replace(name, '.png', '.jpeg')
where bucket_id = 'club-assets'
  and name like '%/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png';
delete from storage.objects
where bucket_id = 'club-assets'
  and name like '%/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.webp';
select pg_temp.assert_true(
  (select count(*) = 1
   from storage.objects
   where bucket_id = 'club-assets'
     and name like '%/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpeg'),
  'an admin can update and delete valid club assets'
);

select set_config('request.jwt.claim.sub', '51111111-1111-4111-8111-111111111111', true);
do $$
begin
  begin
    delete from public.clubs where slug = 'asset-club';
    raise exception 'expected club deletion to be blocked while assets remain';
  exception
    when foreign_key_violation then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '51111111-1111-4111-8111-111111111111', true);
do $$
begin
  begin
    insert into storage.objects (bucket_id, name)
    select 'club-assets', club.id::text || '/avatar/not-a-logo.png'
    from public.clubs as club
    where club.slug = 'asset-club';
    raise exception 'expected invalid storage path rejection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '54444444-4444-4444-8444-444444444444', true);
select pg_temp.assert_true(
  (select count(*) = 0
   from storage.objects
   where bucket_id = 'club-assets'),
  'an outsider cannot read another club assets'
);

select set_config('request.jwt.claim.sub', '55555555-5555-4555-8555-555555555555', true);
select pg_temp.assert_true(
  (select count(*) = 0
   from storage.objects
   where bucket_id = 'club-assets'
     and name like current_setting('pickle_lo.test_asset_club_id') || '/%'),
  'an owner of another club cannot read Asset Club objects'
);
do $$
begin
  begin
    insert into storage.objects (bucket_id, name)
    values (
      'club-assets',
      current_setting('pickle_lo.test_asset_club_id') ||
      '/logo/eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee.png'
    );
    raise exception 'expected cross-club storage write rejection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;

select pg_temp.assert_true(
  (select public is false from storage.buckets where id = 'club-assets'),
  'club-assets is a private bucket'
);
select pg_temp.assert_true(
  public.club_asset_path_is_valid(
    (select id::text from public.clubs where slug = 'asset-club') ||
    '/logo/dddddddd-dddd-4ddd-8ddd-dddddddddddd.png'
  ),
  'the canonical clubId/logo/fileId.png path is valid'
);
select pg_temp.assert_true(
  not public.club_asset_path_is_valid(
    (select id::text from public.clubs where slug = 'asset-club') ||
    '/logo/dddddddd-dddd-4ddd-8ddd-dddddddddddd.svg'
  ),
  'SVG club assets are rejected'
);
select pg_temp.assert_true(
  not ('image/svg+xml' = any (
    select unnest(allowed_mime_types)
    from storage.buckets
    where id = 'club-assets'
  )),
  'the bucket does not allow SVG uploads'
);
select pg_temp.assert_true(
  not public.club_asset_path_is_valid(
    (select id::text from public.clubs where slug = 'asset-club') ||
    '/logo/../../secret.txt'
  ),
  'path traversal and malformed filenames are invalid'
);

set constraints all immediate;

rollback;
