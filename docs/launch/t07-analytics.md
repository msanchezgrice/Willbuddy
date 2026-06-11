# T07 Analytics Evidence

Date: 2026-06-11

## Provider

- Existing PostHog project confirmed through the PostHog connector: `willbuddy-voice-first-estate-planning`.
- Project id: `464452`.
- Provider status at wiring time: project existed and `ingested_event` was `false`.
- Runtime env vars expected by the app:
  - `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
  - `NEXT_PUBLIC_POSTHOG_HOST`

## Event Map

| Event | Surface | Properties |
| --- | --- | --- |
| `$pageview` | `src/app/providers.tsx` route changes | `route`, `path`, `$pathname`, sanitized `$current_url` |
| `signup_cta_clicked` | Homepage hero and pricing CTAs | `location`, `label`, `route`, `path` |
| `signup_completed` | First authenticated profile creation in `POST /api/session` | `source` |
| `contact_form_submitted` | Contact form success | `topic`, `route`, `path` |

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
- The sanitizer removes these property names when present: `email`, `name`, `message`, `transcript`, `decisions`, `answers`, `token`, `invite_token`, `share_token`, `sessionId`, `session_id`, `userId`, `user_id`.
- Contact form analytics sends only the selected topic, never the support message body.

## Verification

- Local env check: `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`, and `POSTHOG_API_KEY` were not present in this shell on 2026-06-11.
- Provider receipt/network proof is pending until the public PostHog project token and host are configured in local/Vercel env and a pageview or CTA event is generated.
