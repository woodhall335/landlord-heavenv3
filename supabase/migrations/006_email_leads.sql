-- =============================================================================
-- EMAIL LEADS TABLES
-- =============================================================================
-- Tables for email subscriber management and event tracking
-- These are internal tables - service role access only
-- =============================================================================

-- Email Subscribers Table
CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  source TEXT,
  jurisdiction TEXT,
  last_case_id UUID
);

-- Email Events Table
CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS email_events_email_idx ON public.email_events(email);
CREATE INDEX IF NOT EXISTS email_events_created_at_idx ON public.email_events(created_at DESC);
CREATE INDEX IF NOT EXISTS email_subscribers_email_idx ON public.email_subscribers(email);
CREATE INDEX IF NOT EXISTS email_subscribers_created_at_idx ON public.email_subscribers(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
-- These are internal tables - only service role can access

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Service role can manage email subscribers
CREATE POLICY "Service role manages email_subscribers"
  ON public.email_subscribers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Service role can manage email events
CREATE POLICY "Service role manages email_events"
  ON public.email_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
