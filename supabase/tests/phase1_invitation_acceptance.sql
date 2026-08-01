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
  ('41111111-1111-4111-8111-111111111111'::uuid, 'owner@example.test', 'Owner'),
  ('42222222-2222-4222-8222-222222222222'::uuid, 'accepted@example.test', 'Accepted User'),
  ('43333333-3333-4333-8333-333333333333'::uuid, 'wrong@example.test', 'Wrong User'),
  ('44444444-4444-4444-8444-444444444444'::uuid, 'expired@example.test', 'Expired User'),
  ('45555555-5555-4555-8555-555555555555'::uuid, 'revoked@example.test', 'Revoked User'),
  ('46666666-6666-4666-8666-666666666666'::uuid, 'member@example.test', 'Ordinary Member')
) as fixture(user_id, email, display_name);

set local role authenticated;
select set_config('request.jwt.claim.sub', '41111111-1111-4111-8111-111111111111', true);
select public.create_club('Invitation Club', 'invitation-club', 'Taguig', 'invite_only', null, 'Asia/Manila');
select set_config(
  'pickle_lo.test_invitation_club_id',
  (select id::text from public.clubs where slug = 'invitation-club'),
  true
);

select set_config('pickle_lo.test_accepted_token', issued.raw_token, true)
from public.issue_club_invitation(
  (select id from public.clubs where slug = 'invitation-club'),
  'accepted@example.test',
  'admin',
  now() + interval '1 day'
) as issued;

select set_config('pickle_lo.test_revoked_token', issued.raw_token, true)
from public.issue_club_invitation(
  (select id from public.clubs where slug = 'invitation-club'),
  'revoked@example.test',
  'member',
  now() + interval '1 day'
) as issued;

update public.club_invitations
set revoked_at = now()
where email = 'revoked@example.test';

do $$
begin
  begin
    update public.club_invitations
    set revoked_at = null
    where email = 'revoked@example.test';
    raise exception 'expected terminal invitation revocation';
  exception
    when invalid_parameter_value then null;
  end;
end;
$$;

select set_config('pickle_lo.test_active_admin_token', issued.raw_token, true)
from public.issue_club_invitation(
  (select id from public.clubs where slug = 'invitation-club'),
  'member@example.test',
  'member',
  now() + interval '1 day'
) as issued;

do $$
begin
  begin
    perform token_hash
    from public.club_invitations
    where email = 'accepted@example.test';
    raise exception 'expected invitation token hash read rejection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

do $$
begin
  begin
    perform public.issue_club_invitation(
      (select id from public.clubs where slug = 'invitation-club'),
      'owner-invite@example.test',
      'owner',
      now() + interval '1 day'
    );
    raise exception 'expected owner invitation rejection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;
select set_config('request.jwt.claim.sub', '41111111-1111-4111-8111-111111111111', true);
insert into public.club_invitations (
  club_id, email, role, token_hash, expires_at, created_at
)
values (
  (select id from public.clubs where slug = 'invitation-club'),
  'expired@example.test',
  'member',
  extensions.digest(convert_to('expired-token', 'UTF8'), 'sha256'),
  now() - interval '1 day',
  now() - interval '2 days'
);

insert into public.club_memberships (
  club_id, user_id, role, status, joined_at
)
values (
  (select id from public.clubs where slug = 'invitation-club'),
  '42222222-2222-4222-8222-222222222222',
  'member',
  'inactive',
  null
);

insert into public.club_memberships (
  club_id, user_id, role, status, joined_at
)
values (
  (select id from public.clubs where slug = 'invitation-club'),
  '46666666-6666-4666-8666-666666666666',
  'admin',
  'active',
  now()
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '46666666-6666-4666-8666-666666666666', true);
do $$
begin
  begin
    insert into public.club_invitations (club_id, email, role, token_hash, expires_at)
    values (
      current_setting('pickle_lo.test_invitation_club_id')::uuid,
      'blocked@example.test',
      'member',
      extensions.digest(convert_to('blocked-token', 'UTF8'), 'sha256'),
      now() + interval '1 day'
    );
    raise exception 'expected direct invitation insert rejection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '42222222-2222-4222-8222-222222222222', true);
do $$
begin
  begin
    perform public.issue_club_invitation(
      current_setting('pickle_lo.test_invitation_club_id')::uuid,
      'blocked@example.test',
      'member',
      now() + interval '1 day'
    );
    raise exception 'expected non-admin invitation issuance rejection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '43333333-3333-4333-8333-333333333333', true);
do $$
begin
  begin
    perform public.accept_club_invitation(
      current_setting('pickle_lo.test_accepted_token')
    );
    raise exception 'expected invitation email mismatch';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '44444444-4444-4444-8444-444444444444', true);
do $$
begin
  begin
    perform public.accept_club_invitation('expired-token');
    raise exception 'expected expired invitation rejection';
  exception
    when invalid_parameter_value then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '41111111-1111-4111-8111-111111111111', true);
select set_config('pickle_lo.test_replacement_token', issued.raw_token, true)
from public.issue_club_invitation(
  current_setting('pickle_lo.test_invitation_club_id')::uuid,
  'expired@example.test',
  'member',
  now() + interval '2 days'
) as issued;
select pg_temp.assert_true(
  (select count(*) = 1
   from public.club_invitations
   where email = 'expired@example.test'
     and revoked_at is not null),
  'issuing a replacement terminally revokes the expired invitation'
);
select pg_temp.assert_true(
  (select count(*) = 1
   from public.club_invitations
   where email = 'expired@example.test'
     and accepted_at is null
     and revoked_at is null),
  'issuing a replacement creates exactly one outstanding invitation'
);

select set_config('request.jwt.claim.sub', '45555555-5555-4555-8555-555555555555', true);
do $$
begin
  begin
    perform public.accept_club_invitation(
      current_setting('pickle_lo.test_revoked_token')
    );
    raise exception 'expected revoked invitation rejection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '42222222-2222-4222-8222-222222222222', true);
do $$
begin
  begin
    perform public.accept_club_invitation('invalid-token');
    raise exception 'expected invalid invitation rejection';
  exception
    when no_data_found then null;
  end;
end;
$$;

select public.accept_club_invitation(
  current_setting('pickle_lo.test_accepted_token')
);

do $$
begin
  begin
    perform public.accept_club_invitation(
      current_setting('pickle_lo.test_accepted_token')
    );
    raise exception 'expected already-accepted invitation rejection';
  exception
    when unique_violation then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '46666666-6666-4666-8666-666666666666', true);
select public.accept_club_invitation(
  current_setting('pickle_lo.test_active_admin_token')
);
select pg_temp.assert_true(
  (select role = 'admin' and status = 'active'
   from public.club_memberships
   where club_id = current_setting('pickle_lo.test_invitation_club_id')::uuid
     and user_id = '46666666-6666-4666-8666-666666666666'),
  'acceptance does not downgrade an already-active admin role'
);

select set_config('request.jwt.claim.sub', '41111111-1111-4111-8111-111111111111', true);
do $$
begin
  begin
    update public.club_invitations
    set expires_at = expires_at + interval '1 day'
    where email = 'accepted@example.test';
    raise exception 'expected terminal invitation acceptance';
  exception
    when invalid_parameter_value then null;
  end;
end;
$$;

reset role;

select pg_temp.assert_true(
  (select count(*) = 1
   from public.club_memberships as membership
   join public.clubs as club on club.id = membership.club_id
   where club.slug = 'invitation-club'
     and membership.user_id = '42222222-2222-4222-8222-222222222222'
     and membership.role = 'admin'
     and membership.status = 'active'),
  'valid invitation acceptance creates the requested active membership'
);
select pg_temp.assert_true(
  (select accepted_by = '42222222-2222-4222-8222-222222222222'
          and accepted_at is not null
   from public.club_invitations
   where token_hash = extensions.digest(
     convert_to(current_setting('pickle_lo.test_accepted_token'), 'UTF8'),
     'sha256'
   )),
  'valid invitation acceptance marks the invitation accepted'
);
select pg_temp.assert_true(
  (select octet_length(token_hash) = 32
          and token_hash <> convert_to(
            current_setting('pickle_lo.test_accepted_token'),
            'UTF8'
          )
   from public.club_invitations
   where token_hash = extensions.digest(
     convert_to(current_setting('pickle_lo.test_accepted_token'), 'UTF8'),
     'sha256'
   )),
  'invitations never persist the raw token'
);

set constraints all immediate;

rollback;
