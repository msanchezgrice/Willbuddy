# WillBuddy Content Calendar Index

Updated: 2026-06-27

This is the shared Warm Start `contentCalendarPath` for post-launch recurring automations. It points each recurring content surface to the most specific launch artifact while preserving the approval gate: do not publish posts, start recurring automations, or mutate provider accounts until Miguel explicitly approves post-launch recurring activation.

## Source Files

| Surface | Source | Use |
|---|---|---|
| Blog / SEO | `docs/launch/t09-content-calendar.md` | `blog_post_live` planning and SEO topic queue |
| X / Facebook / YouTube | `docs/launch/t11-content-calendar.md` | Social post drafts and channel video concepts |
| Paid and launch creative | `docs/launch/t14-marketing-creative.md` | Hooks, captions, ad/video concepts, claims guardrails |
| UTM map | `docs/launch/t14-utm-map.csv` | Campaign naming and attribution parameters |

## Recurring Automation Routing

- `blog_post_live`: use `docs/launch/t09-content-calendar.md` plus `docs/launch/t09-seo-indexing.md`.
- `tweets_news`: use `docs/launch/t11-content-calendar.md`; requires verified `xHandle` and `xProfileUrl`.
- `fb_page_post`: use `docs/launch/t11-content-calendar.md`; requires verified `facebookPageUrl` and stable `facebookPageIds`.
- `channel_video`: use `docs/launch/t11-content-calendar.md`; requires verified `youtubeChannelUrl` and `videoSurfaceUrls`.

## Current Social Surface Blockers

- X: no verified owned account. `https://x.com/mywillbuddy` returned 404 on 2026-06-27.
- Facebook: no verified owned page URL or stable page ID.
- YouTube: no verified owned channel. `https://www.youtube.com/@mywillbuddy` returned 404 on 2026-06-27.

Keep recurring social automations disabled until those primitives are verified and Miguel approves activation.
