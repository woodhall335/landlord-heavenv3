-- =============================================================================
-- LANDLORD HEAVEN - SECTION 13 HARDENING V3
-- =============================================================================
-- Migration 018: immutable paid-output snapshots, idempotent tribunal bundle
-- jobs, and Defensive Pack support tracking for the England Section 13 flow.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.section13_output_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  rules_version TEXT NOT NULL,
  form_asset_version TEXT NOT NULL,
  form_asset_sha256 TEXT NOT NULL,
  state_snapshot_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  preview_metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  defensibility_summary_sentence TEXT NOT NULL,
  justification_summary_text TEXT NOT NULL,
  justification_narrative_text TEXT NOT NULL,
  comparable_snapshot_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.section13_output_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view section13_output_snapshots through case"
  ON public.section13_output_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_output_snapshots.case_id
      AND (
        c.user_id = auth.uid()
        OR (c.user_id IS NULL AND c.session_token = current_setting('request.headers.x-session-token', true))
      )
    )
  );

CREATE POLICY "Service role manages section13_output_snapshots"
  ON public.section13_output_snapshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE UNIQUE INDEX IF NOT EXISTS idx_section13_output_snapshots_order_id
  ON public.section13_output_snapshots(order_id);

CREATE INDEX IF NOT EXISTS idx_section13_output_snapshots_case_id_created_at
  ON public.section13_output_snapshots(case_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.section13_bundle_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  output_snapshot_id UUID NOT NULL REFERENCES public.section13_output_snapshots(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  generation_mode TEXT NOT NULL DEFAULT 'sync',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  retry_after TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  peak_rss_mb INTEGER,
  warning_count INTEGER NOT NULL DEFAULT 0,
  failure_type TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.section13_bundle_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view section13_bundle_jobs through case"
  ON public.section13_bundle_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_bundle_jobs.case_id
      AND (
        c.user_id = auth.uid()
        OR (c.user_id IS NULL AND c.session_token = current_setting('request.headers.x-session-token', true))
      )
    )
  );

CREATE POLICY "Service role manages section13_bundle_jobs"
  ON public.section13_bundle_jobs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE UNIQUE INDEX IF NOT EXISTS idx_section13_bundle_jobs_case_idempotency
  ON public.section13_bundle_jobs(case_id, idempotency_key);

CREATE INDEX IF NOT EXISTS idx_section13_bundle_jobs_case_id_created_at
  ON public.section13_bundle_jobs(case_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_section13_bundle_jobs_case_id_status
  ON public.section13_bundle_jobs(case_id, status, created_at DESC);

CREATE TRIGGER update_section13_bundle_jobs_updated_at
  BEFORE UPDATE ON public.section13_bundle_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.section13_support_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  latest_conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  handling_mode TEXT NOT NULL DEFAULT 'automated',
  intent_code TEXT NOT NULL,
  blocked_reason TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  deadline_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'received',
  assigned_to TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.section13_support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view section13_support_requests through case"
  ON public.section13_support_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_support_requests.case_id
      AND (
        c.user_id = auth.uid()
        OR (c.user_id IS NULL AND c.session_token = current_setting('request.headers.x-session-token', true))
      )
    )
  );

CREATE POLICY "Service role manages section13_support_requests"
  ON public.section13_support_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_section13_support_requests_case_id_created_at
  ON public.section13_support_requests(case_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_section13_support_requests_case_id_status
  ON public.section13_support_requests(case_id, status, created_at DESC);
