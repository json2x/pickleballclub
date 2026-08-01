create or replace function public.set_registration_check_in(
  p_registration_id uuid,
  p_checked_in boolean
)
returns public.event_registrations
language plpgsql
security definer
set search_path = ''
as $$
declare
  registration_record public.event_registrations;
  event_record public.events;
  is_self boolean;
begin
  select * into registration_record
  from public.event_registrations
  where id = p_registration_id
  for update;

  if registration_record.id is null then
    raise exception 'Registration not found.' using errcode = 'P0002';
  end if;

  select * into event_record
  from public.events
  where id = registration_record.event_id;

  select exists (
    select 1
    from public.club_memberships
    where id = registration_record.membership_id
      and profile_id = auth.uid()
  ) into is_self;

  if not private.can_operate_event(registration_record.event_id)
    and not (is_self and event_record.check_in_open) then
    raise exception 'Check-in is not available for this account.' using errcode = '42501';
  end if;

  update public.event_registrations
  set
    status = case
      when p_checked_in then 'checked_in'::public.registration_status
      else 'registered'::public.registration_status
    end,
    checked_in_at = case when p_checked_in then now() else null end,
    availability = case
      when p_checked_in then 'waiting'::public.availability_status
      else 'unavailable'::public.availability_status
    end
  where id = p_registration_id
  returning * into registration_record;

  return registration_record;
end;
$$;;
