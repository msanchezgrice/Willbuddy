# T15 Launch QA

Date: 2026-06-11

## Implemented

- Added `npm run smoke:launch`.
- Added `tests/launch-smoke.mjs`.

## Coverage

The smoke script checks:

- `/`
- `/contact`
- `/privacy`
- `/terms`
- `/robots.txt`
- `/sitemap.xml`
- `/opengraph-image`
- `/sign-in`
- `/sign-up`
- `/api/contact` validation behavior

## Usage

```bash
npm run smoke:launch
SMOKE_BASE_URL=https://willbuddy.vercel.app EXPECTED_SITE_URL=https://willbuddy.vercel.app npm run smoke:launch
```

## Verification

- `npm run build` passed on 2026-06-11.
- Local server smoke passed on 2026-06-11:
  `SMOKE_BASE_URL=http://localhost:3000 npm run smoke:launch`
- Playwright loaded `/` and `/contact` successfully at `http://localhost:3000`.
- Browser console had no errors. The only warning observed was Clerk's
  development-key warning from local auth configuration.
- Starting `next start` bound to `127.0.0.1` caused Next proxy failures in this
  local environment; starting it with `--hostname localhost` resolved the smoke
  failures.
- Production smoke should be run after merge/deploy with `SMOKE_BASE_URL` set to
  the production URL.
