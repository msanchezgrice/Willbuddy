# T08 Performance / Script Budget

Date: 2026-06-27

## Scope

T08 protects the public landing and conversion routes from analytics and ad script drag. Auth, voice, payment, and document-generation dependencies are allowed where needed for the product flow, but analytics and paid-media scripts must stay delayed, scoped, and measurable.

## Current Third-Party Script Plan

| Surface | Status | Budget rule |
| --- | --- | --- |
| PostHog analytics | Implemented through `src/lib/analytics/posthog-client.ts` | No static client import from `posthog-js` or `posthog-js/react`. SDK loads only after browser idle for pageviews or after a tracked interaction. Autocapture, performance capture, pageleave, and session recording remain disabled. |
| Google Tag Manager / GA4 | Not installed | Do not add a root-layout tag. If T12/T13 introduces Google tags, use route-scoped or consent-gated loading and prefer idle or `lazyOnload` behavior over `beforeInteractive`. |
| Meta Pixel | Not installed | Do not add Pixel to initial HTML. If T13 introduces Pixel, document the exact routes/events and keep public landing LCP smoke in this file current. |
| Support/chat widgets | Not installed | No chat widget before launch. Any future widget must be interaction-triggered or lazy after load. |
| Clerk auth | Scoped to `src/app/(auth)/layout.tsx` | Keep auth scripts limited to sign-in/up and auth-group routes. Do not load Clerk from the root layout or use Clerk as an analytics/ad channel. |

## Route Budget

- `/` and `/contact` must render initial HTML without third-party `<script src="...">` tags.
- Public landing page analytics pageviews are deferred with `requestIdleCallback` and a 3000 ms timeout fallback.
- CTA/contact analytics may load PostHog on interaction, but captured properties must keep the existing PII sanitizer.
- Clerk's browser script must not appear in initial HTML for `/` or `/contact`.
- No analytics/ad script belongs in `beforeInteractive`.
- Re-run `npm run smoke:launch` after any analytics, ads, auth-provider, or landing-page script change.

## Verification

- Static import guard: `tests/launch-smoke.mjs` fails if `src/**/*.ts(x)` reintroduces a non-type static import from `posthog-js` or `posthog-js/react`.
- Initial HTML guard: `tests/launch-smoke.mjs` fails if `/` or `/contact` includes third-party script tags in server-rendered HTML.
- Manual viewport smoke should cover mobile `390x844` and desktop `1440x1000` against the same build used for launch smoke.

## Reopen Conditions

Reopen T08 if any of these happen:

- A Google, Meta, TikTok, LinkedIn, chat, session replay, or tag-manager script is added.
- PostHog autocapture, performance capture, pageleave, or session recording is enabled.
- `posthog-js` or an ad SDK returns to the initial client graph through a static import.
- Mobile homepage or contact smoke fails, screenshots show launch-blocking overflow, or LCP regresses after a script change.
- Production HTML for `/` or `/contact` contains a third-party analytics/ad script tag before explicit approval and updated documentation.
