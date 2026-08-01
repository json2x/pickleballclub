create or replace function public.register_event_member(
  p_event_id uuid,
  p_membership_id uuid
)
returns public.event_registrations
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_registration public.event_registrations;
  membership_record public.club_memberships;
  event_record public.events;
begin
  select * into membership_record
  from public.club_memberships
  where id = p_membership_id;

  select * into event_record
  from public.events
  where id = p_event_id;

  if membership_record.id is null or event_record.id is null then
    raise exception 'Event or membership not found.' using errcode = 'P0002';
  end if;
  if membership_record.club_id <> event_record.club_id then
    raise exception 'The member and event must belong to the same club.' using errcode = '23514';
  end if;
  if event_record.status not in ('published', 'check_in_open', 'active') then
    raise exception 'Registration is not open for this event.' using errcode = '23514';
  end if;
  if not private.can_manage_event(p_event_id)
    and membership_record.profile_id <> auth.uid() then
    raise exception 'You do not have permission to register this member.' using errcode = '42501';
  end if;
  if membership_record.membership_status <> 'active' then
    raise exception 'Only active club members can register.' using errcode = '23514';
  end if;

  insert into public.event_registrations (event_id, membership_id)
  values (p_event_id, p_membership_id)
  on conflict (event_id, membership_id) do update
  set status = 'registered', availability = 'waiting'
  returning * into created_registration;

  return created_registration;
end;
$$;;
