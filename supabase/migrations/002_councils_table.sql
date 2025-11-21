-- =============================================================================
-- COUNCILS TABLE - Simple structure matching our TypeScript data
-- =============================================================================
-- This table stores all 382 UK councils with comprehensive HMO licensing data
-- Each council record is stored as JSONB for flexibility and exact structure match

CREATE TABLE IF NOT EXISTS public.councils (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core identification (extracted for indexing/querying)
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('england', 'wales', 'scotland', 'northern-ireland')),
  region TEXT NOT NULL,

  -- Complete council data (stored as JSONB - matches our TypeScript structure exactly)
  website TEXT,
  hmo_licensing JSONB NOT NULL,
  hmo_thresholds JSONB NOT NULL,
  contact JSONB,
  postcode_areas TEXT[] NOT NULL,
  confidence TEXT DEFAULT '✓✓',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES for fast queries
-- =============================================================================

-- Search by code (most common lookup)
CREATE INDEX IF NOT EXISTS idx_councils_code ON public.councils(code);

-- Search by jurisdiction (filter by country)
CREATE INDEX IF NOT EXISTS idx_councils_jurisdiction ON public.councils(jurisdiction);

-- Search by region (filter by region)
CREATE INDEX IF NOT EXISTS idx_councils_region ON public.councils(region);

-- Search within postcode arrays (e.g., find council for postcode 'M1')
CREATE INDEX IF NOT EXISTS idx_councils_postcode_areas ON public.councils USING GIN(postcode_areas);

-- Full-text search on council name
CREATE INDEX IF NOT EXISTS idx_councils_name_search ON public.councils USING GIN(to_tsvector('english', name));

-- Filter by HMO licensing types (e.g., find councils with additional licensing)
CREATE INDEX IF NOT EXISTS idx_councils_hmo_licensing ON public.councils USING GIN(hmo_licensing);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- This is public reference data - anyone can read it

ALTER TABLE public.councils ENABLE ROW LEVEL SECURITY;

-- Allow anyone (authenticated or not) to read council data
CREATE POLICY "Anyone can view councils"
  ON public.councils
  FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (via seed script)
CREATE POLICY "Service role can manage councils"
  ON public.councils
  FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- TRIGGER - Auto-update updated_at timestamp
-- =============================================================================

CREATE OR REPLACE FUNCTION update_councils_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_councils_updated_at
  BEFORE UPDATE ON public.councils
  FOR EACH ROW
  EXECUTE FUNCTION update_councils_updated_at();

-- =============================================================================
-- HELPFUL VIEWS
-- =============================================================================

-- View for councils with additional licensing schemes
CREATE OR REPLACE VIEW councils_with_additional_licensing AS
SELECT
  code,
  name,
  jurisdiction,
  region,
  (hmo_licensing->>'additional')::boolean as has_additional,
  hmo_licensing->'schemes' as schemes
FROM public.councils
WHERE (hmo_licensing->>'additional')::boolean = true;

-- View for councils with selective licensing schemes
CREATE OR REPLACE VIEW councils_with_selective_licensing AS
SELECT
  code,
  name,
  jurisdiction,
  region,
  (hmo_licensing->>'selective')::boolean as has_selective,
  hmo_licensing->'schemes' as schemes
FROM public.councils
WHERE (hmo_licensing->>'selective')::boolean = true;

-- View for councils with low thresholds (3+ persons - stricter)
CREATE OR REPLACE VIEW councils_with_strict_thresholds AS
SELECT
  code,
  name,
  jurisdiction,
  region,
  (hmo_thresholds->>'persons')::int as person_threshold
FROM public.councils
WHERE (hmo_thresholds->>'persons')::int <= 3;

-- =============================================================================
-- COMMENTS (Documentation)
-- =============================================================================

COMMENT ON TABLE public.councils IS 'UK councils data with comprehensive HMO licensing information for all 382 councils';
COMMENT ON COLUMN public.councils.code IS 'Official ONS council code (e.g., E09000001 for City of London)';
COMMENT ON COLUMN public.councils.jurisdiction IS 'UK country: england, wales, scotland, or northern-ireland';
COMMENT ON COLUMN public.councils.hmo_licensing IS 'HMO licensing schemes: mandatory, additional, selective with fees and criteria';
COMMENT ON COLUMN public.councils.hmo_thresholds IS 'Thresholds for HMO licensing: persons, households, storeys';
COMMENT ON COLUMN public.councils.postcode_areas IS 'Array of postcode areas covered by this council (e.g., ["M1", "M2", "M3"])';
COMMENT ON COLUMN public.councils.confidence IS 'Data confidence level: ✓✓✓ (verified), ✓✓ (statutory defaults)';
