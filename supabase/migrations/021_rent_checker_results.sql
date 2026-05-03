-- =============================================================================
-- LANDLORD HEAVEN - RENT CHECKER RESULTS
-- =============================================================================
-- Migration 021: Store completed rent checker results for analytics and email
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.rent_checker_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  tool_name TEXT NOT NULL DEFAULT 'rent_increase_challenge_checker',
  jurisdiction TEXT NOT NULL DEFAULT 'england',
  user_type TEXT NOT NULL,
  postcode_outcode TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  current_rent NUMERIC(10,2) NOT NULL,
  proposed_rent NUMERIC(10,2),
  market_low NUMERIC(10,2),
  market_median NUMERIC(10,2),
  market_high NUMERIC(10,2),
  comparable_count INTEGER NOT NULL DEFAULT 0,
  source_backed_count INTEGER NOT NULL DEFAULT 0,
  fresh_comparable_count INTEGER NOT NULL DEFAULT 0,
  evidence_strength TEXT NOT NULL,
  challenge_risk TEXT NOT NULL,
  recommended_product TEXT NOT NULL,
  result_state TEXT NOT NULL,
  raw_input JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.rent_checker_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages rent_checker_results"
  ON public.rent_checker_results FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_rent_checker_results_created_at
  ON public.rent_checker_results(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rent_checker_results_postcode_outcode
  ON public.rent_checker_results(postcode_outcode);

CREATE INDEX IF NOT EXISTS idx_rent_checker_results_recommended_product
  ON public.rent_checker_results(recommended_product);

CREATE INDEX IF NOT EXISTS idx_rent_checker_results_result_state
  ON public.rent_checker_results(result_state);
