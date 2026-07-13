# WillBuddy organic sprint baseline — 2026-07-13

This is an instrumentation baseline captured immediately after the tool launch and mobile QA. It is not an organic-performance baseline because most observed activity came from launch verification sessions.

## Production health

- Tools hub, five tool experiences, suite roundup, and research report returned `200` on `mywillbuddy.com`.
- Each audited URL exposed a self-referencing canonical.
- All audited URLs appeared in `https://mywillbuddy.com/sitemap.xml`.
- Google Search Console indexing inspection and submission are tracked separately because a successful live response does not prove index inclusion.

## PostHog instrumentation proof

Project: `willbuddy-voice-first-estate-planning` (`464452`)  
Window start: `2026-07-13 00:00:00 UTC`

| Event | Count | Distinct people | Notes |
| --- | ---: | ---: | --- |
| `$pageview` | 35 | 4 | Launch and QA traffic |
| `tool_started` | 6 | 3 | Event and `tool` property verified |
| `tool_completed` | 1 | 1 | Power-of-attorney navigator QA completion |
| `tool_cta_clicked` | 1 | 1 | Navigator result CTA |
| `onboarding_started` | 1 | 1 | Followed the tool CTA |
| `texas_readiness_survey_completed` | 0 | 0 | No completed research response observed |

Observed `tool_started` breakdown:

| Tool | Starts | Distinct people |
| --- | ---: | ---: |
| `estate_planning_readiness` | 4 | 2 |
| `texas_power_of_attorney_navigator` | 1 | 1 |
| `will_trust_decision` | 1 | 1 |

## Measurement rule for promotion

- Treat the counts above as instrumentation proof, not acquisition performance.
- Use the approved `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content` values in every owned and partner placement.
- Report page view → tool start → tool completion → CTA click → onboarding start by tool and UTM.
- Keep research completions separate from product signups and exclude known staff/test responses from any publishable research dataset.
- Update the operating scoreboard with zeros rather than blanks when a conversion step has no verified events.
