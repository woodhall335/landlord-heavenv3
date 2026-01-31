-- =============================================================================
-- LANDLORD HEAVEN - ORDER ATTRIBUTION
-- =============================================================================
-- Migration 012: Add attribution columns to orders table for revenue tracking
-- by landing page, UTM campaign, and marketing source.
--
-- Strategy: FIRST-TOUCH attribution (preserve original acquisition source)
-- =============================================================================

-- =============================================================================
-- 1. ADD ATTRIBUTION COLUMNS TO ORDERS TABLE
-- =============================================================================

-- Landing page path (first page user visited)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS landing_path TEXT;

-- Standard UTM parameters (captured on first visit)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- Referrer (HTTP referer header on first visit)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Timestamps for attribution tracking
-- first_touch_at: when user first arrived (for attribution window analysis)
-- Note: we use first_touch_at rather than created_at because the order
-- may be created days after the initial visit
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS first_touch_at TIMESTAMPTZ;

-- GA client ID for server-side event deduplication
-- This allows us to match server-side purchase events to client-side sessions
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS ga_client_id TEXT;

-- =============================================================================
-- 2. CREATE INDEXES FOR ATTRIBUTION QUERIES
-- =============================================================================

-- Index for revenue by UTM source reporting
CREATE INDEX IF NOT EXISTS idx_orders_utm_source ON public.orders(utm_source)
WHERE utm_source IS NOT NULL;

-- Index for revenue by UTM campaign reporting
CREATE INDEX IF NOT EXISTS idx_orders_utm_campaign ON public.orders(utm_campaign)
WHERE utm_campaign IS NOT NULL;

-- Index for revenue by landing page reporting
CREATE INDEX IF NOT EXISTS idx_orders_landing_path ON public.orders(landing_path)
WHERE landing_path IS NOT NULL;

-- Composite index for multi-dimensional attribution analysis
CREATE INDEX IF NOT EXISTS idx_orders_attribution_composite
ON public.orders(utm_source, utm_campaign, landing_path)
WHERE payment_status = 'paid';

-- =============================================================================
-- 3. COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON COLUMN public.orders.landing_path IS 'First page path user visited (e.g., /how-to-evict-tenant). Used for SEO revenue attribution.';
COMMENT ON COLUMN public.orders.utm_source IS 'UTM source parameter from first visit (e.g., google, facebook). First-touch attribution.';
COMMENT ON COLUMN public.orders.utm_medium IS 'UTM medium parameter from first visit (e.g., cpc, organic, email). First-touch attribution.';
COMMENT ON COLUMN public.orders.utm_campaign IS 'UTM campaign parameter from first visit (e.g., section21-guide-jan2026). First-touch attribution.';
COMMENT ON COLUMN public.orders.utm_term IS 'UTM term parameter from first visit (e.g., eviction notice). First-touch attribution.';
COMMENT ON COLUMN public.orders.utm_content IS 'UTM content parameter from first visit (e.g., hero-cta, sidebar). First-touch attribution.';
COMMENT ON COLUMN public.orders.referrer IS 'HTTP referer header from first visit. May be truncated to domain for privacy.';
COMMENT ON COLUMN public.orders.first_touch_at IS 'Timestamp of user first visit. Used to calculate time-to-conversion.';
COMMENT ON COLUMN public.orders.ga_client_id IS 'Google Analytics client ID for server-side event matching and deduplication.';

-- =============================================================================
-- MIGRATION 012 COMPLETE
-- =============================================================================
