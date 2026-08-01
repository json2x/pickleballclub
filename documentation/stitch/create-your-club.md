# Create Your Club

- Stitch project: `4500934471177156793`
- Stitch screen: `Create Your Club`
- Screen ID: `60a68eca7a03472d8c6923469e548361`
- Shared layout screen ID: `838acb55e2534782b32bd2bbdce13970`
- Route: `/onboarding/create-club`
- Assets: `logo-pickle-lo-primary.png`
- Components: progress context, back navigation, labeled club form, join-policy select, optional private logo input, submit action
- States: idle, pending, validation errors, duplicate slug, logo type/size error, generic mutation error, success redirect, usable-club redirect after logo failure
- Accessibility: visible labels/descriptions, associated errors, keyboard focus, 44px controls, responsive single-column form
- Intentional deviation: optional logo storage and the following `clubs.logo_path` update are not atomic with `create_club`; a failure never deletes the created club and instead redirects to its dashboard with a safe notice
