# WillBuddy Remotion Ad — Spec & Scene Breakdown

**File:** `WillBuddyAd.tsx`
**Format:** 1080×1920 (9:16), 30fps, 720 frames = **24 seconds**
**Style:** Standard demo/promo ad — animated typography, a mock voice-chat UI, and a price-comparison payoff. No filmed footage required; renders entirely from code.
**Palette:** bg `#FAF8F5`, secondary `#F0EBE4`, accent `#5B7A5E`, text `#2D2A26`. Headline font Libre Baskerville.

## Scene-by-scene

| # | Frames | Time | On-screen text | Optional VO |
|---|--------|------|----------------|-------------|
| 1 | 0–90 | 0–3s | "You have little kids." → "You're busy. You keep meaning to make a plan." | *"You've got little kids and a full life. And a plan you keep meaning to make."* |
| 2 | 90–210 | 3–7s | "But a lawyer starts at $1,500… and half that meeting is them figuring out what you and your partner even want." | *"A lawyer starts around fifteen hundred dollars — and half of it is just figuring out what you want."* |
| 3 | 210–360 | 7–12s | Voice-chat bubbles: guardianship question → "we've never decided…" → "Take your time, we can come back to it." | *"So talk it out first. WillBuddy walks you both through it — by voice."* |
| 4 | 360–480 | 12–16s | Pills: Talk as long as you need · Pause & come back · Revisit any decision · Together or solo | *"No forms. No pressure. Pause and come back whenever you're ready."* |
| 5 | 480–600 | 16–20s | Cards: $1,500 lawyer vs **$49** WillBuddy — "review, not discovery." | *"Then walk in ready — so your lawyer's time goes to review, not discovery."* |
| 6 | 600–720 | 20–24s | Logo · "Estate planning you actually finish." · **Start for free →** · $49 · Texas families | *"WillBuddy. Start for free."* |

## Notes
- **Captions:** VO is optional; the ad reads fully with sound off (Meta/IG best practice). If you add VO, burn matching captions in the safe zone.
- **Music:** warm, unhurried piano/acoustic bed; no dramatic sting (stay on-brand calm).
- **Alt aspect ratios:** change `width`/`height` in the `Composition` — 1080×1080 (square, Meta feed) and 1200×675 (X in-stream) both work; the max-width containers scale down gracefully. For 16:9 shorten to ~15s by trimming Scene 3–4 hold frames.
- **Compliance:** never says "will is legal"/"binding" — frames output as prep for a Texas attorney.

## Render
```bash
npm i remotion @remotion/cli @remotion/google-fonts
npx remotion render WillBuddyAd out/willbuddy-ad.mp4
# square variant after editing Composition dims:
npx remotion render WillBuddyAd out/willbuddy-ad-1x1.mp4
```
