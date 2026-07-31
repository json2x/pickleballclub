---
name: supabase-github-branching
description: Manage Supabase schema, migration, Edge Function, storage, and deployment changes directly against this project's hosted Supabase backend. Use whenever work touches supabase/, database schema, RLS, SQL migrations, generated database types, or a Supabase deployment check.
license: MIT
compatibility: opencode
metadata:
  project: pickleballclub
  service: supabase
  workflow: hosted-remote
---

## Project Context

- Supabase project: `pickleballclub` in the `Zenner` organization.
- GitHub repository: `json2x/pickleballclub`.
- The tracked Supabase directory is `supabase/` at the repository root.
- Hosted project reference: `ptrxdxpwhreirwgpeima`.
- `supabase/config.toml` intentionally contains only migration metadata; no local stack is used.
- `supabase/migrations/` is the source-controlled schema history.

## Use This Workflow

1. Inspect the hosted tables, migration history, advisors, current worktree, existing migrations, functions, and relevant callers before changing anything.
2. Represent every schema change as a new SQL migration under `supabase/migrations/`; never edit or reorder an applied migration.
3. Keep migrations ordered, deterministic, and safe for the current hosted schema. Review destructive operations, locks, table rewrites, and broad data updates before deployment.
4. Verify RLS and least-privilege grants for every exposed table and callable function.
5. Preview pending migrations with `npm run supabase:push:dry`.
6. Apply reviewed changes with `npm run supabase:push` or `supabase_apply_migration`.
7. Verify the actual hosted migration result, table shape, security advisors, and performance advisors.
8. Regenerate hosted database types with `npm run supabase:types`, then run app diagnostics/build and exercise the changed behavior against the hosted project.
9. Never run `supabase start`, `supabase db reset`, `--local`, local Docker services, or seed fixture/user data into the hosted database.

## Remote Deployment Boundaries

- Direct migration application changes the shared hosted database immediately.
- No local or preview database is assumed.
- Never include fixtures, test users, or production personal data in migrations.
- Destructive remote operations require a backup and explicit user approval.
- API, Auth, and Dashboard settings not represented by migrations must be verified through their supported management path.

## Migration Safety

- Never edit or reorder a migration that has already been applied to the hosted database. Add a new corrective migration.
- Preserve migration timestamp order across rebases and resolve conflicting migration versions before pushing.
- Review destructive operations such as `DROP`, irreversible type changes, table rewrites, and broad data updates with the user before applying them.
- Add and verify Row Level Security policies for every exposed table. Hiding controls in the client is not authorization.
- Do not optimistically claim deployment success. Read the actual hosted migration result.
- On a failed deployment, inspect the first failing migration or deployment log and fix the root cause in a new corrective migration when the prior one is already recorded remotely.
- Expect dependent deployment steps to be skipped after an earlier step fails; do not diagnose skipped steps as independent failures.
- Do not bypass the dry run, hosted migration verification, or advisor checks for a failing migration.

## Secrets And Remote Access

- Never read, print, commit, or paste database passwords, connection strings, access tokens, service-role keys, JWT signing keys, or `.env` contents into chat, logs, SQL, config, or commits.
- Keep local secrets in ignored environment files and production secrets in the deployment platform's secret store.
- If `supabase db pull --db-url` is required, obtain the Session pooler connection string from the Dashboard **Connect** panel and pass it through a private environment variable or secure prompt. Never place it directly in a tracked command or file.
- Treat `supabase/.temp/`, `.branches`, and local environment files as generated private state; do not commit them.
- Use the anon/publishable key in clients only where intended. The service-role key must never be bundled into Expo or web client code.

## Completion Checklist

Before reporting completion:

- Migration files contain no secrets, fixtures, or production personal data.
- Pending remote migrations were reviewed with a dry run before application.
- RLS and grants match the intended roles and Data API exposure.
- Hosted migration history and advisors were checked after deployment.
- Generated TypeScript types match the hosted schema.
- Application behavior is exercised against the hosted project.
- Deployment is confirmed from the actual hosted database state, not inferred from a command starting.

## Official References

- Supabase CLI: https://supabase.com/docs/guides/local-development/cli/getting-started
- Database migrations: https://supabase.com/docs/guides/deployment/database-migrations
- Database advisors: https://supabase.com/docs/guides/database/database-advisors
