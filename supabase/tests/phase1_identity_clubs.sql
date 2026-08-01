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
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated', 'authenticated', 'owner@example.test', '', now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Owner One"}'::jsonb, now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated', 'authenticated', 'member@example.test', '', now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb, now(), now()
  );

select pg_temp.assert_true(
  (select display_name = 'Owner One' and email = 'owner@example.test'
   from public.profiles
   where id = '11111111-1111-4111-8111-111111111111'),
  'the auth signup trigger creates a separate profile'
);

select pg_temp.assert_true(
  (select array_agg(enumlabel order by enumsortorder)
   from pg_enum
   where enumtypid = 'public.club_role'::regtype)
    = array['owner', 'admin', 'member']::name[],
  'club_role contains exactly owner, admin, and member'
);

set local role authenticated;
set constraints all immediate;
select set_config(
  'request.jwt.claim.sub',
  '11111111-1111-4111-8111-111111111111',
  true
);

select public.create_club(
  'North Court Club',
  'NORTH-COURT',
  'Quezon City',
  'open',
  null,
  'Asia/Manila'
);

select pg_temp.assert_true(
  (select count(*) = 1
   from public.clubs
   where slug = 'north-court' and location = 'Quezon City'),
  'create_club normalizes the slug and stores the location'
);

select pg_temp.assert_true(
  (select data_type = 'uuid'
   from information_schema.columns
   where table_schema = 'public'
     and table_name = 'club_membership_role_audit'
     and column_name = 'id'),
  'role-audit identifiers are transactional UUIDs rather than sequences'
);

select pg_temp.assert_true(
  (select count(*) = 1
   from public.club_memberships as membership
   join public.clubs as club on club.id = membership.club_id
   where club.slug = 'north-court'
     and membership.user_id = '11111111-1111-4111-8111-111111111111'
     and membership.role = 'owner'
     and membership.status = 'active'),
  'create_club atomically creates one active owner membership'
);

do $$
begin
  begin
    perform public.create_club(
      'Duplicate Slug Club', 'north-court', 'Makati', 'open', null, 'Asia/Manila'
    );
    raise exception 'expected duplicate slug rejection';
  exception
    when unique_violation then null;
  end;
end;
$$;

reset role;

do $$
declare
  target_club_id uuid;
begin
  select id into target_club_id from public.clubs where slug = 'north-court';

  begin
    insert into public.club_memberships (
      club_id, user_id, role, status, joined_at
    )
    values (
      target_club_id,
      '11111111-1111-4111-8111-111111111111',
      'member',
      'active',
      now()
    );
    raise exception 'expected duplicate membership rejection';
  exception
    when unique_violation then null;
  end;

  begin
    insert into public.club_memberships (
      club_id, user_id, role, status, joined_at
    )
    values (
      target_club_id,
      '22222222-2222-4222-8222-222222222222',
      'owner',
      'active',
      now()
    );
    raise exception 'expected second active owner rejection';
  exception
    when unique_violation then null;
  end;
end;
$$;

do $$
declare
  target_club_id uuid;
begin
  select id into target_club_id from public.clubs where slug = 'north-court';

  begin
    update public.club_memberships
    set role = 'admin'
    where club_id = target_club_id
      and role = 'owner';

    set constraints all immediate;
    raise exception 'expected zero active owner rejection';
  exception
    when check_violation then null;
  end;
end;
$$;

set constraints all immediate;

rollback;
