# Deployment

Pickle-lo uses a standard stateless Next.js build on Vercel and hosted Supabase persistence. No custom server or in-memory WebSocket service is permitted.

Environment values belong in Vercel project settings by development, preview, and production environment. `.env.local` is never committed. Preview environments must not send production invitations or mutate production data.

Database changes are forward-only timestamped migrations. Reconcile and dry-run before applying, deploy one reviewed migration boundary at a time, verify hosted history/tables/advisors afterward, and use a corrective migration rather than editing an applied file. Destructive rollback requires explicit approval and backup.

Auth Site URL and redirect allowlists must cover local, preview, and production callback URLs. Invitation/recovery links must use the correct environment application URL.
