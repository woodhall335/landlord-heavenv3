# 🗄️ AGENT 2: BACKEND DEVELOPER - INSTRUCTION FILE

**Role:** Database, API Routes, Business Logic  
**Duration:** Days 4-7 (parallel with Agent 1)  
**Primary Docs:** `/docs/DATABASE_SCHEMA.md`, `/docs/LANDLORD_HEAVEN_BLUEPRINT_v6.0.md`

---

## 📋 PRE-REQUISITES

Before starting:
- [ ] Project initialized (Quick Start Checklist complete)
- [ ] Supabase project created
- [ ] Database schema documentation read (`DATABASE_SCHEMA.md`)
- [ ] Product specifications understood (Blueprint)
- [ ] Environment variables configured

---

## 🎯 YOUR MISSION

Build the entire backend infrastructure:
- ✅ Complete database schema (PostgreSQL + RLS)
- ✅ RESTful API routes for all features
- ✅ Business logic layer
- ✅ Data validation
- ✅ Multi-tenant security (Row Level Security)
- ✅ Comprehensive error handling

---

## 📦 DELIVERABLES CHECKLIST

### Phase 1: Database Setup (Day 4)
- [ ] Complete schema migration
- [ ] Row Level Security policies
- [ ] Indexes and triggers
- [ ] Seed data (councils)
- [ ] Database testing

### Phase 2: Core API Routes (Day 5)
- [ ] Authentication routes
- [ ] Wizard/case management routes
- [ ] User profile routes
- [ ] Document routes
- [ ] Validation middleware

### Phase 3: HMO Pro API (Day 6)
- [ ] HMO property management
- [ ] Tenant CRUD operations
- [ ] Council lookup API
- [ ] Compliance reminders
- [ ] Document regeneration

### Phase 4: Integration & Testing (Day 7)
- [ ] Cron jobs (reminders)
- [ ] Error handling
- [ ] API documentation
- [ ] Integration tests
- [ ] Performance optimization

---

## 🗄️ TASK 1: DATABASE SETUP

### Task 1.1: Create Supabase Client

**Create:** `/src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Create:** `/src/lib/supabase/server.ts`

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server component - can't set cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Server component - can't remove cookies
          }
        },
      },
    }
  );
}

// Admin client (bypasses RLS)
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    }
  );
}
```

---

### Task 1.2: Complete Database Schema

**Reference:** `/docs/DATABASE_SCHEMA.md` → Complete schema

**Create:** `/supabase/migrations/001_complete_schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,

  -- Profile
  user_type TEXT CHECK (user_type IN ('landlord', 'agent', 'admin')) DEFAULT 'landlord',
  company_name TEXT,
  properties_count INTEGER DEFAULT 0,

  -- HMO Pro Subscription
  hmo_pro_active BOOLEAN DEFAULT false,
  hmo_pro_band INTEGER DEFAULT 1,
  hmo_count INTEGER DEFAULT 0,
  hmo_pro_started_at TIMESTAMPTZ,
  hmo_pro_trial_ends_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,

  -- Preferences
  preferred_jurisdiction TEXT,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,

  -- Stats
  total_cases INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_hmo_pro ON public.users(hmo_pro_active) WHERE hmo_pro_active = true;
CREATE INDEX idx_users_stripe_sub ON public.users(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- ============================================================================
-- CASES TABLE
-- ============================================================================

CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,

  -- Case Type
  case_type TEXT CHECK (case_type IN (
    'eviction',
    'money_claim',
    'tenancy_agreement',
    'hmo_license'
  )) NOT NULL,

  -- Jurisdiction
  jurisdiction_code TEXT NOT NULL,

  -- Status
  status TEXT CHECK (status IN (
    'draft',
    'analyzing',
    'ready',
    'purchased',
    'in_progress',
    'completed',
    'abandoned'
  )) DEFAULT 'draft',

  -- Case Details
  primary_issue TEXT,
  property_address TEXT,
  tenant_name TEXT,

  -- Legal Route
  recommended_route TEXT,
  selected_grounds TEXT[],

  -- Financials
  amount_claimed DECIMAL(10,2),
  estimated_costs DECIMAL(10,2),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Analysis Results
  analysis_result JSONB,
  red_flags JSONB,

  -- Progress Tracking
  wizard_progress INTEGER DEFAULT 0,
  last_question_id TEXT,

  -- Search
  search_vector TSVECTOR
);

CREATE INDEX idx_cases_user_id ON public.cases(user_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_jurisdiction ON public.cases(jurisdiction_code);
CREATE INDEX idx_cases_created_at ON public.cases(created_at DESC);
CREATE INDEX idx_cases_search ON public.cases USING gin(search_vector);

-- ============================================================================
-- CASE_FACTS TABLE
-- ============================================================================

CREATE TABLE public.case_facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,

  -- Structured Facts
  facts JSONB NOT NULL,

  -- Validation
  validated_at TIMESTAMPTZ,
  validation_errors JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Version Control
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_case_facts_case_id ON public.case_facts(case_id);

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,

  -- Message Content
  role TEXT CHECK (role IN ('system', 'assistant', 'user')) NOT NULL,
  content TEXT NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- AI Metadata
  model TEXT,
  tokens_used INTEGER,

  -- Question Context
  question_id TEXT,
  input_type TEXT,
  user_input JSONB
);

CREATE INDEX idx_conversations_case_id ON public.conversations(case_id, created_at);

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,

  -- Document Details
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,

  -- Status
  status TEXT CHECK (status IN (
    'generating',
    'preview',
    'ready',
    'downloaded',
    'delivered'
  )) DEFAULT 'generating',

  -- File Details
  file_path TEXT,
  file_url TEXT,
  file_size_bytes INTEGER,
  mime_type TEXT,

  -- Format
  format TEXT CHECK (format IN ('pdf', 'docx')) DEFAULT 'pdf',

  -- Content
  content_json JSONB,
  is_preview BOOLEAN DEFAULT false,
  is_watermarked BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Generation Details
  generated_by TEXT,
  generation_time_ms INTEGER,

  -- Quality Check
  qa_score INTEGER,
  qa_issues JSONB
);

CREATE INDEX idx_documents_case_id ON public.documents(case_id);
CREATE INDEX idx_documents_status ON public.documents(status);

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,

  -- Order Details
  order_number TEXT UNIQUE NOT NULL,

  -- Products Purchased
  product_type TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,

  -- Pricing
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',

  -- Payment Status
  payment_status TEXT CHECK (payment_status IN (
    'pending',
    'processing',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
  )) DEFAULT 'pending',

  -- Payment Provider (Stripe)
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  payment_method TEXT,

  -- Fulfillment
  fulfilled_at TIMESTAMPTZ,
  documents_delivered BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  -- Metadata JSON
  metadata JSONB
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_case_id ON public.orders(case_id);
CREATE INDEX idx_orders_status ON public.orders(payment_status);
CREATE INDEX idx_orders_stripe_intent ON public.orders(stripe_payment_intent_id);

-- ============================================================================
-- HMO_PROPERTIES TABLE
-- ============================================================================

CREATE TABLE public.hmo_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,

  -- Property
  property_address TEXT NOT NULL,
  postcode TEXT NOT NULL,
  council_code TEXT NOT NULL,
  council_name TEXT NOT NULL,

  -- License
  licence_type TEXT CHECK (licence_type IN ('mandatory', 'additional', 'selective')),
  licence_number TEXT,
  licence_status TEXT CHECK (licence_status IN (
    'not_started', 'in_progress', 'submitted', 'granted', 'expired'
  )) DEFAULT 'not_started',
  licence_issued_date DATE,
  licence_expiry_date DATE,

  -- Certificates
  gas_safety_expiry DATE,
  eicr_expiry DATE,
  fire_risk_assessment_date DATE,
  epc_rating TEXT,

  -- Capacity
  max_occupants INTEGER,
  current_occupants INTEGER DEFAULT 0,
  number_of_rooms INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Search
  search_vector TSVECTOR
);

CREATE INDEX idx_hmo_properties_user ON public.hmo_properties(user_id);
CREATE INDEX idx_hmo_properties_council ON public.hmo_properties(council_code);
CREATE INDEX idx_hmo_properties_expiry ON public.hmo_properties(licence_expiry_date);
CREATE INDEX idx_hmo_properties_postcode ON public.hmo_properties(postcode);

-- ============================================================================
-- HMO_TENANTS TABLE
-- ============================================================================

CREATE TABLE public.hmo_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hmo_property_id UUID REFERENCES public.hmo_properties(id) ON DELETE CASCADE NOT NULL,

  -- Tenant
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,

  -- Room
  room_number TEXT NOT NULL,
  room_rent DECIMAL(10,2) NOT NULL,

  -- Tenancy
  tenancy_start DATE NOT NULL,
  tenancy_end DATE,
  is_active BOOLEAN DEFAULT true,

  -- Guarantor
  has_guarantor BOOLEAN DEFAULT false,
  guarantor_name TEXT,
  guarantor_email TEXT,
  guarantor_phone TEXT,
  guarantor_relationship TEXT,
  guarantor_address TEXT,

  -- Version Control
  version INTEGER DEFAULT 1,
  superseded_by UUID REFERENCES public.hmo_tenants(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hmo_tenants_property ON public.hmo_tenants(hmo_property_id);
CREATE INDEX idx_hmo_tenants_active ON public.hmo_tenants(is_active);
CREATE INDEX idx_hmo_tenants_email ON public.hmo_tenants(email);

-- ============================================================================
-- COMPLIANCE_REMINDERS TABLE
-- ============================================================================

CREATE TABLE public.compliance_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  hmo_property_id UUID REFERENCES public.hmo_properties(id) ON DELETE CASCADE,

  -- Reminder
  reminder_type TEXT CHECK (reminder_type IN (
    'licence_expiry',
    'gas_safety',
    'eicr',
    'fire_assessment',
    'tenancy_end',
    'deposit_return'
  )) NOT NULL,

  -- Timing
  due_date DATE NOT NULL,
  days_before INTEGER NOT NULL,

  -- Status
  status TEXT CHECK (status IN ('scheduled', 'sent', 'dismissed')) DEFAULT 'scheduled',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX idx_compliance_reminders_user ON public.compliance_reminders(user_id, status);
CREATE INDEX idx_compliance_reminders_due ON public.compliance_reminders(due_date, status);
CREATE INDEX idx_compliance_reminders_property ON public.compliance_reminders(hmo_property_id);

-- ============================================================================
-- COUNCIL_DATA TABLE
-- ============================================================================

CREATE TABLE public.council_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Council
  council_code TEXT UNIQUE NOT NULL,
  council_name TEXT NOT NULL,
  region TEXT CHECK (region IN ('England', 'Wales', 'Scotland', 'Northern Ireland')),

  -- Licensing
  has_mandatory_licensing BOOLEAN DEFAULT false,
  has_additional_licensing BOOLEAN DEFAULT false,
  has_selective_licensing BOOLEAN DEFAULT false,

  -- Requirements
  min_room_size_sqm DECIMAL(5,2),
  max_occupants_per_bathroom INTEGER,
  requires_fire_alarm BOOLEAN DEFAULT true,
  requires_fire_blanket BOOLEAN DEFAULT true,

  -- Contact
  licensing_team_email TEXT,
  licensing_team_phone TEXT,
  application_url TEXT,
  application_fee DECIMAL(10,2),

  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_council_data_code ON public.council_data(council_code);
CREATE INDEX idx_council_data_region ON public.council_data(region);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hmo_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hmo_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reminders ENABLE ROW LEVEL SECURITY;

-- Users: Can only access own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Cases: Users can access own cases
CREATE POLICY "Users can view own cases"
  ON public.cases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cases"
  ON public.cases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases"
  ON public.cases FOR UPDATE
  USING (auth.uid() = user_id);

-- Case Facts: Via cases table
CREATE POLICY "Users can view own case facts"
  ON public.case_facts FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM public.cases WHERE id = case_id)
  );

CREATE POLICY "Users can insert own case facts"
  ON public.case_facts FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.cases WHERE id = case_id)
  );

-- Conversations: Via cases table
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM public.cases WHERE id = case_id)
  );

-- Documents: Via cases table
CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM public.cases WHERE id = case_id)
  );

-- Orders: Users can access own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- HMO Properties: Users can access own properties
CREATE POLICY "Users can view own HMO properties"
  ON public.hmo_properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own HMO properties"
  ON public.hmo_properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own HMO properties"
  ON public.hmo_properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own HMO properties"
  ON public.hmo_properties FOR DELETE
  USING (auth.uid() = user_id);

-- HMO Tenants: Via properties table
CREATE POLICY "Users can view own HMO tenants"
  ON public.hmo_tenants FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM public.hmo_properties WHERE id = hmo_property_id)
  );

CREATE POLICY "Users can insert own HMO tenants"
  ON public.hmo_tenants FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.hmo_properties WHERE id = hmo_property_id)
  );

CREATE POLICY "Users can update own HMO tenants"
  ON public.hmo_tenants FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM public.hmo_properties WHERE id = hmo_property_id)
  );

-- Compliance Reminders: Users can access own reminders
CREATE POLICY "Users can view own reminders"
  ON public.compliance_reminders FOR SELECT
  USING (auth.uid() = user_id);

-- Council Data: Public read access
ALTER TABLE public.council_data DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_case_facts_updated_at
  BEFORE UPDATE ON public.case_facts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_hmo_properties_updated_at
  BEFORE UPDATE ON public.hmo_properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_hmo_tenants_updated_at
  BEFORE UPDATE ON public.hmo_tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'LH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Update search vector for cases
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

CREATE TRIGGER update_cases_search_vector
  BEFORE INSERT OR UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION update_case_search_vector();
```

**Run migration:**
```bash
# In Supabase SQL Editor, paste and run the above SQL
# Or use Supabase CLI:
supabase db push
```

---

### Task 1.3: TypeScript Database Types

**Create:** `/src/types/database.ts`

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          user_type: 'landlord' | 'agent' | 'admin'
          company_name: string | null
          properties_count: number
          hmo_pro_active: boolean
          hmo_pro_band: number
          hmo_count: number
          hmo_pro_started_at: string | null
          hmo_pro_trial_ends_at: string | null
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          preferred_jurisdiction: string | null
          email_notifications: boolean
          sms_notifications: boolean
          created_at: string
          updated_at: string
          last_login_at: string | null
          total_cases: number
          total_spent: number
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          user_type?: 'landlord' | 'agent' | 'admin'
          company_name?: string | null
          properties_count?: number
          hmo_pro_active?: boolean
          hmo_pro_band?: number
          hmo_count?: number
          hmo_pro_started_at?: string | null
          hmo_pro_trial_ends_at?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          preferred_jurisdiction?: string | null
          email_notifications?: boolean
          sms_notifications?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          total_cases?: number
          total_spent?: number
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          user_type?: 'landlord' | 'agent' | 'admin'
          company_name?: string | null
          properties_count?: number
          hmo_pro_active?: boolean
          hmo_pro_band?: number
          hmo_count?: number
          hmo_pro_started_at?: string | null
          hmo_pro_trial_ends_at?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          preferred_jurisdiction?: string | null
          email_notifications?: boolean
          sms_notifications?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          total_cases?: number
          total_spent?: number
        }
      }
      cases: {
        Row: {
          id: string
          user_id: string
          case_type: 'eviction' | 'money_claim' | 'tenancy_agreement' | 'hmo_license'
          jurisdiction_code: string
          status: 'draft' | 'analyzing' | 'ready' | 'purchased' | 'in_progress' | 'completed' | 'abandoned'
          primary_issue: string | null
          property_address: string | null
          tenant_name: string | null
          recommended_route: string | null
          selected_grounds: string[] | null
          amount_claimed: number | null
          estimated_costs: number | null
          created_at: string
          updated_at: string
          completed_at: string | null
          analysis_result: Json | null
          red_flags: Json | null
          wizard_progress: number
          last_question_id: string | null
          search_vector: unknown | null
        }
        Insert: {
          id?: string
          user_id: string
          case_type: 'eviction' | 'money_claim' | 'tenancy_agreement' | 'hmo_license'
          jurisdiction_code: string
          status?: 'draft' | 'analyzing' | 'ready' | 'purchased' | 'in_progress' | 'completed' | 'abandoned'
          primary_issue?: string | null
          property_address?: string | null
          tenant_name?: string | null
          recommended_route?: string | null
          selected_grounds?: string[] | null
          amount_claimed?: number | null
          estimated_costs?: number | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          analysis_result?: Json | null
          red_flags?: Json | null
          wizard_progress?: number
          last_question_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          case_type?: 'eviction' | 'money_claim' | 'tenancy_agreement' | 'hmo_license'
          jurisdiction_code?: string
          status?: 'draft' | 'analyzing' | 'ready' | 'purchased' | 'in_progress' | 'completed' | 'abandoned'
          primary_issue?: string | null
          property_address?: string | null
          tenant_name?: string | null
          recommended_route?: string | null
          selected_grounds?: string[] | null
          amount_claimed?: number | null
          estimated_costs?: number | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          analysis_result?: Json | null
          red_flags?: Json | null
          wizard_progress?: number
          last_question_id?: string | null
        }
      }
      // Add remaining table types...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
```

---

## 🔌 TASK 2: AUTHENTICATION API

### Task 2.1: Auth Utilities

**Create:** `/src/lib/auth/utils.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getUser() {
  const supabase = createServerSupabaseClient();
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireAuth() {
  const user = await getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return user;
}

export async function getUserProfile(userId: string) {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data;
}
```

---

### Task 2.2: Signup Route

**Create:** `/src/app/api/auth/signup/route.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(1, "Name is required"),
  user_type: z.enum(["landlord", "agent"]).default("landlord"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = signupSchema.parse(body);

    const supabase = createServerSupabaseClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          full_name: validated.full_name,
          user_type: validated.user_type,
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: validated.email,
        full_name: validated.full_name,
        user_type: validated.user_type,
      });

      if (profileError) {
        console.error("Failed to create user profile:", profileError);
        // Auth user created but profile failed - handle gracefully
      }
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      session: authData.session,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

### Task 2.3: Login Route

**Create:** `/src/app/api/auth/login/route.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.user.id);

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 🧙 TASK 3: WIZARD API ROUTES

### Task 3.1: Start Case

**Create:** `/src/app/api/wizard/start/route.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/utils";
import { NextResponse } from "next/server";
import { z } from "zod";

const startCaseSchema = z.object({
  case_type: z.enum(["eviction", "money_claim", "tenancy_agreement", "hmo_license"]),
  jurisdiction_code: z.string(),
});

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = startCaseSchema.parse(body);

    const supabase = createServerSupabaseClient();

    // Create new case
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .insert({
        user_id: user.id,
        case_type: validated.case_type,
        jurisdiction_code: validated.jurisdiction_code,
        status: "draft",
        wizard_progress: 0,
      })
      .select()
      .single();

    if (caseError) {
      throw caseError;
    }

    // Create initial case_facts entry
    const { error: factsError } = await supabase.from("case_facts").insert({
      case_id: caseData.id,
      facts: {},
    });

    if (factsError) {
      throw factsError;
    }

    // Log system message
    await supabase.from("conversations").insert({
      case_id: caseData.id,
      role: "system",
      content: "Case started",
    });

    return NextResponse.json({
      success: true,
      case: caseData,
    });
  } catch (error: any) {
    console.error("Start case error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

### Task 3.2: Get Next Question

**Create:** `/src/app/api/wizard/question/route.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/utils";
import { NextResponse } from "next/server";
import { getNextQuestion } from "@/lib/ai/fact-finder";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { caseId } = body;

    const supabase = createServerSupabaseClient();

    // Get case
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .eq("user_id", user.id)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Get collected facts
    const { data: factsData } = await supabase
      .from("case_facts")
      .select("facts")
      .eq("case_id", caseId)
      .single();

    const collectedFacts = factsData?.facts || {};

    // Get next question from AI (Agent 3 will implement this)
    const questionData = await getNextQuestion(
      caseId,
      collectedFacts,
      caseData.jurisdiction_code
    );

    // Log assistant message
    await supabase.from("conversations").insert({
      case_id: caseId,
      role: "assistant",
      content: questionData.question.text,
      question_id: questionData.question.id,
      model: questionData.model,
    });

    return NextResponse.json({
      success: true,
      question: questionData.question,
      progress: questionData.progress,
    });
  } catch (error: any) {
    console.error("Get question error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

### Task 3.3: Submit Answer

**Create:** `/src/app/api/wizard/answer/route.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/utils";
import { NextResponse } from "next/server";
import { validateAnswer } from "@/lib/validation/answer-validator";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { caseId, questionId, answer } = body;

    const supabase = createServerSupabaseClient();

    // Validate answer (Agent 2's responsibility)
    const validation = await validateAnswer(questionId, answer);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Update case_facts
    const { data: existingFacts } = await supabase
      .from("case_facts")
      .select("facts")
      .eq("case_id", caseId)
      .single();

    const updatedFacts = {
      ...(existingFacts?.facts || {}),
      [questionId]: answer,
    };

    await supabase
      .from("case_facts")
      .update({ facts: updatedFacts })
      .eq("case_id", caseId);

    // Log user message
    await supabase.from("conversations").insert({
      case_id: caseId,
      role: "user",
      content: JSON.stringify(answer),
      question_id: questionId,
      user_input: answer,
    });

    // Update case progress
    const progress = calculateProgress(updatedFacts);
    await supabase
      .from("cases")
      .update({
        wizard_progress: progress,
        last_question_id: questionId,
      })
      .eq("id", caseId);

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error: any) {
    console.error("Submit answer error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateProgress(facts: any): number {
  // Count non-null fact values
  const totalAnswered = Object.values(facts).filter(
    (v) => v !== null && v !== undefined && v !== ""
  ).length;
  
  // Estimate total questions based on case type (simplified)
  const estimatedTotal = 20;
  
  return Math.min(100, Math.floor((totalAnswered / estimatedTotal) * 100));
}
```

---

## 🏠 TASK 4: HMO PRO API ROUTES

### Task 4.1: Property Management

**Create:** `/src/app/api/hmo/properties/route.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/utils";
import { NextResponse } from "next/server";
import { z } from "zod";

const propertySchema = z.object({
  property_address: z.string().min(1),
  postcode: z.string().min(1),
  council_code: z.string().min(1),
  council_name: z.string().min(1),
  number_of_rooms: z.number().int().positive(),
  max_occupants: z.number().int().positive(),
  licence_type: z.enum(["mandatory", "additional", "selective"]).optional(),
});

// GET - List all properties for user
export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("hmo_properties")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, properties: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new property
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = propertySchema.parse(body);

    const supabase = createServerSupabaseClient();

    // Check HMO Pro subscription
    const { data: userData } = await supabase
      .from("users")
      .select("hmo_pro_active, hmo_count")
      .eq("id", user.id)
      .single();

    if (!userData?.hmo_pro_active) {
      return NextResponse.json(
        { error: "HMO Pro subscription required" },
        { status: 403 }
      );
    }

    // Create property
    const { data: property, error: propertyError } = await supabase
      .from("hmo_properties")
      .insert({
        user_id: user.id,
        ...validated,
      })
      .select()
      .single();

    if (propertyError) throw propertyError;

    // Update user HMO count
    await supabase
      .from("users")
      .update({ hmo_count: (userData.hmo_count || 0) + 1 })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      property,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

### Task 4.2: Tenant Management (Unlimited Updates!)

**Create:** `/src/app/api/hmo/tenants/route.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/utils";
import { NextResponse } from "next/server";
import { z } from "zod";

const tenantSchema = z.object({
  hmo_property_id: z.string().uuid(),
  full_name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  room_number: z.string().min(1),
  room_rent: z.number().positive(),
  tenancy_start: z.string(),
  tenancy_end: z.string().optional(),
  has_guarantor: z.boolean().default(false),
  guarantor_name: z.string().optional(),
  guarantor_email: z.string().email().optional(),
  guarantor_phone: z.string().optional(),
  guarantor_relationship: z.string().optional(),
  guarantor_address: z.string().optional(),
});

// GET - List tenants for property
export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Verify property ownership
    const { data: property } = await supabase
      .from("hmo_properties")
      .select("id")
      .eq("id", propertyId)
      .eq("user_id", user.id)
      .single();

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Get tenants
    const { data: tenants, error } = await supabase
      .from("hmo_tenants")
      .select("*")
      .eq("hmo_property_id", propertyId)
      .eq("is_active", true)
      .order("room_number");

    if (error) throw error;

    return NextResponse.json({ success: true, tenants });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add new tenant (UNLIMITED!)
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = tenantSchema.parse(body);

    const supabase = createServerSupabaseClient();

    // Verify property ownership & HMO Pro subscription
    const { data: property } = await supabase
      .from("hmo_properties")
      .select(`
        id,
        users!inner(hmo_pro_active)
      `)
      .eq("id", validated.hmo_property_id)
      .eq("user_id", user.id)
      .single();

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (!property.users.hmo_pro_active) {
      return NextResponse.json(
        { error: "HMO Pro subscription required for tenant management" },
        { status: 403 }
      );
    }

    // Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from("hmo_tenants")
      .insert({
        ...validated,
        is_active: true,
        version: 1,
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // Trigger document regeneration (Agent 3 will handle)
    await triggerDocumentRegeneration(validated.hmo_property_id);

    return NextResponse.json({
      success: true,
      tenant,
      message: "Tenant added successfully. Documents will be regenerated.",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update tenant (version control)
export async function PUT(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tenantId, ...updates } = body;

    const supabase = createServerSupabaseClient();

    // Get existing tenant
    const { data: existingTenant } = await supabase
      .from("hmo_tenants")
      .select(`
        *,
        hmo_properties!inner(user_id)
      `)
      .eq("id", tenantId)
      .single();

    if (!existingTenant || existingTenant.hmo_properties.user_id !== user.id) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    // Create new version
    const { data: newVersion, error: createError } = await supabase
      .from("hmo_tenants")
      .insert({
        ...existingTenant,
        ...updates,
        version: existingTenant.version + 1,
        superseded_by: null,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Mark old version as superseded
    await supabase
      .from("hmo_tenants")
      .update({
        is_active: false,
        superseded_by: newVersion.id,
      })
      .eq("id", tenantId);

    // Trigger document regeneration
    await triggerDocumentRegeneration(existingTenant.hmo_property_id);

    return NextResponse.json({
      success: true,
      tenant: newVersion,
      message: "Tenant updated. Documents will be regenerated.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove tenant
export async function DELETE(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("id");

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get tenant
    const { data: tenant } = await supabase
      .from("hmo_tenants")
      .select(`
        *,
        hmo_properties!inner(user_id)
      `)
      .eq("id", tenantId)
      .single();

    if (!tenant || tenant.hmo_properties.user_id !== user.id) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    // Mark as inactive (soft delete)
    await supabase
      .from("hmo_tenants")
      .update({ is_active: false })
      .eq("id", tenantId);

    // Trigger document regeneration
    await triggerDocumentRegeneration(tenant.hmo_property_id);

    return NextResponse.json({
      success: true,
      message: "Tenant removed. Documents will be regenerated.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

async function triggerDocumentRegeneration(propertyId: string) {
  // Queue document regeneration job
  // This will be implemented by Agent 3 (AI Pipeline)
  console.log(`Queuing document regeneration for property: ${propertyId}`);
  
  // For now, just log - Agent 3 will implement the actual regeneration
}
```

---

### Task 4.3: Council Lookup API

**Create:** `/src/app/api/councils/lookup/route.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postcode = searchParams.get("postcode");

    if (!postcode) {
      return NextResponse.json(
        { error: "Postcode required" },
        { status: 400 }
      );
    }

    // Extract postcode area (e.g., "M14 6HY" -> "M14")
    const postcodeArea = postcode.trim().toUpperCase().split(" ")[0];

    const supabase = createServerSupabaseClient();

    // Lookup council by postcode area
    // Note: Agent 6 will provide the postcode mapping data
    const { data: council, error } = await supabase
      .from("council_data")
      .select("*")
      .or(`postcode_areas.cs.{${postcodeArea}}`)
      .single();

    if (error || !council) {
      return NextResponse.json(
        {
          error: "Council not found for this postcode",
          postcode,
          postcodeArea,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      council,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET all councils (for admin)
export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: councils, error } = await supabase
      .from("council_data")
      .select("council_code, council_name, region")
      .order("council_name");

    if (error) throw error;

    return NextResponse.json({
      success: true,
      councils,
      total: councils.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## ⏰ TASK 5: COMPLIANCE REMINDERS

### Task 5.1: Reminder Scheduler

**Create:** `/src/lib/reminders/scheduler.ts`

```typescript
import { createAdminClient } from "@/lib/supabase/server";
import { addDays, subDays } from "date-fns";

export async function scheduleReminders(propertyId: string) {
  const supabase = createAdminClient();

  // Get property with compliance dates
  const { data: property } = await supabase
    .from("hmo_properties")
    .select("*")
    .eq("id", propertyId)
    .single();

  if (!property) return;

  const reminders: any[] = [];

  // License expiry reminders
  if (property.licence_expiry_date) {
    const expiryDate = new Date(property.licence_expiry_date);
    
    reminders.push(
      {
        user_id: property.user_id,
        hmo_property_id: property.id,
        reminder_type: "licence_expiry",
        due_date: property.licence_expiry_date,
        days_before: 90,
        status: "scheduled",
      },
      {
        user_id: property.user_id,
        hmo_property_id: property.id,
        reminder_type: "licence_expiry",
        due_date: property.licence_expiry_date,
        days_before: 30,
        status: "scheduled",
      },
      {
        user_id: property.user_id,
        hmo_property_id: property.id,
        reminder_type: "licence_expiry",
        due_date: property.licence_expiry_date,
        days_before: 7,
        status: "scheduled",
      }
    );
  }

  // Gas safety reminders
  if (property.gas_safety_expiry) {
    reminders.push(
      {
        user_id: property.user_id,
        hmo_property_id: property.id,
        reminder_type: "gas_safety",
        due_date: property.gas_safety_expiry,
        days_before: 90,
        status: "scheduled",
      },
      {
        user_id: property.user_id,
        hmo_property_id: property.id,
        reminder_type: "gas_safety",
        due_date: property.gas_safety_expiry,
        days_before: 30,
        status: "scheduled",
      },
      {
        user_id: property.user_id,
        hmo_property_id: property.id,
        reminder_type: "gas_safety",
        due_date: property.gas_safety_expiry,
        days_before: 7,
        status: "scheduled",
      }
    );
  }

  // EICR reminders
  if (property.eicr_expiry) {
    reminders.push(
      {
        user_id: property.user_id,
        hmo_property_id: property.id,
        reminder_type: "eicr",
        due_date: property.eicr_expiry,
        days_before: 90,
        status: "scheduled",
      },
      {
        user_id: property.user_id,
        hmo_property_id: property.id,
        reminder_type: "eicr",
        due_date: property.eicr_expiry,
        days_before: 30,
        status: "scheduled",
      },
      {
        user_id: property.user_id,
        hmo_property_id: property.id,
        reminder_type: "eicr",
        due_date: property.eicr_expiry,
        days_before: 7,
        status: "scheduled",
      }
    );
  }

  // Delete existing reminders for this property
  await supabase
    .from("compliance_reminders")
    .delete()
    .eq("hmo_property_id", property.id);

  // Insert new reminders
  if (reminders.length > 0) {
    await supabase.from("compliance_reminders").insert(reminders);
  }
}
```

---

### Task 5.2: Cron Job (Daily Reminder Processor)

**Create:** `/src/app/api/cron/reminders/route.ts`

```typescript
import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendReminderEmail } from "@/lib/email/reminders";
import { subDays, startOfDay } from "date-fns";

export async function GET(request: Request) {
  try {
    // Verify cron secret (Vercel Cron)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const today = startOfDay(new Date());

    // Find reminders due today
    const { data: dueReminders, error } = await supabase
      .from("compliance_reminders")
      .select(`
        *,
        hmo_properties(*),
        users(email, full_name)
      `)
      .eq("status", "scheduled")
      .lte("due_date", today.toISOString());

    if (error) throw error;

    let sent = 0;
    let failed = 0;

    for (const reminder of dueReminders || []) {
      try {
        // Send email (Agent 5 will implement email templates)
        await sendReminderEmail({
          to: reminder.users.email,
          userName: reminder.users.full_name,
          reminderType: reminder.reminder_type,
          property: reminder.hmo_properties,
          dueDate: reminder.due_date,
          daysUntilDue: reminder.days_before,
        });

        // Mark as sent
        await supabase
          .from("compliance_reminders")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", reminder.id);

        sent++;
      } catch (emailError) {
        console.error(`Failed to send reminder ${reminder.id}:`, emailError);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: dueReminders?.length || 0,
      sent,
      failed,
    });
  } catch (error: any) {
    console.error("Reminder cron error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Configure in Vercel:**

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

## 🧪 TASK 6: VALIDATION & ERROR HANDLING

### Task 6.1: Answer Validator

**Create:** `/src/lib/validation/answer-validator.ts`

```typescript
import { z } from "zod";

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export async function validateAnswer(
  questionId: string,
  answer: any
): Promise<ValidationResult> {
  try {
    // Load question schema from config
    // Agent 6 will provide these schemas
    const schema = await getQuestionSchema(questionId);

    if (!schema) {
      return { valid: true }; // No schema = no validation
    }

    // Validate with Zod
    schema.parse(answer);

    return { valid: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map((e) => e.message),
      };
    }

    return {
      valid: false,
      errors: ["Validation failed"],
    };
  }
}

async function getQuestionSchema(questionId: string): Promise<z.ZodSchema | null> {
  // Common validation schemas
  const schemas: Record<string, z.ZodSchema> = {
    rent_amount: z.number().positive("Rent amount must be positive"),
    rent_owed: z.number().positive("Amount owed must be positive"),
    months_overdue: z.number().int().positive().max(36),
    email: z.string().email("Invalid email address"),
    postcode: z.string().regex(/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i, "Invalid UK postcode"),
    phone: z.string().min(10).max(15),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date"),
  };

  return schemas[questionId] || null;
}
```

---

### Task 6.2: Error Handler Middleware

**Create:** `/src/lib/errors/handler.ts`

```typescript
import { NextResponse } from "next/server";

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function handleAPIError(error: any) {
  console.error("API Error:", error);

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error.code === "23505") {
    // PostgreSQL unique violation
    return NextResponse.json(
      { error: "Record already exists" },
      { status: 409 }
    );
  }

  if (error.code === "23503") {
    // PostgreSQL foreign key violation
    return NextResponse.json(
      { error: "Referenced record not found" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

---

## ✅ COMPLETION CHECKLIST

### Phase 1: Database
- [ ] Complete schema migration run
- [ ] All RLS policies working
- [ ] Triggers and functions tested
- [ ] TypeScript types generated
- [ ] Test data inserted

### Phase 2: Core API
- [ ] Auth routes (signup, login, logout)
- [ ] Wizard routes (start, question, answer)
- [ ] Case management routes
- [ ] User profile routes
- [ ] All routes tested with Postman/curl

### Phase 3: HMO Pro API
- [ ] Property CRUD complete
- [ ] Tenant CRUD complete (with versioning)
- [ ] Council lookup API working
- [ ] Reminder scheduler implemented
- [ ] Cron job configured

### Phase 4: Quality
- [ ] All routes have error handling
- [ ] Validation working on all inputs
- [ ] RLS tested (users can't access others' data)
- [ ] API documented
- [ ] Integration tests passing

---

## 🧪 TESTING PROTOCOL

Test each API route:

```bash
# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test start case (with auth token)
curl -X POST http://localhost:3000/api/wizard/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"case_type":"eviction","jurisdiction_code":"uk-england-wales"}'

# Test council lookup
curl http://localhost:3000/api/councils/lookup?postcode=M14%206HY
```

---

## 🚀 HANDOFF TO OTHER AGENTS

Once complete:

1. **Agent 1 (Frontend)** can now call your APIs
2. **Agent 3 (AI)** will implement the AI logic you've stubbed
3. **Agent 4 (Payments)** will add payment processing
4. **Agent 5 (DevOps)** will deploy and monitor

Document all routes in `/docs/api-documentation.md`

---

**END OF AGENT 2 INSTRUCTIONS**

Your database and API layer is the foundation of the entire system. Quality here = quality everywhere!
