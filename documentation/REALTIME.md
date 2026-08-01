# Realtime

Realtime is not required for Phase 1. PostgreSQL remains the source of truth.

Later live-event clients will start with server-fetched data, subscribe only to event/match-scoped changes, reconcile by primary key and version/timestamp, expose reconnecting state, provide manual refresh, and remove channels on unmount. Presence or broadcast will never be the only persistence mechanism, and subscribed tables must be protected by RLS.
