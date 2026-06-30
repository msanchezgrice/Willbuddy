# T05 Email & Support Evidence

Date: 2026-06-27

## Implemented Locally

- Public support path: `/contact`
- Support receiving env var: `SUPPORT_EMAIL`
- Sender env vars: `RESEND_API_KEY`, `RESEND_FROM`
- Contact submissions send through Resend in `src/app/api/contact/route.ts`.
- Default email identity now matches the launch domain when env vars are absent:
  - `RESEND_FROM`: `WillBuddy <hello@mywillbuddy.com>`
  - `SUPPORT_EMAIL`: `support@mywillbuddy.com`
  - `NEXT_PUBLIC_APP_URL`: `https://mywillbuddy.com`
- `.env.local.example` documents the required Resend/support env vars.

## PII Handling

- The contact form asks users not to include estate-planning answers in the message body.
- The app sends the form body only to the configured support inbox through Resend.
- Contact form analytics sends the selected topic only; the message body is not sent to analytics.
- Secrets are referenced by env-var name only.

## Verification

- Fetched launch repo artifact before analysis; `.env.local` was filtered as a secret file and no extra T05 source changed the local findings.
- Read Next route-handler docs before changing the contact/email helper behavior.
- Local focused test passed: `npm run test:email`.
- Lint passed with pre-existing warnings only: `npm run lint`.
- Existing dev server served `/contact` at `http://[::1]:3000/contact` with support email `support@mywillbuddy.com`.
- Contact API validation returned `400` for invalid email/message input at `http://[::1]:3000/api/contact`.
- Resend API domain list does not include `mywillbuddy.com`; verified domains in the account are other Miguel products only.
- Public DNS for `mywillbuddy.com` has Vercel DNS and A records but no MX, TXT, Resend DKIM, DMARC, or sender-domain records.
- Vercel production env has `RESEND_API_KEY` and `RESEND_FROM`, but `RESEND_FROM` resolves to `resend.dev` and `SUPPORT_EMAIL` is absent.
- Live production `/contact` is not deployed yet: `https://mywillbuddy.com/contact` returns `404`.
- Chrome provider UI route could not be used because the Codex Chrome bridge failed before browser connection.

## Current Status

T05 is not complete. The app-side support defaults are fixed, but sender domain verification, a real test email, and confirmed support receiving still need provider setup.

Blocking provider work:

- Add and verify `mywillbuddy.com` in Resend for sending.
- Add the required DNS sender records for `mywillbuddy.com`.
- Configure or confirm the receiving mailbox/path for `support@mywillbuddy.com`; current DNS has no MX.
- Set Vercel production/preview support env after provider setup, especially `SUPPORT_EMAIL=support@mywillbuddy.com` and a verified-domain `RESEND_FROM`.
- Deploy the branch that contains `/contact` before running an end-to-end production test.

No controlled test email was sent, because sending from `hello@mywillbuddy.com` would currently use an unverified sender domain.
