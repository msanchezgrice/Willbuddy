# T07 Analytics Evidence

Date: 2026-06-27

## Provider

- Existing PostHog project confirmed through the PostHog connector: `willbuddy-voice-first-estate-planning`.
- Project id: `464452`.
- Host used by the app when no override is supplied: `https://us.i.posthog.com`.
- Runtime env vars expected by the app:
  - `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
  - `NEXT_PUBLIC_POSTHOG_HOST`
- Local `.env.local` inventory and Vercel env inventory on 2026-06-27 did not include the PostHog public env vars, so the current deployed build is not expected to emit WillBuddy app events until those vars are added and redeployed.
- No GA4, GTM, Google Ads, or Meta Pixel identifiers were found in local env names, Vercel env names, or the analytics code. Those provider pixels should be wired only after T12/T13 confirm owned accounts, conversion IDs, labels, and pixels.

## Event Map

| Event | Surface | Properties |
| --- | --- | --- |
| `$pageview` | `src/app/providers.tsx` route changes via `capturePageview` | `route`, `path`, `$pathname`, sanitized `$current_url`, allowed attribution fields |
| `signup_cta_clicked` | Homepage hero and pricing CTAs via `TrackedLink` | `location`, `label`, `route`, `path`, allowed attribution fields |
| `signup_completed` | First authenticated profile creation in `POST /api/session` | `source` |
| `contact_form_submitted` | Contact form success | `topic`, `route`, `path`, allowed attribution fields |

## Attribution Capture

- Whitelisted query parameters are captured in `src/lib/analytics/properties.ts`:
  - `utm_source`
  - `utm_medium`
  - `utm_campaign`
  - `utm_term`
  - `utm_content`
  - `gclid`
  - `gbraid`
  - `wbraid`
  - `fbclid`
  - `msclkid`
  - `ttclid`
- Attribution values are trimmed and capped at 160 characters.
- Pageviews register allowed attribution as PostHog super properties so subsequent explicit events can keep campaign context during the session.
- Free-form query strings are not forwarded; `$current_url` is normalized to origin plus sanitized route.

## Google, GA4, and Meta Signal Plan

- PostHog is the current implemented analytics provider for launch-safe product analytics.
- Google Ads / GA4 should consume the same funnel semantics once T12 confirms owned Google properties and exact conversion identifiers:
  - CTA intent: `signup_cta_clicked`
  - Signed-in start/profile creation: `signup_completed`
  - Google click identifiers preserved: `gclid`, `gbraid`, `wbraid`
- Meta should consume the same funnel semantics once T13 confirms owned Page, dataset/pixel, and event setup:
  - Lead / signup intent: `signup_cta_clicked`
  - Registration/start: `signup_completed`
  - Meta click identifier preserved: `fbclid`
- No ad spend, campaign activation, public posting, or unowned provider tag was created from T07.

## PII Exclusions

- Broad PostHog autocapture is disabled.
- Session recording is disabled.
- Input text and element attributes are masked.
- Dynamic routes are normalized before capture:
  - `/session/[id]`
  - `/summary/[id]`
  - `/share/[token]`
  - `/couple/join/[token]`
  - `/couple/compare/[id]`
  - `/sign-in`
  - `/sign-up`
- The shared sanitizer removes these property names when present: `email`, `name`, `message`, `transcript`, `decisions`, `answers`, `token`, `invite_token`, `share_token`, `sessionId`, `session_id`, `userId`, `user_id`.
- Contact form analytics sends only the selected topic, never the support message body.
- Estate-planning answers, generated documents, transcripts, and contact message bodies are not sent to analytics providers.

## Verification

- `npm run test:analytics` passed on 2026-06-27.
- `npx tsc --noEmit` passed on 2026-06-27.
- `npm run lint` passed on 2026-06-27 with four pre-existing warnings outside T07.
- `npm run build` passed on 2026-06-27. The build also verified the `useSearchParams` tracker is wrapped in `Suspense`.
- PostHog provider receipt: after switching to project `464452`, HogQL returned one `t07_analytics_probe` event with `launch_task_id = T07`, `proof_source = codex_direct_capture`, `attribution_capture = utm_click_id_whitelist`, latest timestamp `2026-06-27T18:15:32.585000Z`.

## Follow-Up

- Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to the appropriate local/Vercel environments before the production deploy that includes this code. Do not commit token values.
- After deploy, generate a real homepage pageview with UTM/click parameters and a CTA click, then query PostHog for `$pageview` and `signup_cta_clicked` on `mywillbuddy.com`.
