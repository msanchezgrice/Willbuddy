# T09 SEO & Indexing Evidence

Date: 2026-06-11

## Implemented

- Added shared site config in `src/lib/site.ts`.
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

- `https://willbuddy.vercel.app/`
- `https://willbuddy.vercel.app/contact`
- `https://willbuddy.vercel.app/privacy`
- `https://willbuddy.vercel.app/terms`

## Crawl Rules

- Allowed: public marketing, contact, privacy, and terms pages.
- Disallowed: `/api/`, `/session/`, `/summary/`, `/share/`, `/couple/`, `/sign-in`, `/sign-up`.

## Verification

- Local build and smoke checks are covered by T15.
- Production `/robots.txt` and `/sitemap.xml` cannot be verified until this branch is merged/deployed.
- Search Console status was not changed in this run; no Search Console credentials or manual indexing workflow was available in this session.
