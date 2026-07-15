# WillBuddy paid-ads launch kit

Prepared July 14, 2026 for the Texas tools campaign. Nothing in this folder authorizes spend.

## Current activation status

- **July 15 controlled utility iteration:** Meta ad account `1335549898788063` is live at a fixed $30/day campaign budget. A remains on `/tools/texas-intestacy-calculator`; B remains on `/tools/texas-estate-planning-cost-calculator`; C is paused because no public voice-first route matches its promise. The reporting KPI is now `ToolStart` / `ToolComplete`; LPV remains the bidding control until start volume is sufficient for a same-budget optimization test.
- Google Ads provider settings require a fresh signed-in dashboard verification before changing the live campaign. The local keyword import already maps intestacy and cost intent directly to their matching tools; do not infer that those keyword-level URLs are live without provider readback.
- Google Ads account `824-798-0358`: campaign `24026704287` was last provider-verified live and Eligible/Learning on July 14 at a $16/day budget. The single responsive search ad used generic `/tools`; a fresh signed-in provider read is required before changing its live destination or ad-group structure.
- Meta Ads: account `1335549898788063`, campaign `52545550655410`, ad set `52545551089810`, and Pixel/Dataset `2542612909548568` are live. A and B use their direct tool destinations; C is paused as of July 15 for message mismatch.
- GA4 `G-T00BH5C80B`, Google Ads tag `AW-18323307402`, Meta Pixel `2542612909548568`, and PostHog project `464452` are deployed. `tool_started` and `tool_completed` are the primary utility-validation events.

## Creative assets

| Concept | Static | Video | Destination |
| --- | --- | --- | --- |
| A: Texas law decides | `stills/a-intestacy-lifestyle-v2.png` | `../remotion-ads/out/toolshook-vertical.mp4` and `toolshook-square.mp4` | `/tools/texas-intestacy-calculator` |
| B: cost transparency | `stills/b-cost-editorial-v2.png` | — | `/tools/texas-estate-planning-cost-calculator` |
| C: voice ease | `stills/c-voice-lifestyle-v2.png` | `videos/higgsfield-ugc-voice-vertical.mp4` | Paused — no matching public voice-first route |

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
7. Keep A and B on their matching tool routes. Keep C paused until a public voice-first route matches its promise.
8. Review previews, policy disclosures, billing, budgets, exclusions, and UTMs before explicitly authorizing spend.
