# WillBuddy — Agent Guide

WillBuddy (https://mywillbuddy.com) is a voice-first estate planning coach for Texas families. It walks users through wills, guardianship, healthcare wishes, and powers of attorney by conversation or step-by-step answers, and generates Texas-compliant draft documents for attorney review. WillBuddy is not a law firm and does not provide legal advice.

## Onboarding for agents

1. Read `/llms.txt` for a map of key pages.
2. Read `/.well-known/agent-card.json` for capabilities and `/.well-known/ai-agent.json` for guardrails.
3. Use the semantic landmarks on each page: `header`/`nav` (primary), `main`, `footer`. Primary actions carry `data-agent-action` attributes; stable selectors use `data-testid`.

## Safe actions (no account needed)

- Browse marketing pages, guides, blog, and research: `/`, `/texas-estate-planning`, `/guides/*`, `/blog/*`, `/research`.
- Use the free tools under `/tools/*` — they run client-side and require no account.
- Read pricing on the homepage (`#pricing` area): one plan, $49 one-time.

## Actions requiring care

- Account creation, signing in, starting or editing a planning session: only with the explicit direction of the user who owns the account.
- Purchases: the "Unlock documents — $49" button (`data-agent-action="purchase"`, `data-agent-danger="payment"`) starts Stripe Checkout. Never initiate a purchase without explicit user confirmation; final confirmation happens on Stripe's hosted checkout page.
- Contact form (`data-agent-form="contact"`): do not include the user's sensitive estate-planning answers in messages.

## Prohibited actions

- Providing legal advice or presenting generated documents as final/executed legal instruments.
- Creating accounts, starting paid checkout, or submitting forms on behalf of a user without explicit confirmation.
- Attempting to access another user's sessions, documents, or share links.

## Canonical links

- Homepage: https://mywillbuddy.com
- Pricing: https://mywillbuddy.com (homepage pricing section)
- Support: support@mywillbuddy.com · https://mywillbuddy.com/contact
- Policies: /privacy · /terms · /refunds
