# Hosted Supabase Workflow

This project uses the hosted `pickleballclub` Supabase project directly. Do not
start, reset, seed, or depend on a local Supabase Docker stack.

## One-Time CLI Setup

```sh
npm exec -- supabase login
npm exec -- supabase link --project-ref ptrxdxpwhreirwgpeima
```

The link metadata is machine-local under `supabase/.temp/` and must not be
committed. Database passwords, connection strings, access tokens, and
service-role keys must never appear in source files or command arguments.

## Schema Changes

1. Inspect hosted tables, migration history, and advisors before editing.
2. Create a new migration with `npm exec -- supabase migration new <name>`.
3. Edit only the new migration. Never change an applied migration.
4. Review RLS, grants, destructive operations, locks, and data rewrites.
5. Preview pending changes with `npm run supabase:push:dry`.
6. Apply reviewed changes with `npm run supabase:push` or the Supabase MCP
   migration tool.
7. Verify hosted migration history, tables, security advisors, and performance
   advisors.
8. Regenerate client types with `npm run supabase:types`.
9. Run the application checks and exercise the changed behavior against the
   hosted project.

Direct remote changes affect the shared hosted database. Destructive migrations
require an explicit backup and user approval. Do not use `supabase start`,
`supabase db reset`, `--local`, or seed production with fixture/user data.

## Commands

```sh
npm run supabase:migrations
npm run supabase:lint
npm run supabase:push:dry
npm run supabase:push
npm run supabase:types
```
