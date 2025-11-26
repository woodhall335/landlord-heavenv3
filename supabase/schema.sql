-- =============================================================================
-- LANDLORD HEAVEN - COMPLETE DATABASE SCHEMA
-- =============================================================================
-- Run this entire script in Supabase SQL Editor
-- This creates all tables, RLS policies, indexes, and triggers
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. USERS TABLE (extends auth.users)
-- =============================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,

  -- Stripe integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,

  -- HMO Pro subscription
  hmo_pro_active BOOLEAN DEFAULT FALSE,
  hmo_pro_tier TEXT, -- '1-5', '6-10', '11-15', '16-20'
  hmo_pro_trial_ends_at TIMESTAMPTZ,
  hmo_pro_subscription_ends_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Indexes
CREATE INDEX idx_users_stripe_customer ON public.users(stripe_customer_id);
CREATE INDEX idx_users_email ON public.users(email);

-- =============================================================================
-- 2. CASES TABLE (wizard sessions and legal cases)
-- =============================================================================
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Case metadata
  case_type TEXT NOT NULL, -- 'eviction', 'money_claim', 'tenancy_agreement'
  jurisdiction TEXT NOT NULL, -- 'england-wales', 'scotland', 'northern-ireland'
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'paid', 'delivered'

  -- Wizard data (collected facts as JSON)
  collected_facts JSONB DEFAULT '{}'::jsonb,
  wizard_progress INTEGER DEFAULT 0, -- 0-100
  wizard_completed_at TIMESTAMPTZ,

  -- Decision engine results
  recommended_route TEXT, -- 'section_8', 'section_21', 'money_claim', etc.
  recommended_grounds TEXT[], -- ['ground_8', 'ground_10']
  success_probability INTEGER, -- 0-100
  red_flags JSONB DEFAULT '[]'::jsonb,
  compliance_issues JSONB DEFAULT '[]'::jsonb,

  -- Council lookup (for HMO cases)
  council_code TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own cases"
  ON public.cases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cases"
  ON public.cases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases"
  ON public.cases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cases"
  ON public.cases FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_cases_user_id ON public.cases(user_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_case_type ON public.cases(case_type);
CREATE INDEX idx_cases_jurisdiction ON public.cases(jurisdiction);
CREATE INDEX idx_cases_council_code ON public.cases(council_code);

-- =============================================================================
-- 3. DOCUMENTS TABLE (generated legal documents)
-- =============================================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,

  -- Document metadata
  document_type TEXT NOT NULL, -- 'section8_notice', 'section21_form6a', 'n5_claim', etc.
  document_title TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,

  -- Generation metadata
  generated_by_model TEXT, -- 'gpt-4', etc.
  generation_tokens_used INTEGER,
  generation_cost_usd DECIMAL(10, 6),

  -- QA validation
  qa_score INTEGER, -- 0-100 (from Claude Sonnet 4)
  qa_issues JSONB DEFAULT '[]'::jsonb,
  qa_passed BOOLEAN DEFAULT FALSE,

  -- Document content
  html_content TEXT,
  pdf_url TEXT, -- Supabase Storage URL
  is_preview BOOLEAN DEFAULT TRUE, -- true = watermarked, false = paid/final

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_case_id ON public.documents(case_id);
CREATE INDEX idx_documents_document_type ON public.documents(document_type);

-- =============================================================================
-- 4. ORDERS TABLE (one-time purchases)
-- =============================================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,

  -- Product information
  product_type TEXT NOT NULL, -- 'notice_only', 'complete_pack', 'money_claim', etc.
  product_name TEXT NOT NULL,

  -- Pricing
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  total_amount DECIMAL(10, 2) NOT NULL,

  -- Payment status
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  paid_at TIMESTAMPTZ,

  -- Fulfillment
  fulfillment_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  fulfilled_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_stripe_payment_intent ON public.orders(stripe_payment_intent_id);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);

-- =============================================================================
-- 5. HMO PROPERTIES TABLE (HMO Pro feature)
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
  council_code TEXT NOT NULL,
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

-- Enable RLS
ALTER TABLE public.hmo_properties ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Indexes
CREATE INDEX idx_hmo_properties_user_id ON public.hmo_properties(user_id);
CREATE INDEX idx_hmo_properties_council_code ON public.hmo_properties(council_code);
CREATE INDEX idx_hmo_properties_postcode ON public.hmo_properties(postcode);

-- =============================================================================
-- 6. HMO TENANTS TABLE (HMO Pro feature)
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

-- Enable RLS
ALTER TABLE public.hmo_tenants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Indexes
CREATE INDEX idx_hmo_tenants_property_id ON public.hmo_tenants(property_id);
CREATE INDEX idx_hmo_tenants_user_id ON public.hmo_tenants(user_id);
CREATE INDEX idx_hmo_tenants_status ON public.hmo_tenants(tenancy_status);

-- =============================================================================
-- 7. HMO COMPLIANCE ITEMS TABLE (HMO Pro feature)
-- =============================================================================
CREATE TABLE public.hmo_compliance_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.hmo_properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Compliance item details
  item_type TEXT NOT NULL, -- 'gas_safety', 'eicr', 'epc', 'fire_alarm_test', 'license_renewal', etc.
  item_title TEXT NOT NULL,
  description TEXT,

  -- Due dates
  due_date DATE NOT NULL,
  completed_date DATE,

  -- Status
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'due_soon', 'overdue', 'completed'

  -- Reminders
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,

  -- Attachments
  certificate_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.hmo_compliance_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Indexes
CREATE INDEX idx_compliance_property_id ON public.hmo_compliance_items(property_id);
CREATE INDEX idx_compliance_user_id ON public.hmo_compliance_items(user_id);
CREATE INDEX idx_compliance_due_date ON public.hmo_compliance_items(due_date);
CREATE INDEX idx_compliance_status ON public.hmo_compliance_items(status);

-- =============================================================================
-- 8. UK COUNCILS TABLE (380+ councils with HMO licensing data)
-- =============================================================================
CREATE TABLE public.uk_councils (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Council identification
  council_code TEXT UNIQUE NOT NULL,
  council_name TEXT NOT NULL,
  region TEXT NOT NULL, -- 'England', 'Wales', 'Scotland', 'Northern Ireland'
  country TEXT NOT NULL,

  -- Geographic coverage
  postcode_areas TEXT[], -- ['M1', 'M2', 'M3', ...]

  -- HMO Licensing
  has_mandatory_licensing BOOLEAN DEFAULT TRUE,
  has_additional_licensing BOOLEAN DEFAULT FALSE,
  has_selective_licensing BOOLEAN DEFAULT FALSE,

  -- Licensing requirements (stored as JSONB for flexibility)
  licensing_criteria JSONB DEFAULT '{}'::jsonb,
  application_process JSONB DEFAULT '{}'::jsonb,
  fees JSONB DEFAULT '{}'::jsonb,
  requirements JSONB DEFAULT '{}'::jsonb,
  standards JSONB DEFAULT '{}'::jsonb,

  -- Contact information
  contact_info JSONB DEFAULT '{}'::jsonb,
  useful_links JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS needed - this is public reference data
ALTER TABLE public.uk_councils ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view councils"
  ON public.uk_councils FOR SELECT
  TO authenticated
  USING (true);

-- Indexes
CREATE INDEX idx_councils_code ON public.uk_councils(council_code);
CREATE INDEX idx_councils_region ON public.uk_councils(region);
CREATE INDEX idx_councils_postcode_areas ON public.uk_councils USING GIN(postcode_areas);

-- =============================================================================
-- 9. AI USAGE LOGS TABLE (cost tracking)
-- =============================================================================
CREATE TABLE public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- AI model information
  model TEXT NOT NULL,
  operation_type TEXT NOT NULL, -- 'wizard', 'decision', 'generation', 'qa'

  -- Token usage
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,

  -- Cost tracking
  total_cost_usd DECIMAL(10, 6) DEFAULT 0,

  -- Associated records
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin only for cost monitoring)
CREATE POLICY "Service role can insert logs"
  ON public.ai_usage_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can view logs"
  ON public.ai_usage_logs FOR SELECT
  TO service_role
  USING (true);

-- Indexes
CREATE INDEX idx_ai_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX idx_ai_logs_created_at ON public.ai_usage_logs(created_at);
CREATE INDEX idx_ai_logs_model ON public.ai_usage_logs(model);

-- =============================================================================
-- 10. WEBHOOK LOGS TABLE (Stripe webhook debugging)
-- =============================================================================
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Webhook details
  event_type TEXT NOT NULL,
  stripe_event_id TEXT,

  -- Payload
  payload JSONB DEFAULT '{}'::jsonb,

  -- Processing status
  status TEXT DEFAULT 'received', -- 'received', 'processing', 'completed', 'failed'
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (service role only)
CREATE POLICY "Service role can manage webhook logs"
  ON public.webhook_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_webhook_logs_event_type ON public.webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at);
CREATE INDEX idx_webhook_logs_stripe_event_id ON public.webhook_logs(stripe_event_id);

-- =============================================================================
-- TRIGGERS (auto-update timestamps)
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hmo_properties_updated_at BEFORE UPDATE ON public.hmo_properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hmo_tenants_updated_at BEFORE UPDATE ON public.hmo_tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hmo_compliance_updated_at BEFORE UPDATE ON public.hmo_compliance_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_councils_updated_at BEFORE UPDATE ON public.uk_councils
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STORAGE BUCKETS (for PDFs)
-- =============================================================================

-- Create storage bucket for documents (run this in Supabase Dashboard > Storage)
-- Bucket name: 'documents'
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: application/pdf

-- Storage RLS policies will be set via Supabase Dashboard

-- =============================================================================
-- SCHEMA COMPLETE!
-- =============================================================================
-- Next steps:
-- 1. Seed uk_councils table with 380+ councils data (Agent 6)
-- 2. Test with sample data
-- 3. Verify RLS policies work correctly
-- =============================================================================
