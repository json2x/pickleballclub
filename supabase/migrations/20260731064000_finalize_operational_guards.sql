create or replace function private.prevent_event_tenant_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.club_id <> old.club_id or new.created_by <> old.created_by then
    raise exception 'An event cannot move between clubs or change its creator.' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function private.prevent_event_tenant_change() from public;

create trigger events_prevent_tenant_change
before update of club_id, created_by on public.events
for each row execute function private.prevent_event_tenant_change();

create or replace function public.set_registration_availability(
  p_registration_id uuid,
  p_availability public.availability_status
)
returns public.event_registrations
language plpgsql
security definer
set search_path = ''
as $$
declare
  registration_record public.event_registrations;
  is_self boolean;
  is_operator boolean;
begin
  select * into registration_record from public.event_registrations where id = p_registration_id for update;
  if registration_record.id is null then
    raise exception 'Registration not found.' using errcode = 'P0002';
  end if;
  select exists (
    select 1 from public.club_memberships
    where id = registration_record.membership_id and profile_id = auth.uid()
  ) into is_self;
  is_operator := private.can_operate_event(registration_record.event_id);

  if not is_operator and not is_self then
    raise exception 'You do not have permission to change availability.' using errcode = '42501';
  end if;
  if not is_operator and p_availability not in ('waiting', 'resting', 'unavailable') then
    raise exception 'Players can only mark themselves waiting, resting, or unavailable.' using errcode = '42501';
  end if;
  if registration_record.status <> 'checked_in' then
    raise exception 'Only checked-in players can change availability.' using errcode = '23514';
  end if;

  update public.event_registrations
  set availability = p_availability
  where id = p_registration_id
  returning * into registration_record;
  return registration_record;
end;
$$;
