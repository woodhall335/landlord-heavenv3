-- =============================================================================
-- LANDLORD HEAVEN - SECTION 13 WIZARD
-- =============================================================================
-- Migration 017: Section 13 rent increase workflow, comparables, evidence, and
-- bundle manifests for the post-1 May 2026 England assured tenancy flow.
-- =============================================================================

ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS workflow_status TEXT,
  ADD COLUMN IF NOT EXISTS workflow_status_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_cases_workflow_status
  ON public.cases(workflow_status);

CREATE TABLE IF NOT EXISTS public.section13_comparables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  postcode_raw TEXT,
  postcode_normalized TEXT,
  bedrooms INTEGER,
  source TEXT NOT NULL DEFAULT 'manual_unlinked',
  source_url TEXT,
  source_domain TEXT,
  source_date_value DATE,
  source_date_kind TEXT NOT NULL DEFAULT 'unknown',
  address_snippet TEXT,
  property_type TEXT,
  listed_at TIMESTAMPTZ,
  distance_miles NUMERIC(5, 2),
  raw_rent_value NUMERIC(10, 2),
  raw_rent_frequency TEXT,
  monthly_equivalent NUMERIC(10, 2),
  weekly_equivalent NUMERIC(10, 2),
  adjusted_monthly_equivalent NUMERIC(10, 2),
  is_manual BOOLEAN NOT NULL DEFAULT FALSE,
  scrape_batch_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.section13_comparables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view section13_comparables through case"
  ON public.section13_comparables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_comparables.case_id
      AND (
        c.user_id = auth.uid()
        OR (c.user_id IS NULL AND c.session_token = current_setting('request.headers.x-session-token', true))
      )
    )
  );

CREATE POLICY "Users can insert section13_comparables through case"
  ON public.section13_comparables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_comparables.case_id
      AND (c.user_id = auth.uid() OR c.user_id IS NULL)
    )
  );

CREATE POLICY "Users can update section13_comparables through case"
  ON public.section13_comparables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_comparables.case_id
      AND (
        c.user_id = auth.uid()
        OR (c.user_id IS NULL AND c.session_token = current_setting('request.headers.x-session-token', true))
      )
    )
  );

CREATE POLICY "Service role manages section13_comparables"
  ON public.section13_comparables FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_section13_comparables_case_id
  ON public.section13_comparables(case_id);

CREATE INDEX IF NOT EXISTS idx_section13_comparables_sort_order
  ON public.section13_comparables(case_id, sort_order);

CREATE TRIGGER update_section13_comparables_updated_at
  BEFORE UPDATE ON public.section13_comparables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.section13_comparable_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  comparable_id UUID NOT NULL REFERENCES public.section13_comparables(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  method TEXT,
  input_value NUMERIC(10, 2),
  normalized_monthly_delta NUMERIC(10, 2) NOT NULL DEFAULT 0,
  reason TEXT,
  source_kind TEXT NOT NULL DEFAULT 'system',
  is_override BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.section13_comparable_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view section13 adjustments through case"
  ON public.section13_comparable_adjustments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_comparable_adjustments.case_id
      AND (
        c.user_id = auth.uid()
        OR (c.user_id IS NULL AND c.session_token = current_setting('request.headers.x-session-token', true))
      )
    )
  );

CREATE POLICY "Users can insert section13 adjustments through case"
  ON public.section13_comparable_adjustments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_comparable_adjustments.case_id
      AND (c.user_id = auth.uid() OR c.user_id IS NULL)
    )
  );

CREATE POLICY "Users can update section13 adjustments through case"
  ON public.section13_comparable_adjustments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_comparable_adjustments.case_id
      AND (
        c.user_id = auth.uid()
        OR (c.user_id IS NULL AND c.session_token = current_setting('request.headers.x-session-token', true))
      )
    )
  );

CREATE POLICY "Service role manages section13 adjustments"
  ON public.section13_comparable_adjustments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_section13_adjustments_comparable_id
  ON public.section13_comparable_adjustments(comparable_id, sort_order);

CREATE TRIGGER update_section13_adjustments_updated_at
  BEFORE UPDATE ON public.section13_comparable_adjustments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.section13_evidence_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  byte_size BIGINT NOT NULL,
  file_sha256 TEXT,
  title TEXT,
  exhibit_label TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  upload_status TEXT NOT NULL DEFAULT 'uploaded',
  warning_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.section13_evidence_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view section13 evidence through case"
  ON public.section13_evidence_uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_evidence_uploads.case_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert section13 evidence through case"
  ON public.section13_evidence_uploads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_evidence_uploads.case_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update section13 evidence through case"
  ON public.section13_evidence_uploads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_evidence_uploads.case_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role manages section13 evidence"
  ON public.section13_evidence_uploads FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_section13_evidence_case_id
  ON public.section13_evidence_uploads(case_id, order_index);

CREATE TRIGGER update_section13_evidence_updated_at
  BEFORE UPDATE ON public.section13_evidence_uploads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.section13_bundle_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  rules_version TEXT NOT NULL,
  logical_section TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  title TEXT NOT NULL,
  source_kind TEXT NOT NULL DEFAULT 'generated_document',
  exhibit_label TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  include_in_merged BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'pending',
  page_count INTEGER,
  generation_error TEXT,
  source_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  source_upload_id UUID REFERENCES public.section13_evidence_uploads(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.section13_bundle_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view section13 bundle assets through case"
  ON public.section13_bundle_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_bundle_assets.case_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert section13 bundle assets through case"
  ON public.section13_bundle_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_bundle_assets.case_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update section13 bundle assets through case"
  ON public.section13_bundle_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = section13_bundle_assets.case_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role manages section13 bundle assets"
  ON public.section13_bundle_assets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_section13_bundle_assets_case_id
  ON public.section13_bundle_assets(case_id, logical_section, order_index);

CREATE TRIGGER update_section13_bundle_assets_updated_at
  BEFORE UPDATE ON public.section13_bundle_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.case_recovery_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.case_recovery_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages case recovery tokens"
  ON public.case_recovery_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_case_recovery_tokens_case_id
  ON public.case_recovery_tokens(case_id);

