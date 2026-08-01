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
  ('31111111-1111-4111-8111-111111111111'::uuid, 'owner-a@example.test', 'Owner A'),
  ('32222222-2222-4222-8222-222222222222'::uuid, 'admin-a@example.test', 'Admin A'),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'member-a@example.test', 'Member A'),
  ('34444444-4444-4444-8444-444444444444'::uuid, 'owner-b@example.test', 'Owner B'),
  ('35555555-5555-4555-8555-555555555555'::uuid, 'outsider@example.test', 'Outsider')
) as fixture(user_id, email, display_name);

set local role authenticated;
select set_config('request.jwt.claim.sub', '31111111-1111-4111-8111-111111111111', true);
select public.create_club('Club Alpha', 'club-alpha', 'Manila', 'open', null, 'Asia/Manila');
select set_config(
  'pickle_lo.test_club_alpha_id',
  (select id::text from public.clubs where slug = 'club-alpha'),
  true
);

select set_config('request.jwt.claim.sub', '34444444-4444-4444-8444-444444444444', true);
select public.create_club('Club Beta', 'club-beta', 'Cebu', 'invite_only', null, 'Asia/Manila');

select set_config('request.jwt.claim.sub', '32222222-2222-4222-8222-222222222222', true);
select public.join_club_by_slug('club-alpha');

do $$
begin
  begin
    perform public.join_club_by_slug('club-alpha');
    raise exception 'expected duplicate membership rejection';
  exception
    when unique_violation then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
select public.join_club_by_slug('club-alpha');

select set_config('request.jwt.claim.sub', '31111111-1111-4111-8111-111111111111', true);
select public.create_club(
  'Approval Club', 'approval-club', 'Pasay', 'approval', null, 'Asia/Manila'
);

select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
select public.join_club_by_slug('approval-club');
select set_config(
  'pickle_lo.test_pending_membership_id',
  (
    select membership.id::text
    from public.club_memberships as membership
    where membership.user_id = '33333333-3333-4333-8333-333333333333'
      and membership.status = 'pending'
  ),
  true
);
do $$
begin
  begin
    perform public.approve_club_membership(
      current_setting('pickle_lo.test_pending_membership_id')::uuid
    );
    raise exception 'expected member self-approval rejection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '31111111-1111-4111-8111-111111111111', true);
select public.approve_club_membership(
  current_setting('pickle_lo.test_pending_membership_id')::uuid
);
select pg_temp.assert_true(
  (select status = 'active' and joined_at is not null
   from public.club_memberships
   where id = current_setting('pickle_lo.test_pending_membership_id')::uuid),
  'approval atomically activates a pending membership and records joined_at'
);

select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
select public.set_active_club(
  (select id from public.clubs where slug = 'approval-club')
);
select set_config('request.jwt.claim.sub', '31111111-1111-4111-8111-111111111111', true);
update public.club_memberships
set status = 'inactive'
where id = current_setting('pickle_lo.test_pending_membership_id')::uuid;
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
select pg_temp.assert_true(
  (select active_club_id is null from public.get_my_profile()),
  'deactivating the selected membership clears active_club_id'
);

select set_config('request.jwt.claim.sub', '31111111-1111-4111-8111-111111111111', true);
update public.club_memberships
set role = 'admin'
where club_id = (select id from public.clubs where slug = 'club-alpha')
  and user_id = '32222222-2222-4222-8222-222222222222';

do $$
begin
  begin
    update public.club_memberships
    set user_id = '35555555-5555-4555-8555-555555555555'
    where club_id = (select id from public.clubs where slug = 'club-alpha')
      and user_id = '33333333-3333-4333-8333-333333333333';
    raise exception 'expected membership user_id update privilege rejection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;

do $$
begin
  begin
    update public.club_memberships
    set user_id = '35555555-5555-4555-8555-555555555555'
    where club_id = (select id from public.clubs where slug = 'club-alpha')
      and user_id = '33333333-3333-4333-8333-333333333333';
    raise exception 'expected immutable membership identity rejection';
  exception
    when invalid_parameter_value then null;
  end;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '31111111-1111-4111-8111-111111111111', true);

select pg_temp.assert_true(
  (select count(*) = 1
   from public.club_membership_role_audit as audit
   join public.clubs as club on club.id = audit.club_id
   where club.slug = 'club-alpha'
     and audit.user_id = '32222222-2222-4222-8222-222222222222'
     and audit.previous_role = 'member'
     and audit.new_role = 'admin'
     and audit.changed_by = '31111111-1111-4111-8111-111111111111'),
  'an authorized member-to-admin change is audited'
);

select pg_temp.assert_true(
  public.has_club_role(
    (select id from public.clubs where slug = 'club-alpha'),
    array['admin']::public.club_role[]
  ) is false,
  'the owner does not inherit the admin role'
);

select set_config('request.jwt.claim.sub', '32222222-2222-4222-8222-222222222222', true);
select pg_temp.assert_true(
  public.has_club_role(
    (select id from public.clubs where slug = 'club-alpha'),
    array['admin']::public.club_role[]
  ),
  'an active admin is recognized by has_club_role'
);

do $$
begin
  begin
    update public.club_memberships
    set status = 'inactive'
    where club_id = (select id from public.clubs where slug = 'club-alpha')
      and role = 'owner';
    raise exception 'expected admin owner-modification rejection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
do $$
declare
  changed_rows integer;
begin
  update public.clubs
  set name = 'Member Changed This'
  where slug = 'club-alpha';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 0 then
    raise exception 'member unexpectedly updated club settings';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '35555555-5555-4555-8555-555555555555', true);
select pg_temp.assert_true(
  (select count(*) = 0 from public.clubs),
  'an outsider cannot read clubs through table RLS'
);
select pg_temp.assert_true(
  (select count(*) = 2 from public.search_joinable_clubs('Club')),
  'search returns joinable clubs but hides invite-only clubs'
);

do $$
begin
  begin
    perform public.set_active_club(
      (select id from public.search_joinable_clubs('club-alpha') limit 1)
    );
    raise exception 'expected cross-club active selection rejection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '34444444-4444-4444-8444-444444444444', true);
select pg_temp.assert_true(
  (select count(*) = 0 from public.clubs where slug = 'club-alpha'),
  'a Club Beta owner cannot read Club Alpha through table RLS'
);
do $$
declare
  changed_rows integer;
begin
  update public.clubs
  set name = 'Cross-club overwrite'
  where slug = 'club-alpha';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 0 then
    raise exception 'Club Beta owner unexpectedly updated Club Alpha';
  end if;
end;
$$;
do $$
begin
  begin
    perform public.set_active_club(
      current_setting('pickle_lo.test_club_alpha_id')::uuid
    );
    raise exception 'expected Club Beta owner active-club rejection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '32222222-2222-4222-8222-222222222222', true);
select pg_temp.assert_true(
  (select count(*) = 1
   from public.profiles
   where id = '33333333-3333-4333-8333-333333333333'
     and display_name = 'Member A'),
  'co-members can read directory-safe profile fields'
);
do $$
begin
  begin
    perform email
    from public.profiles
    where id = '33333333-3333-4333-8333-333333333333';
    raise exception 'expected private co-member profile field rejection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;
select pg_temp.assert_true(
  (select email = 'admin-a@example.test'
   from public.get_my_profile()),
  'get_my_profile returns private fields only for the authenticated user'
);

select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
select public.set_active_club(
  current_setting('pickle_lo.test_club_alpha_id')::uuid
);
select set_config('request.jwt.claim.sub', '31111111-1111-4111-8111-111111111111', true);
delete from public.club_memberships
where club_id = current_setting('pickle_lo.test_club_alpha_id')::uuid
  and user_id = '33333333-3333-4333-8333-333333333333';
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
select pg_temp.assert_true(
  (select active_club_id is null from public.get_my_profile()),
  'deleting the selected membership clears active_club_id'
);

select set_config('request.jwt.claim.sub', '31111111-1111-4111-8111-111111111111', true);
set constraints all immediate;
select public.transfer_club_ownership(
  (select id from public.clubs where slug = 'club-alpha'),
  '32222222-2222-4222-8222-222222222222',
  true,
  'Phase 1 ownership transfer test'
);

reset role;

select pg_temp.assert_true(
  (select count(*) = 1
   from public.club_memberships as membership
   join public.clubs as club on club.id = membership.club_id
   where club.slug = 'club-alpha'
     and membership.role = 'owner'
     and membership.status = 'active'),
  'ownership transfer leaves exactly one active owner'
);
select pg_temp.assert_true(
  (select count(*) = 2
   from public.club_membership_role_audit as audit
   join public.clubs as club on club.id = audit.club_id
   where club.slug = 'club-alpha'
     and audit.reason = 'Phase 1 ownership transfer test'),
  'ownership transfer records both audited role changes'
);

set constraints all immediate;

rollback;
