# Pickleball Club

Next.js App Router application for the Pickleball Club.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the placeholder environment file and fill in values from the Supabase dashboard. Do not commit real secrets.

   ```bash
   cp .env.example .env.local
   ```

3. Run the app:

   ```bash
   npm run dev
   ```

## Required environment variables

These public values are safe for browser-side usage when configured with a publishable key and protected by RLS:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`NEXT_PUBLIC_APP_URL` is also required for environment-correct callbacks and invitation links as those flows are implemented. The remaining variables in `.env.example` are server-only or optional provider settings for future Supabase admin, Resend, and Sentry integrations.

Copy `.env.example` to `.env.local` and supply real values there. Never commit `.env.local`, expose `SUPABASE_SECRET_KEY`, or prefix server secrets with `NEXT_PUBLIC_`.

For Vercel, add the same variables under Project Settings → Environment Variables for each target environment before deploying.

## Dependency audit note

Scoped Next dependency overrides pin `postcss@8.5.25` and `sharp@0.35.0` to address the current advisories. `npm audit` reports 0 advisories. Retest the application and retain lint, typecheck, and production build checks whenever Next.js is upgraded.

## Validation scripts

```bash
npm run lint
npm run typecheck
npm run build
```
