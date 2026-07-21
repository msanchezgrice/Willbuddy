<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# WillBuddy

Voice-first estate planning coach for Texas families (https://mywillbuddy.com). Users plan wills, guardianship, healthcare wishes, and powers of attorney by voice conversation or step-by-step answers; WillBuddy then generates Texas-compliant draft documents for attorney review. WillBuddy is not a law firm and does not provide legal advice — keep legal-adjacent copy conservative and never invent legal claims.

## Setup and commands

- `npm install` — install dependencies
- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — ESLint

## Project structure

- `src/app/` — Next.js App Router routes. `(marketing)/` holds public pages (homepage, guides, blog, tools, contact, legal pages); `onboarding/`, `session/`, `summary/`, `couple/` are authenticated product flows; `api/` holds route handlers (Stripe, Gemini token, contact, share, cron).
- `src/components/` — shared UI; `analytics/TrackedLink` is the standard tracked CTA primitive; `layout/Footer` and `layout/Header` are the marketing chrome.
- `src/lib/` — site config (`site.ts`), Stripe (`stripe.ts`, single $49 one-time price), Supabase, Gemini, document templates, analytics.
- `supabase/migrations/` — database schema and RLS.
- `public/` — static assets plus agent protocol files: `llms.txt`, `agents.md`, `.well-known/agent-card.json`, `.well-known/ai-agent.json`.
- `tests/` — standalone node smoke/test scripts (`tests/*.mjs`).

## Key routes

- `/` — marketing homepage: hero, how-it-works, documents, pricing ($49 one-time document package), FAQ.
- `/tools/*` — free no-account tools (readiness quiz, intestacy calculator, cost calculator, POA navigator).
- `/guides/*`, `/blog/*`, `/texas-estate-planning`, `/research` — source-linked educational content.
- `/onboarding`, `/session`, `/summary/[id]` — authenticated planning flows; `/api/stripe/checkout` starts Stripe Checkout.

## How agents should interact

- Site-level agent guidance lives at `public/agents.md` (served at `/agents.md`); machine manifests at `/.well-known/agent-card.json` and `/.well-known/ai-agent.json` (includes guardrails).
- Public content is fair to read and cite. Account creation, purchases, and form submissions require explicit user confirmation; the purchase CTA is marked with `data-agent-danger="payment"`.
- Interactive elements carry `data-testid` selectors; primary CTAs carry `data-agent-action`; navigation containers carry `data-agent-nav`; the contact form carries `data-agent-form`.
- Pricing appears only on the homepage — keep any price references in sync with the visible price and `src/lib/stripe.ts` (currently $49 one-time).
