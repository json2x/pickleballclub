-- Phase 2: Invitation Management RPCs
-- Adds RPCs for listing, revoking, and resending invitations,
-- plus a performance index for filtered invitation queries.

-- ─── Index for filtered invitation queries ──────────────────────────────

create index if not exists club_invitations_club_status_idx
  on public.club_invitations (club_id, accepted_at, revoked_at, expires_at);

-- ─── RPC: Get club invitations (owner/admin only) ──────────────────────

create or replace function public.get_club_invitations(
  p_club_id uuid,
  p_status_filter text default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invitations json;
begin
  -- Caller must be owner or admin
  if not public.has_club_role(p_club_id, array['owner'::public.club_role, 'admin'::public.club_role]) then
    raise exception 'Insufficient permissions to view invitations';
  end if;

  select json_agg(row_to_json(t) order by t.created_at desc)
  into v_invitations
  from (
    select
      ci.id,
      ci.email,
      ci.role,
      ci.created_at,
      ci.expires_at,
      ci.accepted_at,
      ci.revoked_at,
      ci.accepted_by,
      ci.invited_by,
      p.display_name as invited_by_name,
      case
        when ci.revoked_at is not null then 'revoked'
        when ci.accepted_at is not null then 'accepted'
        when ci.expires_at < now() then 'expired'
        else 'pending'
      end as status
    from public.club_invitations ci
    left join public.profiles p on p.id = ci.invited_by
    where ci.club_id = p_club_id
      and (
        p_status_filter is null
        or p_status_filter = 'all'
        or (p_status_filter = 'pending' and ci.accepted_at is null and ci.revoked_at is null and ci.expires_at >= now())
        or (p_status_filter = 'accepted' and ci.accepted_at is not null)
        or (p_status_filter = 'expired' and ci.expires_at < now() and ci.accepted_at is null and ci.revoked_at is null)
        or (p_status_filter = 'revoked' and ci.revoked_at is not null)
      )
  ) t;

  return json_build_object('invitations', coalesce(v_invitations, '[]'::json));
end;
$$;

-- ─── RPC: Revoke invitation (owner/admin only) ─────────────────────────

create or replace function public.revoke_club_invitation(
  p_club_id uuid,
  p_invitation_id uuid
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result json;
begin
  -- Caller must be owner or admin
  if not public.has_club_role(p_club_id, array['owner'::public.club_role, 'admin'::public.club_role]) then
    raise exception 'Insufficient permissions';
  end if;

  update public.club_invitations
  set revoked_at = now()
  where id = p_invitation_id
    and club_id = p_club_id
    and accepted_at is null
    and revoked_at is null
  returning json_build_object('id', id, 'email', email, 'revoked_at', revoked_at) into v_result;

  if v_result is null then
    raise exception 'Invitation not found, already accepted, or already revoked';
  end if;

  return v_result;
end;
$$;
