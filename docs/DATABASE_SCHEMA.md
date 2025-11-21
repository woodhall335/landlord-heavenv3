# 🗄️ DATABASE SCHEMA

**Version:** 1.0  
**Date:** November 2024  
**Database:** PostgreSQL 15 (Supabase)

---

## 📋 OVERVIEW

Landlord Heaven uses Supabase (PostgreSQL) with Row Level Security (RLS) for multi-tenant data isolation.

**Core Tables:**

- `users` - User authentication & profiles
- `cases` - Legal cases/matters
- `documents` - Generated documents
- `orders` - Payments & purchases
- `conversations` - Wizard chat history
- `case_facts` - Collected case data
- `hmo_properties` - HMO property management 🆕
- `hmo_tenants` - HMO tenant records 🆕
- `compliance_reminders` - Automated reminders 🆕
- `council_data` - UK council reference data 🆕

---

## 📊 COMPLETE SCHEMA

-- =====================================================================
-- USERS TABLE
-- =====================================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  user_type TEXT CHECK (user_type IN ('landlord', 'agent', 'admin')) DEFAULT 'landlord',
  company_name TEXT,
  properties_count INTEGER DEFAULT 0,
  hmo_pro_active BOOLEAN DEFAULT false,
  hmo_pro_band INTEGER DEFAULT 1,
  hmo_count INTEGER DEFAULT 0,
  hmo_pro_started_at TIMESTAMPTZ,
  hmo_pro_trial_ends_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  preferred_jurisdiction TEXT,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  total_cases INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_hmo_pro ON public.users(hmo_pro_active) WHERE hmo_pro_active = true;
CREATE INDEX idx_users_stripe_sub ON public.users(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- =====================================================================
-- CASES TABLE
-- =====================================================================

CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  case_type TEXT CHECK (case_type IN ('eviction','money_claim','tenancy_agreement','hmo_license')) NOT NULL,
  jurisdiction_code TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft','analyzing','ready','purchased','in_progress','completed','abandoned')) DEFAULT 'draft',
  primary_issue TEXT,
  property_address TEXT,
  tenant_name TEXT,
  recommended_route TEXT,
  selected_grounds TEXT[],
  amount_claimed DECIMAL(10,2),
  estimated_costs DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  analysis_result JSONB,
  red_flags JSONB,
  wizard_progress INTEGER DEFAULT 0,
  last_question_id TEXT,
  search_vector TSVECTOR
);

CREATE INDEX idx_cases_user_id ON public.cases(user_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_jurisdiction ON public.cases(jurisdiction_code);
CREATE INDEX idx_cases_created_at ON public.cases(created_at DESC);
CREATE INDEX idx_cases_search ON public.cases USING gin(search_vector);

-- =====================================================================
-- CASE_FACTS
-- =====================================================================

CREATE TABLE public.case_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  facts JSONB NOT NULL,
  validated_at TIMESTAMPTZ,
  validation_errors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_case_facts_case_id ON public.case_facts(case_id);

-- =====================================================================
-- CONVERSATIONS
-- =====================================================================

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('system','assistant','user')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  model TEXT,
  tokens_used INTEGER,
  question_id TEXT,
  input_type TEXT,
  user_input JSONB
);

CREATE INDEX idx_conversations_case_id ON public.conversations(case_id, created_at);

-- =====================================================================
-- DOCUMENTS
-- =====================================================================

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('generating','preview','ready','downloaded','delivered')) DEFAULT 'generating',
  file_path TEXT,
  file_url TEXT,
  file_size_bytes INTEGER,
  mime_type TEXT,
  format TEXT CHECK (format IN ('pdf','docx')) DEFAULT 'pdf',
  content_json JSONB,
  is_preview BOOLEAN DEFAULT false,
  is_watermarked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  generated_by TEXT,
  generation_time_ms INTEGER,
  qa_score INTEGER,
  qa_issues JSONB
);

CREATE INDEX idx_documents_case_id ON public.documents(case_id);
CREATE INDEX idx_documents_status ON public.documents(status);

-- =====================================================================
-- ORDERS
-- =====================================================================

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  product_type TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  payment_status TEXT CHECK (payment_status IN ('pending','processing','paid','failed','refunded','partially_refunded')) DEFAULT 'pending',
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  payment_method TEXT,
  fulfilled_at TIMESTAMPTZ,
  documents_delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  metadata JSONB
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_case ON public.orders(case_id);
CREATE INDEX idx_orders_status ON public.orders(payment_status);
CREATE INDEX idx_orders_intent ON public.orders(stripe_payment_intent_id);

-- =====================================================================
-- HMO_PROPERTIES
-- =====================================================================

CREATE TABLE public.hmo_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  property_address TEXT NOT NULL,
  postcode TEXT NOT NULL,
  council_code TEXT NOT NULL,
  council_name TEXT NOT NULL,
  licence_type TEXT CHECK (licence_type IN ('mandatory','additional','selective')),
  licence_number TEXT,
  licence_status TEXT CHECK (licence_status IN ('not_started','in_progress','submitted','granted','expired')) DEFAULT 'not_started',
  licence_issued_date DATE,
  licence_expiry_date DATE,
  gas_safety_expiry DATE,
  eicr_expiry DATE,
  fire_risk_assessment_date DATE,
  epc_rating TEXT,
  max_occupants INTEGER,
  current_occupants INTEGER DEFAULT 0,
  number_of_rooms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  search_vector TSVECTOR
);

CREATE INDEX idx_hmo_properties_user ON public.hmo_properties(user_id);
CREATE INDEX idx_hmo_properties_council ON public.hmo_properties(council_code);
CREATE INDEX idx_hmo_properties_expiry ON public.hmo_properties(licence_expiry_date);
CREATE INDEX idx_hmo_properties_postcode ON public.hmo_properties(postcode);

-- =====================================================================
-- HMO_TENANTS
-- =====================================================================

CREATE TABLE public.hmo_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hmo_property_id UUID REFERENCES public.hmo_properties(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  room_number TEXT NOT NULL,
  room_rent DECIMAL(10,2) NOT NULL,
  tenancy_start DATE NOT NULL,
  tenancy_end DATE,
  is_active BOOLEAN DEFAULT true,
  has_guarantor BOOLEAN DEFAULT false,
  guarantor_name TEXT,
  guarantor_email TEXT,
  guarantor_phone TEXT,
  guarantor_relationship TEXT,
  guarantor_address TEXT,
  version INTEGER DEFAULT 1,
  superseded_by UUID REFERENCES public.hmo_tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hmo_tenants_property ON public.hmo_tenants(hmo_property_id);
CREATE INDEX idx_hmo_tenants_active ON public.hmo_tenants(is_active);
CREATE INDEX idx_hmo_tenants_email ON public.hmo_tenants(email);

-- =====================================================================
-- COMPLIANCE_REMINDERS
-- =====================================================================

CREATE TABLE public.compliance_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  hmo_property_id UUID REFERENCES public.hmo_properties(id) ON DELETE CASCADE,
  reminder_type TEXT CHECK (reminder_type IN ('licence_expiry','gas_safety','eicr','fire_assessment','tenancy_end','deposit_return')) NOT NULL,
  due_date DATE NOT NULL,
  days_before INTEGER NOT NULL,
  status TEXT CHECK (status IN ('scheduled','sent','dismissed')) DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX idx_compliance_reminders_user ON public.compliance_reminders(user_id, status);
CREATE INDEX idx_compliance_reminders_due ON public.compliance_reminders(due_date, status);
CREATE INDEX idx_compliance_reminders_property ON public.compliance_reminders(hmo_property_id);

-- =====================================================================
-- COUNCIL_DATA
-- =====================================================================

CREATE TABLE public.council_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  council_code TEXT UNIQUE NOT NULL,
  council_name TEXT NOT NULL,
  region TEXT CHECK (region IN ('England','Wales','Scotland','Northern Ireland')),
  has_mandatory_licensing BOOLEAN DEFAULT false,
  has_additional_licensing BOOLEAN DEFAULT false,
  has_selective_licensing BOOLEAN DEFAULT false,
  min_room_size_sqm DECIMAL(5,2),
  max_occupants_per_bathroom INTEGER,
  requires_fire_alarm BOOLEAN DEFAULT true,
  requires_fire_blanket BOOLEAN DEFAULT true,
  licensing_team_email TEXT,
  licensing_team_phone TEXT,
  application_url TEXT,
  application_fee DECIMAL(10,2),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_council_data_code ON public.council_data(council_code);
CREATE INDEX idx_council_data_region ON public.council_data(region);

-- =====================================================================
-- EMAIL_QUEUE
-- =====================================================================

CREATE TABLE public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending','sending','sent','failed','cancelled')) DEFAULT 'pending',
  template_data JSONB,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_queue_scheduled ON public.email_queue(scheduled_for, status);
CREATE INDEX idx_email_queue_status ON public.email_queue(status);

-- =====================================================================
-- ANALYTICS_EVENTS
-- =====================================================================

CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_category TEXT,
  properties JSONB,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_name ON public.analytics_events(event_name, created_at);
CREATE INDEX idx_analytics_events_user ON public.analytics_events(user_id, created_at);

-- =====================================================================
-- RLS CONFIG
-- =====================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hmo_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hmo_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- USER POLICIES
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- CASE POLICIES
CREATE POLICY "Users can view own cases" ON public.cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cases" ON public.cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cases" ON public.cases FOR UPDATE USING (auth.uid() = user_id);

-- HMO PROPERTY POLICIES
CREATE POLICY "Users can view own HMO properties" ON public.hmo_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own HMO properties" ON public.hmo_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own HMO properties" ON public.hmo_properties FOR UPDATE USING (auth.uid() = user_id);

-- HMO TENANTS
CREATE POLICY "Users can view own HMO tenants"
ON public.hmo_tenants FOR SELECT
USING (auth.uid() = (SELECT user_id FROM public.hmo_properties WHERE id = hmo_property_id));

-- DOCUMENTS
CREATE POLICY "Users can view own documents"
ON public.documents FOR SELECT
USING (auth.uid() = (SELECT user_id FROM public.cases WHERE id = case_id));

-- ORDERS
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- COMPLIANCE REMINDERS
CREATE POLICY "Users can view own reminders" ON public.compliance_reminders FOR SELECT USING (auth.uid() = user_id);

-- COUNCIL_DATA: PUBLIC
ALTER TABLE public.council_data DISABLE ROW LEVEL SECURITY;

-- =====================================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_hmo_properties_updated_at BEFORE UPDATE ON public.hmo_properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_hmo_tenants_updated_at BEFORE UPDATE ON public.hmo_tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'LH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

CREATE OR REPLACE FUNCTION update_case_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector =
    setweight(to_tsvector('english', COALESCE(NEW.primary_issue, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.property_address, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.tenant_name, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cases_search_vector BEFORE INSERT OR UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION update_case_search_vector();

**END OF DATABASE SCHEMA**

This schema supports both one-time products and the HMO Pro subscription model with complete multi-tenant isolation via Row Level Security.
