# Club Dashboard

- Stitch project: `4500934471177156793`
- Stitch screen: `Club Dashboard`
- Screen ID: `07687bf3a4a54ad8b02e22e473b44193`
- Shell screen ID: `6beac0ed87274907a88a50bd06a51e4f`
- Route: `/<clubSlug>/dashboard`
- Assets: `mark-pickle-lo-p.png`, `mascot-pickle-lo-ready.png`, short-lived signed private club logo when available
- Components: greeting, role badge, live membership metrics, signed club logo with initial fallback, club overview, honest coming-next panel
- States: member view, owner/admin metrics, logo-upload warning, signed-logo fallback, loading, unauthorized/not found, data error
- Accessibility: semantic metric sections, definition list details, permission-aware content, responsive cards, reduced motion
- Intentional deviation: event, registration, rating, and leaderboard values are not fabricated; private logo signing failures silently use the existing club initial/mark, while non-atomic onboarding upload failures show a safe usable-club notice
