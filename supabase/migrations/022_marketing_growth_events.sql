-- =============================================================================
-- LANDLORD HEAVEN - MARKETING GROWTH EVENTS
-- =============================================================================
-- Migration 022: first-party, no-PII event tracking for revenue SEO funnels.
-- These events let admin reporting join guide/tool/product actions to orders.
-- =============================================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS marketing_session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_marketing_session_id
  ON public.orders(marketing_session_id)
  WHERE marketing_session_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  marketing_session_id TEXT NOT NULL,
  source_page TEXT,
  page_path TEXT,
  page_type TEXT,
  intent TEXT,
  cta_position TEXT,
  destination TEXT,
  recommended_product TEXT,
  product_clicked TEXT,
  user_type TEXT,
  tool_name TEXT,
  event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT marketing_events_allowed_event CHECK (
    event_name IN (
      'commercial_bridge_viewed',
      'commercial_bridge_clicked',
      'tool_started',
      'tool_completed',
      'result_viewed',
      'product_cta_clicked',
      'checkout_started',
      'purchase_completed',
      'product_page_viewed'
    )
  )
);

ALTER TABLE public.marketing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages marketing_events"
  ON public.marketing_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_marketing_events_created_at
  ON public.marketing_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketing_events_name_created
  ON public.marketing_events(event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketing_events_session
  ON public.marketing_events(marketing_session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketing_events_source_page
  ON public.marketing_events(source_page, created_at DESC)
  WHERE source_page IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_marketing_events_product_clicked
  ON public.marketing_events(product_clicked, created_at DESC)
  WHERE product_clicked IS NOT NULL;

COMMENT ON COLUMN public.orders.marketing_session_id IS 'First-party marketing session ID used to join paid orders to non-PII guide/tool/product events.';
COMMENT ON TABLE public.marketing_events IS 'No-PII first-party marketing funnel events used for growth reporting and revenue attribution.';

-- =============================================================================
-- MIGRATION 022 COMPLETE
-- =============================================================================
