# WillBuddy — Higgsfield Video Ad Script

**Concept:** Emotional, cinematic slice-of-life. A young couple talks through the big, important things — kids, the future, "what if" — in warm, real moments at home. A calm voiceover (shown as closed captions) reframes it: *you have little kids, think about their future, you should have a plan.*
**Format:** 9:16 vertical, ~24–30s. Also export 1:1 and 16:9 via `reframe`.
**Tone:** tender, unhurried, hopeful — never fearful. Golden-hour, film-grain, shallow depth of field.
**Palette to bias prompts toward:** warm cream, sage green, soft natural light (matches brand bg `#FAF8F5` / accent `#5B7A5E`).

---

## Voiceover / Closed-caption script

Voiceover is soft and warm (female or neutral, mid-30s). Captions are burned in, one line at a time, high-contrast with a subtle scrim for readability.

| Beat | Caption (on screen) | VO |
|------|--------------------|----|
| 1 | *You have little kids.* | "You have little kids." |
| 2 | *A whole life you're building for them.* | "A whole life you're building for them." |
| 3 | *So think about their future.* | "So think about their future." |
| 4 | *Who'd raise them. What you'd want.* | "Who would raise them. What you'd want." |
| 5 | *These are big questions.* | "These are big questions." |
| 6 | *You should have a plan.* | "You should have a plan." |
| 7 | *Talk it through — then bring it to your lawyer.* | "Talk it through together — then bring it to your lawyer." |
| 8 (end card) | **WillBuddy · $49 · Texas families · Start for free** | "WillBuddy. Estate planning you actually finish." |

---

## Shot list & image prompts

Generate each still with `generate_image` (bias to a cinematic, warm, photorealistic model), then animate with `generate_video` using the described motion. Keep the **same couple** across shots — generate a character reference from Shot 1 and reuse it (character consistency) for Shots 2–6.

**Global style suffix (append to every image prompt):**
> photorealistic, cinematic, warm golden-hour natural light, soft film grain, shallow depth of field, 9:16 vertical, muted cream and sage tones, tender intimate mood, editorial photography

### Shot 1 — Establishing (Beat 1)
- **Image prompt:** "A young couple in their early 30s sitting close on a cozy living-room couch at golden hour, a toddler's toys scattered on the rug, both smiling softly as they talk, warm lamp light, out-of-focus family home in background." + global suffix
- **Motion:** slow push-in (dolly in), subtle. 3s.

### Shot 2 — The kids (Beat 2)
- **Image prompt:** "Over-the-shoulder view of the same couple watching their toddler play on the floor, parents' hands intertwined, soft warm window light, home interior." + global suffix
- **Motion:** gentle handheld sway, rack focus from parents to child. 3s.

### Shot 3 — The conversation (Beat 3–4)
- **Image prompt:** "The same couple at the kitchen table after dark, two mugs of tea, leaning in and talking seriously but warmly, one gesturing mid-sentence, soft pendant light overhead." + global suffix
- **Motion:** slow orbit / slight parallax around the table. 4s.

### Shot 4 — Reflection (Beat 5)
- **Image prompt:** "Close-up of the woman's thoughtful, hopeful face lit by warm light as she listens, slightly out-of-focus partner in foreground." + global suffix
- **Motion:** near-still, breathing motion, faint catchlight shimmer. 3s.

### Shot 5 — Together / resolve (Beat 6)
- **Image prompt:** "The same couple on the couch again, now looking at a tablet together, calm and relieved expressions, a phone showing a simple app interface glowing softly, cozy evening living room." + global suffix
- **Motion:** slow push-in on the shared screen. 3s.

### Shot 6 — Handoff (Beat 7)
- **Image prompt:** "The couple at a bright, tidy desk handing a neat folder of documents across to a friendly professional (attorney) in a warm office, confident and prepared body language." + global suffix
- **Motion:** subtle dolly, warm rack focus to the folder. 3s.

### Shot 7 — End card (Beat 8)
- **Not generated as photo.** Solid sage `#5B7A5E` card, "WillBuddy" in Libre Baskerville white, tagline "Estate planning you actually finish.", white CTA chip "Start for free →", footer "$49 · Texas families · mywillbuddy.com". 3s. (Can composite in edit or generate a plain branded frame.)

---

## Audio
- **VO:** warm, calm, unhurried. Optionally clone/select via Higgsfield `create_voice` / `list_voices`.
- **Music:** soft solo piano or fingerpicked acoustic, hopeful, low intensity. Duck under VO.
- **SFX:** minimal ambient room tone; a soft chime on the end-card CTA.

## Post / export
- Burn captions in the middle-safe zone; ensure legible with sound off.
- `reframe` to 1:1 (Meta feed) and 16:9 (YouTube/X) after the master 9:16 is locked.
- `upscale_video` to 2K/4K for paid placements.

## Compliance
- The attorney handoff shot reinforces "prepare for your lawyer," not "replace." Keep the end card's "$49 · Texas families." No "legal / binding / official" claims. Warm framing only — no fear of death imagery.

---

### Ready-to-run Higgsfield sequence (if generating in-session)
1. `generate_image` — Shot 1 → confirm → create character reference.
2. `generate_image` ×5 — Shots 2–6 reusing the character reference.
3. `generate_video` — animate each still with its motion note.
4. `create_voice` / `generate_audio` — VO track from the caption script.
5. Assemble, add captions + music, `reframe` + `upscale_video` for each placement.
