-- WillBuddy: Async Couple Mode
-- Adds couple_sessions table, session mode, couple linkage, and decision reasoning.
-- Additive-only and idempotent (profiles/sessions Clerk text-id changes already
-- applied in production via dashboard).

-- ============================================================
-- 1. COUPLE_SESSIONS
-- ============================================================
create table if not exists public.couple_sessions (
  id                   uuid primary key default gen_random_uuid(),
  primary_session_id   uuid not null references public.sessions(id) on delete cascade,
  partner_session_id   uuid references public.sessions(id) on delete set null,
  invite_token         text unique not null,
  invite_email         text,
  invite_expires_at    timestamptz,
  status               text not null default 'awaiting_partner',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists couple_sessions_primary_idx
  on public.couple_sessions (primary_session_id);
create index if not exists couple_sessions_partner_idx
  on public.couple_sessions (partner_session_id);
create unique index if not exists couple_sessions_invite_token_idx
  on public.couple_sessions (invite_token);

alter table public.couple_sessions enable row level security;

-- Clerk handles auth; server-side uses service role, so allow_all is safe
drop policy if exists "couple_sessions_allow_all" on public.couple_sessions;
create policy "couple_sessions_allow_all"
  on public.couple_sessions for all
  using (true) with check (true);

-- ============================================================
-- 2. SESSIONS: mode + couple_session_id
-- ============================================================
alter table public.sessions
  add column if not exists mode text not null default 'solo';

alter table public.sessions
  add column if not exists couple_session_id uuid
  references public.couple_sessions(id) on delete set null;

create index if not exists sessions_couple_session_idx
  on public.sessions (couple_session_id);

-- ============================================================
-- 3. DECISIONS: reasoning (WHY not just WHAT)
-- ============================================================
alter table public.decisions
  add column if not exists reasoning text;
