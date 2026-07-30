# AGENTS.md — Pickleball Club

> **Repository state:** Design specification only. No implementation, build system, or tests exist yet. The active source of truth is `DESIGN.md` and the PDFs in `documentation/`.

## Tech Stack (Locked)

- **Runtime:** Expo + React Native (iOS, Android, tablet, web admin, TV/projector)
- **Router:** Expo Router
- **State:** TanStack Query (server), Zustand (client)
- **Forms:** React Hook Form + Zod
- **Styling:** NativeWind or typed StyleSheet tokens
- **Motion:** React Native Reanimated + Gesture Handler
- **Lists:** FlashList
- **Icons:** Lucide React Native / Expo Symbols
- **Charts:** Victory Native or React Native Skia
- **Local:** Expo SQLite, Expo SecureStore
- **Native APIs:** Notifications, Camera, Haptics

## Planned Source Layout

```text
src/
├── app/                 # Expo Router file-system routes
├── components/
│   ├── ui/              # primitives (Button, Card, Badge, etc.)
│   ├── event/
│   ├── court/
│   ├── match/
│   ├── member/
│   ├── ranking/
│   └── display/         # TV components
├── features/            # feature modules
├── hooks/
├── schemas/             # Zod schemas
├── stores/              # Zustand stores
├── theme/               # tokens (colors, typography, spacing, radius, elevation)
├── types/
└── utils/
```

## Architectural Rules (from DESIGN.md)

1. **Components consume semantic tokens** — never hard-code hex values inside screen components.
2. **Screens compose feature components** — do not duplicate markup across surfaces.
3. **Responsive behavior belongs in shared layout primitives** where possible.
4. **Business authorization must not depend only on hidden UI controls** — permission checks must be enforced in logic, not just UI.
5. **Critical actions expose pending, success, conflict, and failure states**.
6. **Real-time updates preserve user context and scroll position**.

## Multi-Surface Targets

| Surface | Key Constraint |
|---|---|
| Mobile | One-handed actions, bottom tabs, 44×44 min touch targets |
| Tablet | Collapsible nav rail, two-column content, context panel |
| Web admin | Desktop shell with tables, persistent page header, side nav |
| TV / Projector | Read-only, 16:9, no tiny metadata, no hover-only info, high contrast |

TV mode **defaults to light theme** even if dark mode is enabled elsewhere — outdoor readability takes priority.

## Role-Based UI

Do not render disabled privileged controls when hiding improves clarity. When a control must stay visible for discoverability, show a concise permission explanation.

| Role | Capabilities |
|---|---|
| Administrator | Full club mgmt, roles, members, events, disputes, audit logs, settings |
| Event organizer | Event creation, check-in, court setup, round generation, assignment override |
| Court marshal | Assigned-court controls, start/pause match, scoring, dispute reporting |
| Scorekeeper | Assigned-match scoring, undo, submit final score |
| Member | Register, check in, view assignment, score own match when allowed |
| Guest | Event-scoped registration, assignment viewing, limited participation |

## State & Interaction Rules

- **Optimistic updates** are acceptable only for low-risk preferences/acknowledgements.
- **Never optimistically finalize:** scores, matches, rounds, court assignments, ratings, conflicting check-ins.
- **Loading:** skeletons for predictable layouts; centered spinner only when shape is unknown.
- **Empty states** must explain what is missing, why it matters, and the next action.
- **Errors** must be specific and actionable — never "Something went wrong."
- **Offline:** cached event and assignment data must remain readable; show a non-obstructive connection banner.

## Design Tokens Quick Reference

- **Typography:** Inter (primary), Sora (display only). Use tabular numerals for scores/timers/rankings.
- **Brand colors:** pickle-500 `#6FB51E` (primary), court-500 `#2188E5`.
- **Spacing:** 4-point grid (`space-1` = 4, `space-4` = 16, `space-8` = 32).
- **Radius:** `radius-sm` = 8 (inputs), `radius-md` = 12 (cards), `radius-lg` = 16 (modals).
- **Touch targets:** minimum 44 × 44; score controls should be 64 × 64 or larger.
- **Motion:** micro 100–150ms, standard 180–240ms, bottom sheet 250–320ms. Respect reduced-motion.

## MVP Priority Order

1. Authentication and invitation acceptance
2. Club and member management
3. Event creation and registration
4. QR / manual check-in
5. Event overview and player states
6. Court grid and queue
7. Smart round generation and manual override
8. Player assignment view
9. Court-side scoring and score confirmation
10. Rankings and player statistics
11. TV event display

## When Implementation Starts

1. Initialize the Expo project with the stack above.
2. Set up `src/theme/` tokens first — all later components must consume them.
3. Build `components/ui/` primitives before any screen work.
4. Implement auth + club/member mgmt before event flows (dependency order in the MVP list).
5. Keep the QA checklist from `DESIGN.md` §14 as the definition of done for every screen.

## Reference Files

- `DESIGN.md` — full UI specification, component library, screen specs, accessibility rules
- `documentation/Pickleball Club Management App Software Design.pdf` — software design document
- `documentation/Pickleball Club OS PRD.pdf` — product requirements document
