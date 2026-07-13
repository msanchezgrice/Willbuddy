# WillBuddy Video Studio

An isolated Remotion package for the free Texas estate-planning tools. It does not import from or change the production Next.js app.

## Deliverables

- `SuiteOverview`: 75-second, 16:9 overview of all five tools.
- `Tool-readiness`: 30-second, 9:16 readiness-check short.
- `Tool-will-trust`: 30-second, 9:16 will-vs.-trust short.
- `Tool-intestacy`: 30-second, 9:16 intestacy-visualizer short.
- `Tool-cost`: 30-second, 9:16 cost-calculator short.
- `Tool-poa`: 30-second, 9:16 power-of-attorney navigator short.
- `Thumbnail-WillVsTrust`: 1280×720 search-video thumbnail.
- `Thumbnail-TexasCosts`: 1280×720 search-video thumbnail.
- `content/search-videos/`: scripts, storyboards, captions, and publishing metadata for the two long search videos.

The rendered motion pieces are intentionally presenter-free. Every interaction is based on a real WillBuddy question or result pattern. There are no fictional lawyers, customers, testimonials, or legal outcomes.

## Run locally

```bash
cd video
npm install
npm run studio
```

Remotion Studio opens the full composition list for review.

## Render

```bash
npm run render:suite
npm run render:shorts
npm run render:thumbnails
```

Or render everything:

```bash
npm run render:all
```

Outputs go to `video/output/`. MP4 and PNG renders are gitignored; keep the source package in version control and upload approved masters to the publishing destination or media storage.

## Production workflow

1. Review wording against the live tool and linked Texas primary sources.
2. Record narration from the scripts or publish the short cutdowns as caption-led motion pieces.
3. Replace the UI mock with a real screen capture only when the live interaction materially improves clarity. Keep the same composition timing and disclaimers.
4. Run a final legal-claim pass. The videos must say `educational`, `starting point`, `may`, and `illustration` where appropriate—never guarantee a result.
5. Export a clean master and a captioned social version.
6. Upload the long videos to YouTube with the matching `.srt` file and the exact tool URL in the first two description lines.
7. Embed the long video on its matching article or tool page only after the video is public and the page change is separately reviewed.

## Narration and music

Narration is deliberately not synthesized into the repository. The compositions work without audio because the key message is carried on screen. For final long-form exports:

- Aim for 145–160 spoken words per minute.
- Use a calm, plain-English delivery; avoid an attorney or authority impersonation.
- Keep music at least 18 dB under narration.
- Do not use generated spokesperson footage.

## Optional Higgsfield hook

`higgsfield-hook-prompt.md` contains a bounded 3-second abstract opener. It contains no people, legal imagery, or generated UI. Use it only behind Remotion typography and only if it improves the first three seconds. The tool demo should remain real UI or the deterministic mock in this package.

## URLs

| Video | Destination |
|---|---|
| Readiness | `https://mywillbuddy.com/tools/estate-planning-readiness` |
| Will vs. trust | `https://mywillbuddy.com/blog/wills-vs-trusts-texas` |
| Intestacy | `https://mywillbuddy.com/tools/texas-intestacy-calculator` |
| Cost ranges | `https://mywillbuddy.com/tools/texas-estate-planning-cost-calculator` |
| POA navigator | `https://mywillbuddy.com/tools/texas-power-of-attorney-navigator` |

## Safe-area notes

- The 9:16 cutdowns keep essential text within the central 80% of the frame.
- Platform overlays still vary. Preview in YouTube Shorts, Instagram Reels, and X before publishing.
- Keep captions above the bottom CTA/navigation zone.
