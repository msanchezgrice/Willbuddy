# P01 Supabase Readiness

Date: 2026-06-11

## Recommendation

Reuse the existing Supabase database for launch. The repo already contains
Supabase helpers and migrations, and the app code is wired to Supabase through:

- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/middleware.ts`
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_couple_mode.sql`
- `supabase/migrations/003_email_preferences.sql`

## Required Env Vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Observed Schema Gate

The current committed migrations are not a complete source of truth for a fresh
database launch:

- `001_initial_schema.sql` creates `profiles.id` and `sessions.user_id` as
  `uuid` columns tied to Supabase Auth.
- Current application code uses Clerk user IDs, which are text strings, through
  `@clerk/nextjs`.
- `002_couple_mode.sql` explicitly notes that Clerk text-id changes were
  already applied in production via dashboard, but those changes are not
  represented as a committed migration.

Because of that drift, a fresh Supabase project created only from the committed
migrations would not safely match the app. The existing production database may
already be correct, but it must be verified before launch.

## Launch Gate

Before marking P01 green, verify one of these is true:

1. The existing Supabase project has `profiles.id` and `sessions.user_id`
   compatible with Clerk text IDs, plus RLS/policies that match the current
   Clerk + service-role access pattern.
2. A new idempotent migration is written, tested against a clone, and committed
   to encode the Clerk text-id/RLS changes that were applied via dashboard.

## Local Verification

- `supabase` CLI is installed locally.
- This shell did not have `SUPABASE_ACCESS_TOKEN`, `NEXT_PUBLIC_SUPABASE_URL`,
  or `SUPABASE_SERVICE_ROLE_KEY`, so live database introspection was not
  performed in this run.

## Status

Partial. The recommendation to reuse Supabase is documented and the required
launch gate is explicit, but live schema verification is still required before
claiming the database task is complete.
