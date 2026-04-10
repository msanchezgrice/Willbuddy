# WillBuddy

Voice-first AI estate planning coach for new parents in Texas.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- **Voice:** Google Gemini 3.1 Flash Live via @google/genai (client-side WebSocket)
- **Database + Auth:** Supabase (Postgres + Auth + Realtime + Storage)
- **Payments:** Stripe Checkout
- **PDF:** @react-pdf/renderer
- **Hosting:** Vercel (Pro plan)

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

- Voice WebSocket runs CLIENT-SIDE (browser to Gemini directly). No Vercel Functions in the voice path.
- Gemini API key stays server-side. Client gets ephemeral token via `/api/gemini/token`.
- Supabase handles auth, persistence, and real-time state sync.
- All tool call args are validated server-side against VALID_DECISION_KEYS whitelist.
- Documents generated from attorney-reviewed templates with variable substitution, NOT AI-generated legal language.

## Design Tokens

```
Colors: bg=#FAF8F5, secondary=#F0EBE4, accent=#5B7A5E, text=#2D2A26
Typography: Headings=Libre Baskerville (serif), Body=system-ui
Spacing: 8px grid, cards 24px padding, 16px border-radius
```

## Conventions

- Types in `src/types/index.ts`
- Supabase clients in `src/lib/supabase/`
- Gemini code in `src/lib/gemini/`
- Document templates in `src/lib/documents/templates/`
- RLS policies live in `supabase/migrations/`

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
