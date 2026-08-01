# Join a Club

- Stitch project: `4500934471177156793`
- Stitch screen: `Join a Club`
- Screen ID: `12e8461cedeb4eebbfe3fb1e6efcc05b`
- Shared layout screen ID: `838acb55e2534782b32bd2bbdce13970`
- Route: `/onboarding/join-club`
- Assets: `logo-pickle-lo-primary.png`
- Components: server-rendered GET search, joinable result list, exact-slug form, private-invitation help
- States: initial results, query results, no results, search error, validation error, already-member, invite-only, pending approval, success redirect
- Accessibility: search landmark, result list semantics, live form feedback, keyboard focus, 44px controls, responsive stacked layout
- Intentional deviation: raw invitation tokens are never accepted by the slug form; users open the complete `/invite/[token]` link they received
