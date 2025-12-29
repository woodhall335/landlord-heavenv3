create table if not exists public.email_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  tags text[] not null default '{}'::text[],
  source text,
  jurisdiction text,
  last_case_id uuid
);

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_events_email_idx on public.email_events (email);
