-- WillBuddy: Onboarding answers
-- Stores the pre-session onboarding quiz answers on the session so the voice
-- assistant can personalize the conversation and avoid re-asking (Texas,
-- children, couple-vs-individual, priority). Additive-only and idempotent.

alter table public.sessions
  add column if not exists onboarding jsonb;

comment on column public.sessions.onboarding is
  'Pre-session onboarding quiz answers: { planning_for, children, texas, priority, completedAt }';
