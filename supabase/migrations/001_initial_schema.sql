-- WillBuddy Initial Schema
-- Voice-first AI estate planning coach

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  full_name     text,
  partner_name  text,
  state         text default 'TX',
  stripe_customer_id text,
  created_at    timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- 2. SESSIONS
-- ============================================================
create table public.sessions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  status               text default 'in_progress',
  current_section      text default 'family',
  sections_completed   text[] default '{}',
  gemini_resume_handle text,
  started_at           timestamptz default now(),
  completed_at         timestamptz,
  user_confirmed       boolean default false
);

alter table public.sessions enable row level security;

create policy "Users can read own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.sessions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3. DECISIONS
-- ============================================================
create table public.decisions (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.sessions(id) on delete cascade,
  section        text not null,
  key            text not null,
  value          text not null,
  user_confirmed boolean default false,
  confidence     text default 'decisive',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (session_id, section, key)
);

alter table public.decisions enable row level security;

create policy "Users can read own decisions"
  on public.decisions for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = decisions.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can insert own decisions"
  on public.decisions for insert
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = decisions.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can update own decisions"
  on public.decisions for update
  using (
    exists (
      select 1 from public.sessions s
      where s.id = decisions.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can delete own decisions"
  on public.decisions for delete
  using (
    exists (
      select 1 from public.sessions s
      where s.id = decisions.session_id
        and s.user_id = auth.uid()
    )
  );

-- ============================================================
-- 4. TRANSCRIPT ENTRIES
-- ============================================================
create table public.transcript_entries (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  role       text not null check (role in ('ai', 'user')),
  content    text not null,
  timestamp  timestamptz default now()
);

alter table public.transcript_entries enable row level security;

create policy "Users can read own transcript entries"
  on public.transcript_entries for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = transcript_entries.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can insert own transcript entries"
  on public.transcript_entries for insert
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = transcript_entries.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can delete own transcript entries"
  on public.transcript_entries for delete
  using (
    exists (
      select 1 from public.sessions s
      where s.id = transcript_entries.session_id
        and s.user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. FLAGGED ITEMS
-- ============================================================
create table public.flagged_items (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  topic      text not null,
  reason     text,
  resolved   boolean default false,
  created_at timestamptz default now()
);

alter table public.flagged_items enable row level security;

create policy "Users can read own flagged items"
  on public.flagged_items for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = flagged_items.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can insert own flagged items"
  on public.flagged_items for insert
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = flagged_items.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can update own flagged items"
  on public.flagged_items for update
  using (
    exists (
      select 1 from public.sessions s
      where s.id = flagged_items.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can delete own flagged items"
  on public.flagged_items for delete
  using (
    exists (
      select 1 from public.sessions s
      where s.id = flagged_items.session_id
        and s.user_id = auth.uid()
    )
  );

-- ============================================================
-- 6. DOCUMENTS
-- ============================================================
create table public.documents (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references public.sessions(id) on delete cascade,
  doc_type         text not null,
  storage_path     text not null,
  share_token      text unique,
  share_expires_at timestamptz,
  created_at       timestamptz default now()
);

alter table public.documents enable row level security;

create policy "Users can read own documents"
  on public.documents for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = documents.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can insert own documents"
  on public.documents for insert
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = documents.session_id
        and s.user_id = auth.uid()
    )
  );

-- ============================================================
-- 7. PAYMENTS
-- ============================================================
create table public.payments (
  id                          uuid primary key default gen_random_uuid(),
  session_id                  uuid not null references public.sessions(id) on delete cascade,
  stripe_checkout_session_id  text unique,
  stripe_payment_intent_id    text,
  amount_cents                int not null,
  currency                    text default 'usd',
  status                      text default 'pending',
  created_at                  timestamptz default now(),
  completed_at                timestamptz
);

alter table public.payments enable row level security;

create policy "Users can read own payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = payments.session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can insert own payments"
  on public.payments for insert
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = payments.session_id
        and s.user_id = auth.uid()
    )
  );
