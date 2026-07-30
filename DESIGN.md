# Pickleball Club Management App — Design System and UI Specification

**Document version:** 1.0  
**Status:** Proposed  
**Primary client:** Expo + React Native  
**Supported surfaces:** iOS, Android, tablet, web administration, TV/projector display  
**Scope:** MVP

---

## 1. Purpose

This document defines the visual language, layout behavior, reusable components, interaction patterns, and core screen specifications for the Pickleball Club Management App.

It is intended to guide product designers, frontend engineers, QA testers, and AI coding agents so the application remains visually consistent across mobile, tablet, web, and large-screen event displays.

The app is an operational club tool rather than a formal tournament-bracket product. Its interface must make recurring club play fast to manage, easy to understand, and reliable in active court environments.

---

## 2. Product Experience

### 2.1 Product personality

The product should feel:

- Energetic
- Competitive without being aggressive
- Social
- Clear
- Fast
- Trustworthy
- Practical in bright outdoor environments

### 2.2 Experience principles

1. **Show the event state immediately.** Players and organizers should understand what is happening without searching.
2. **Optimize for one-handed actions.** Common mobile actions must be reachable and fast.
3. **Minimize organizer taps.** High-frequency workflows should avoid unnecessary screens and confirmations.
4. **Prioritize outdoor readability.** Important text, scores, court numbers, and states require strong contrast and generous sizing.
5. **Make status visually distinct.** Playing, waiting, on-deck, resting, unavailable, and disputed states must never look interchangeable.
6. **Keep critical operations server-confirmed.** Court assignment, score finalization, match completion, and ranking changes must not appear complete until confirmed by the server.
7. **Explain smart matchmaking.** Recommended assignments should include clear reasons and warnings so organizers can trust the system.
8. **Design destructive actions safely.** Cancellation, score correction, player removal, and round replacement require explicit confirmation.
9. **Support every target surface.** Mobile, tablet, desktop, and TV should share a design language while adapting their information density.
10. **Prefer function over decoration.** Operational screens must remain clean and focused.

### 2.3 Visual direction

Use a modern, flat interface with clean hierarchy and restrained visual decoration.

Avoid:

- Heavy gradients
- Excessive shadows
- Decorative glass effects
- Tiny labels
- Low-contrast gray text
- Overly playful illustrations inside gameplay and organizer screens
- Color-only communication

Brand graphics may use pickleball-inspired circles, perforation patterns, court lines, paddles, and ball motion. These should not interfere with event operations.

---

## 3. Supported Roles and UI Permissions

The interface must adapt actions according to the active club role.

| Role | Primary UI capabilities |
|---|---|
| Administrator | Full club management, roles, members, events, disputes, audit logs, settings |
| Event organizer | Event creation, check-in, court setup, round generation, assignment override, announcements |
| Court marshal | Assigned-court controls, start/pause match, scoring, dispute reporting |
| Scorekeeper | Assigned-match scoring, undo, submit final score |
| Member | Register, check in, view assignment, score own match when allowed, confirm result |
| Guest | Event-scoped registration, assignment viewing, limited event participation |

Do not render disabled privileged controls when hiding them improves clarity. When a control must remain visible for discoverability, show a concise permission explanation.

---

## 4. Design Tokens

All visual values should be implemented as shared tokens. Avoid hard-coded values inside screen components.

### 4.1 Typography

#### Primary font

**Inter** is the default font for iOS, Android, web, tablet, and TV mode.

Use Inter for:

- Navigation
- Forms
- Dense dashboards
- Timers
- Scores
- Statistics
- Rankings
- Operational labels

#### Optional display font

**Sora** may be used only for:

- Marketing headlines
- Large empty-state titles
- Club branding
- Selected leaderboard headings

Do not use Sora for long copy, forms, data tables, or scoring controls.

#### Type scale

| Token | Size | Line height | Weight | Usage |
|---|---:|---:|---:|---|
| `display-xl` | 48 | 56 | 700 | TV scores, major numbers |
| `display-lg` | 40 | 48 | 700 | Scoring displays |
| `heading-1` | 32 | 40 | 700 | Primary page title |
| `heading-2` | 26 | 34 | 700 | Section title |
| `heading-3` | 22 | 30 | 600 | Card group title |
| `title` | 18 | 26 | 600 | Card title |
| `body-lg` | 17 | 26 | 400 | Important body text |
| `body` | 15 | 22 | 400 | Standard copy |
| `body-sm` | 13 | 19 | 400 | Supporting details |
| `label` | 13 | 16 | 600 | Controls and labels |
| `caption` | 11 | 16 | 500 | Metadata |
| `score-xl` | 72 | 80 | 700 | Full-screen scoring |

Use tabular numerals for scores, timers, court numbers, rankings, and statistics.

Support operating-system text scaling up to at least 150% without hiding essential actions. Giant score text may be capped where required, but all controls and labels must remain accessible.

### 4.2 Brand colors

#### Pickle green

| Token | Hex | Usage |
|---|---|---|
| `pickle-50` | `#F3FCE8` | Soft background |
| `pickle-100` | `#E2F8C8` | Selected surface |
| `pickle-200` | `#C7EF99` | Accent border |
| `pickle-300` | `#A8E35F` | Decorative accent |
| `pickle-400` | `#8BD133` | Active accent |
| `pickle-500` | `#6FB51E` | Primary brand/action |
| `pickle-600` | `#548F14` | Pressed primary |
| `pickle-700` | `#416E14` | Strong text accent |
| `pickle-800` | `#365717` | Dark accent |
| `pickle-900` | `#2F4918` | Deep brand |

#### Court blue

| Token | Hex |
|---|---|
| `court-50` | `#EFF8FF` |
| `court-100` | `#DCEEFF` |
| `court-300` | `#8DCBFF` |
| `court-500` | `#2188E5` |
| `court-600` | `#126BBC` |
| `court-700` | `#115695` |
| `court-900` | `#113E68` |

#### Neutral palette

| Token | Hex |
|---|---|
| `neutral-0` | `#FFFFFF` |
| `neutral-50` | `#F8FAFC` |
| `neutral-100` | `#F1F5F9` |
| `neutral-200` | `#E2E8F0` |
| `neutral-300` | `#CBD5E1` |
| `neutral-400` | `#94A3B8` |
| `neutral-500` | `#64748B` |
| `neutral-600` | `#475569` |
| `neutral-700` | `#334155` |
| `neutral-800` | `#1E293B` |
| `neutral-900` | `#0F172A` |
| `neutral-950` | `#070D19` |

### 4.3 Semantic colors

| Purpose | Background | Foreground |
|---|---|---|
| Success | `#DCFCE7` | `#166534` |
| Warning | `#FEF3C7` | `#92400E` |
| Error | `#FEE2E2` | `#B91C1C` |
| Information | `#DBEAFE` | `#1D4ED8` |
| Playing | `#DCFCE7` | `#166534` |
| On deck | `#FEF3C7` | `#92400E` |
| Waiting | `#E0F2FE` | `#075985` |
| Resting | `#F3E8FF` | `#6B21A8` |
| Unavailable | `#F1F5F9` | `#475569` |
| Disputed | `#FFE4E6` | `#BE123C` |

Semantic colors must always be paired with text, icons, shapes, or labels.

### 4.4 Team colors

#### Team 1

- Background: `#DBEAFE`
- Strong: `#2563EB`
- Text: `#1E3A8A`
- Label: `Team 1`

#### Team 2

- Background: `#FFEDD5`
- Strong: `#EA580C`
- Text: `#7C2D12`
- Label: `Team 2`

Always display team labels or side names. Team identity must not depend on blue versus orange alone.

### 4.5 Dark mode

Dark mode is supported for standard mobile and web screens.

Full-screen outdoor scoring should default to a high-contrast light theme or a dedicated scoring theme. Dark scoring interfaces may be difficult to read in direct sunlight.

### 4.6 Spacing

Use a four-point grid.

| Token | Value |
|---|---:|
| `space-0` | 0 |
| `space-1` | 4 |
| `space-2` | 8 |
| `space-3` | 12 |
| `space-4` | 16 |
| `space-5` | 20 |
| `space-6` | 24 |
| `space-8` | 32 |
| `space-10` | 40 |
| `space-12` | 48 |
| `space-16` | 64 |
| `space-20` | 80 |

Default page padding:

| Surface | Padding |
|---|---:|
| Compact mobile | 16 |
| Large mobile | 20 |
| Tablet | 24 |
| Desktop content | 32 |
| TV display | 40 |

Default vertical separation:

- Related controls: 8
- Form fields: 16
- Cards: 16
- Page sections: 24 or 32

### 4.7 Radius

| Token | Value | Usage |
|---|---:|---|
| `radius-xs` | 4 | Status markers |
| `radius-sm` | 8 | Inputs and small buttons |
| `radius-md` | 12 | Cards |
| `radius-lg` | 16 | Modals and feature cards |
| `radius-xl` | 24 | Hero panels |
| `radius-full` | 999 | Pills and avatars |

### 4.8 Elevation

Use minimal elevation and prefer borders in light mode and on web.

| Level | Usage |
|---:|---|
| 0 | Base surfaces |
| 1 | Cards and sticky controls |
| 2 | Dropdowns and floating controls |
| 3 | Modal sheets |
| 4 | Critical overlays |

Standard card border: `1px solid neutral-200`.

### 4.9 Icons

Use one consistent rounded-outline family such as Lucide React Native or Expo Symbols.

| Context | Size |
|---|---:|
| Inline | 16 |
| Input | 20 |
| Navigation | 22 |
| Primary action | 24 |
| Empty state | 40 |
| TV status | 32 |

Icons must not be the sole indication of destructive, warning, or critical actions.

### 4.10 Motion and haptics

Motion communicates state and feedback; it is not decoration.

| Motion | Duration |
|---|---:|
| Micro interaction | 100–150 ms |
| Standard transition | 180–240 ms |
| Bottom sheet | 250–320 ms |
| Success confirmation | 400–600 ms |
| Court assignment reveal | Maximum 800 ms |

Respect reduced-motion preferences.

Use haptics for:

- Point recorded
- Score undone
- Match started
- Assignment confirmed
- Invalid score action
- Destructive action confirmed

### 4.11 Touch targets

- Minimum target: `44 × 44` points
- Preferred score controls: `64 × 64` points or larger
- Primary court-side actions should be usable while standing and with sweaty hands
- Never place destructive and primary actions too close together

---

## 5. Responsive Layout

### 5.1 Breakpoints

| Breakpoint | Width | Layout |
|---|---:|---|
| Compact | Under 600 | Mobile |
| Medium | 600–899 | Tablet |
| Expanded | 900–1199 | Small desktop |
| Wide | 1200+ | Desktop and TV |

### 5.2 Mobile navigation

Primary bottom tabs:

1. Home
2. Events
3. Clubs
4. Rankings
5. Profile

During an active event, use nested event navigation:

1. Overview
2. Courts
3. Queue
4. Matches
5. More

Keep the most urgent active-event status above or independent of nested navigation when possible.

### 5.3 Tablet navigation

Use:

- Collapsible navigation rail
- Persistent page header
- Two-column content
- Context panel for selected court, player, or match

The scoring view uses the full available area and hides standard navigation.

### 5.4 Web administration

Desktop shell:

- Top bar: club switcher, search, notifications, profile
- Left side navigation
- Persistent page title and action area
- Main content canvas

Side navigation:

- Overview
- Events
- Members
- Rankings
- Announcements
- Club settings

Tables may be used on desktop, but equivalent mobile views should use cards or progressive disclosure.

### 5.5 TV and projector mode

TV mode is read-only and optimized for 16:9 displays.

Recommended regions:

- Header: event name, current time, round number, announcement ticker
- Main left: active court cards with score and timer
- Main right upper: upcoming matches
- Main right lower: waiting queue
- Footer: leaderboard, club message, or sponsor rotation

TV mode requirements:

- No tiny metadata
- No hover-only information
- No interactive controls
- Automatic refresh through real-time subscriptions
- High contrast from a distance
- Resilient empty and reconnecting states

---

## 6. Navigation and Information Architecture

### 6.1 Auth routes

- Sign in
- Sign up
- Forgot password
- Accept invitation

### 6.2 Main application routes

- Home
- Events
- Clubs
- Rankings
- Profile

### 6.3 Club routes

- Club overview
- Members
- Announcements
- Roles
- Settings

### 6.4 Event routes

- Event overview
- Registration
- Check-in
- Players
- Courts
- Queue
- Matches
- Leaderboard
- Announcements
- Event settings
- Generate round

### 6.5 Match routes

- Match details
- Scoring
- Score confirmation

### 6.6 Member routes

- Member profile
- Match history
- Partner history
- Statistics

### 6.7 Public and deep-link routes

- Event display: `/display/[eventId]`
- QR/invitation join: `/join/[eventCode]`

Every route should work as a native deep link and a web URL where appropriate.

---

## 7. Core Component Library

### 7.1 Foundation

- `AppText`
- `AppIcon`
- `Screen`
- `SafeAreaScreen`
- `PageHeader`
- `SectionHeader`
- `Divider`
- `Surface`
- `Card`
- `Badge`
- `Avatar`
- `Skeleton`
- `EmptyState`
- `ErrorState`

### 7.2 Inputs

- `TextField`
- `NumberField`
- `SearchField`
- `SelectField`
- `DateTimeField`
- `SegmentedControl`
- `Checkbox`
- `RadioGroup`
- `Switch`
- `Slider`
- `PlayerPicker`
- `MemberAutocomplete`
- `CourtPicker`
- `SkillRatingInput`

Every field must support:

- Label
- Helper text
- Error text
- Required marker
- Disabled state
- Loading state
- Keyboard-safe scrolling
- Screen-reader label

### 7.3 Actions

Implement at least:

- `Button` — primary, secondary, outline, ghost, destructive
- `IconButton`
- `FloatingActionButton`
- `SplitButton` for desktop-only compound actions
- `ActionSheet`
- `ConfirmationDialog`
- `UndoToast`

Button rules:

- One visually dominant primary action per region
- Use destructive red only for destructive actions
- Loading actions preserve width
- Disable repeated submission while a critical request is pending
- Critical success appears only after server confirmation

### 7.4 Navigation

- `BottomTabBar`
- `NavigationRail`
- `SideNavigation`
- `EventSegmentedNav`
- `Breadcrumbs`
- `ClubSwitcher`
- `BackButton`
- `TopBar`

### 7.5 Status and feedback

- `StatusBadge`
- `ConnectionBanner`
- `RealtimeIndicator`
- `InlineAlert`
- `Toast`
- `ProgressIndicator`
- `SyncStatus`
- `PermissionNotice`
- `ConflictNotice`

### 7.6 Event components

- `EventCard`
- `EventStatusHeader`
- `RegistrationCard`
- `CheckInPanel`
- `PlayerAvailabilityChip`
- `EventMetricsRow`
- `AnnouncementCard`
- `RoundSummaryCard`

### 7.7 Court components

- `CourtCard`
- `CourtStatusBadge`
- `CourtAssignmentCard`
- `CourtTimer`
- `CourtPicker`
- `CourtActionBar`

### 7.8 Match components

- `MatchCard`
- `TeamPanel`
- `PlayerSlot`
- `ScoreBoard`
- `ScoreControl`
- `GameIndicator`
- `MatchTimer`
- `ScoreConfirmationPanel`
- `MatchWarningList`

### 7.9 Matchmaking components

- `StrategySelector`
- `AssignmentBoard`
- `DraggablePlayerChip`
- `MatchQualityScore`
- `MatchExplanation`
- `ConstraintWarning`
- `LockedAssignmentIndicator`
- `RegenerateControls`

### 7.10 Ranking components

- `LeaderboardTable`
- `LeaderboardRow`
- `RankBadge`
- `RatingChange`
- `ProvisionalBadge`
- `RankingFilterBar`
- `PlayerStatCard`
- `TrendChart`

### 7.11 TV components

- `TVHeader`
- `TVClock`
- `TVCourtGrid`
- `TVCourtCard`
- `TVQueuePanel`
- `TVUpcomingMatches`
- `TVAnnouncementTicker`
- `TVLeaderboardPanel`

---

## 8. Interaction States

Every data-driven screen and reusable component must account for:

- Initial loading
- Background refresh
- Empty data
- Partial data
- Offline-readable state
- Reconnecting state
- Permission denied
- Validation error
- Server error
- Conflict/stale version
- Success
- Disabled
- Archived or cancelled state

### 8.1 Loading

Use skeletons for predictable layouts. Use a centered progress indicator only when the shape of the content is unknown or the operation blocks the entire view.

Avoid replacing the whole screen during background refresh.

### 8.2 Empty states

An empty state should explain:

1. What is missing
2. Why it matters
3. The next available action

Example: “No players are checked in yet. Share the event QR code or check in a member manually.”

### 8.3 Errors

Errors should be specific and actionable.

Bad: “Something went wrong.”  
Better: “This round could not be confirmed because two players are no longer available. Review the highlighted assignments and regenerate.”

### 8.4 Connectivity

Show a persistent but non-obstructive connection banner when the app is offline or reconnecting.

Critical actions requiring a network must clearly state that they are unavailable. Cached event and assignment data should remain readable.

### 8.5 Optimistic behavior

Optimistic updates are acceptable for low-risk preference and acknowledgement actions.

Do not optimistically finalize:

- Scores
- Matches
- Rounds
- Court assignments
- Ratings
- Conflicting check-ins

---

## 9. Core Screen Specifications

### 9.1 Home

Purpose: give the user immediate access to the most relevant club and event activity.

Content priority:

1. Active or next event
2. Current assignment or on-deck status
3. Upcoming registrations
4. Club announcements
5. Recent results and ranking movement

Mobile: stacked cards.  
Tablet/Desktop: two-column dashboard.

### 9.2 Events list

Provide filters for:

- Upcoming
- Active
- Completed
- Cancelled
- Club

Each event card displays:

- Event name
- Date and time
- Venue
- Format
- Registration/check-in status
- Player capacity or attendee count
- User status
- Primary next action

### 9.3 Event overview

The top region must show:

- Event name
- Event state
- Current round
- Venue/time
- Connection status if relevant
- User-specific status

Organizer quick actions:

- Open/close check-in
- Check in player
- Generate round
- Publish announcement
- Pause event

Participant quick actions:

- Register or withdraw
- Check in
- View assignment
- Change availability

### 9.4 Check-in

Organizer view:

- QR scanner action
- Search/member autocomplete
- Checked-in count
- Waitlisted count
- Late-arrival indicators
- Player availability controls
- Guest creation

Player view:

- Large check-in confirmation
- Event and venue summary
- Current queue status
- Permission and location guidance only when required

Prevent duplicate check-in and make conflict messages explicit.

### 9.5 Courts

Use a court-card grid.

Each court card shows:

- Court name/number
- Court state
- Current match
- Team/player names
- Score
- Timer
- Next action

Organizer controls may include pause, mark unavailable, move match, or open details.

### 9.6 Queue

Display players grouped by state:

- On deck
- Waiting
- Resting
- Temporarily unavailable
- Finished

Player rows should show games played and waiting time where useful. Organizers may adjust availability and manually prioritize only when permitted.

### 9.7 Generate round

Recommended layout:

1. Strategy selector
2. Available court selector
3. Summary of eligible and unavailable players
4. Generated assignment board
5. Quality score and explanation
6. Warning list
7. Sticky confirmation controls

Manual override supports:

- Drag player between teams
- Swap players
- Move a match between courts
- Remove a player
- Add a waiting player
- Lock a match
- Regenerate unlocked matches
- Regenerate entire round

After edits, show:

- Team rating difference
- Repeated teammate warning
- Repeated opponent warning
- Unequal games warning
- Insufficient rest warning

Warnings do not always block confirmation, but hard-rule violations do.

### 9.8 Player assignment

The assignment screen must prioritize:

- Court number
- Match state
- Partner
- Opponents
- On-deck/start timing
- Navigation to venue or court notes when available

Use a highly visible status treatment and optional haptic feedback when a new assignment arrives.

### 9.9 Scoring

Scoring is a distraction-free, full-screen experience.

Requirements:

- Hide normal navigation
- Show court and match identifier
- Display Team 1 and Team 2 labels and colors
- Use very large tabular scores
- Use 64 × 64 or larger score controls
- Support undo
- Show game number and best-of status
- Show server/sync state
- Prevent invalid score transitions
- Require explicit final-score submission
- Show confirmation state when required

Do not rely on swipes as the only scoring mechanism.

### 9.10 Score confirmation

Show:

- Final game scores
- Winner
- Participant names
- Who has confirmed
- Dispute action
- Submission timestamp

A disputed score must use a strong semantic treatment and direct the organizer to resolution.

### 9.11 Rankings

Filters may include:

- All time
- Per event
- Per month
- Rolling 30 days
- Current season
- Custom range
- Singles/Doubles
- Men/Women/Mixed
- Skill division

Leaderboard rows display:

- Rank
- Player
- Rating
- Provisional status
- Matches played
- Wins/losses or win percentage
- Rating trend

Do not rank players with insufficient participation as if they were fully qualified.

### 9.12 Member profile

Sections:

- Identity and club membership
- Singles and doubles ratings
- Skill level
- Preferred side and format
- Attendance
- Match history
- Frequent partners and opponents
- Wins/losses and point differential

### 9.13 Club administration

Desktop-first screens may use tables for:

- Members
- Roles
- Event list
- Announcements
- Audit history

All tables require responsive alternatives, search, filters, sorting, empty states, and clear row actions.

### 9.14 TV display

The screen must remain understandable from across a venue.

Prioritize:

1. Active courts and scores
2. Next matches
3. Waiting/on-deck players
4. Event announcement
5. Leaderboard or secondary content

Use automatic rotation only for secondary panels. Never rotate active scores out of view.

---

## 10. Smart Matchmaking UX

### 10.1 Strategy choices

Organizer-facing strategy labels:

- Most balanced
- Most randomized
- Maximum player variety
- Shortest waiting time
- Competitive matches
- Social matches

Each strategy needs a one-sentence explanation and an optional details panel.

### 10.2 Quality explanation

Each generated match should explain why it was recommended, for example:

- Balanced match
- Team rating difference: 2.4%
- All players have completed two matches
- No teammate pairing repeats within the previous three rounds
- Two players were prioritized after waiting 18 minutes

### 10.3 Constraint communication

Differentiate:

- **Hard violation:** blocks confirmation
- **Warning:** allows confirmation after organizer review
- **Information:** explains a tradeoff

Never expose raw algorithm terminology without plain-language explanation.

---

## 11. Accessibility

### 11.1 Visual

- Meet WCAG AA contrast for normal text and controls
- Do not rely on color alone
- Support 150% text scaling
- Use tabular numerals for rapidly changing numeric data
- Ensure focus indicators are visible on web
- Preserve important information in high-contrast and dark modes

### 11.2 Motor

- Minimum 44 × 44 touch target
- Large court-side scoring controls
- Avoid precise drag-only interactions; provide tap-based alternatives
- Provide undo for reversible actions
- Separate destructive actions from primary actions

### 11.3 Screen readers

- Every icon button needs an accessible label
- Announce score changes and assignment updates appropriately
- Team and player information must be read in a logical order
- Dynamic status updates should not interrupt unrelated interaction excessively

### 11.4 Motion

- Respect reduced-motion settings
- Avoid flashing content
- Keep assignment reveals brief
- Do not use animation as the only way to communicate state

---

## 12. Content and Microcopy

Use concise, direct language.

Preferred:

- “Generate round”
- “Confirm assignments”
- “Mark unavailable”
- “Submit final score”
- “Undo point”

Avoid vague labels such as “Proceed,” “Okay,” or “Manage” when a specific action is possible.

Status labels should use consistent capitalization and wording across all surfaces.

Error copy should explain the cause and next step. Confirmation copy should state the consequence.

---

## 13. Implementation Guidance

### 13.1 Recommended frontend stack

- Expo and React Native
- TypeScript
- Expo Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- NativeWind or typed StyleSheet tokens
- React Native Reanimated
- React Native Gesture Handler
- FlashList
- Lucide React Native / Expo Symbols
- Expo SecureStore
- Expo SQLite
- Expo Notifications
- Expo Camera
- Expo Haptics
- Victory Native or React Native Skia

### 13.2 Suggested source organization

```text
src/
├── app/
├── components/
│   ├── ui/
│   ├── event/
│   ├── court/
│   ├── match/
│   ├── member/
│   ├── ranking/
│   └── display/
├── features/
├── hooks/
├── schemas/
├── stores/
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   ├── elevation.ts
│   └── index.ts
├── types/
└── utils/
```

### 13.3 Component rules

- Components consume semantic tokens rather than raw hex values
- Screens compose feature components rather than duplicating markup
- Responsive behavior belongs in shared layout primitives where possible
- Business authorization must not depend only on hidden UI controls
- Critical actions expose pending, success, conflict, and failure states
- Real-time updates should preserve the user’s current context and scroll position

---

## 14. QA and Design Acceptance Checklist

A screen is ready for implementation review when:

- It works at compact, medium, expanded, and wide breakpoints
- It supports loading, empty, error, offline, and success states
- Touch targets meet minimum size
- Text remains usable at 150% scaling
- Colors meet contrast requirements
- Color is not the only status indicator
- Primary and destructive actions are clearly separated
- Critical operations wait for server confirmation
- Permissions are reflected correctly
- Keyboard and screen-reader behavior is defined
- Real-time updates do not create jarring layout shifts
- Outdoor-critical content remains readable
- Reduced-motion behavior is respected
- TV mode remains readable at a distance
- Copy clearly states actions and consequences

---

## 15. MVP Design Priorities

The first implementation should prioritize these flows:

1. Authentication and invitation acceptance
2. Club and member management
3. Event creation and registration
4. QR/manual check-in
5. Event overview and player states
6. Court grid and queue
7. Smart round generation and manual override
8. Player assignment view
9. Court-side scoring and score confirmation
10. Rankings and player statistics
11. TV event display

Later visual refinements should not delay clarity, accessibility, or the complete event workflow.
