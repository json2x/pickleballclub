# Implementation Decisions

## Active decisions

- Keep the public sign-in URL at `/login`; the internal route group may be `(auth)` without changing the URL.
- Use a separate authenticated `(onboarding)` layout without the club sidebar.
- Use `Join a Club` as the canonical join content; horizontal and animated screens are responsive/enhanced references.
- The onboarding skip action returns to `/onboarding` and never grants club-scoped access.
- Club roles are exactly `owner`, `admin`, and `member`; ownership transfers through a dedicated audited action.
- Invitation management is nested at `/[clubSlug]/members/invitations`; token acceptance remains `/invite/[token]`.
- Stats is one navigation area: overview at `/[clubSlug]/stats`, rankings at `/[clubSlug]/stats/rankings`.
- Live play is event-scoped at `/[clubSlug]/events/[eventId]/live`; no club-level `/live` route.
- Use hosted Supabase only. Do not run a local Supabase stack or insert permanent seed/test users into the hosted project.
- Defer magic links and social providers until explicitly activated.
- Defer Sentry until DSNs are configured. Defer Resend delivery until `EMAIL_FROM` is configured and Phase 2 invitation administration is implemented.

## Release blockers

- Brand artwork is usable during development but requires ownership/trademark/consistency approval before public release.
- Supabase leaked-password protection must be enabled before release.
