-- =============================================================================
-- LANDLORD HEAVEN - CORE SCHEMA
-- =============================================================================
-- Migration 001: Core tables for users, cases, case_facts, and documents
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- HELPER FUNCTION: Auto-update updated_at timestamp
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. USERS TABLE (extends auth.users)
-- =============================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  full_name TEXT,
  phone TEXT,

  -- Stripe integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,

  -- HMO Pro subscription
  hmo_pro_active BOOLEAN DEFAULT FALSE,
  hmo_pro_tier TEXT, -- 'starter', 'growth', 'professional', 'enterprise'
  hmo_pro_trial_ends_at TIMESTAMPTZ,
  hmo_pro_subscription_ends_at TIMESTAMPTZ,

  -- Activity tracking
  last_sign_in_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Service role full access
CREATE POLICY "Service role manages users"
  ON public.users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_stripe_customer ON public.users(stripe_customer_id);

-- Trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 2. CASES TABLE (wizard sessions and legal cases)
-- =============================================================================
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Nullable for anonymous

  -- Case metadata
  case_type TEXT NOT NULL, -- 'eviction', 'money_claim', 'tenancy_agreement'
  jurisdiction TEXT NOT NULL, -- 'england', 'wales', 'scotland', 'northern-ireland'
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'archived'

  -- Wizard data (legacy - use case_facts for new data)
  collected_facts JSONB DEFAULT '{}'::jsonb,
  wizard_progress INTEGER DEFAULT 0, -- 0-100
  wizard_completed_at TIMESTAMPTZ,

  -- Decision engine results
  recommended_route TEXT,
  recommended_grounds TEXT[],
  success_probability INTEGER, -- 0-100
  red_flags JSONB DEFAULT '[]'::jsonb,
  compliance_issues JSONB DEFAULT '[]'::jsonb,

  -- Council lookup (for HMO/location-specific cases)
  council_code TEXT,

  -- Anonymous session token (for security)
  session_token TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Authenticated users see their own cases
CREATE POLICY "Users can view own cases"
  ON public.cases FOR SELECT
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND session_token = current_setting('request.headers.x-session-token', true))
  );

CREATE POLICY "Users can create cases"
  ON public.cases FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own cases"
  ON public.cases FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND session_token = current_setting('request.headers.x-session-token', true))
  );

CREATE POLICY "Users can delete own cases"
  ON public.cases FOR DELETE
  USING (user_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role manages cases"
  ON public.cases FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_cases_user_id ON public.cases(user_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_case_type ON public.cases(case_type);
CREATE INDEX idx_cases_jurisdiction ON public.cases(jurisdiction);
CREATE INDEX idx_cases_council_code ON public.cases(council_code);
CREATE INDEX idx_cases_session_token ON public.cases(session_token) WHERE session_token IS NOT NULL;
CREATE INDEX idx_cases_created_at ON public.cases(created_at DESC);

-- Trigger
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. CASE_FACTS TABLE (wizard facts storage)
-- =============================================================================
CREATE TABLE public.case_facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,

  -- Facts storage (flat JSON structure)
  facts JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Validation
  validated_at TIMESTAMPTZ,
  validation_errors JSONB DEFAULT '[]'::jsonb,

  -- Optimistic locking
  version INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.case_facts ENABLE ROW LEVEL SECURITY;

-- Access through case ownership
CREATE POLICY "Users can view case_facts through case"
  ON public.case_facts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_facts.case_id
      AND (c.user_id = auth.uid() OR (c.user_id IS NULL AND c.session_token = current_setting('request.headers.x-session-token', true)))
    )
  );

CREATE POLICY "Users can insert case_facts"
  ON public.case_facts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_facts.case_id
      AND (c.user_id = auth.uid() OR c.user_id IS NULL)
    )
  );

CREATE POLICY "Users can update case_facts"
  ON public.case_facts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_facts.case_id
      AND (c.user_id = auth.uid() OR (c.user_id IS NULL AND c.session_token = current_setting('request.headers.x-session-token', true)))
    )
  );

-- Service role full access
CREATE POLICY "Service role manages case_facts"
  ON public.case_facts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE UNIQUE INDEX idx_case_facts_case_id ON public.case_facts(case_id);
CREATE INDEX idx_case_facts_updated_at ON public.case_facts(updated_at DESC);

-- Trigger
CREATE TRIGGER update_case_facts_updated_at
  BEFORE UPDATE ON public.case_facts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. DOCUMENTS TABLE (generated legal documents)
-- =============================================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Nullable for anonymous
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,

  -- Document metadata
  document_type TEXT NOT NULL, -- 'section8_notice', 'section21_form6a', 'n5_claim', etc.
  document_title TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,

  -- Generation metadata
  generated_by_model TEXT,
  generation_tokens_used INTEGER,
  generation_cost_usd DECIMAL(10, 6),

  -- QA validation
  qa_score INTEGER, -- 0-100
  qa_issues JSONB DEFAULT '[]'::jsonb,
  qa_passed BOOLEAN DEFAULT FALSE,

  -- Document content
  html_content TEXT,
  pdf_url TEXT, -- Supabase Storage path
  is_preview BOOLEAN DEFAULT TRUE,

  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Anonymous session token
  session_token TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND session_token = current_setting('request.headers.x-session-token', true))
  );

CREATE POLICY "Users can create documents"
  ON public.documents FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own documents"
  ON public.documents FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND session_token = current_setting('request.headers.x-session-token', true))
  );

CREATE POLICY "Users can delete own documents"
  ON public.documents FOR DELETE
  USING (user_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role manages documents"
  ON public.documents FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_case_id ON public.documents(case_id);
CREATE INDEX idx_documents_document_type ON public.documents(document_type);
CREATE INDEX idx_documents_jurisdiction ON public.documents(jurisdiction);
CREATE INDEX idx_documents_session_token ON public.documents(session_token) WHERE session_token IS NOT NULL;
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);

-- Trigger
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- MIGRATION 001 COMPLETE
-- =============================================================================
