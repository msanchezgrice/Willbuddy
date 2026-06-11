# T05 Email & Support Evidence

Date: 2026-06-11

## Implemented

- Public support path: `/contact`
- Support receiving env var: `SUPPORT_EMAIL`
- Sender env vars: `RESEND_API_KEY`, `RESEND_FROM`
- Contact submissions send through the existing Resend SDK helper in `src/lib/resend.ts`.
- The root layout footer now links to Contact and the support email. Privacy and Terms footer links are handled by T10.

## PII Handling

- The contact form asks users not to include estate-planning answers in the message body.
- The app sends the form body only to the configured support inbox through Resend.
- Secrets are referenced by env-var name only.

## Verification

- Local env check: `RESEND_API_KEY`, `RESEND_FROM`, and `SUPPORT_EMAIL` were not present in this shell on 2026-06-11.
- Sender domain verification: not verified locally because no Resend API key or configured sender domain was available.
- Test email evidence: not sent locally for the same reason.
- Support receiving path is known: set `SUPPORT_EMAIL` to the monitored support inbox and configure `RESEND_FROM` to a verified sender before production use.
