-- =============================================================================
-- LANDLORD HEAVEN - HMO PRO TABLES
-- =============================================================================
-- Migration 003: HMO property management, tenants, and compliance tracking
-- =============================================================================

-- =============================================================================
-- 1. HMO PROPERTIES TABLE
-- =============================================================================
CREATE TABLE public.hmo_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Property details
  property_name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,

  -- Council information
  council_code TEXT,
  council_name TEXT,

  -- License information
  license_type TEXT, -- 'mandatory', 'additional', 'selective'
  license_number TEXT,
  license_expiry_date DATE,

  -- Property specifications
  number_of_bedrooms INTEGER,
  number_of_tenants INTEGER,
  max_occupancy INTEGER,
  number_of_bathrooms INTEGER,
  number_of_kitchens INTEGER,

  -- Compliance status
  has_fire_alarm BOOLEAN DEFAULT FALSE,
  has_co_alarm BOOLEAN DEFAULT FALSE,
  has_emergency_lighting BOOLEAN DEFAULT FALSE,
  has_fire_doors BOOLEAN DEFAULT FALSE,
  has_fire_blanket BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.hmo_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own properties"
  ON public.hmo_properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own properties"
  ON public.hmo_properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON public.hmo_properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON public.hmo_properties FOR DELETE
  USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role manages hmo_properties"
  ON public.hmo_properties FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_hmo_properties_user_id ON public.hmo_properties(user_id);
CREATE INDEX idx_hmo_properties_council_code ON public.hmo_properties(council_code);
CREATE INDEX idx_hmo_properties_postcode ON public.hmo_properties(postcode);

-- Trigger
CREATE TRIGGER update_hmo_properties_updated_at
  BEFORE UPDATE ON public.hmo_properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 2. HMO TENANTS TABLE
-- =============================================================================
CREATE TABLE public.hmo_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.hmo_properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Tenant details
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  room_number TEXT,

  -- Tenancy dates
  move_in_date DATE NOT NULL,
  tenancy_end_date DATE,
  move_out_date DATE,

  -- Financial
  monthly_rent DECIMAL(10, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2),
  deposit_protected BOOLEAN DEFAULT FALSE,
  deposit_scheme TEXT, -- 'DPS', 'TDS', 'MyDeposits'

  -- Status
  tenancy_status TEXT DEFAULT 'active', -- 'active', 'notice_given', 'ended'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.hmo_tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenants"
  ON public.hmo_tenants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tenants"
  ON public.hmo_tenants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tenants"
  ON public.hmo_tenants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tenants"
  ON public.hmo_tenants FOR DELETE
  USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role manages hmo_tenants"
  ON public.hmo_tenants FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_hmo_tenants_property_id ON public.hmo_tenants(property_id);
CREATE INDEX idx_hmo_tenants_user_id ON public.hmo_tenants(user_id);
CREATE INDEX idx_hmo_tenants_status ON public.hmo_tenants(tenancy_status);

-- Trigger
CREATE TRIGGER update_hmo_tenants_updated_at
  BEFORE UPDATE ON public.hmo_tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. HMO COMPLIANCE ITEMS TABLE
-- =============================================================================
CREATE TABLE public.hmo_compliance_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.hmo_properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Compliance item details
  item_type TEXT NOT NULL, -- 'gas_safety', 'eicr', 'epc', 'fire_alarm_test', 'license_renewal'
  item_title TEXT NOT NULL,
  description TEXT,

  -- Due dates
  due_date DATE NOT NULL,
  completed_date DATE,

  -- Status
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'due_soon', 'overdue', 'completed', 'expiring_soon'

  -- Reminders
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,

  -- Attachments
  certificate_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.hmo_compliance_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own compliance items"
  ON public.hmo_compliance_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own compliance items"
  ON public.hmo_compliance_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own compliance items"
  ON public.hmo_compliance_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own compliance items"
  ON public.hmo_compliance_items FOR DELETE
  USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role manages hmo_compliance_items"
  ON public.hmo_compliance_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_compliance_property_id ON public.hmo_compliance_items(property_id);
CREATE INDEX idx_compliance_user_id ON public.hmo_compliance_items(user_id);
CREATE INDEX idx_compliance_due_date ON public.hmo_compliance_items(due_date);
CREATE INDEX idx_compliance_status ON public.hmo_compliance_items(status);

-- Trigger
CREATE TRIGGER update_hmo_compliance_updated_at
  BEFORE UPDATE ON public.hmo_compliance_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- MIGRATION 003 COMPLETE
-- =============================================================================
