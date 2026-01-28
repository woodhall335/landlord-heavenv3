-- =============================================================================
-- LANDLORD HEAVEN - CRON RUNS TRACKING
-- =============================================================================
-- Migration 014: Cron run tracking for Phase 23 Admin Portal
-- Provides persistent storage for cron job execution history
-- =============================================================================

-- =============================================================================
-- 1. CRON_RUNS TABLE
-- =============================================================================
CREATE TABLE public.cron_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Job identification
  job_name TEXT NOT NULL,

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'success', 'partial', 'failed'
  duration_ms INTEGER,

  -- Metrics
  sources_checked INTEGER DEFAULT 0,
  events_created INTEGER DEFAULT 0,
  events_updated INTEGER DEFAULT 0,

  -- Issues
  errors JSONB DEFAULT '[]',
  warnings JSONB DEFAULT '[]',

  -- Output
  summary TEXT,
  raw_output TEXT,

  -- Trigger info
  triggered_by TEXT NOT NULL DEFAULT 'cron', -- 'cron', 'manual', 'webhook'
  triggered_by_user_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.cron_runs ENABLE ROW LEVEL SECURITY;

-- Service role for management (cron jobs run with service role)
CREATE POLICY "Service role manages cron_runs"
  ON public.cron_runs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read cron runs (for admin dashboard)
CREATE POLICY "Authenticated users can read cron_runs"
  ON public.cron_runs FOR SELECT
  TO authenticated
  USING (true);

-- Indexes for efficient queries
CREATE INDEX idx_cron_runs_job_name ON public.cron_runs(job_name);
CREATE INDEX idx_cron_runs_status ON public.cron_runs(status);
CREATE INDEX idx_cron_runs_started_at ON public.cron_runs(started_at DESC);
CREATE INDEX idx_cron_runs_job_started ON public.cron_runs(job_name, started_at DESC);

-- =============================================================================
-- 2. LEGAL_CHANGE_AUDIT_LOG TABLE
-- =============================================================================
-- Dedicated audit log for legal change workflow actions
CREATE TABLE public.legal_change_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event reference
  event_id TEXT NOT NULL,

  -- Action details
  action TEXT NOT NULL, -- Explicit action types
  actor TEXT NOT NULL,

  -- State tracking
  previous_state TEXT,
  new_state TEXT,

  -- Additional context
  details JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.legal_change_audit_log ENABLE ROW LEVEL SECURITY;

-- Service role for management
CREATE POLICY "Service role manages legal_change_audit_log"
  ON public.legal_change_audit_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read (for admin dashboard)
CREATE POLICY "Authenticated users can read legal_change_audit_log"
  ON public.legal_change_audit_log FOR SELECT
  TO authenticated
  USING (true);

-- Indexes
CREATE INDEX idx_legal_change_audit_event ON public.legal_change_audit_log(event_id);
CREATE INDEX idx_legal_change_audit_action ON public.legal_change_audit_log(action);
CREATE INDEX idx_legal_change_audit_created ON public.legal_change_audit_log(created_at DESC);

-- =============================================================================
-- 3. COMMENTS
-- =============================================================================
COMMENT ON TABLE public.cron_runs IS 'Tracks cron job executions for admin dashboard visibility';
COMMENT ON COLUMN public.cron_runs.job_name IS 'Name of the cron job (e.g., legal-change:check)';
COMMENT ON COLUMN public.cron_runs.status IS 'Execution status: running, success, partial, failed';
COMMENT ON COLUMN public.cron_runs.errors IS 'Array of error objects from the run';
COMMENT ON COLUMN public.cron_runs.warnings IS 'Array of warning strings from the run';

COMMENT ON TABLE public.legal_change_audit_log IS 'Audit trail for legal change workflow actions';
COMMENT ON COLUMN public.legal_change_audit_log.action IS 'Action type: triage, mark_action_required, push_pr_created, etc.';

-- =============================================================================
-- MIGRATION 014 COMPLETE
-- =============================================================================
