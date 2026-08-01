# Database

Supabase project: `ptrxdxpwhreirwgpeima`.

## Deployed Phase 1 migrations

1. `20260801101933_phase1_identity_clubs`
2. `20260801102129_phase1_tenancy_security_operations`
3. `20260801102512_phase1_invitation_acceptance`
4. `20260801102616_phase1_private_club_assets`
5. `20260801102900_phase1_advisor_indexes`

## Public schema and tenancy

All five public tables have RLS enabled and revoke default table access:

- `profiles`
- `clubs`
- `club_memberships`
- `club_membership_role_audit`
- `club_invitations`

Club roles are `owner`, `admin`, and `member`. Membership states are `pending`, `active`, and `inactive`. Join policies are `open`, `approval`, and `invite_only`: open joins become active, approval joins become pending, and invite-only clubs require an invitation. Each club has exactly one active owner. Owner transitions are authorized and atomic through `transfer_club_ownership`.

RLS policies limit club data and audit visibility to active members, give owners and admins the permitted management actions, and keep invitation access with owners and admins. Security-definer RPCs handle authorized, atomic operations including profile retrieval, club discovery and creation, joining by slug, membership approval, active-club selection, ownership transfer, invitation issue, and invitation acceptance. These RPCs validate the authenticated actor and protect state transitions rather than exposing direct inserts.

Active-club routing uses the selected membership when available. If no selected membership exists, the app falls back to the user's most recently active membership before sending a user to onboarding.

`issue_club_invitation` returns a raw invitation token once. Only its SHA-256 hash is persisted. Invitations can grant `admin` or `member`, never `owner`. Acceptance verifies the token, recipient email, expiration, and terminal state before applying membership changes. The application maps invitation failures to distinct safe states, including invalid, expired, revoked, already accepted, and wrong-account outcomes.

## Private club assets and application logo flow

The `club-assets` Storage bucket is private, limited to 5 MiB, and accepts JPEG, PNG, or WebP only. Object paths are constrained to a club UUID logo path. Active members may read a club's assets; only owners and admins may insert, update, or delete them. A club cannot be deleted while assets remain in this bucket. Remove assets through the Storage API first.

Before upload, the application checks the 5 MiB limit and JPEG, PNG, or WebP magic signatures rather than trusting the browser MIME type. It writes logos to UUID-derived private paths and renders them with 300-second signed URLs. Club creation is non-destructive: if an optional logo upload fails after the club is created, the club and owner membership remain usable and the UI reports a safe upload warning.

## Hosted workflow

Use the hosted Supabase project only. Do not start, reset, seed, or depend on a local Supabase stack, and do not create permanent hosted fixture data. SQL verification suites run against the hosted project inside transactions and roll back only.

After schema changes, regenerate types at `src/types/database.types.ts`.

## Current advisor caveats

Security-definer RPC advisor notices are intentional and reviewed. Leaked-password protection remains disabled. Unused-index INFO notices are expected while the operational dataset is empty.
