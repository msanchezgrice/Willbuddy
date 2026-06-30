# T10 Legal & Footer Evidence

Date: 2026-06-27

## Implemented

- Added `/privacy` at `src/app/privacy/page.tsx`.
- Added `/terms` at `src/app/terms/page.tsx`.
- Added `/refunds` at `src/app/refunds/page.tsx`.
- Added footer links for Contact, support email, Privacy, Refunds, and Terms in `src/app/layout.tsx`.
- Aligned default public app/support fallbacks to `https://mywillbuddy.com` and `support@mywillbuddy.com`.

## Claim Alignment

- Legal pages state that WillBuddy is not a law firm and does not provide legal advice.
- Texas-only product scope matches homepage and FAQ copy.
- Privacy provider list matches observed implementation: Clerk, Supabase, Google Gemini, Stripe, Resend, Vercel, and PostHog.
- Analytics privacy language matches the implemented PostHog sanitizer and disabled autocapture/session recording.
- Refund copy matches implementation: one-time Stripe checkout, manual support review, no automated refund flow claimed.

## Verification

- Local route reachability is covered by the launch smoke test added in T15, now including `/refunds`.
- Legal copy is implementation-aligned but should still receive attorney review before production launch.
