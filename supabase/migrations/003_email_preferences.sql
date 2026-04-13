-- Email preferences + email send log for idempotent cron drips

alter table public.profiles
  add column if not exists email_opt_out boolean not null default false;

-- Track sent emails so the cron can avoid re-sending.
-- Keyed by (user_id, kind, context_id) so the same email+context is only sent once.
create table if not exists public.sent_emails (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  kind       text not null,
  context_id text,
  sent_at    timestamptz not null default now()
);

create unique index if not exists sent_emails_unique_idx
  on public.sent_emails (user_id, kind, coalesce(context_id, ''));

alter table public.sent_emails enable row level security;

drop policy if exists "sent_emails_allow_all" on public.sent_emails;
create policy "sent_emails_allow_all"
  on public.sent_emails for all
  using (true) with check (true);
