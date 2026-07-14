# WillBuddy paid-ads launch kit

Prepared July 14, 2026 for the Texas tools campaign. Nothing in this folder authorizes spend.

## Current activation status

- Google Ads account `824-798-0358`: Search campaign draft `Search | TX Tools | Jul 2026 | PAUSED` exists, with Texas presence targeting, Search-only inventory, click-focused bidding, an $8 maximum CPC, exact/phrase keywords, one responsive search ad, four sitelinks, and four callouts. Google is requiring an account-owner **Confirm it's you** check before it will save the final budget/review step. The campaign is not published.
- Meta Ads: creative and an import blueprint are ready. Creation is blocked until a WillBuddy-specific Meta ad account, Facebook Page, and Pixel/Dataset are available. Do not use another product's account or dataset.
- GA4: measurement ID `G-T00BH5C80B` is implemented locally in `src/app/layout.tsx` and covered by `tests/google-analytics-tag.test.mjs`. It is not live until the site change is reviewed, committed, and deployed.
- Conversion optimization: do not activate spend until `tool_completed` is verified in GA4 and imported as the Google Ads primary conversion. Keep `signup` secondary until the event exists and is tested.

## Creative assets

| Concept | Static | Video | Destination |
| --- | --- | --- | --- |
| A: Texas law decides | `stills/a-intestacy-lifestyle-v2.png` | `../remotion-ads/out/toolshook-vertical.mp4` and `toolshook-square.mp4` | `/tools/texas-intestacy-calculator` |
| B: cost transparency | `stills/b-cost-editorial-v2.png` | — | `/tools/texas-estate-planning-cost-calculator` |
| C: voice ease | `stills/c-voice-lifestyle-v2.png` | `videos/higgsfield-ugc-voice-vertical.mp4` | `/tools` |

The V2 lifestyle stills are high-resolution portrait masters and should use placement-safe cropping in Meta; the cost still is native 4:5. Remotion exports are 1080×1920 and 1080×1080; the Higgsfield UGC export is 720×1280 with audio.

QA contact sheets are in `qa/`. The image and video masters contain no claims that WillBuddy replaces a lawyer. Use this compliance line in primary text or the first comment:

> WillBuddy is not a law firm and does not provide legal advice. Documents are drafts for review by a licensed attorney. Texas residents.

## Planned spend after approval

- Meta prospecting: $30/day.
- Google Search: $16/day.
- Meta 30-day retargeting: $3/day after the audience and conversion exclusions populate.

## Activation checklist

1. Account owner completes Google's **Confirm it's you** check.
2. Set the Google Search custom daily budget to $16 and verify the campaign remains paused before publishing.
3. Deploy GA4 and confirm a live `page_view` in property `G-T00BH5C80B`.
4. Map a tested `tool_completed` event to GA4 and import it into Google Ads as the primary conversion.
5. Create or assign the WillBuddy Meta ad account, Page, and Pixel/Dataset; verify `PageView`, `tool_started`, and `tool_completed`.
6. Apply `imports/google-negative-keywords.csv` before Google activation.
7. Upload the Meta assets from this folder using `imports/meta-campaign-blueprint.csv` and leave every campaign, ad set, and ad paused.
8. Review previews, policy disclosures, billing, budgets, exclusions, and UTMs before explicitly authorizing spend.
