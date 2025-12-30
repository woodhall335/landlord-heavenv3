-- =============================================================================
-- LANDLORD HEAVEN - UK COUNCILS
-- =============================================================================
-- Migration 005: UK councils reference data with HMO licensing information
-- =============================================================================

-- =============================================================================
-- COUNCILS TABLE
-- =============================================================================
CREATE TABLE public.councils (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core identification
  code TEXT UNIQUE NOT NULL, -- ONS council code (e.g., E09000001)
  name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('england', 'wales', 'scotland', 'northern-ireland')),
  region TEXT NOT NULL,

  -- Complete council data (JSONB for flexibility)
  website TEXT,
  hmo_licensing JSONB NOT NULL, -- { mandatory: true, additional: false, selective: false, schemes: [] }
  hmo_thresholds JSONB NOT NULL, -- { persons: 5, households: 2, storeys: 3 }
  contact JSONB, -- { phone, email, address }
  postcode_areas TEXT[] NOT NULL, -- ['M1', 'M2', 'M3', ...]
  confidence TEXT DEFAULT '✓✓', -- Data confidence level

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.councils ENABLE ROW LEVEL SECURITY;

-- Public read access (reference data)
CREATE POLICY "Anyone can view councils"
  ON public.councils FOR SELECT
  USING (true);

-- Service role can manage (for seeding)
CREATE POLICY "Service role manages councils"
  ON public.councils FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_councils_code ON public.councils(code);
CREATE INDEX idx_councils_jurisdiction ON public.councils(jurisdiction);
CREATE INDEX idx_councils_region ON public.councils(region);
CREATE INDEX idx_councils_postcode_areas ON public.councils USING GIN(postcode_areas);
CREATE INDEX idx_councils_name_search ON public.councils USING GIN(to_tsvector('english', name));
CREATE INDEX idx_councils_hmo_licensing ON public.councils USING GIN(hmo_licensing);

-- Trigger
CREATE TRIGGER update_councils_updated_at
  BEFORE UPDATE ON public.councils
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- HELPFUL VIEWS
-- =============================================================================

-- Councils with additional licensing
CREATE VIEW councils_with_additional_licensing AS
SELECT
  code, name, jurisdiction, region,
  (hmo_licensing->>'additional')::boolean as has_additional,
  hmo_licensing->'schemes' as schemes
FROM public.councils
WHERE (hmo_licensing->>'additional')::boolean = true;

-- Councils with selective licensing
CREATE VIEW councils_with_selective_licensing AS
SELECT
  code, name, jurisdiction, region,
  (hmo_licensing->>'selective')::boolean as has_selective,
  hmo_licensing->'schemes' as schemes
FROM public.councils
WHERE (hmo_licensing->>'selective')::boolean = true;

-- Councils with strict thresholds (3+ persons)
CREATE VIEW councils_with_strict_thresholds AS
SELECT
  code, name, jurisdiction, region,
  (hmo_thresholds->>'persons')::int as person_threshold
FROM public.councils
WHERE (hmo_thresholds->>'persons')::int <= 3;

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE public.councils IS 'UK councils with comprehensive HMO licensing information';
COMMENT ON COLUMN public.councils.code IS 'Official ONS council code';
COMMENT ON COLUMN public.councils.hmo_licensing IS 'HMO licensing schemes and criteria';
COMMENT ON COLUMN public.councils.hmo_thresholds IS 'Thresholds for HMO licensing';
COMMENT ON COLUMN public.councils.postcode_areas IS 'Postcode areas covered by this council';

-- =============================================================================
-- MIGRATION 005 COMPLETE
-- =============================================================================
