# T16 Post-launch Ops Runbook

Date: 2026-06-27

## Scope

This runbook prepares WillBuddy post-launch operations. It does not activate
recurring automations, paid spend, public posts, provider billing changes, or
email sends.

Launch pack: `/tmp/warmstart/launch-packs/willbuddy-2026-06-27T17-56-58-929Z`

Production target: `https://mywillbuddy.com`

Known fallback in code: `https://willbuddy.vercel.app` unless
`NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_APP_URL` is configured.

Warm Start primitive file:
`/tmp/warmstart/launch-packs/willbuddy-2026-06-27T17-56-58-929Z/warm-start-primitives.json`

## Current Launch Dependencies

These are dependencies for operating the routines below. They do not block this
T16 runbook, but they do gate truthful daily counts after launch.

| Area | Source | Current gate |
| --- | --- | --- |
| Production deploy/domain/env | T03 | Not started in the launch pack. Production URL and env inventory still need live evidence. |
| Payments | T04, repo Stripe code | T04 prompt file is missing from the reconstructed pack; checkout/webhook routines are based on `src/app/api/stripe/*` and `src/lib/stripe.ts`. |
| Support email | T05 | `/contact` and Resend routing exist; sender domain/test email evidence is provider-gated. |
| Analytics | T07 | PostHog project `willbuddy-voice-first-estate-planning` / `464452` was identified earlier; live receipt remains gated by env and provider proof. |
| SEO/indexing | T09 | Robots/sitemap code exists; Search Console and live crawl proof are provider-gated. |
| Social/video recurring surfaces | T11 | X, Facebook, and YouTube primitives are currently empty until T11 confirms owned surfaces. |
| Ads | T12/T13 | Campaigns, pixels, conversion labels, budgets, and activation remain provider-gated and approval-gated. |
| Smoke/health | T15 | `npm run smoke:launch` exists; production smoke waits for deploy/domain evidence. |

## First 24 Hours

Run this cadence on launch day after T03 records production evidence.

| Time | Routine | Evidence to record | Approval gate |
| --- | --- | --- | --- |
| T+0 | Confirm canonical production URL, Vercel deployment, domain alias, and env inventory. | Vercel deployment URL, production alias, commit SHA, env names only. | Domain, billing, or customer-email changes need Miguel approval. |
| T+0 | Run production smoke. | `SMOKE_BASE_URL=https://mywillbuddy.com EXPECTED_SITE_URL=https://mywillbuddy.com npm run smoke:launch` output. | None for read-only smoke. |
| T+0 | Verify legal/support/SEO public routes. | HTTP 200 for `/`, `/contact`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`, `/opengraph-image`. | Content/legal copy changes need approval if materially changing claims. |
| T+1h | Verify PostHog receipt. | Provider-visible `$pageview`, `signup_cta_clicked`, and `contact_form_submitted` receipt with route sanitization intact. | Provider project mutation beyond read-only verification needs approval. |
| T+1h | Verify support receiving. | Resend sender domain status plus one controlled `/contact` test message delivered to `support@mywillbuddy.com`. | Sending a real customer-facing message or changing sender/domain settings needs approval. |
| T+2h | Verify Stripe guardrails. | Auth-required checkout behavior, unsigned webhook returns 400, and test-mode checkout/webhook proof if available. | Live charge, refund, product price change, billing/account mutation, or live webhook endpoint mutation needs approval. |
| T+2h | Verify Supabase compatibility. | `profiles.id` and `sessions.user_id` support Clerk text IDs; RLS/policies match service-role app paths. | Destructive migrations, policy broadening, or production data repair need approval. |
| T+4h | Verify Vercel cron state. | Vercel cron exists for `/api/cron/emails` and logs show healthy schedule metadata. | Manual production cron invocation can send emails; do not trigger without approval. |
| T+4h | Verify Search Console. | Property `https://mywillbuddy.com/`, sitemap submitted, crawl/indexing statuses recorded. | Manual indexing is allowed only after T09 verifies owned property and approved URL set. |
| T+6h | Verify paid ads remain controlled. | Google Ads and Meta account/page/pixel/campaign state recorded as draft or paused unless Miguel approved activation. | Any spend, campaign enablement, budget increase, or billing change needs approval. |
| T+12h | Review funnel and support backlog. | Counts for sessions started, checkout starts, purchases, support tickets, delivery failures, and provider errors. | Replies/refunds/custom account action need approval unless pre-authorized. |
| T+24h | Write launch-day closeout. | One status note with production smoke, provider checks, blockers, and next-day action list. | Starting recurring Warm Start automations needs explicit Miguel approval. |

## Week-One Daily Checklist

Use exact same-day/provider proof for each count. If proof is missing, record
`count: 0` with the blocker string instead of estimating.

- Production health: run `npm run smoke:launch` against the canonical domain;
  check Vercel deployment status, function errors, cron logs, and recent 5xx.
- Funnel refresh: reconcile PostHog events and provider dashboards for pageview,
  signup CTA, account/session start, checkout start, purchase completed, and
  contact form submit.
- Support: check `support@mywillbuddy.com`, Resend delivery/bounce logs, and
  `/contact` failures. Draft replies for review when the answer affects legal,
  billing, refund, privacy, or account state.
- Payments: reconcile Stripe checkout sessions, completed payments, webhook
  errors, and Supabase `payments` rows. Do not create live charges or refunds
  without approval.
- SEO/indexing: check `/robots.txt`, `/sitemap.xml`, Search Console coverage,
  crawl errors, and sitemap processing. Request indexing only for approved
  public routes.
- Paid ads: confirm Google Ads and Meta spend remains paused/draft until Miguel
  approves activation. If active later, reconcile spend, conversions, URL tags,
  and disapproved ads daily.
- Content/social/video: check T11/T14-approved assets only. No public posts or
  channel uploads without approval.
- Security/privacy: scan logs for sensitive estate-planning answers in analytics,
  support, or error logs. Preserve PostHog autocapture/session-recording
  exclusions.

## Weekly Operating Review

Run weekly after the first seven launch days, or earlier if Miguel explicitly
moves the project into post-launch recurring operations.

- Production reliability: Vercel deploy history, function errors, cron logs,
  smoke trend, dependency updates, and recent security advisories.
- Product funnel: PostHog conversion by source/device, drop-off by route, and
  comparison against paid/social/email traffic.
- Revenue reconciliation: Stripe payments, Supabase `payments`, failed webhooks,
  chargebacks, refunds, and support billing tickets.
- Support quality: response time, unresolved tickets, delivery failures, repeated
  product questions, and copy/docs changes to reduce confusion.
- SEO: indexed URL count, sitemap status, query impressions/clicks, crawl
  issues, and next approved blog/topic candidate.
- Paid ads: spend, CPA, conversion attribution, disabled/disapproved creative,
  URL suffix correctness, and budget guardrails.
- Legal/compliance: privacy/terms accuracy, data retention posture, attorney
  review notes, and "not legal advice" claim alignment.
- Warm Start readiness: confirm launch workstreams are completed or explicitly
  deferred, production launch evidence exists, and Miguel has approved recurring
  automation activation before scheduling anything.

## Provider Reconciliation Procedures

| Provider/surface | Reconcile | Evidence |
| --- | --- | --- |
| Vercel | Production deployment, canonical domain alias, env names, cron config, function errors. | Deployment URL, alias, commit SHA, selected log timestamps. |
| PostHog | Events arrive with sanitized route names and no sensitive form/session data. | Project id, event names, sample timestamps, dashboard/insight link if available. |
| Resend/support | Sender domain status, support delivery, bounces, contact API failures. | Domain status, message id for controlled test, inbox receipt. |
| Supabase | Clerk text-id compatibility, session/payment/doc tables, RLS/service-role paths. | Schema readback, query counts, migration status. |
| Stripe | Checkout sessions, webhook signature rejection, completed payment rows. | Session ids, webhook event ids, Supabase payment row ids. |
| Search Console | Property ownership, sitemap processing, coverage/indexing status. | Property URL, sitemap URL, submitted URLs, processing status. |
| Google Ads | Customer id, conversion id/labels, tag receipt, campaign paused/draft state. | Customer id, `AW-.../<label>` values, campaign ids, budget caps. |
| Meta/Facebook | Page, ad account, pixel/dataset, CAPI/offline event set, campaign paused/draft state. | Page id, ad account id, pixel/dataset id, campaign/ad set ids. |
| Social/video | Owned X/Facebook/YouTube surfaces and approved content assets. | Profile/channel URLs, stable ids, asset paths. |

## Approval Gates

Stop and ask Miguel at the exact action-time gate for:

- Starting recurring Warm Start daily automations.
- Enabling paid spend, resuming ads, increasing budgets, changing billing, or
  publishing ads.
- Public posts, social profile changes, video uploads, or public content
  publishing not already approved in a launch workstream.
- Domain, DNS, sender-domain, customer-email, legal copy, privacy/terms, or
  account ownership changes.
- MFA, CAPTCHA, security challenges, provider permission grants, or new app
  authorizations.
- Live charges, refunds, destructive payment actions, destructive database
  writes, broad RLS changes, or production data repairs.
- Manual production cron invocation that could send emails.
- Any customer-specific support reply that gives legal, billing, refund, privacy,
  or account-status commitments.

## Warm Start Handoff

Do not start recurring automations from T16. The activation gate remains:

`Activate only after launch workstreams are completed or explicitly deferred,
production launch evidence is recorded, and Miguel approves moving into
recurring daily automations.`

Recurring topic ownership remains:

| Topic | Owning launch workstream | Current primitive source |
| --- | --- | --- |
| `funnel_refresh` | T07 | `workdir`, `codexProjectName` |
| `blog_post_live` | T09 | `brandBriefPath`, `contentCalendarPath`, `seoStrategyPath` |
| `tweets_news` | T11 | `xHandle`, `xProfileUrl`, `brandBriefPath`, `contentCalendarPath` |
| `channel_video` | T11 | `youtubeChannelUrl`, `videoSurfaceUrls`, `brandBriefPath`, `contentCalendarPath` |
| `fb_page_post` | T11 | `facebookPageUrl`, `facebookPageIds`, `brandBriefPath`, `contentCalendarPath` |
| `index_pages` | T09 | `searchConsolePropertyUrl`, `seoStrategyPath` |
| `cs_tickets_replied` | T05 | `supportEmail`, `workdir` |

## Closeout Template

Use this shape for daily/weekly evidence notes:

```text
Date:
Mode: read-only / approved action
Production URL:
Checks passed:
Counts with same-day/provider proof:
Provider blockers:
Approval gates reached:
Next action:
```
