# Pickle-lo Implementation Plan

> Source: [`PICKLE_LO_CODING_AGENT_IMPLEMENTATION_PROMPT.md`](PICKLE_LO_CODING_AGENT_IMPLEMENTATION_PROMPT.md)  
> Audit date: 2026-08-01  
> Stitch project: `4500934471177156793` (`Pickle-lo Club Manager`)  
> Hosted Supabase project: `ptrxdxpwhreirwgpeima`

This is the canonical, checkbox-based implementation plan for Pickle-lo. Update a checkbox only when the implementation and verification evidence described here exists. Use `documentation/IMPLEMENTATION_STATUS.md` for dated phase summaries; do not maintain a competing master checklist there.

## Status legend and completion rules

- `[x]` — implemented and verified with concrete repository or hosted-service evidence.
- `[ ] **PARTIAL**` — useful implementation exists, but one or more mandatory acceptance criteria are missing.
- `[ ] **NOT STARTED**` — no meaningful implementation exists.
- `[ ] **BLOCKED**` — work cannot proceed until the named dependency or decision is resolved.
- `[ ] **UNVERIFIED**` — an implementation may exist externally, but required evidence is unavailable.
- `[ ] **CONDITIONAL**` — optional work; complete it only when its activation condition applies.

A parent item is complete only when every mandatory child is complete. A visual-only screen, scaffold, unapplied migration, or untested workflow must not be marked complete.

## Current baseline

### Implemented and verified

- [x] Next.js App Router scaffold is installed (`next@16.2.12`).
- [x] TypeScript strict mode is enabled in `tsconfig.json`.
- [x] ESLint and the `lint`, `typecheck`, and `build` scripts are configured.
- [x] React Server Components remain the default; no unnecessary client boundary exists in the current routes.
- [x] `@supabase/ssr` and `@supabase/supabase-js` are installed.
- [x] Browser and server Supabase client helpers exist under `src/lib/supabase/`.
- [x] Cookie-based session refresh plumbing exists in `src/lib/supabase/proxy.ts` and root `proxy.ts`.
- [x] Bebas Neue and Inter are loaded with `next/font` in `src/app/layout.tsx`.
- [x] Local brand assets are inventoried in `public/brand-assets/README.md`; production approval remains pending.
- [x] The Pickle-lo favicon pack is checked in under `public/brand-assets/favicon/` and mapped through Next.js metadata with explicit sizes.
- [x] The Stitch Sign In screen was inspected and reproduced at `/login` using local assets.
- [x] The `/login` reproduction passed lint, typecheck, production build, desktop/mobile browser inspection, and keyboard-focus inspection during its implementation.
- [x] The live Stitch project and available screens were queried during this audit.
- [x] Hosted migration history was reconciled and the active Phase 1 schema is deployed: five RLS-enabled public tables plus the private `club-assets` bucket.

### Partial foundation

- [x] Supabase SSR supports functional password authentication, PKCE callbacks, recovery/reset, sign-out, protected application routing, and server identity checks.
- [x] The sign-in page is visually faithful and has functional password-auth form states.
- [x] Tailwind-based semantic tokens and the Phase 0 reusable UI foundation are configured.
- [x] `.env.example` defines the public app/Supabase contract plus blank server-only Supabase, Resend, and Sentry placeholders without real secrets.
- [ ] **PARTIAL** The app can build for Vercel and deployment/environment/migration guidance exists, but deployed environment and auth redirect verification remain pending.

### Critical audit findings

- [x] Reconciled checked-in and hosted migration history, then deployed the active Phase 1 schema through `20260801102900_phase1_advisor_indexes`.
- [x] Created the active Phase 1 application schema: five RLS-enabled public tables and the private `club-assets` bucket.
- [ ] **BLOCKED** Obtain production approval for the AI-generated brand assets noted in `public/brand-assets/README.md` before public release.
- [ ] **NOT STARTED** Enable Supabase leaked-password protection; the current security advisor reports it disabled.

## Stitch screen and route inventory

Create the durable version of this table in `documentation/STITCH_SCREEN_INVENTORY.md`. Asset-only screens are listed in `public/brand-assets/README.md` and do not require routes.

| Status | Stitch screen | Screen ID | Intended route/use | Phase |
|---|---|---|---|---:|
| Implemented | Sign In | `80cd8b5adbf44b1db3ecd2bb7671b985` | `/login` | 1 |
| Implemented | Sign Up - Purple Theme | `e8ee5528c02042f88ad363ba9d8ad2d1` | `/sign-up` | 1 |
| Implemented | Logged Out | `e937028023c14b0097cc755ee7d796db` | Signed-out feedback | 1 |
| Implemented | Welcome - Get Started | `4533382cf60941adb64021884b283294` | `/onboarding` create-or-join chooser | 1 |
| Implemented | Onboarding flow layout (Full HD) | `838acb55e2534782b32bd2bbdce13970` | Shared `(onboarding)` layout reference; no standalone route | 1 |
| Implemented | Bare Layout Template | `6beac0ed87274907a88a50bd06a51e4f` | Authenticated shell | 1 |
| Implemented | Create Your Club | `60a68eca7a03472d8c6923469e548361` | `/onboarding/create-club` | 1 |
| Implemented | Join a Club | `12e8461cedeb4eebbfe3fb1e6efcc05b` | `/onboarding/join-club` | 1 |
| Implemented responsive reference | Join a Club (Horizontal Layout) | `b2673f87a79e48b6a5bb3cc63b8ed692` | Alternate responsive reference for `/onboarding/join-club` | 1 |
| Implemented responsive reference | Join a Club (Animated Mascot) | `0dcf3ff28d2c4c0d94e16c4e870de750` | Alternate enhanced reference for `/onboarding/join-club` | 1 |
| Implemented | Club Dashboard | `07687bf3a4a54ad8b02e22e473b44193` | `/[clubSlug]/dashboard` | 1/3 |
| Pending | Member Directory | `af16c6b48ea74f259c05ce17ddd5a64d` | `/[clubSlug]/members` | 2 |
| Pending | Events Management | `53877cdb21dd4f2fa328937b8ecc1a61` | `/[clubSlug]/events` | 3 |
| Pending | Live Play Control Center | `71672c9b76aa42259b16c607d06846a5` | `/[clubSlug]/events/[eventId]/live` | 5 |

For each implemented screen:

- [ ] Add `documentation/stitch/<route-or-screen-name>.md` with the screen ID, route, references, tokens, shared components, states, corrections, and assumptions.
- [ ] Fetch the exact Stitch screen immediately before implementation.
- [ ] Use Playwright to capture desktop and mobile comparisons.
- [ ] Record intentional deviations in `documentation/IMPLEMENTATION_DECISIONS.md`.

## Initial application structure

Normalize toward this structure without moving files merely for cosmetic reasons:

```text
src/
  app/
    (auth)/
      sign-in/
      forgot-password/
      reset-password/
      invite/[token]/
    (onboarding)/
      onboarding/
        layout.tsx
        page.tsx
        create-club/
        join-club/
    (app)/
      layout.tsx
      [clubSlug]/
        layout.tsx
        dashboard/
        events/
          new/
          [eventId]/
          [eventId]/edit/
          [eventId]/check-in/
          [eventId]/setup/
          [eventId]/live/
          [eventId]/results/
        members/
          [memberId]/
          invitations/
        stats/
          rankings/
        settings/
    api/health/
    auth/callback/
    error.tsx
    loading.tsx
    not-found.tsx
  components/
    app-shell/
    brand/
    charts/
    courts/
    data-table/
    events/
    forms/
    members/
    scoring/
    ui/
  features/
    auth/
    clubs/
    onboarding/
    events/
    invitations/
    live-play/
    matching/
    members/
    ratings/
    reporting/
  lib/
    auth/
    permissions/
    supabase/
    validation/
    utils/
  server/
    actions/
    queries/
    services/
  types/
    database.types.ts
    domain.ts
supabase/
  migrations/
  seed.sql
  tests/
documentation/
  stitch/
  STITCH_SCREEN_INVENTORY.md
  IMPLEMENTATION_PLAN.md
  IMPLEMENTATION_STATUS.md
  IMPLEMENTATION_DECISIONS.md
  DATABASE.md
  REALTIME.md
  DEPLOYMENT.md
```

## Database migration sequence

Do not edit migrations already applied to the hosted project. After migration-history reconciliation, add new timestamped migrations in this dependency order:

1. [x] Reconcile local and hosted migration records and establish the active Phase 1 history.
2. [ ] **PARTIAL** `extensions_and_domain_enums` — `citext` and the Phase 1 club-role, membership-status, invitation-role, and invitation-status enums are deployed; future game/scoring/result/reason enums remain pending.
3. [x] `phase1_identity_clubs` — `profiles`, `clubs`, `club_memberships`, role audit, core constraints, and indexes.
4. [ ] **PARTIAL** `phase1_invitation_acceptance` — hashed, expiring, revocable invitations and membership acceptance are deployed; player profiles are not.
5. [ ] `events_registrations_and_logistics` — events, registrations, logistics, booking attachment metadata.
6. [ ] `courts_matches_and_score_events` — courts, matches, match players, append-only scoring audit.
7. [ ] `rating_ledger_and_operational_audit` — rating transactions, audit/activity records, idempotency constraints.
8. [x] `phase1_tenancy_security_operations` — membership/role helpers, locked search paths, and RLS policies for all deployed public tables.
9. [ ] `event_and_scoring_rpcs` — registration, check-in, score delta, undo, match finalization, event completion.
10. [ ] **PARTIAL** `phase1_private_club_assets` — private, path-scoped `club-assets` policies are deployed; booking-confirmation and avatar buckets are not.
11. [ ] `realtime_publication_configuration` — only required event/match/check-in entities.
12. [ ] `reporting_views_indexes_and_performance` — ranking, results, player connections, dashboard and stats queries.
13. [x] Regenerated `src/types/database.types.ts` from the hosted schema.
14. [x] Ran hosted security and performance advisors after the Phase 1 database foundation; intentional `SECURITY DEFINER` notices, the leaked-password warning, and expected unused-index INFO notices remain recorded.

Every schema migration must include or be followed by:

- [ ] Primary/foreign keys, useful indexes, checks, and tenant scoping.
- [ ] RLS enablement for every exposed application table.
- [ ] Least-privilege grants and callable-function permissions.
- [ ] Allowed and denied SQL tests, including cross-club isolation.
- [ ] No generated IDs, fixtures, secrets, or production personal data.

# Phase 0 — Discovery and foundation

## 0.1 Discovery and documentation

- [x] Inspect the implementation prompt.
- [x] Connect to Stitch project `4500934471177156793` and list available screens.
- [x] Inspect the current `public/brand-assets/` inventory.
- [x] Identify the current Stitch design DNA: Bebas Neue, Inter, lime, purple, ink, 4px spacing rhythm, and dark authenticated navigation.
- [x] Create `documentation/STITCH_SCREEN_INVENTORY.md` from the inventory above and resolve canonical variants.
- [x] Create `documentation/IMPLEMENTATION_DECISIONS.md` and record route naming, canonical join screen, onboarding skip destination, asset approval, provider choices, and deviations.
- [x] Create `documentation/IMPLEMENTATION_STATUS.md` with a dated Phase 0 baseline.
- [x] Create `documentation/DATABASE.md`, `documentation/REALTIME.md`, and `documentation/DEPLOYMENT.md` skeletons.
- [x] Add a Stitch implementation note for the existing sign-in reproduction.

## 0.2 Framework and architecture foundation

- [x] Next.js App Router initialized.
- [x] Strict TypeScript configured.
- [x] ESLint configured.
- [x] `next/font` configured for Bebas Neue and Inter.
- [x] Path alias `@/*` configured.
- [x] Use the Next.js 16 `proxy.ts` convention with `src/lib/supabase/proxy.ts` and preserve the static-asset matcher.
- [ ] Keep route protection optimistic in Proxy and enforce identity/authorization again in server code.
- [x] Replace the scaffold `/` page with an auth-aware redirect or signed-in application entry; do not create a marketing landing page.
- [ ] Normalize the feature-oriented directory structure.
- [ ] Keep route components thin; place business logic in typed server queries/services and pure domain functions.
- [x] Add root `loading.tsx`, `error.tsx`, and `not-found.tsx` foundations.
- [ ] Have Server Components call typed server query functions directly.
- [ ] Use Server Actions for authenticated UI-coupled mutations and Route Handlers for webhooks, callbacks, file streaming, and explicit HTTP APIs.
- [ ] Validate every mutation payload with Zod and return structured action results.
- [ ] Revalidate affected paths/tags after successful mutations.
- [ ] Store durable filters, tabs, search, and pagination in URL search parameters.
- [ ] Reserve client state for ephemeral UI and browser data access for realtime or truly client-driven behavior.
- [ ] Enforce no `any`, type suppression, placeholder APIs, fake persistence, or hard-coded production data.

## 0.3 Styling and reusable UI foundation

- [x] Initial Stitch-derived CSS tokens and login styles exist.
- [x] Local logo and mascot assets use root-relative URLs and `next/image` where appropriate.
- [x] Browser favicon assets use `favicon.ico` plus explicit 16px, 32px, 48px, and 256px metadata entries; in-app branding continues to use the wordmark or standalone mark.
- [x] Install and configure Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/postcss`, `postcss`, `postcss.config.mjs`).
- [x] Map Stitch core and semantic tokens into the Tailwind/CSS theme without regressing `/login`.
- [x] Initialize shadcn/ui or document direct Radix primitive use.
- [x] Build the Phase 0 accessible shared UI primitives foundation.
- [x] Install Lucide React and use it only after existing project assets/components are considered.
- [ ] Add reduced-motion support and enforce 44px minimum touch targets.
- [ ] Verify WCAG 2.2 AA contrast for semantic token combinations.

## 0.4 Forms, charts, and testing foundation

- [x] Install React Hook Form, Zod, and `@hookform/resolvers`.
- [x] Establish shared server/client schema patterns and structured action results.
- [x] Install Recharts and `react-is`; isolate charts in client leaf components.
- [x] Install Vitest, jsdom, React Testing Library, and jest-dom.
- [x] Add `vitest.config.ts`, `vitest.setup.ts`, and `npm run test`/coverage scripts.
- [x] Install `@playwright/test`, add `playwright.config.ts`, and configure `webServer` plus `baseURL`.
- [x] Add semantic-locator-first test conventions and stable selectors only where needed.

## 0.5 Supabase and environment foundation

- [x] Browser Supabase client helper exists.
- [x] Per-request server Supabase client helper exists.
- [x] Cookie refresh helper exists.
- [x] Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` consistently across env helpers/docs.
- [x] Define `NEXT_PUBLIC_APP_URL`, server-only Supabase secret, Resend, email sender, and Sentry placeholders in `.env.example` with safe descriptions only.
- [ ] Validate required public/server environment variables at build/startup without exposing values.
- [x] Reconcile hosted/local migration history and establish the new active schema sequence.
- [ ] Add safe development seed data in `supabase/seed.sql` only if the hosted-only workflow permits it; otherwise document the deviation.
- [ ] Enable leaked-password protection in Supabase Auth. This requires a Pro-plan Dashboard session or Management API PAT; Supabase CLI `2.111.0` cannot configure the HIBP field safely through `config.toml` or `config push`.

## 0.6 CI and Phase 0 gate

- [x] Add a GitHub Actions workflow using frozen-lockfile install.
- [x] Run lint, typecheck, unit/component tests, and production build in CI.
- [x] Add an optional Playwright login smoke test.
- [x] Add migration validation and rollback-only SQL database tests when credentials/environment support them.
- [x] Confirm `npm run lint` exits `0`.
- [x] Confirm `npm run typecheck` exits `0`.
- [x] Confirm `npm run test` exits `0` for 69 tests.
- [x] Confirm `npm run build` exits `0`.
- [x] Update `documentation/IMPLEMENTATION_STATUS.md` with Phase 0 evidence, limitations, and Phase 1 entry criteria.

# Phase 1 — Authentication, club tenancy, and shell

## 1.1 Authentication and session handling

- [x] Static Stitch Sign In UI exists at `/login`.
- [x] Browser/server Supabase clients and cookie refresh plumbing exist.
- [x] Keep `/login` as the public sign-in URL and document the intentional route deviation.
- [x] Convert sign-in to a validated functional flow with Supabase Auth.
- [x] Use server-side Zod validation and structured errors for implemented auth mutations.
- [x] Implement loading, validation-error, invalid-credential, and success states.
- [x] Implement forgot-password and reset-password routes and recovery success/error states.
- [x] Implement `/auth/callback` for supported PKCE and recovery callbacks.
- [x] Implement invitation acceptance at `/invite/[token]` with distinct safe invitation states.
- [x] Defer magic links from the first release; keep the decision documented before adding any UI or callbacks.
- [x] Preserve intended destinations when redirecting unauthenticated users.
- [x] Verify identity server-side with current Supabase guidance; never authorize from `getSession()` alone.
- [x] Redirect authenticated users without memberships to `/onboarding`.
- [x] Redirect authenticated users with memberships away from onboarding to their selected or most recent club dashboard.
- [x] Never trust user identity from form payloads.

## 1.2 Identity, clubs, memberships, and authorization

- [x] Create `profiles` separately from `auth.users`.
- [x] Create `clubs`, `club_memberships`, and required role/status enums.
- [x] Enforce unique club slugs and unique `(club_id, user_id)` memberships.
- [x] Implement exactly three club roles: owner, admin, member.
- [x] Implement dedicated, audited ownership transfer with explicit confirmation; never grant owner through invitations.
- [x] Restrict ownership transfer and club deletion to owner.
- [x] Allow admins to manage deployed club operations and admin/member roles without modifying owner.
- [ ] **PARTIAL** Members are limited by deployed tenancy policies; event participation, self-check-in, and self-scoring are not implemented.
- [ ] **PARTIAL** Centralize implemented authentication and membership authorization helpers; the full named helper set and coverage for future event permissions are not complete.
- [x] Verify authentication, membership, and allowed role in every implemented privileged server mutation.
- [x] Add RLS helpers/policies and allowed/denied rollback-only hosted SQL tests.

## 1.3 Club onboarding and switching

- [x] Implement the shared, authenticated `(onboarding)` layout from `Onboarding flow layout (Full HD)` without the club sidebar.
- [x] Implement `/onboarding` from `Welcome - Get Started` with accessible Create a Club and Join a Club choices.
- [x] Implement `/onboarding/create-club` from `Create Your Club` with club name, location, slug, progress context, and back navigation.
- [x] Validate club creation server-side, prevent slug collisions, and atomically create the club plus owner membership.
- [x] Redirect successful creation to `/<clubSlug>/dashboard`.
- [x] Implement `/onboarding/join-club` from the primary Join a Club screen.
- [x] Treat the Horizontal Layout and Animated Mascot screens as alternate references for the same join route with a canonical responsive treatment.
- [x] Support club search by name/city and joining by exact slug; private invitations use `/invite/[token]`.
- [x] Validate join eligibility, invitation constraints, authenticated identity, and duplicate membership state on the server.
- [x] Redirect successful joining to `/<clubSlug>/dashboard`.
- [x] Implement loading, no-results, validation, duplicate-slug, already-member, invalid/expired-invite, permission-denied, mutation-error, and success/redirect states.
- [x] Decide and document the Stitch “skip this step” destination; it does not bypass membership checks for tenant-owned routes.
- [x] Implement active-club switching and display current role.
- [x] Implement private `club-assets` upload and signed-access flow with 5 MiB and magic-signature validation, UUID paths, and 300-second signed display URLs.

## 1.4 Authenticated application shell and dashboard frame

- [x] Confirm the canonical shell from Bare Layout Template/Club Dashboard Stitch screens.
- [x] Implement the authenticated shell with a dark desktop sidebar and responsive tablet/mobile navigation.
- [x] Implement shared sidebar, top bar, page header, account menu, club switcher, and permission-aware navigation.
- [x] Keep shell data server-rendered and interactive controls as client leaves.
- [x] Add responsive, keyboard, and focus verification for implemented shell controls; reduced-motion and touch-target work remains broader hardening.

## 1.5 Phase 1 tests and gate

- [x] Unit-test implemented auth validation and authorization behavior.
- [ ] **PARTIAL** Unit and component coverage covers implemented auth validation and public auth states, but authenticated onboarding and shell component coverage is not implemented.
- [x] SQL-test profile/club/membership RLS and tenant isolation with rollback-only hosted suites.
- [ ] **PARTIAL** 8 Playwright tests cover public and unauthenticated routing, but authenticated mutation happy paths require a safe credential-backed environment and remain unexecuted.
- [ ] **PARTIAL** Perform broader Stitch visual comparisons for all Phase 1 screens.
- [ ] **PARTIAL** 69 Vitest tests, 8 Playwright tests, lint, typecheck, production build, database lint, four hosted rollback SQL suites, and `npm audit` with 0 advisories pass. Credential-backed hosted auth and mutation acceptance remain unexecuted, so the Phase 1 parent gate is not complete.
- [x] Update `documentation/IMPLEMENTATION_STATUS.md`.

# Phase 2 — Members and invitations

## 2.1 Member and player data

- [ ] Create club player profiles and required indexes/constraints.
- [ ] Create one Members navigation area with Directory at `/[clubSlug]/members` and Invitations at `/[clubSlug]/members/invitations` using route-driven tabs/subnavigation.
- [ ] Implement `/[clubSlug]/members` with search, filters, sorting, pagination, and responsive cards/rows.
- [ ] Show name/avatar, role, rank, rating, trend, matches, wins, win rate, and status.
- [ ] Implement `/[clubSlug]/members/[memberId]` profile basics with permission-aware actions.
- [ ] Implement private avatar storage, replacement cleanup, MIME/size validation, and signed URLs.

## 2.2 Invitation workflow

- [ ] Implement club-scoped invitation administration at `/[clubSlug]/members/invitations`; do not add a separate top-level Invitations navigation item.
- [ ] Keep recipient acceptance at `/invite/[token]` and clearly distinguish it from the signed-in management route.
- [x] Create hashed, expiring, revocable club invitation records.
- [ ] Add an `EmailService` abstraction and isolated Resend production implementation.
- [ ] Implement single/bulk invite with membership role selection: member by default, admin when authorized, never owner.
- [ ] Implement pending/accepted/expired/revoked filters, resend, revoke, and authorized link copy.
- [x] Verify token hash, email match, expiry, revocation, and wrong-account states server-side.
- [ ] **PARTIAL** Create membership atomically during acceptance; player profiles are not implemented.
- [ ] Show delivery failures without leaking provider internals.

## 2.3 Phase 2 tests and gate

- [ ] Test owner/admin/member permissions, admin limits, invitation role constraints, and ownership-transfer protection.
- [ ] SQL-test invitation acceptance isolation and storage access.
- [ ] Playwright-test owner invitations plus admin/member acceptance end to end.
- [ ] Compare Member Directory and invitation/onboarding UI to Stitch.
- [ ] Pass all quality gates and update implementation status.

# Phase 3 — Events and registration

## 3.1 Event model and lifecycle

- [ ] Create events, registrations, statuses, formats, strategies, indexes, and constraints.
- [ ] Implement a validated event state-transition service; never transition from UI state alone.
- [ ] Implement events list tabs/filters, search, status, progress, venue/date/event manager, and responsive views.
- [ ] Implement create/edit multi-section forms with draft and publish actions.
- [ ] Validate every mutation with Zod on the server.

## 3.2 Registration and event detail

- [ ] Implement atomic `register_for_event(event_id)` with windows, duplicate prevention, capacity, waitlist, and minimum-player transition.
- [ ] Implement cancellation and owner/admin registration management.
- [ ] Implement event detail with timeline, attendee/waitlist, logistics, attachments, owner/admin management actions, check-in/live/results links.
- [ ] Prompt authorized owners/admins to confirm courts, hours, booking reference, and attachment after minimum registration is reached.
- [ ] Never claim external court booking automatically.

## 3.3 Operational dashboard

- [ ] Implement next event, drafts needing work, minimum-reached events, booking status, member count, recent registrations, leaderboard preview, and quick actions.
- [ ] Compose dashboard queries server-side and parallelize independent reads.

## 3.4 Phase 3 tests and gate

- [ ] Unit-test event transitions and Zod schemas.
- [ ] SQL-test capacity, waitlist, minimum transition, RLS, and tenant isolation.
- [ ] Playwright-test admin event creation/publish and player registrations to minimum.
- [ ] Compare Dashboard and Events Management screens to Stitch.
- [ ] Pass all quality gates and update implementation status.

# Phase 4 — Logistics and check-in

## 4.1 Logistics and booking attachments

- [ ] Create event logistics and booking attachment metadata.
- [ ] Provision private `booking-confirmations` storage and path-scoped policies.
- [ ] Accept approved PDFs/images with client and server MIME/size validation.
- [ ] Store paths, not expiring signed URLs; sanitize displayed filenames and delete replacements.

## 4.2 Check-in and event setup

- [ ] Implement atomic `check_in_player(event_id, player_id)` with role/self-check rules.
- [ ] Support owner/admin check-in, allowed-window member self-check-in, reversal, search, filters, counts, not-arrived, and late-arrival states.
- [ ] **CONDITIONAL** Add a QR-oriented self-check-in link after the base flow is stable.
- [ ] Implement configured court creation, singles/doubles, scoring type, points-to-win, win-by-two, and matching strategy.
- [ ] Implement available-player review, generated assignments, manual adjustment, and event start.

## 4.3 Phase 4 tests and gate

- [ ] SQL-test allowed/denied check-in and private attachment access.
- [ ] Component-test upload validation and check-in states.
- [ ] Playwright-test logistics confirmation, upload, and player check-in.
- [ ] Pass all quality gates and update implementation status.

# Phase 5 — Matching and live play

## 5.1 Deterministic matching engine

- [ ] Implement balanced, randomized, maximum-variety, shortest-wait, competitive, social, and manual strategies.
- [ ] Score bounded candidate assignments using skill, repeat pairings, games played, rest, and consecutive-game factors.
- [ ] Add a deterministic seeded pseudo-random generator.
- [ ] Add bounded-search limits and a greedy fallback for large pools.
- [ ] Persist matching runs, inputs, weights, assignments, locks, exclusions, and owner/admin adjustments.
- [ ] Unit-test singles/doubles, odd/few players, multiple courts, ties, skill imbalance, repeats, wait preference, locks, late arrival, and departure.

## 5.2 Realtime live event board

- [ ] Implement the event-scoped Live Play Control Center at `/[clubSlug]/events/[eventId]/live`; do not add a redundant `/[clubSlug]/live` route.
- [ ] Link dashboard, event-list, and event-detail live actions directly to the applicable event; handle multiple live-event selection in those existing surfaces.
- [ ] Implement server-fetched initial event/court/match state.
- [ ] Subscribe only to event/match-scoped realtime changes while mounted.
- [ ] Reconcile updates by primary key and timestamp/version; remove channels on unmount.
- [ ] Protect every subscribed table with RLS and never use presence/broadcast as the persistence source of truth.
- [ ] Show connected/reconnecting/stale state and manual refresh fallback.
- [ ] Implement available, pending, ready, in-progress, completed, and paused court states.

## 5.3 Scoring view and audit

- [ ] Implement tablet/large-display scoring with names, large scores, timer, status, and permitted actions.
- [ ] Implement atomic `record_score_delta` with row locking, live-state validation, non-negative scores, and audit insertion.
- [ ] Implement auditable `undo_last_score_event` without deleting history where practical.
- [ ] Implement pause/resume and guarded end-game confirmation.
- [ ] Prevent accidental rapid duplicate scoring and reconcile optimistic UI with authoritative responses.

## 5.4 Phase 5 tests and gate

- [ ] Unit-test matching and scoring domain logic.
- [ ] SQL-test atomic scoring, undo, concurrency/conflict behavior, and scoring authorization.
- [ ] Component-test score controls, disabled roles, reconnecting state, and confirmation dialogs.
- [ ] Playwright-test assignment generation, adjustment, scoring, correction, and unauthorized denial.
- [ ] Compare Live Play Control Center and scoring surfaces to Stitch.
- [ ] Pass all quality gates and update implementation status.

# Phase 6 — Ratings and results

## 6.1 Transactional match finalization

- [ ] Implement idempotent `finalize_match(match_id, winning_team)` with row locking.
- [ ] Validate winner/scoring rules and require an authorized audit reason for overrides.
- [ ] Assign `+10` to each winner and `-5` to each loser exactly once.
- [ ] Write immutable rating transactions and update cached balances transactionally.
- [ ] Update player match results/deltas and release the court.
- [ ] Prevent duplicate finalization with constraints and idempotency checks.

## 6.2 Event completion and Stats rankings

- [ ] Implement `complete_event(event_id)` only when no live matches remain.
- [ ] Implement event summary, leaders/achievements, all matches, and performance table without inventing a bracket champion.
- [ ] Create the shared Stats layout/subnavigation with Overview at `/[clubSlug]/stats` and Rankings at `/[clubSlug]/stats/rankings` under one primary Stats navigation item.
- [ ] Implement the full club leaderboard at `/[clubSlug]/stats/rankings` from ledger balances with stable tie-breaking and calculation timestamp.
- [ ] Include rank, rating points, 30-day movement, wins, matches, win rate, filters, search, sorting, and pagination in the Rankings subview.
- [ ] Persist rankings filters, search, sorting, and pagination in URL search parameters.
- [ ] Implement player profile rating chart (`6M`, `1Y`, `ALL`), recent matches, and deterministic connection/opponent analytics with sample context.

## 6.3 Phase 6 tests and gate

- [ ] Unit-test rating calculations, tie-breaking, connections, and idempotency.
- [ ] SQL-test finalization, ledger/cache consistency, duplicate prevention, and tenant isolation.
- [ ] Playwright-test one-time finalization, `+10/-5`, event completion, and reflected rankings/stats.
- [ ] Pass all quality gates and update implementation status.

# Phase 7 — Club analytics and settings

## 7.1 Stats overview and analytics

- [ ] Implement the parent Stats overview at `/[clubSlug]/stats` without creating a separate top-level Rankings navigation item.
- [ ] Add route-driven Overview and Rankings tabs/subnavigation.
- [ ] Show a compact leaderboard/top-rating preview that links to `/[clubSlug]/stats/rankings` for the complete ranking dataset.
- [ ] Implement all-time wins, matches, qualified win rate, rating points, events hosted, active members, matches over time, and participation trends.
- [ ] Use server-side aggregates/views/materialized views where appropriate; do not calculate entire datasets in the browser.
- [ ] Persist analytics filters/date ranges in URL search parameters.
- [ ] Add indexes and dynamically load heavy chart clients when beneficial.

## 7.2 Settings and audit history

- [ ] Implement general info, branding, event defaults, scoring defaults, rating rules, owner/admin/member permissions, self-check-in, notifications, and dangerous actions.
- [ ] Keep `+10/-5` fixed initially but structure it for future configuration.
- [ ] Require explicit confirmation and stronger authorization for dangerous actions.
- [ ] Record privileged role, event, score, settings, and destructive changes in an audit trail.

## 7.3 Phase 7 tests and gate

- [ ] Test aggregate query correctness and role-based settings access.
- [ ] Test dangerous-action confirmations and audit records.
- [ ] Playwright-test authorized settings updates and unauthorized denial.
- [ ] Pass all quality gates and update implementation status.

# Phase 8 — Hardening and release

## 8.1 Security and data review

- [ ] Complete RLS allowed/denied tests for every exposed table and callable function.
- [ ] Verify cross-club isolation for reads, writes, RPCs, storage, and realtime.
- [ ] Verify service/secret keys never enter client bundles or logs.
- [ ] Run Supabase security/performance advisors and remediate release-blocking findings.
- [ ] Review webhook signatures, invitation tokens, signed URLs, and sensitive logging.

## 8.2 Accessibility, performance, and visual quality

- [ ] Audit keyboard navigation, focus, semantics, contrast, non-color status, reduced motion, touch targets, and destructive confirmations.
- [ ] Verify mobile screens do not depend on horizontal tables.
- [ ] Review server waterfalls, pagination, indexes, Suspense/loading boundaries, image priorities, dynamic imports, and realtime subscription scope.
- [ ] Capture and compare desktop/mobile Playwright screenshots for every Stitch-backed screen.
- [ ] Record every intentional visual deviation.

## 8.3 Error handling, observability, and operational readiness

- [ ] Add recoverable error, loading, empty, filtered-empty, permission-denied, and reconnecting states to every relevant screen.
- [ ] Add structured server logging without secrets or sensitive payloads.
- [ ] Add `/api/health` for basic application checks.
- [ ] Add user-friendly error messages and correlation IDs where useful.
- [ ] **CONDITIONAL** Integrate Sentry when a DSN/project is configured.
- [ ] Verify Vercel log compatibility and external-provider webhook signature handling.

## 8.4 Deployment and smoke tests

- [ ] Document development, preview, and production environment variables.
- [ ] Configure local/preview/production auth redirect URLs.
- [ ] Ensure invitation links use the correct environment base URL.
- [ ] Document controlled migration deployment, rollback, and recovery.
- [ ] Keep deployment stateless and serverless-safe: standard Next.js build, no custom server, no long-running in-memory WebSocket service, and external persistence for important state.
- [ ] Isolate production and preview Supabase/email behavior; preview must not send production invitations or mutate production data.
- [ ] Document production/preview project separation and choose Vercel/Supabase regions with reasonable proximity to primary users.
- [ ] Run the full Playwright critical-flow suite against a safe environment.
- [ ] Run preview and production smoke tests.
- [ ] Complete `documentation/DEPLOYMENT.md` and final `documentation/IMPLEMENTATION_STATUS.md`.

## 8.5 Final release gate

- [ ] Frozen-lockfile install succeeds.
- [ ] `npm run lint` exits `0`.
- [ ] `npm run typecheck` exits `0`.
- [ ] Unit/component tests exit `0`.
- [ ] Supabase SQL/database tests exit `0`.
- [ ] `npm run build` exits `0`.
- [ ] Playwright critical E2E tests exit `0`.
- [ ] No unresolved critical/high security advisor findings remain.
- [ ] Production deployment and rollback procedures have been exercised.

## Per-screen definition of done

Copy this checklist into each `documentation/stitch/<screen>.md` note. No screen is complete until every applicable mandatory item is checked.

- [ ] Exact Stitch source and identifier recorded.
- [ ] Shared shell/components used where appropriate.
- [ ] Desktop, tablet, and mobile layouts verified.
- [ ] Loading, empty, error, filtered-empty, permission, and reconnecting states implemented where applicable.
- [ ] Real Supabase data connected; no fake persistence or hard-coded production data.
- [ ] Mutations persist correctly and return structured results.
- [ ] Server-side identity, membership, and role authorization enforced.
- [ ] Associated tables/functions/storage have RLS/least-privilege policies.
- [ ] Forms use server-side Zod validation.
- [ ] Keyboard navigation and visible focus work.
- [ ] Meaningful images have text alternatives; decorative images are ignored appropriately.
- [ ] Unit/component/database/E2E tests cover critical behavior.
- [ ] Playwright visual comparison completed at target viewports.
- [ ] Lint, typecheck, tests, and production build pass.
- [ ] Intentional deviations and assumptions are documented.

## Required deliverables

- [ ] **PARTIAL** Working Next.js application with implemented Phase 1 auth, onboarding, tenancy shell, and logo workflows. Credential-backed hosted happy-path acceptance remains unexecuted.
- [x] Active Supabase schema migrations through `20260801102900_phase1_advisor_indexes`.
- [x] Generated `src/types/database.types.ts`.
- [x] Documented hosted-only alternative; no local stack or permanent hosted seed fixtures are used.
- [x] RLS policies and four rollback-only hosted SQL suites.
- [ ] Reusable component system.
- [x] `documentation/STITCH_SCREEN_INVENTORY.md`.
- [ ] Per-screen `documentation/stitch/*.md` notes.
- [x] 69 unit/component tests and 8 Playwright tests.
- [x] `.env.example` documents the required public and planned server/provider environment contract with blank values.
- [x] `README.md` contains basic local setup.
- [ ] Expand `README.md` as architecture and workflows mature.
- [x] `documentation/DATABASE.md`.
- [x] `documentation/REALTIME.md`.
- [x] `documentation/DEPLOYMENT.md`.
- [x] `documentation/IMPLEMENTATION_DECISIONS.md`.
- [x] `documentation/IMPLEMENTATION_STATUS.md`.
- [x] `documentation/IMPLEMENTATION_PLAN.md`.

## Official implementation references

- Next.js Proxy: <https://nextjs.org/docs/app/api-reference/file-conventions/proxy>
- Next.js server/client components: <https://nextjs.org/docs/app/getting-started/server-and-client-components>
- Supabase SSR clients: <https://supabase.com/docs/guides/auth/server-side/creating-a-client>
- Supabase RLS: <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Supabase API keys: <https://supabase.com/docs/guides/getting-started/api-keys>
- Tailwind with Next.js: <https://tailwindcss.com/docs/installation/framework-guides/nextjs>
- shadcn/ui with Next.js: <https://ui.shadcn.com/docs/installation/next>
- Radix primitives: <https://www.radix-ui.com/primitives/docs/overview/getting-started>
- React Hook Form: <https://react-hook-form.com/docs/useform>
- Vitest: <https://vitest.dev/guide/>
- React Testing Library: <https://testing-library.com/docs/react-testing-library/intro/>
- Playwright configuration: <https://playwright.dev/docs/test-configuration#webserver>
- Recharts: <https://recharts.github.io/en-US/guide/installation/>
- Lucide React: <https://lucide.dev/guide/installation>

## Maintenance procedure

At the end of each implementation task:

1. [ ] Update only the affected atomic checkboxes with evidence.
2. [ ] Add or update the relevant Stitch note and implementation decision.
3. [ ] Record migrations, tests, known limitations, and next work in `documentation/IMPLEMENTATION_STATUS.md`.
4. [ ] Re-run the phase quality gate before checking a phase complete.
5. [ ] Re-audit external state (Stitch, hosted migrations/tables, advisors, Vercel) instead of inferring deployment success from local files.
