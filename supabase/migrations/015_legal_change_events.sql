-- =============================================================================
-- LANDLORD HEAVEN - LEGAL CHANGE EVENTS PERSISTENCE
-- =============================================================================
-- Migration 015: Persistent storage for legal change events
-- Fixes issue where events were stored in-memory and lost on serverless restart
-- =============================================================================

-- =============================================================================
-- 1. LEGAL_CHANGE_EVENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.legal_change_events (
  id TEXT PRIMARY KEY,

  -- Source information
  source_id TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  reference_url TEXT NOT NULL,

  -- Detection metadata
  detected_at TIMESTAMPTZ NOT NULL,
  detection_method TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'manual', 'webhook', 'external_alert'

  -- Scope (stored as JSON arrays)
  jurisdictions JSONB NOT NULL DEFAULT '[]',
  topics JSONB NOT NULL DEFAULT '[]',

  -- Content
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  diff_summary TEXT,
  extracted_notes TEXT,
  raw_content TEXT,

  -- Trust and confidence
  trust_level TEXT NOT NULL DEFAULT 'authoritative',
  confidence_level TEXT NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low', 'unverified'

  -- Workflow state
  state TEXT NOT NULL DEFAULT 'new', -- 'new', 'triaged', 'action_required', 'no_action', 'implemented', 'rolled_out', 'closed'
  state_history JSONB NOT NULL DEFAULT '[]',

  -- Impact assessment (JSON blob when assessed)
  impact_assessment JSONB,

  -- Related items (JSON arrays)
  related_event_ids JSONB DEFAULT '[]',
  linked_pr_urls JSONB DEFAULT '[]',
  linked_rollout_ids JSONB DEFAULT '[]',
  linked_incident_ids JSONB DEFAULT '[]',

  -- Metadata
  created_by TEXT NOT NULL,
  assigned_to TEXT,
  tags JSONB DEFAULT '[]',
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.legal_change_events ENABLE ROW LEVEL SECURITY;

-- Service role for management (cron jobs and admin APIs run with service role)
CREATE POLICY "Service role manages legal_change_events"
  ON public.legal_change_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read events (for admin dashboard)
CREATE POLICY "Authenticated users can read legal_change_events"
  ON public.legal_change_events FOR SELECT
  TO authenticated
  USING (true);

-- =============================================================================
-- 2. INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_legal_change_events_state ON public.legal_change_events(state);
CREATE INDEX IF NOT EXISTS idx_legal_change_events_source ON public.legal_change_events(source_id);
CREATE INDEX IF NOT EXISTS idx_legal_change_events_created ON public.legal_change_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_change_events_updated ON public.legal_change_events(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_change_events_detected ON public.legal_change_events(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_change_events_assigned ON public.legal_change_events(assigned_to) WHERE assigned_to IS NOT NULL;

-- GIN indexes for JSONB searches
CREATE INDEX IF NOT EXISTS idx_legal_change_events_jurisdictions ON public.legal_change_events USING GIN (jurisdictions);
CREATE INDEX IF NOT EXISTS idx_legal_change_events_topics ON public.legal_change_events USING GIN (topics);
CREATE INDEX IF NOT EXISTS idx_legal_change_events_tags ON public.legal_change_events USING GIN (tags);

-- =============================================================================
-- 3. TRIGGER FOR updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_legal_change_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS legal_change_events_updated_at ON public.legal_change_events;
CREATE TRIGGER legal_change_events_updated_at
  BEFORE UPDATE ON public.legal_change_events
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_change_events_updated_at();

-- =============================================================================
-- 4. COMMENTS
-- =============================================================================
COMMENT ON TABLE public.legal_change_events IS 'Persistent storage for legal change events detected by the monitoring system';
COMMENT ON COLUMN public.legal_change_events.state IS 'Workflow state: new, triaged, action_required, no_action, implemented, rolled_out, closed';
COMMENT ON COLUMN public.legal_change_events.state_history IS 'Array of state transition records with timestamps, actors, and reasons';
COMMENT ON COLUMN public.legal_change_events.impact_assessment IS 'Impact analysis results including severity, affected rules, and required actions';

-- =============================================================================
-- MIGRATION 015 COMPLETE
-- =============================================================================
