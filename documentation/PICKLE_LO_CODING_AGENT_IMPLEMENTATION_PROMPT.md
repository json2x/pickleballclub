# Pickle-lo Coding Agent Implementation Prompt

## Mission

Act as a senior full-stack engineer and implementation lead. Build **Pickle-lo**, a production-ready pickleball club management web application, from the approved Google Stitch designs using the Stitch MCP server as the design source of truth.

The application must use:

- **Next.js App Router**
- **TypeScript** with strict mode
- **React Server Components by default**
- **Supabase** for PostgreSQL, authentication, Row Level Security, Storage, and Realtime
- **Vercel** for hosting and deployments
- **Tailwind CSS** for styling
- **shadcn/ui or Radix primitives** for accessible low-level UI behavior where the Stitch output does not already provide a suitable implementation
- **React Hook Form + Zod** for complex forms and validation
- **Recharts** for application charts
- **Lucide React** for general UI icons, supplemented by approved Pickle-lo brand assets
- **Vitest or Jest + React Testing Library** for unit/component tests
- **Playwright** for critical end-to-end flows

Do not create a marketing landing page. Build authentication pages and the signed-in application only.

The primary outcome is not a static design reproduction. It is a working, secure, responsive, maintainable SaaS application that faithfully implements the supplied Stitch screens and the product behavior defined below.

---

# Repository context and existing project assets

This repository already contains Pickle-lo project assets and design resources. **The existing `/public` directory is the first source of truth for static assets used by the implementation.**

Before implementing any page, route, or component:

1. Inspect the relevant contents of `/public`.
2. Identify existing logos, app icons, favicons, mascot illustrations, court graphics, SVG icons, patterns, backgrounds, screenshots, placeholder images, and other design resources.
3. Match those assets against the Google Stitch screen and reuse the closest approved version.
4. Preserve the existing directory structure and filenames unless there is a clear technical reason to normalize them.
5. Do not copy the same asset into another directory or create a duplicate with a different filename.
6. Do not recreate a logo, mascot, icon, or illustration that already exists in `/public`.
7. Only add a placeholder when no suitable asset exists. Mark placeholders clearly in code and record them in `documentation/IMPLEMENTATION_DECISIONS.md`.

Use public assets through root-relative URLs. Prefer `next/image` for raster images when its optimization and sizing behavior are appropriate. Use inline React SVG components only when the asset must be dynamically styled or animated and doing so does not alter approved brand artwork.

```tsx
import Image from "next/image";

<Image
  src="/brand/logo/pickle-lo-primary.svg"
  alt="Pickle-lo"
  width={180}
  height={48}
  priority
/>
```

Do not import files from `/public` using relative JavaScript imports. Reference them from the application root, for example `/brand/mascot/ready-to-play.png`.

## Asset selection priority

When selecting an asset, use this order:

1. Existing approved project asset in `/public`
2. Asset exported or retrieved from the approved Google Stitch project
3. Existing project component or icon already used elsewhere in the repository
4. Lucide React for generic interface icons
5. A simple temporary placeholder
6. Newly generated artwork only when explicitly requested and approved

When an exported Stitch asset is needed, first check whether an equivalent version already exists in `/public`. If it does, reuse the repository version rather than adding another copy.

---

# 1. Non-negotiable operating rules

1. **Use Stitch MCP before coding each screen.** Fetch the relevant Stitch screen, its design metadata, component structure, visual hierarchy, spacing, typography, colors, and assets.
2. **Treat Stitch as the visual source of truth** and this document as the behavioral and technical source of truth.
3. **Do not blindly paste generated Stitch code.** Inspect it, normalize it into the project architecture, extract reusable components, correct accessibility issues, and replace mock data with typed application data.
4. **Do not redesign approved screens.** Only make necessary implementation corrections for accessibility, responsiveness, missing states, or technical feasibility.
5. **Do not invent missing product behavior silently.** Record assumptions in `documentation/IMPLEMENTATION_DECISIONS.md`.
6. **Use Server Components by default.** Add `"use client"` only for interactive components that require browser state, event handlers, hooks, realtime subscriptions, or third-party client libraries.
7. **Never expose the Supabase service-role key to the browser.**
8. **Every tenant-owned table must have RLS enabled before the feature is considered complete.**
9. **All privileged mutations must verify authentication, club membership, and role on the server.** UI permission checks are not sufficient.
10. **No `any` types, placeholder APIs, fake persistence, or hard-coded production data.** Seed/demo data may exist only in local development and must be clearly isolated.
11. **Run linting, type checking, tests, and production build before marking a phase complete.**
12. **Do not stop after scaffolding.** Continue until the requested phase is functional end to end.

---

# 2. Design-to-code workflow using Google Stitch MCP

For every page or major component, follow this sequence.

## Step 1: Inspect the Stitch project

Use the configured Stitch MCP tools to:

- locate the Pickle-lo project;
- list available screens and variants;
- fetch the exact screen requested for implementation;
- retrieve screenshots or rendered previews;
- retrieve generated code only as a reference;
- inspect layout dimensions, breakpoints, typography, colors, spacing, radii, borders, shadows, and assets;
- identify repeated visual patterns across screens.

If the Stitch MCP server exposes a “Design DNA,” theme, token, or project context resource, fetch it before implementing the first page and whenever the design changes.

Do not assume MCP tool names. Discover the available Stitch MCP tools from the agent environment and use the closest matching operations.

## Step 2: Create a visual implementation note

Before coding a screen, add or update an entry in:

`documentation/stitch/<route-or-screen-name>.md`

Include:

- Stitch screen name and identifier;
- implementation route;
- desktop and mobile references;
- reusable components identified;
- design tokens used;
- expected states not represented in Stitch;
- any accessibility or responsiveness corrections;
- unresolved questions or assumptions.

## Step 3: Map the screen to reusable components

Do not create a monolithic page component. Identify whether the screen reuses:

- application shell;
- sidebar;
- top bar;
- page header;
- filter bar;
- KPI/stat card;
- data table;
- member row;
- event card;
- court card;
- scoreboard;
- empty state;
- confirmation dialog;
- form section;
- chart container;
- status badge;
- drawer or sheet.

Prefer composition over route-specific duplication.

## Step 4: Implement visual fidelity

Match the supplied design closely:

- hierarchy;
- alignment;
- spacing;
- dimensions;
- font families and weights;
- colors;
- icon sizes;
- radii;
- borders;
- responsive rearrangement;
- hover, focus, active, disabled, loading, empty, and error states.

Use CSS variables and Tailwind theme tokens rather than scattering raw hex values through components.

## Step 5: Compare and refine

After implementation:

- run the app at the target viewport sizes;
- capture screenshots with Playwright;
- compare them with Stitch references;
- fix obvious differences;
- verify keyboard navigation, focus visibility, contrast, overflow, and touch target sizes;
- record intentional deviations.

Where supported, use screenshot or browser MCP tooling to inspect the rendered application. Do not claim pixel accuracy without performing a visual comparison.

---

# 3. Brand and design system implementation

Create a project-level design token layer based on the approved Pickle-lo design system.

## Core colors

```css
--brand-lime: #A7E23E;
--brand-green: #2E7D32;
--brand-purple: #7A3FC8;
--brand-white: #FFFFFF;
--brand-ink: #0E1117;
--surface-light: #F7F8F5;
--surface-dark: #121923;
--border-light: #E4E7E1;
--text-muted: #5E665F;
--focus-ring: #7A3FC8;
```

Build semantic tokens on top of them, including:

- background;
- foreground;
- card;
- card foreground;
- muted;
- muted foreground;
- primary;
- primary foreground;
- secondary;
- accent;
- success;
- warning;
- destructive;
- border;
- input;
- ring.

## Typography

Use `next/font` where possible:

- Bebas Neue for short display headings, score displays, celebratory headings, and live-play emphasis;
- Inter for interface text, data, forms, navigation, and body content.

Do not use Bebas Neue for tables, form controls, or dense paragraphs.

## UI character

- Product screens should remain calm and structured.
- Use mascot artwork selectively for onboarding, empty states, event success, and celebration.
- Avoid gradients unless they are explicitly present in the approved Stitch design.
- Use lime for action and energy, green for positive/success states, and purple sparingly for selection or branded emphasis.
- Minimum touch target: `44px × 44px`.
- Meet WCAG 2.2 AA where practical.

## Brand assets

The project may already contain approved assets anywhere inside `/public`. Inspect and reuse them before adding or moving files. Do not reorganize existing assets solely to match a preferred structure if doing so would break references or create unnecessary churn.

For newly added brand assets, prefer this structure when it is compatible with the current repository:

```text
/public/brand/logo/
/public/brand/mascot/
/public/brand/icons/
/public/brand/motifs/
```

Rules:

- Do not recreate the logo from a font. Use the supplied SVG or PNG asset.
- Do not redraw or regenerate the mascot when a suitable approved version exists.
- Preserve SVG view boxes, transparent backgrounds, aspect ratios, and safe areas.
- Use descriptive alt text for meaningful artwork and empty alt text for purely decorative assets.
- Set explicit image dimensions or use a constrained `fill` container to avoid layout shift.
- Use `priority` only for above-the-fold images that materially affect Largest Contentful Paint.
- Keep original master assets intact; create optimized derivatives only when required for performance and document why.

### Favicons and browser icons

Use the checked-in favicon pack under `/public/brand-assets/favicon/` through Next.js metadata:

- `favicon.ico` for broad browser and shortcut compatibility;
- `favicon-16x16.png`, `favicon-32x32.png`, and `favicon-48x48.png` for explicit browser-tab and bookmark sizes;
- `favicon-256x256.png` for high-resolution browser surfaces and as the source for future manifest/app-icon derivatives.

Do not use favicon files as in-app logos, avatars, or decorative artwork. Continue to use the primary wordmark or standalone `P` mark for application navigation and compact brand placements. Do not treat the 256px favicon as an Apple touch icon or installable PWA icon until the required platform-specific sizes/background treatment and manifest are implemented.

---

# 4. Application architecture

Use a feature-oriented structure that remains compatible with the App Router.

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
          general/
          members/
          roles/
          ratings/
          notifications/
    api/
      webhooks/
      health/
    auth/
      callback/
    error.tsx
    not-found.tsx
    globals.css
    layout.tsx
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
      client.ts
      server.ts
      admin.ts
      proxy.ts
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

Keep route components thin. Put domain logic in server services and pure functions, not in JSX.

The `(onboarding)` route group is authenticated but intentionally separate from the signed-in application shell. It uses the simplified header/footer composition from the Stitch onboarding layout rather than the club sidebar. Route authenticated users with no active memberships to `/onboarding`; route users with memberships to their selected or most recent club dashboard.

---

# 5. Authentication and session handling

Use Supabase Auth with the official SSR approach for the Next.js App Router.

Support initially:

- email/password sign-in;
- password reset;
- email invitation acceptance;
- optional magic link, provided it does not complicate the first release.

Implementation requirements:

- browser Supabase client for client-side interactions;
- server Supabase client using request cookies;
- session refresh through the current Supabase-recommended Next.js proxy/middleware pattern;
- protected route groups;
- server-side user verification before loading club data;
- redirect unauthenticated users to sign-in while preserving the intended destination;
- redirect authenticated users without club membership to `/onboarding`;
- keep onboarding routes protected while omitting the club-scoped application shell;
- redirect authenticated users with memberships away from onboarding to their selected or most recent club dashboard;
- never trust user identity sent in form payloads.

Create application profiles separately from `auth.users`.

---

# 6. Multi-tenant club model and authorization

A user can belong to multiple clubs. Every club-owned record must be scoped by `club_id`.

## Roles

Use these roles:

- `owner`
- `admin`
- `member`

Recommended permissions:

| Capability | Owner | Admin | Member |
|---|---:|---:|---:|
| Update club settings | Yes | Yes | No |
| Manage membership roles | Yes | Yes, except owner | No |
| Transfer ownership or delete club | Yes | No | No |
| Invite/remove members | Yes | Yes, except owner | No |
| Create/edit events | Yes | Yes | No |
| Finalize event logistics | Yes | Yes | No |
| Manage any player's check-in | Yes | Yes | Self only |
| Configure courts/matches | Yes | Yes | No |
| Record/correct scores | Yes | Yes | Optional self-scoring for assigned matches |
| View club data | Yes | Yes | Yes |

`owner` is a singular, transferable responsibility. Ownership transfer must use a dedicated, audited server mutation with explicit confirmation; it must never be assigned through a normal invitation. Invitations default to `member` and may grant `admin` only to an authorized owner/admin. Event manager and scorer are capabilities, not additional club roles.

Centralize authorization in server-side helpers such as:

```ts
requireUser()
requireClubMembership(clubId)
requireClubRole(clubId, allowedRoles)
canManageEvent(membership, event)
```

Do not duplicate role logic ad hoc across pages.

Onboarding mutations are privileged server operations. Creating a club must create the owner membership atomically. Joining a club must verify the target club, invitation or slug eligibility, authenticated identity, duplicate membership state, and any invitation email constraint before creating membership. A user without membership must never gain access to a club-scoped route by skipping onboarding in the UI.

---

# 7. Proposed database model

Use UUID primary keys, `timestamptz`, foreign keys, useful indexes, check constraints, and explicit enum types where appropriate.

## Identity and clubs

### `profiles`

- `id uuid primary key references auth.users(id)`
- `display_name text`
- `first_name text`
- `last_name text`
- `avatar_url text`
- `phone text null`
- `timezone text default 'Asia/Manila'`
- `created_at timestamptz`
- `updated_at timestamptz`

### `clubs`

- `id uuid primary key`
- `name text`
- `slug text unique`
- `description text null`
- `logo_url text null`
- `timezone text default 'Asia/Manila'`
- `currency text default 'PHP'`
- `created_by uuid references profiles(id)`
- `created_at timestamptz`
- `updated_at timestamptz`

### `club_memberships`

- `id uuid primary key`
- `club_id uuid references clubs(id)`
- `user_id uuid references profiles(id)`
- `role club_role`
- `status membership_status`
- `joined_at timestamptz`
- `created_at timestamptz`
- unique `(club_id, user_id)`

### `club_invitations`

- `id uuid primary key`
- `club_id uuid`
- `email citext`
- `role club_role`
- `token_hash text`
- `invited_by uuid`
- `expires_at timestamptz`
- `accepted_at timestamptz null`
- `revoked_at timestamptz null`
- `created_at timestamptz`

Store only a hash of the invitation token in the database. Send the raw token only in the invitation URL.

Invitation role must be restricted to `admin` or `member`; `owner` can only be established through club creation or the dedicated ownership-transfer operation.

## Player profile and ratings

### `club_player_profiles`

Club-specific player information:

- `id uuid primary key`
- `club_id uuid`
- `user_id uuid`
- `skill_rating numeric`
- `skill_level text null`
- `preferred_side text null`
- `preferred_format text null`
- `is_active boolean default true`
- `rating_points integer default 0`
- `created_at timestamptz`
- `updated_at timestamptz`
- unique `(club_id, user_id)`

### `rating_transactions`

Immutable rating ledger:

- `id uuid primary key`
- `club_id uuid`
- `player_id uuid references club_player_profiles(id)`
- `match_id uuid null`
- `event_id uuid null`
- `points_delta integer`
- `reason rating_reason`
- `balance_after integer`
- `created_at timestamptz`
- unique `(player_id, match_id)` where `match_id is not null`

The ledger is authoritative. `club_player_profiles.rating_points` is a cached balance maintained transactionally for fast ranking queries.

## Events and registration

### `events`

- `id uuid primary key`
- `club_id uuid`
- `title text`
- `description text null`
- `venue_name text`
- `venue_address text null`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `registration_opens_at timestamptz null`
- `registration_closes_at timestamptz null`
- `minimum_players integer`
- `maximum_players integer null`
- `status event_status`
- `game_format event_game_format`
- `matching_strategy matching_strategy`
- `created_by uuid`
- `published_at timestamptz null`
- `finalized_at timestamptz null`
- `completed_at timestamptz null`
- `created_at timestamptz`
- `updated_at timestamptz`

Recommended statuses:

- `draft`
- `published`
- `minimum_reached`
- `confirmed`
- `check_in_open`
- `live`
- `completed`
- `cancelled`

Do not transition solely because the UI says so. Implement a validated event state transition service.

### `event_registrations`

- `id uuid primary key`
- `event_id uuid`
- `player_id uuid`
- `status registration_status`
- `registered_at timestamptz`
- `cancelled_at timestamptz null`
- `waitlist_position integer null`
- `checked_in_at timestamptz null`
- `checked_in_by uuid null`
- `notes text null`
- unique `(event_id, player_id)`

### `event_logistics`

- `event_id uuid primary key`
- `court_count integer`
- `reserved_hours numeric`
- `booking_reference text null`
- `booking_notes text null`
- `confirmed_by uuid`
- `confirmed_at timestamptz`

### `event_booking_attachments`

- `id uuid primary key`
- `event_id uuid`
- `storage_path text`
- `file_name text`
- `mime_type text`
- `size_bytes bigint`
- `uploaded_by uuid`
- `created_at timestamptz`

## Courts and matches

### `event_courts`

- `id uuid primary key`
- `event_id uuid`
- `court_number integer`
- `display_name text`
- `game_mode court_game_mode`
- `scoring_type scoring_type`
- `points_to_win integer`
- `win_by_two boolean`
- `status court_status`
- `created_at timestamptz`
- unique `(event_id, court_number)`

### `matches`

- `id uuid primary key`
- `club_id uuid`
- `event_id uuid`
- `court_id uuid`
- `sequence_number integer`
- `game_mode court_game_mode`
- `scoring_type scoring_type`
- `status match_status`
- `team_a_score integer default 0`
- `team_b_score integer default 0`
- `winning_team smallint null check (winning_team in (1,2))`
- `started_at timestamptz null`
- `ended_at timestamptz null`
- `created_by uuid`
- `finalized_by uuid null`
- `created_at timestamptz`
- `updated_at timestamptz`

### `match_players`

- `id uuid primary key`
- `match_id uuid`
- `player_id uuid`
- `team_number smallint check (team_number in (1,2))`
- `position_number smallint`
- `result match_result null`
- `rating_delta integer null`
- unique `(match_id, player_id)`

### `score_events`

Append-only score audit log:

- `id bigint generated always as identity primary key`
- `match_id uuid`
- `team_number smallint`
- `delta smallint`
- `score_a_after integer`
- `score_b_after integer`
- `recorded_by uuid`
- `created_at timestamptz`

This table supports undo, auditing, and recovery. Do not update scores only in browser state.

## Optional operational tables

Add as needed:

- `event_activity_log`
- `notifications`
- `club_settings`
- `matching_runs`
- `matching_run_assignments`

Keep an audit trail for high-value operational actions such as event finalization, score correction, match cancellation, and role changes.

---

# 8. Database functions and transactional operations

Use PostgreSQL functions/RPCs or server-side transactions for operations that must be atomic.

Implement at minimum:

## `register_for_event(event_id)`

- verify authenticated club member;
- enforce event registration window and status;
- prevent duplicates;
- enforce maximum capacity or place player on waitlist;
- insert registration;
- determine whether minimum player count was newly reached;
- update event status when appropriate;
- return new registration state and event counts.

## `check_in_player(event_id, player_id)`

- verify permissions or self-check-in eligibility;
- verify registration;
- prevent invalid duplicate state;
- record actor and timestamp.

## `record_score_delta(match_id, team_number, delta)`

- lock the match row;
- verify match is live;
- validate resulting score is non-negative;
- update aggregate scores;
- insert an audit event;
- return current score and match version/timestamp.

## `finalize_match(match_id, winning_team)`

In one transaction:

- lock the match;
- verify it is not already finalized;
- validate winner against scores and scoring rules, unless explicitly overridden by an authorized role with an audit reason;
- mark the match complete;
- assign `+10` to each winning player;
- assign `-5` to each losing player;
- create one rating transaction per player;
- update cached player balances;
- set result and rating delta on `match_players`;
- release the court;
- emit data needed for the next assignment;
- prevent double application using database constraints and idempotency checks.

## `undo_last_score_event(match_id)`

- allowed only to authorized scorers;
- lock the match;
- reverse the most recent score event;
- update current score;
- retain an auditable reversal record rather than deleting history where practical.

## `complete_event(event_id)`

- verify no live matches remain;
- mark event completed;
- generate or refresh event summary data;
- return leaderboard and statistics.

---

# 9. RLS requirements

Enable RLS on every application table.

Create helper functions carefully, preferably as stable security-definer functions with a locked search path where needed:

- `is_club_member(club_id)`
- `has_club_role(club_id, roles[])`
- `can_manage_event(event_id)`
- `can_score_match(match_id)`

Policy principles:

- members can read records belonging to clubs they actively belong to;
- members can update their own limited profile fields;
- only authorized roles can create/update/delete club resources;
- event registrations can be created/cancelled by the player or managed by owners/admins;
- score operations must go through controlled RPCs rather than broad direct update policies;
- private storage objects must be accessible only to members of the owning club;
- service role is restricted to trusted server-only workflows.

Add SQL tests for important RLS cases. Test both allowed and denied access.

---

# 10. Storage

Use private Supabase Storage buckets.

Recommended buckets:

- `club-assets`
- `booking-confirmations`
- `avatars`

Path conventions:

```text
club-assets/{clubId}/logo/{fileId}.{ext}
booking-confirmations/{clubId}/{eventId}/{fileId}.{ext}
avatars/{userId}/{fileId}.{ext}
```

Requirements:

- validate MIME type and file size on client and server;
- use signed URLs for private files;
- sanitize displayed filenames;
- delete replaced files where appropriate;
- do not store public permanent URLs for private documents;
- save storage paths in the database, not expiring signed URLs.

For booking confirmations, accept PDF and common image types unless product requirements later narrow the list.

---

# 11. Email invitations

Supabase handles authentication emails, but club invitations require a clear application workflow.

Implement an email provider abstraction:

```ts
interface EmailService {
  sendClubInvitation(input: ClubInvitationEmail): Promise<void>
}
```

Use Resend as the default production implementation if no provider is already configured, but keep provider-specific code isolated.

Invitation flow:

1. authorized owner/admin enters one or more email addresses and membership roles;
2. server creates hashed invitation records with expiry;
3. server sends invitation links;
4. recipient opens `/invite/[token]`;
5. unauthenticated recipient signs up or signs in;
6. server verifies token, email match, expiry, and revocation state;
7. membership and player profile are created atomically;
8. invitation is marked accepted;
9. user is redirected to the accepted club dashboard, not back to the generic onboarding chooser.

Handle resend, revoke, expired token, already accepted, and wrong-account states.

If an invitation link requires authentication, preserve the raw-token destination through sign-in without exposing the token in logs or client analytics. Direct slug joining from onboarding is a separate flow from token-based invitation acceptance and must not bypass invitation or membership rules.

---

# 12. Realtime architecture

Use Supabase Realtime for live operational pages, but keep PostgreSQL as the source of truth.

Realtime entities:

- event check-ins;
- event court status;
- match creation and assignment;
- match score and status;
- score audit events if needed for animation;
- player queue/availability changes.

Guidelines:

- subscribe only while the live page is mounted;
- filter subscriptions by event or match where possible;
- perform initial data fetch on the server;
- hydrate client components with initial state;
- reconcile realtime updates by primary key and `updated_at` or version;
- remove channels on unmount;
- show connection state and a reconnecting indicator;
- provide manual refresh fallback;
- never use presence or broadcast as the only persistence mechanism;
- protect subscribed tables with RLS.

For score controls, use optimistic UI only after the server mutation is initiated. Reconcile with the authoritative returned score. Disable or queue repeated inputs to avoid accidental double taps.

---

# 13. Matching engine

Implement the player matching system as a deterministic, testable domain service. Keep version one practical and explainable rather than pretending to solve a perfect global optimization problem.

## Inputs

- checked-in and available players;
- court game mode: singles or doubles;
- court count;
- each player’s skill rating;
- number of games played in the event;
- accumulated rest time;
- consecutive games played;
- recent teammates;
- recent opponents;
- manual locks and exclusions;
- selected strategy.

## Strategies

Support:

- `balanced`
- `randomized`
- `maximum_variety`
- `shortest_wait`
- `competitive`
- `social`
- `manual`

## Version-one approach

1. Filter eligible players.
2. Rank player urgency using wait time, games played, and consecutive games.
3. Select the required number of players for open courts.
4. Generate a bounded set of candidate combinations.
5. Score each candidate using weighted penalties/rewards.
6. Choose the lowest-penalty assignment.
7. Persist the matching run, inputs, chosen assignment, and strategy weights.
8. Allow an authorized owner/admin to swap, remove, lock, or replace players before starting matches.

Suggested balanced-match penalties:

- team skill difference;
- total team strength difference;
- repeated teammate penalty;
- repeated opponent penalty;
- games-played imbalance;
- insufficient rest penalty;
- consecutive-game penalty.

Do not run unbounded combinatorial searches. Set limits and fall back to a greedy heuristic for large player pools.

Use a seeded pseudo-random generator for randomized modes so a run can be reproduced for debugging.

Create unit tests for:

- singles and doubles;
- odd player counts;
- fewer players than required;
- one or multiple courts;
- tied candidates;
- highly uneven skill ratings;
- repeat teammate avoidance;
- longest-wait preference;
- manual locks;
- late check-in and early departure.

---

# 14. Product pages and workflows

Implement the routes and behavior below using the corresponding Stitch screens.

## 14.1 Authentication

- Sign in
- Forgot password
- Reset password
- Accept invitation

States:

- loading;
- validation error;
- invalid credentials;
- expired invitation;
- invitation email mismatch;
- successful account recovery.

## 14.2 Onboarding, club selection, creation, and joining

Use the approved Stitch onboarding renders as the visual source of truth:

- `Welcome - Get Started` (`4533382cf60941adb64021884b283294`) for `/onboarding`;
- `Create Your Club` (`60a68eca7a03472d8c6923469e548361`) for `/onboarding/create-club`;
- `Join a Club` (`12e8461cedeb4eebbfe3fb1e6efcc05b`) for `/onboarding/join-club`;
- `Join a Club (Horizontal Layout)` (`b2673f87a79e48b6a5bb3cc63b8ed692`) and `Join a Club (Animated Mascot)` (`0dcf3ff28d2c4c0d94e16c4e870de750`) as alternate responsive/visual references for the same join route;
- `Onboarding flow layout (Full HD)` (`838acb55e2534782b32bd2bbdce13970`) as the shared onboarding layout reference, not a separate page.

The onboarding flow must:

- protect all onboarding pages behind authentication;
- redirect authenticated users with no memberships to `/onboarding`;
- show the Welcome/Get Started choice between creating and joining a club;
- preserve back navigation and progress context between onboarding steps;
- create a club from club name, location, and unique slug, then create the owner membership atomically;
- redirect successful club creation to `/<clubSlug>/dashboard`;
- let users join by searching club name/city or entering an exact club slug/direct invite value;
- validate that the target club is joinable and prevent duplicate memberships;
- keep token-based invitation acceptance on `/invite/[token]` and apply its email, expiry, revocation, and wrong-account checks;
- redirect successful joining to `/<clubSlug>/dashboard`;
- define and document the destination of the Stitch “skip this step” action before enabling it; skipping must not grant access to tenant-owned routes;
- provide loading, no-results, validation, duplicate-slug, already-member, invalid/expired invite, permission-denied, mutation-error, and success/redirect states;
- list clubs the user already belongs to when club switching is available;
- switch the active club and display the user role;
- upload a club logo using private storage rules;
- remain responsive and accessible across the primary and alternate Stitch layouts.

## 14.3 Dashboard

Show actionable operational information:

- next event;
- draft events needing completion;
- events that reached minimum registrations;
- booking confirmation status;
- member count;
- recent registrations;
- club leaderboard preview;
- quick actions.

Dashboard queries should be composed server-side and avoid multiple sequential client fetches.

## 14.4 Events list

- tabs or filters for upcoming, draft, completed, and cancelled;
- search;
- status badges;
- registration progress;
- venue, date, and event manager;
- responsive card/table presentation;
- create event action.

## 14.5 Create/edit event

Use a multi-section form:

- basics;
- schedule and venue;
- registration limits;
- game format;
- default matching strategy;
- member visibility;
- notes.

Allow save as draft and publish. Validate server-side with Zod.

## 14.6 Event detail

Show:

- status and timeline;
- registration count versus minimum/maximum;
- attendee list;
- waitlist if applicable;
- logistics and court booking;
- booking confirmation attachments;
- event-management actions available to owners/admins;
- check-in access;
- live-play access;
- results after completion.

When minimum registration is reached, clearly prompt an authorized owner/admin to confirm:

- number of courts;
- reserved hours;
- booking reference;
- booking attachment.

Do not auto-claim the courts were booked. The app records owner/admin confirmation.

## 14.7 Check-in

Support:

- owner/admin manual check-in;
- member self-check-in during an allowed window;
- search and filters;
- checked-in count;
- not-arrived list;
- late arrivals;
- check-in reversal by authorized users;
- QR-oriented self-check-in link as a progressive enhancement.

## 14.8 Event setup

Allow authorized owners/admins to:

- create the configured number of courts;
- set each court to singles or doubles;
- select scoring type;
- set points to win and win-by-two;
- select matching strategy;
- review available players;
- generate assignments;
- manually adjust assignments;
- start the event.

## 14.9 Live event overview

Use `/[clubSlug]/events/[eventId]/live` as the canonical Live Play Control Center route. The screen is scoped to one event's courts, queue, timer, matches, and operational controls. Do not create a redundant `/[clubSlug]/live` page. Dashboard, event-list, and event-detail actions should link to the applicable event-specific live route; if multiple events are live, selection belongs in those existing club/event surfaces.

Display all courts with live status:

- available;
- assignment pending;
- ready;
- in progress;
- completed;
- paused.

Each court card should show:

- court name;
- game mode;
- teams/players;
- current score;
- elapsed duration;
- server indicator when configured;
- assigned scoring actor or last score updater when configured;
- actions permitted to the current user.

The page must update in realtime.

## 14.10 Court scoring view

Create a high-visibility responsive scoring experience suitable for a tablet or large display.

Include:

- large team scores;
- player names;
- add and subtract score controls;
- undo last action;
- timer;
- game status;
- optional serving team and server number indicator for doubles;
- pause/resume;
- end game;
- confirmation before finalization;
- connection/reconnecting state;
- full-screen-friendly layout.

Keep score controls usable with one hand and prevent accidental rapid duplicate scoring.

## 14.11 Match completion

After authorized confirmation:

- persist the winner;
- assign `+10` to every winner;
- assign `-5` to every losing player;
- mark the court available;
- show a compact result celebration;
- update live event statistics;
- permit generation of the next match.

The operation must be idempotent.

## 14.12 Event results

Show:

- event summary;
- winner board;
- top wins;
- top rating gain;
- matches played;
- win rate;
- longest game;
- closest game;
- all completed matches;
- player performance table.

Do not imply a single tournament champion unless the event format actually defines one. For open play, use leaders and achievements rather than a false bracket winner.

## 14.13 Members

Use `/[clubSlug]/members` as the parent member-management route. Provide one primary **Members** navigation item with route-driven Directory and Invitations tabs/subnavigation.

Display:

- member name and avatar;
- role;
- rank based on accumulated rating points;
- rating points;
- 30-day trend;
- matches;
- wins;
- win rate;
- status;
- invitation/member actions according to permissions.

Support search, sorting, filters, pagination, and responsive rows/cards.

## 14.14 Player profile

Show:

- personal information visible within the club;
- club role;
- rating points;
- rank;
- matches;
- wins and win rate;
- rating progression chart with `6M`, `1Y`, and `ALL` toggles;
- recent matches;
- top connection by matches played together;
- top connection by wins together;
- toughest opponent based on losses against that opponent.

Define ties deterministically and show sample-size context to avoid misleading insights.

## 14.15 Club stats: rankings

Use `/[clubSlug]/stats/rankings` as the canonical full leaderboard route. Rankings is a focused dataset within the broader Stats area, not a separate top-level navigation destination.

- current rank;
- rating points;
- movement over 30 days;
- wins;
- matches;
- win rate;
- filters and search;
- ranking calculation timestamp.

Rank from the rating ledger balance, with stable tie-breaking such as rating points, wins, then name or earliest achievement time.

## 14.16 Club stats overview

Use `/[clubSlug]/stats` as the parent analytics route. Provide one primary **Stats** navigation item with route-driven Overview and Rankings tabs/subnavigation; do not expose duplicate top-level Stats and Rankings destinations.

Show all-time leaders and club activity:

- most wins;
- most matches played;
- highest win rate with a minimum-match threshold;
- top rating points;
- events hosted;
- active members;
- matches over time;
- participation trends.

The overview may show a compact ranking or top-rating preview, but it must link to `/[clubSlug]/stats/rankings` for the complete searchable, sortable, and paginated leaderboard.

Use server-side aggregate queries, views, or materialized views if needed. Avoid calculating all statistics in the browser.

Persist rankings and analytics filters, search, sorting, date ranges, and pagination in URL search parameters so views are shareable and survive refreshes.

## 14.17 Invitations

Use `/[clubSlug]/members/invitations` for club-scoped invitation administration. Invitations are part of the member lifecycle and must not appear as a separate top-level navigation destination. Keep recipient token acceptance at `/invite/[token]`; that auth/onboarding route is distinct from the signed-in management view.

- invite one or multiple members;
- select membership role (`member` by default, `admin` when authorized; never `owner`);
- pending/accepted/expired/revoked filters;
- resend;
- revoke;
- copy invitation link only for authorized users;
- display delivery failures without leaking provider internals.

## 14.18 Club settings

Create sections for:

- general club information;
- branding/logo;
- default event settings;
- default scoring settings;
- rating rules, initially fixed at `+10 / -5` but structured for later configurability;
- membership roles (`owner`, `admin`, `member`);
- self-check-in settings;
- notifications;
- dangerous actions.

Dangerous actions require explicit confirmation and stronger authorization.

---

# 15. Server/client data patterns

Use these conventions:

- Server Components call typed server query functions directly.
- Mutations use Server Actions or Route Handlers based on the operation.
- Use Route Handlers for webhooks, external callbacks, file streaming, and APIs that require explicit HTTP semantics.
- Use Server Actions for authenticated form mutations tightly coupled to the UI.
- Validate every mutation payload with Zod on the server.
- Return structured action results rather than throwing raw messages into the UI.
- Revalidate affected paths/tags after successful mutations.
- Use URL search parameters for durable filters, tabs, search terms, and pagination.
- Use client state only for ephemeral UI behavior.

Do not fetch protected Supabase data from the browser unless realtime or truly client-driven interaction requires it.

---

# 16. Performance requirements

- Avoid client-side waterfalls.
- Use parallel server queries where independent.
- Paginate large member, match, and event datasets.
- Add indexes for common filters and joins.
- Use `loading.tsx` and Suspense boundaries for meaningful sections.
- Use `next/image` for raster assets where appropriate.
- Dynamically import heavy chart or live-score client components if beneficial.
- Keep mascot and decorative assets out of the critical path on operational screens.
- Avoid subscribing to entire club-wide realtime tables when an event-level filter is available.
- Use Vercel/Supabase regions with reasonable proximity to the primary user base when selecting project configuration.

---

# 17. Accessibility and responsive behavior

Every implemented screen must include:

- keyboard navigation;
- visible focus styles;
- semantic headings;
- form labels that remain visible;
- accessible dialog and sheet behavior;
- text alternatives for meaningful images;
- non-color status indicators;
- reduced-motion support;
- screen-reader labels for score controls;
- safe confirmation patterns for destructive actions;
- mobile layouts that do not depend on horizontal tables.

Do not use hover as the only way to expose essential actions.

---

# 18. Error, loading, empty, and offline-like states

For every data-driven screen, implement:

- skeleton or clear loading state;
- no-data empty state;
- filtered-empty state;
- recoverable error state;
- permission-denied state;
- stale/reconnecting realtime state where applicable.

Live scoring must remain honest about connection state. Do not show an update as confirmed until the server acknowledges it.

---

# 19. Testing strategy

## Unit tests

Test:

- permission helpers;
- event transition validation;
- rating calculations;
- match finalization idempotency;
- matching strategy scoring;
- ranking tie-breaking;
- player connection calculations;
- Zod schemas.

## Database tests

Test:

- RLS allowed and denied access;
- registration capacity behavior;
- minimum-player status transition;
- atomic score updates;
- match finalization and rating ledger updates;
- duplicate finalization prevention;
- club tenant isolation.

## Component tests

Test:

- forms;
- tables and filters;
- score controls;
- dialogs;
- responsive navigation;
- disabled actions based on roles.

## End-to-end tests

At minimum, cover:

1. owner creates a club;
2. owner invites one admin and one member;
3. admin and member accept their invitations;
4. admin creates and publishes an event;
5. players register until minimum is reached;
6. admin confirms courts and uploads booking confirmation;
7. players check in;
8. admin generates and adjusts matches;
9. admin records and corrects score;
10. match is finalized once;
11. winners receive `+10`, losers receive `-5`;
12. event is completed;
13. rankings, player profile, and club stats reflect results;
14. unauthorized member cannot perform owner/admin event-management actions;
15. ownership cannot be granted by invitation and transfers only through the dedicated confirmed owner action.

Use stable test selectors only where semantic locators are insufficient.

---

# 20. Observability and auditability

Implement:

- structured server logging without secrets or sensitive tokens;
- error boundary reporting integration, preferably Sentry if configured;
- Vercel logs compatibility;
- health endpoint for basic application checks;
- audit records for privileged changes;
- webhook signature verification for external providers;
- user-friendly error messages with internal correlation IDs where useful.

Do not log access tokens, invitation raw tokens, signed storage URLs, passwords, or complete sensitive payloads.

---

# 21. Environment variables

Create `.env.example` with names only and safe descriptions.

Expected variables may include:

```text
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
RESEND_API_KEY=
EMAIL_FROM=
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

Use the current Supabase public-key naming recommended by the installed SDK and project. Do not duplicate deprecated variable names unnecessarily.

Validate required server environment variables at startup/build time without exposing secret values.

---

# 22. Vercel deployment requirements

Prepare the project for Git-based Vercel deployment.

Requirements:

- standard Next.js build with no custom server;
- no long-running in-memory websocket server;
- use Supabase Realtime rather than hosting Socket.IO inside Vercel Functions;
- serverless-safe, stateless server code;
- external persistence for all important state;
- environment variables documented by environment: development, preview, production;
- separate Supabase projects for production and preferably staging/preview;
- configure allowed auth redirect URLs for local, preview, and production domains;
- ensure email invitation URLs use the correct environment base URL;
- migrations run through a controlled CI/deployment process, not opportunistically from page requests;
- add `vercel.json` only when a real configuration requirement exists;
- document deployment and rollback in `documentation/DEPLOYMENT.md`.

Preview deployments must not accidentally send real production invitations or mutate production data.

---

# 23. CI quality gate

Create a CI workflow that runs:

```text
install with frozen lockfile
lint
typecheck
unit/component tests
production build
optional Playwright smoke tests
```

Also run Supabase migration validation and database tests when the CI environment supports it.

A task is not complete while any quality gate fails.

---

# 24. Implementation phases

Implement incrementally in this order.

## Phase 0: Discovery and foundation

- inspect all Stitch screens through MCP;
- inventory routes, components, and assets;
- initialize Next.js project;
- configure TypeScript, ESLint, Tailwind, fonts, tokens, and test tools;
- configure Supabase local development;
- create architecture and implementation decision docs.

## Phase 1: Auth, club tenancy, and shell

- authentication;
- profiles;
- authenticated onboarding shell and Welcome/Get Started branching;
- club creation, joining, and switching;
- zero-membership routing and post-onboarding dashboard redirects;
- memberships and roles;
- RLS foundation;
- reusable app shell from Stitch;
- responsive navigation.

## Phase 2: Members and invitations

- member list;
- member profile basics;
- invitation management nested at `/[clubSlug]/members/invitations`;
- roles;
- email delivery abstraction;
- storage avatar support.

## Phase 3: Events and registration

- event CRUD;
- publish flow;
- registration;
- waitlist/capacity;
- minimum-player transition;
- event detail and dashboard widgets.

## Phase 4: Logistics and check-in

- event logistics;
- private booking attachments;
- manual and self-check-in;
- event setup and courts.

## Phase 5: Matching and live play

- matching engine;
- assignment review;
- matches;
- event-scoped realtime court board at `/[clubSlug]/events/[eventId]/live`;
- scoring view;
- score audit and undo.

## Phase 6: Ratings and results

- transactional match finalization;
- rating ledger;
- event result board;
- Stats-area rankings at `/[clubSlug]/stats/rankings`;
- player rating chart;
- recent matches and connection analytics.

## Phase 7: Club analytics and settings

- Stats overview at `/[clubSlug]/stats`;
- all-time leaders;
- activity charts;
- club settings;
- notification preferences;
- audit history.

## Phase 8: Hardening and release

- complete RLS tests;
- performance review;
- accessibility audit;
- visual comparison with Stitch;
- Playwright critical flows;
- production deployment docs;
- preview and production smoke tests.

At the end of each phase, update `documentation/IMPLEMENTATION_STATUS.md` with completed work, migrations, tests, known limitations, and the next phase.

---

# 25. Definition of done for each screen

A screen is complete only when:

- its Stitch source was inspected;
- it uses the shared shell and shared components where appropriate;
- layout is responsive;
- loading, empty, error, and permission states exist;
- real Supabase data is connected;
- mutations persist correctly;
- server-side authorization is enforced;
- associated tables have RLS;
- forms have server validation;
- keyboard and focus behavior works;
- tests cover critical behavior;
- visual comparison was performed;
- lint, typecheck, tests, and build pass;
- intentional deviations are documented.

---

# 26. Required deliverables

Produce and maintain:

- working Next.js application;
- Supabase migrations;
- generated typed database definitions;
- seed data for local development;
- RLS policies and SQL tests;
- reusable component system;
- Stitch implementation notes;
- unit/component/E2E tests;
- `.env.example`;
- `README.md` with local setup;
- `documentation/DATABASE.md`;
- `documentation/REALTIME.md`;
- `documentation/DEPLOYMENT.md`;
- `documentation/IMPLEMENTATION_DECISIONS.md`;
- `documentation/IMPLEMENTATION_STATUS.md`.

---

# 27. First execution instructions

Start by doing the following, in order:

1. Inspect the repository and do not overwrite useful existing work.
2. Discover and connect to the Stitch MCP server.
3. List the available Pickle-lo screens and identify the canonical authenticated shell.
4. Read the project design-system document and inventory available brand assets.
5. Create `documentation/STITCH_SCREEN_INVENTORY.md` mapping every Stitch screen to its intended application route and implementation phase, including the onboarding screen family and its shared layout/variants.
6. Propose the exact initial project structure and database migration sequence in `documentation/IMPLEMENTATION_PLAN.md`.
7. Initialize or normalize the project foundation.
8. Implement Phase 1 completely, beginning with the shared authenticated shell and authentication flow.
9. Run lint, typecheck, tests, and production build.
10. Report completed files, migrations, tests, assumptions, and remaining work without claiming unfinished features are complete.

Do not merely explain what should be built. Modify the repository and deliver working code.
