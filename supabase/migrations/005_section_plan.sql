-- WillBuddy: Tailored section plans
-- Stores the computed, onboarding-driven flow of modules for a session so the
-- voice assistant, the sidebar, progress, and document generation all agree on
-- which sections are in scope and in what order. Additive-only and idempotent.

alter table public.sessions
  add column if not exists section_plan text[];

alter table public.sessions
  add column if not exists goals jsonb;

comment on column public.sessions.section_plan is
  'Ordered list of in-scope module ids for this session, e.g. {family,guardianship,healthcare}. Null means the legacy all-5 default.';

comment on column public.sessions.goals is
  'What the user chose to cover: { preset: string | null, modules: string[] } from the onboarding "what do you need" step.';
