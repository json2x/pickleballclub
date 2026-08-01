# Bare Layout Template

- Stitch project: `4500934471177156793`
- Stitch screen: `Bare Layout Template`
- Screen ID: `6beac0ed87274907a88a50bd06a51e4f`
- Route: shared authenticated `/<clubSlug>/*` layout
- Assets: `mark-pickle-lo-p.png`
- Components: fixed 260px desktop sidebar, mobile top and bottom navigation, active club switcher, role/account context, local sign-out
- States: loading, unauthorized/unknown club, workspace error, switch pending/error, signed out
- Accessibility: navigation landmarks, current-page state, disabled future destinations, labeled switcher, 44px controls, focus-visible styles
- Intentional deviation: Events, Members, Stats, and Settings are visibly disabled because their routes are not implemented in Phase 1
