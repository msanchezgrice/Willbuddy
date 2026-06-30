# T09 SEO & Indexing Handoff

Date: 2026-06-27

## Implemented

- Added shared site config in `src/lib/site.ts`.
- Canonical production host: `https://mywillbuddy.com`.
- Added App Router metadata in `src/app/layout.tsx`:
  - metadata base
  - canonical homepage URL
  - Open Graph tags
  - Twitter card tags
  - index/follow robots metadata
- Added generated Open Graph image at `src/app/opengraph-image.tsx`.
- Added robots output at `src/app/robots.ts`.
- Added sitemap output at `src/app/sitemap.ts`.

## Indexing URL Set

- `https://mywillbuddy.com/`
- `https://mywillbuddy.com/contact`
- `https://mywillbuddy.com/privacy`
- `https://mywillbuddy.com/refunds`
- `https://mywillbuddy.com/terms`

## Crawl Rules

- Allowed: public marketing, contact, privacy, refunds, and terms pages.
- Disallowed: `/api/`, `/session/`, `/summary/`, `/share/`, `/couple/`, `/sign-in`, `/sign-up`.

## Content Handoff

- Brand brief: `docs/launch/willbuddy-brand-brief.md`
- Content calendar: `docs/launch/t09-content-calendar.md`
- SEO strategy: this file, `docs/launch/t09-seo-indexing.md`

## IndexNow

No IndexNow key file or provider credential was present in the repo or launch pack during this run. Do not submit IndexNow until a non-secret key location and target provider workflow are explicitly configured.

## Verification

- Production pre-deploy check on 2026-06-27: `https://mywillbuddy.com/` returned 200, but `https://mywillbuddy.com/robots.txt` and `https://mywillbuddy.com/sitemap.xml` returned 404 from the current production deployment.
- Search Console status remains pending until the production deployment serves `/robots.txt` and `/sitemap.xml`, then the sitemap and URL set should be submitted/requested through Miguel's signed-in Chrome session.
