-- =============================================================================
-- LANDLORD HEAVEN - EMAIL LEADS
-- =============================================================================
-- Migration 006: Email subscriber management and event tracking
-- =============================================================================

-- =============================================================================
-- 1. EMAIL_SUBSCRIBERS TABLE
-- =============================================================================
CREATE TABLE public.email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,

  -- Source tracking
  source TEXT, -- 'wizard', 'popup', 'footer', 'checkout'
  jurisdiction TEXT, -- 'england', 'scotland', etc.

  -- Case association
  last_case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,

  -- Tags for segmentation
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],

  -- Activity tracking
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Service role only (internal table)
CREATE POLICY "Service role manages email_subscribers"
  ON public.email_subscribers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_email_subscribers_email ON public.email_subscribers(email);
CREATE INDEX idx_email_subscribers_source ON public.email_subscribers(source);
CREATE INDEX idx_email_subscribers_jurisdiction ON public.email_subscribers(jurisdiction);
CREATE INDEX idx_email_subscribers_created_at ON public.email_subscribers(created_at DESC);
CREATE INDEX idx_email_subscribers_tags ON public.email_subscribers USING GIN(tags);

-- =============================================================================
-- 2. EMAIL_EVENTS TABLE
-- =============================================================================
CREATE TABLE public.email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,

  -- Event details
  event_type TEXT NOT NULL, -- 'lead_captured', 'email_sent', 'email_opened', 'link_clicked'
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Service role only (internal table)
CREATE POLICY "Service role manages email_events"
  ON public.email_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_email_events_email ON public.email_events(email);
CREATE INDEX idx_email_events_event_type ON public.email_events(event_type);
CREATE INDEX idx_email_events_created_at ON public.email_events(created_at DESC);

-- =============================================================================
-- MIGRATION 006 COMPLETE
-- =============================================================================
