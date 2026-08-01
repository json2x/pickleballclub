create or replace function private.assert_announcement_event_same_club()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.event_id is not null
    and not exists (
      select 1
      from public.events
      where id = new.event_id
        and club_id = new.club_id
    ) then
    raise exception 'The announcement and event must belong to the same club.' using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.assert_announcement_event_same_club() from public;

create trigger announcements_event_same_club
before insert or update of club_id, event_id on public.announcements
for each row execute function private.assert_announcement_event_same_club();;
