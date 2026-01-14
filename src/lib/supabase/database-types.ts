/**
 * Strongly-Typed Database Row Interfaces
 *
 * SOURCE OF TRUTH: /supabase/migrations/*.sql
 * ==========================================
 * These types match the actual PostgreSQL schema exactly.
 *
 * WHY THIS FILE EXISTS:
 * - src/lib/supabase/types.ts intentionally uses `any` for backward compatibility
 * - This file provides strict types for new code and gradual migration
 * - V1: Make strict types available
 * - V2+: Refactor existing code to use strict types
 *
 * USAGE:
 * ```typescript
 * import type { CaseRow, CaseInsert, UserRow } from '@/lib/supabase/database-types';
 *
 * const { data } = await supabase.from('cases').select('*').single();
 * const caseRow: CaseRow = data; // ✅ Typed!
 * ```
 *
 * NOTE: All timestamp columns are `string` (ISO 8601 format from Supabase)
 * NOTE: All jsonb columns use the `Json` type from types.ts
 *
 * TABLES COVERED:
 * - users (001_core_schema.sql)
 * - cases (001_core_schema.sql)
 * - case_facts (001_core_schema.sql)
 * - documents (001_core_schema.sql)
 * - orders (002_orders_payments.sql)
 * - webhook_logs (002_orders_payments.sql)
 * - hmo_properties (003_hmo_pro.sql)
 * - hmo_tenants (003_hmo_pro.sql)
 * - hmo_compliance_items (003_hmo_pro.sql)
 * - ai_usage (004_ai_conversations.sql)
 * - conversations (004_ai_conversations.sql)
 * - councils (005_councils.sql)
 * - email_subscribers (006_email_leads.sql)
 * - email_events (006_email_leads.sql)
 * - seo_pages (007_seo_automation.sql)
 * - seo_keywords (007_seo_automation.sql)
 * - seo_content_queue (007_seo_automation.sql)
 * - seo_automation_log (007_seo_automation.sql)
 */

import type { Json } from './types';

// =============================================================================
// USERS TABLE (Migration 001)
// =============================================================================
// Source: 001_core_schema.sql lines 25-53

/**
 * Database row for `users` table (as returned by SELECT)
 */
export interface UserRow {
  /** Primary key UUID - references auth.users(id) */
  id: string;

  /** User email (UNIQUE, NOT NULL) */
  email: string;

  /** Whether email has been verified (default: false) */
  email_verified: boolean | null;

  /** User's full name */
  full_name: string | null;

  /** User's phone number */
  phone: string | null;

  /** Stripe customer ID (UNIQUE) */
  stripe_customer_id: string | null;

  /** Stripe subscription ID for HMO Pro */
  stripe_subscription_id: string | null;

  /** Whether HMO Pro subscription is active (default: false) */
  hmo_pro_active: boolean | null;

  /** HMO Pro tier: 'hmo_pro_1_5', 'hmo_pro_6_10', 'hmo_pro_11_15', 'hmo_pro_16_20' */
  hmo_pro_tier: string | null;

  /** HMO Pro trial end date */
  hmo_pro_trial_ends_at: string | null;

  /** HMO Pro subscription end date */
  hmo_pro_subscription_ends_at: string | null;

  /** Subscription tier (alias for hmo_pro_tier) */
  subscription_tier: string | null;

  /** Subscription status: 'active', 'trialing', 'canceled', 'inactive' (default: 'inactive') */
  subscription_status: string | null;

  /** Trial end date (alias for hmo_pro_trial_ends_at) */
  trial_ends_at: string | null;

  /** Last sign in timestamp */
  last_sign_in_at: string | null;

  /** Row creation timestamp */
  created_at: string | null;

  /** Row last update timestamp */
  updated_at: string | null;
}

/**
 * Insert type for `users` table
 */
export interface UserInsert {
  /** Required: UUID (must match auth.users id) */
  id: string;

  /** Required: User email */
  email: string;

  /** Optional: Email verified (default: false) */
  email_verified?: boolean | null;

  /** Optional: Full name */
  full_name?: string | null;

  /** Optional: Phone number */
  phone?: string | null;

  /** Optional: Stripe customer ID */
  stripe_customer_id?: string | null;

  /** Optional: Stripe subscription ID */
  stripe_subscription_id?: string | null;

  /** Optional: HMO Pro active (default: false) */
  hmo_pro_active?: boolean | null;

  /** Optional: HMO Pro tier */
  hmo_pro_tier?: string | null;

  /** Optional: HMO Pro trial ends at */
  hmo_pro_trial_ends_at?: string | null;

  /** Optional: HMO Pro subscription ends at */
  hmo_pro_subscription_ends_at?: string | null;

  /** Optional: Subscription tier */
  subscription_tier?: string | null;

  /** Optional: Subscription status (default: 'inactive') */
  subscription_status?: string | null;

  /** Optional: Trial ends at */
  trial_ends_at?: string | null;

  /** Optional: Last sign in at */
  last_sign_in_at?: string | null;

  /** Optional: Created at (default: now()) */
  created_at?: string | null;

  /** Optional: Updated at (default: now()) */
  updated_at?: string | null;
}

/**
 * Update type for `users` table
 */
export interface UserUpdate {
  /** Optional: User email */
  email?: string;

  /** Optional: Email verified */
  email_verified?: boolean | null;

  /** Optional: Full name */
  full_name?: string | null;

  /** Optional: Phone number */
  phone?: string | null;

  /** Optional: Stripe customer ID */
  stripe_customer_id?: string | null;

  /** Optional: Stripe subscription ID */
  stripe_subscription_id?: string | null;

  /** Optional: HMO Pro active */
  hmo_pro_active?: boolean | null;

  /** Optional: HMO Pro tier */
  hmo_pro_tier?: string | null;

  /** Optional: HMO Pro trial ends at */
  hmo_pro_trial_ends_at?: string | null;

  /** Optional: HMO Pro subscription ends at */
  hmo_pro_subscription_ends_at?: string | null;

  /** Optional: Subscription tier */
  subscription_tier?: string | null;

  /** Optional: Subscription status */
  subscription_status?: string | null;

  /** Optional: Trial ends at */
  trial_ends_at?: string | null;

  /** Optional: Last sign in at */
  last_sign_in_at?: string | null;

  /** Optional: Updated at */
  updated_at?: string | null;
}

// =============================================================================
// CASES TABLE
// =============================================================================
// Source: supabase_schema.MD lines 87-102

/**
 * Database row for `cases` table (as returned by SELECT)
 */
export interface CaseRow {
  /** Primary key UUID (NOT NULL, default: uuid_generate_v4()) */
  id: string;

  /** Foreign key to users.id (NULLABLE) */
  user_id: string | null;

  /** Case type: 'eviction', 'money_claim', 'tenancy_agreement' (NOT NULL) */
  case_type: string;

  /** Jurisdiction: 'england-wales', 'scotland', 'northern-ireland' (NOT NULL) */
  jurisdiction: string;

  /** Case status: 'in_progress', 'completed', 'archived' (NULLABLE, default: 'in_progress') */
  status: string | null;

  /** Mirrored copy of case_facts.facts for convenience (NULLABLE, default: '{}') */
  collected_facts: Json | null;

  /** Wizard completion percentage 0-100 (NULLABLE, default: 0) */
  wizard_progress: number | null;

  /** Timestamp when wizard was completed (NULLABLE) */
  wizard_completed_at: string | null;

  /** Decision engine recommended route (NULLABLE) */
  recommended_route: string | null;

  /** Decision engine recommended grounds array (NULLABLE) */
  recommended_grounds: string[] | null;

  /** Case strength score 0-100 (NULLABLE) */
  success_probability: number | null;

  /** Decision engine red flags array (NULLABLE, default: '[]') */
  red_flags: Json | null;

  /** Compliance issues array (NULLABLE, default: '[]') */
  compliance_issues: Json | null;

  /** Council code for HMO licensing (NULLABLE) */
  council_code: string | null;

  /** Anonymous session token for security (NULLABLE) */
  session_token: string | null;

  /** Row creation timestamp (NULLABLE, default: now()) */
  created_at: string | null;

  /** Row last update timestamp (NULLABLE, default: now()) */
  updated_at: string | null;
}

/**
 * Insert type for `cases` table (only required columns)
 */
export interface CaseInsert {
  /** Optional: UUID (default: uuid_generate_v4()) */
  id?: string;

  /** Optional: Foreign key to users.id */
  user_id?: string | null;

  /** Required: Case type */
  case_type: string;

  /** Required: Jurisdiction */
  jurisdiction: string;

  /** Optional: Case status (default: 'in_progress') */
  status?: string | null;

  /** Optional: Collected facts (default: '{}') */
  collected_facts?: Json | null;

  /** Optional: Wizard progress (default: 0) */
  wizard_progress?: number | null;

  /** Optional: Wizard completion timestamp */
  wizard_completed_at?: string | null;

  /** Optional: Recommended route */
  recommended_route?: string | null;

  /** Optional: Recommended grounds */
  recommended_grounds?: string[] | null;

  /** Optional: Success probability */
  success_probability?: number | null;

  /** Optional: Red flags (default: '[]') */
  red_flags?: Json | null;

  /** Optional: Compliance issues (default: '[]') */
  compliance_issues?: Json | null;

  /** Optional: Council code */
  council_code?: string | null;

  /** Optional: Session token */
  session_token?: string | null;

  /** Optional: Created at (default: now()) */
  created_at?: string | null;

  /** Optional: Updated at (default: now()) */
  updated_at?: string | null;
}

/**
 * Update type for `cases` table (all columns optional)
 */
export interface CaseUpdate {
  /** Optional: Foreign key to users.id */
  user_id?: string | null;

  /** Optional: Case type */
  case_type?: string;

  /** Optional: Jurisdiction */
  jurisdiction?: string;

  /** Optional: Case status */
  status?: string | null;

  /** Optional: Collected facts */
  collected_facts?: Json | null;

  /** Optional: Wizard progress */
  wizard_progress?: number | null;

  /** Optional: Wizard completion timestamp */
  wizard_completed_at?: string | null;

  /** Optional: Recommended route */
  recommended_route?: string | null;

  /** Optional: Recommended grounds */
  recommended_grounds?: string[] | null;

  /** Optional: Success probability */
  success_probability?: number | null;

  /** Optional: Red flags */
  red_flags?: Json | null;

  /** Optional: Compliance issues */
  compliance_issues?: Json | null;

  /** Optional: Council code */
  council_code?: string | null;

  /** Optional: Session token */
  session_token?: string | null;

  /** Optional: Updated at */
  updated_at?: string | null;
}

// =============================================================================
// CASE_FACTS TABLE
// =============================================================================
// Source: supabase_schema.MD lines 79-86

/**
 * Database row for `case_facts` table (as returned by SELECT)
 */
export interface CaseFactsRow {
  /** Primary key UUID (NOT NULL, default: uuid_generate_v4()) */
  id: string;

  /** Foreign key to cases.id (NOT NULL) */
  case_id: string;

  /** Flat WizardFacts storage (NOT NULL, default: '{}') */
  facts: Json;

  /** Timestamp when facts were validated (NULLABLE) */
  validated_at: string | null;

  /** Validation errors array (NULLABLE) */
  validation_errors: Json | null;

  /** Version number for optimistic locking (NULLABLE, default: 1) */
  version: number | null;

  /** Row creation timestamp (NULLABLE, default: now()) */
  created_at: string | null;

  /** Row last update timestamp (NULLABLE, default: now()) */
  updated_at: string | null;
}

/**
 * Insert type for `case_facts` table (only required columns)
 */
export interface CaseFactsInsert {
  /** Optional: UUID (default: uuid_generate_v4()) */
  id?: string;

  /** Required: Foreign key to cases.id */
  case_id: string;

  /** Optional: Facts (default: '{}') */
  facts?: Json;

  /** Optional: Validated at */
  validated_at?: string | null;

  /** Optional: Validation errors */
  validation_errors?: Json | null;

  /** Optional: Version (default: 1) */
  version?: number | null;

  /** Optional: Created at (default: now()) */
  created_at?: string | null;

  /** Optional: Updated at (default: now()) */
  updated_at?: string | null;
}

/**
 * Update type for `case_facts` table (all columns optional)
 */
export interface CaseFactsUpdate {
  /** Optional: Foreign key to cases.id */
  case_id?: string;

  /** Optional: Facts */
  facts?: Json;

  /** Optional: Validated at */
  validated_at?: string | null;

  /** Optional: Validation errors */
  validation_errors?: Json | null;

  /** Optional: Version */
  version?: number | null;

  /** Optional: Updated at */
  updated_at?: string | null;
}

// =============================================================================
// DOCUMENTS TABLE
// =============================================================================
// Source: supabase_schema.MD lines 143-159

/**
 * Database row for `documents` table (as returned by SELECT)
 */
export interface DocumentRow {
  /** Primary key UUID (NOT NULL, default: uuid_generate_v4()) */
  id: string;

  /** Foreign key to users.id (NULLABLE) */
  user_id: string | null;

  /** Foreign key to cases.id (NULLABLE) */
  case_id: string | null;

  /** Document type: 'n5', 'n119', 'form_e', etc. (NOT NULL) */
  document_type: string;

  /** Human-readable document title (NOT NULL) */
  document_title: string;

  /** Jurisdiction: 'england-wales', 'scotland', 'northern-ireland' (NOT NULL) */
  jurisdiction: string;

  /** AI model used for generation: 'gpt-4o-mini', etc. (NULLABLE) */
  generated_by_model: string | null;

  /** Token count for generation (NULLABLE) */
  generation_tokens_used: number | null;

  /** Generation cost in USD (NULLABLE) */
  generation_cost_usd: number | null;

  /** QA score 0-100 (NULLABLE) */
  qa_score: number | null;

  /** QA issues array (NULLABLE, default: '[]') */
  qa_issues: Json | null;

  /** Whether QA passed (NULLABLE, default: false) */
  qa_passed: boolean | null;

  /** HTML content of document (NULLABLE) */
  html_content: string | null;

  /** PDF URL in storage (NULLABLE) */
  pdf_url: string | null;

  /** Whether this is a preview (NULLABLE, default: true) */
  is_preview: boolean | null;

  /** Additional metadata (NULLABLE, default: '{}') */
  metadata: Json | null;

  /** Anonymous session token (NULLABLE) */
  session_token: string | null;

  /** Row creation timestamp (NULLABLE, default: now()) */
  created_at: string | null;

  /** Row last update timestamp (NULLABLE, default: now()) */
  updated_at: string | null;
}

/**
 * Insert type for `documents` table (only required columns)
 */
export interface DocumentInsert {
  /** Optional: UUID (default: uuid_generate_v4()) */
  id?: string;

  /** Optional: Foreign key to users.id */
  user_id?: string | null;

  /** Optional: Foreign key to cases.id */
  case_id?: string | null;

  /** Required: Document type */
  document_type: string;

  /** Required: Document title */
  document_title: string;

  /** Required: Jurisdiction */
  jurisdiction: string;

  /** Optional: Generated by model */
  generated_by_model?: string | null;

  /** Optional: Generation tokens used */
  generation_tokens_used?: number | null;

  /** Optional: Generation cost USD */
  generation_cost_usd?: number | null;

  /** Optional: QA score */
  qa_score?: number | null;

  /** Optional: QA issues (default: '[]') */
  qa_issues?: Json | null;

  /** Optional: QA passed (default: false) */
  qa_passed?: boolean | null;

  /** Optional: HTML content */
  html_content?: string | null;

  /** Optional: PDF URL */
  pdf_url?: string | null;

  /** Optional: Is preview (default: true) */
  is_preview?: boolean | null;

  /** Optional: Metadata (default: '{}') */
  metadata?: Json | null;

  /** Optional: Session token */
  session_token?: string | null;

  /** Optional: Created at (default: now()) */
  created_at?: string | null;

  /** Optional: Updated at (default: now()) */
  updated_at?: string | null;
}

/**
 * Update type for `documents` table (all columns optional)
 */
export interface DocumentUpdate {
  /** Optional: Foreign key to users.id */
  user_id?: string | null;

  /** Optional: Foreign key to cases.id */
  case_id?: string | null;

  /** Optional: Document type */
  document_type?: string;

  /** Optional: Document title */
  document_title?: string;

  /** Optional: Jurisdiction */
  jurisdiction?: string;

  /** Optional: Generated by model */
  generated_by_model?: string | null;

  /** Optional: Generation tokens used */
  generation_tokens_used?: number | null;

  /** Optional: Generation cost USD */
  generation_cost_usd?: number | null;

  /** Optional: QA score */
  qa_score?: number | null;

  /** Optional: QA issues */
  qa_issues?: Json | null;

  /** Optional: QA passed */
  qa_passed?: boolean | null;

  /** Optional: HTML content */
  html_content?: string | null;

  /** Optional: PDF URL */
  pdf_url?: string | null;

  /** Optional: Is preview */
  is_preview?: boolean | null;

  /** Optional: Metadata */
  metadata?: Json | null;

  /** Optional: Session token */
  session_token?: string | null;

  /** Optional: Updated at */
  updated_at?: string | null;
}

// =============================================================================
// CONVERSATIONS TABLE
// =============================================================================
// Source: supabase_schema.MD lines 103-112

/**
 * Database row for `conversations` table (as returned by SELECT)
 * Used by Ask Heaven for conversation history
 */
export interface ConversationRow {
  /** Primary key UUID (NOT NULL, default: uuid_generate_v4()) */
  id: string;

  /** Foreign key to cases.id (NOT NULL) */
  case_id: string;

  /** Message role: 'user', 'assistant', 'system' (NOT NULL) */
  role: string;

  /** Message content (NOT NULL) */
  content: string;

  /** AI model used: 'gpt-4o-mini', etc. (NULLABLE) */
  model: string | null;

  /** Token count for this message (NULLABLE) */
  tokens_used: number | null;

  /** MQS question ID if applicable (NULLABLE) */
  question_id: string | null;

  /** Input type: 'text', 'select', etc. (NULLABLE) */
  input_type: string | null;

  /** User input data (NULLABLE) */
  user_input: Json | null;

  /** Row creation timestamp (NULLABLE, default: now()) */
  created_at: string | null;
}

/**
 * Insert type for `conversations` table (only required columns)
 */
export interface ConversationInsert {
  /** Optional: UUID (default: uuid_generate_v4()) */
  id?: string;

  /** Required: Foreign key to cases.id */
  case_id: string;

  /** Required: Message role */
  role: string;

  /** Required: Message content */
  content: string;

  /** Optional: AI model */
  model?: string | null;

  /** Optional: Tokens used */
  tokens_used?: number | null;

  /** Optional: Question ID */
  question_id?: string | null;

  /** Optional: Input type */
  input_type?: string | null;

  /** Optional: User input */
  user_input?: Json | null;

  /** Optional: Created at (default: now()) */
  created_at?: string | null;
}

/**
 * Update type for `conversations` table (all columns optional)
 */
export interface ConversationUpdate {
  /** Optional: Foreign key to cases.id */
  case_id?: string;

  /** Optional: Message role */
  role?: string;

  /** Optional: Message content */
  content?: string;

  /** Optional: AI model */
  model?: string | null;

  /** Optional: Tokens used */
  tokens_used?: number | null;

  /** Optional: Question ID */
  question_id?: string | null;

  /** Optional: Input type */
  input_type?: string | null;

  /** Optional: User input */
  user_input?: Json | null;
}

// =============================================================================
// AI USAGE TABLES
// =============================================================================
// Source: supabase_schema.MD lines 56-78 (ai_usage, ai_usage_logs)

export interface AiUsageRow {
  id: string;
  user_id: string;
  model: string;
  operation: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  case_id: string | null;
  document_id: string | null;
  metadata: Json | null;
  created_at: string | null;
}

export interface AiUsageInsert {
  id?: string;
  user_id: string;
  model: string;
  operation: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  case_id?: string | null;
  document_id?: string | null;
  metadata?: Json | null;
  created_at?: string | null;
}

export interface AiUsageLogRow {
  id: string;
  model: string;
  operation_type: string;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  total_cost_usd: number | null;
  user_id: string | null;
  case_id: string | null;
  document_id: string | null;
  created_at: string | null;
}

export interface AiUsageLogInsert {
  id?: string;
  model: string;
  operation_type: string;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  total_cost_usd?: number | null;
  user_id?: string | null;
  case_id?: string | null;
  document_id?: string | null;
  created_at?: string | null;
}

// =============================================================================
// ORDERS TABLE
// =============================================================================
// Source: supabase_schema.MD lines 215-230

/**
 * Database row for `orders` table (as returned by SELECT)
 * Source: 002_orders_payments.sql, 012_order_attribution.sql
 */
export interface OrderRow {
  /** Primary key UUID */
  id: string;

  /** Foreign key to users.id (NULLABLE for anonymous) */
  user_id: string | null;

  /** Foreign key to cases.id */
  case_id: string | null;

  /** Product type: 'notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement' */
  product_type: string;

  /** Human-readable product name */
  product_name: string;

  /** Product amount */
  amount: number;

  /** Currency (default: 'GBP') */
  currency: string | null;

  /** Total amount including any fees */
  total_amount: number;

  /** Payment status: 'pending', 'paid', 'failed', 'refunded', 'partially_refunded' */
  payment_status: string | null;

  /** Stripe payment intent ID */
  stripe_payment_intent_id: string | null;

  /** Stripe charge ID */
  stripe_charge_id: string | null;

  /** Stripe checkout session ID */
  stripe_session_id: string | null;

  /** When payment was made */
  paid_at: string | null;

  /** Fulfillment status: 'pending', 'ready_to_generate', 'processing', 'fulfilled', 'failed' */
  fulfillment_status: string | null;

  /** When order was fulfilled */
  fulfilled_at: string | null;

  // === Attribution fields (Migration 012) ===

  /** First page path user visited (e.g., /how-to-evict-tenant) */
  landing_path: string | null;

  /** UTM source parameter (e.g., google, facebook) - first-touch */
  utm_source: string | null;

  /** UTM medium parameter (e.g., cpc, organic, email) - first-touch */
  utm_medium: string | null;

  /** UTM campaign parameter (e.g., section21-guide-jan2026) - first-touch */
  utm_campaign: string | null;

  /** UTM term parameter (e.g., eviction notice) - first-touch */
  utm_term: string | null;

  /** UTM content parameter (e.g., hero-cta, sidebar) - first-touch */
  utm_content: string | null;

  /** HTTP referer from first visit */
  referrer: string | null;

  /** Timestamp of user first visit */
  first_touch_at: string | null;

  /** Google Analytics client ID for server-side event matching */
  ga_client_id: string | null;

  /** Row creation timestamp */
  created_at: string | null;

  /** Row last update timestamp */
  updated_at: string | null;
}

/**
 * Insert type for `orders` table
 */
export interface OrderInsert {
  id?: string;
  user_id?: string | null;
  case_id?: string | null;
  product_type: string;
  product_name: string;
  amount: number;
  currency?: string | null;
  total_amount: number;
  payment_status?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  stripe_session_id?: string | null;
  paid_at?: string | null;
  fulfillment_status?: string | null;
  fulfilled_at?: string | null;
  // Attribution fields (Migration 012)
  landing_path?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  referrer?: string | null;
  first_touch_at?: string | null;
  ga_client_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Update type for `orders` table
 */
export interface OrderUpdate {
  user_id?: string | null;
  case_id?: string | null;
  product_type?: string;
  product_name?: string;
  amount?: number;
  currency?: string | null;
  total_amount?: number;
  payment_status?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  stripe_session_id?: string | null;
  paid_at?: string | null;
  fulfillment_status?: string | null;
  fulfilled_at?: string | null;
  // Attribution fields (Migration 012)
  landing_path?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  referrer?: string | null;
  first_touch_at?: string | null;
  ga_client_id?: string | null;
  updated_at?: string | null;
}

// =============================================================================
// HMO TABLES
// =============================================================================
// Source: supabase_schema.MD lines 160-214

export interface HmoComplianceItemRow {
  id: string;
  property_id: string;
  user_id: string;
  item_type: string;
  item_title: string;
  description: string | null;
  due_date: string;
  completed_date: string | null;
  status: string | null;
  reminder_sent: boolean | null;
  reminder_sent_at: string | null;
  certificate_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface HmoComplianceItemInsert {
  id?: string;
  property_id: string;
  user_id: string;
  item_type: string;
  item_title: string;
  description?: string | null;
  due_date: string;
  completed_date?: string | null;
  status?: string | null;
  reminder_sent?: boolean | null;
  reminder_sent_at?: string | null;
  certificate_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HmoPropertyRow {
  id: string;
  user_id: string;
  property_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postcode: string;
  council_code: string;
  council_name: string | null;
  license_type: string | null;
  license_number: string | null;
  license_expiry_date: string | null;
  number_of_bedrooms: number | null;
  number_of_tenants: number | null;
  max_occupancy: number | null;
  number_of_bathrooms: number | null;
  number_of_kitchens: number | null;
  has_fire_alarm: boolean | null;
  has_co_alarm: boolean | null;
  has_emergency_lighting: boolean | null;
  has_fire_doors: boolean | null;
  has_fire_blanket: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface HmoPropertyInsert {
  id?: string;
  user_id: string;
  property_name: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  postcode: string;
  council_code: string;
  council_name?: string | null;
  license_type?: string | null;
  license_number?: string | null;
  license_expiry_date?: string | null;
  number_of_bedrooms?: number | null;
  number_of_tenants?: number | null;
  max_occupancy?: number | null;
  number_of_bathrooms?: number | null;
  number_of_kitchens?: number | null;
  has_fire_alarm?: boolean | null;
  has_co_alarm?: boolean | null;
  has_emergency_lighting?: boolean | null;
  has_fire_doors?: boolean | null;
  has_fire_blanket?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HmoTenantRow {
  id: string;
  property_id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  room_number: string | null;
  move_in_date: string;
  tenancy_end_date: string | null;
  move_out_date: string | null;
  monthly_rent: number;
  deposit_amount: number | null;
  deposit_protected: boolean | null;
  deposit_scheme: string | null;
  tenancy_status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface HmoTenantInsert {
  id?: string;
  property_id: string;
  user_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  room_number?: string | null;
  move_in_date: string;
  tenancy_end_date?: string | null;
  move_out_date?: string | null;
  monthly_rent: number;
  deposit_amount?: number | null;
  deposit_protected?: boolean | null;
  deposit_scheme?: string | null;
  tenancy_status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// =============================================================================
// WEBHOOK_LOGS TABLE (Migration 002)
// =============================================================================
// Source: 002_orders_payments.sql lines 75-96

/**
 * Database row for `webhook_logs` table (as returned by SELECT)
 */
export interface WebhookLogRow {
  /** Primary key UUID */
  id: string;

  /** Webhook event type */
  event_type: string;

  /** Stripe event ID (UNIQUE for deduplication) */
  stripe_event_id: string | null;

  /** Full webhook payload */
  payload: Json | null;

  /** Processing status: 'received', 'processing', 'completed', 'failed' */
  status: string | null;

  /** Error message if processing failed */
  error_message: string | null;

  /** Processing result data */
  processing_result: Json | null;

  /** When webhook was received */
  received_at: string | null;

  /** When webhook was processed */
  processed_at: string | null;

  /** Row creation timestamp */
  created_at: string | null;
}

/**
 * Insert type for `webhook_logs` table
 */
export interface WebhookLogInsert {
  id?: string;
  event_type: string;
  stripe_event_id?: string | null;
  payload?: Json | null;
  status?: string | null;
  error_message?: string | null;
  processing_result?: Json | null;
  received_at?: string | null;
  processed_at?: string | null;
  created_at?: string | null;
}

// =============================================================================
// COUNCILS TABLE (Migration 005)
// =============================================================================
// Source: 005_councils.sql lines 10-30

/**
 * Database row for `councils` table (as returned by SELECT)
 */
export interface CouncilRow {
  /** Primary key UUID */
  id: string;

  /** ONS council code (e.g., E09000001) - UNIQUE */
  code: string;

  /** Council name */
  name: string;

  /** Jurisdiction: 'england', 'wales', 'scotland', 'northern-ireland' */
  jurisdiction: string;

  /** Region name */
  region: string;

  /** Council website URL */
  website: string | null;

  /** HMO licensing information: { mandatory, additional, selective, schemes } */
  hmo_licensing: Json;

  /** HMO thresholds: { persons, households, storeys } */
  hmo_thresholds: Json;

  /** Contact information: { phone, email, address } */
  contact: Json | null;

  /** Postcode areas covered by this council */
  postcode_areas: string[];

  /** Data confidence level */
  confidence: string | null;

  /** Row creation timestamp */
  created_at: string | null;

  /** Row last update timestamp */
  updated_at: string | null;
}

// =============================================================================
// EMAIL_SUBSCRIBERS TABLE (Migration 006)
// =============================================================================
// Source: 006_email_leads.sql lines 10-29

/**
 * Database row for `email_subscribers` table (as returned by SELECT)
 */
export interface EmailSubscriberRow {
  /** Primary key UUID */
  id: string;

  /** Subscriber email (UNIQUE) */
  email: string;

  /** Source: 'wizard', 'popup', 'footer', 'checkout' */
  source: string | null;

  /** Jurisdiction: 'england', 'scotland', etc. */
  jurisdiction: string | null;

  /** Last associated case ID */
  last_case_id: string | null;

  /** Segmentation tags */
  tags: string[];

  /** Last activity timestamp */
  last_seen_at: string;

  /** Row creation timestamp */
  created_at: string;
}

/**
 * Insert type for `email_subscribers` table
 */
export interface EmailSubscriberInsert {
  id?: string;
  email: string;
  source?: string | null;
  jurisdiction?: string | null;
  last_case_id?: string | null;
  tags?: string[];
  last_seen_at?: string;
  created_at?: string;
}

/**
 * Update type for `email_subscribers` table
 */
export interface EmailSubscriberUpdate {
  email?: string;
  source?: string | null;
  jurisdiction?: string | null;
  last_case_id?: string | null;
  tags?: string[];
  last_seen_at?: string;
}

// =============================================================================
// EMAIL_EVENTS TABLE (Migration 006)
// =============================================================================
// Source: 006_email_leads.sql lines 51-61

/**
 * Database row for `email_events` table (as returned by SELECT)
 */
export interface EmailEventRow {
  /** Primary key UUID */
  id: string;

  /** Email address */
  email: string;

  /** Event type: 'lead_captured', 'email_sent', 'email_opened', 'link_clicked' */
  event_type: string;

  /** Event data/metadata */
  event_data: Json;

  /** Row creation timestamp */
  created_at: string;
}

/**
 * Insert type for `email_events` table
 */
export interface EmailEventInsert {
  id?: string;
  email: string;
  event_type: string;
  event_data?: Json;
  created_at?: string;
}

// =============================================================================
// SEO_PAGES TABLE (Migration 007)
// =============================================================================
// Source: 007_seo_automation.sql lines 10-71

/**
 * Database row for `seo_pages` table (as returned by SELECT)
 */
export interface SeoPageRow {
  /** Primary key UUID */
  id: string;

  /** URL slug (UNIQUE) */
  slug: string;

  /** Page title */
  title: string;

  /** Meta description */
  meta_description: string;

  /** H1 heading */
  h1: string;

  /** Page content */
  content: string;

  /** Content type: 'location', 'topic', 'service', 'guide' */
  content_type: string;

  /** Target keyword */
  target_keyword: string;

  /** Secondary keywords */
  secondary_keywords: string[] | null;

  /** Monthly search volume */
  search_volume: number | null;

  /** Keyword difficulty (0-100) */
  keyword_difficulty: number | null;

  /** Target location */
  location: string | null;

  /** Target region */
  region: string | null;

  /** Target jurisdiction */
  jurisdiction: string | null;

  /** Word count */
  word_count: number | null;

  /** Readability score */
  readability_score: number | null;

  /** AI quality score (0-100) */
  ai_quality_score: number | null;

  /** Status: 'draft', 'published', 'archived' */
  status: string;

  /** When published */
  published_at: string | null;

  /** When last refreshed */
  last_refreshed_at: string | null;

  /** Total views */
  views: number | null;

  /** Unique visitors */
  unique_visitors: number | null;

  /** Average time on page (seconds) */
  avg_time_on_page: number | null;

  /** Bounce rate (percentage) */
  bounce_rate: number | null;

  /** Conversion count */
  conversions: number | null;

  /** Current search rank */
  current_rank: number | null;

  /** Best search rank achieved */
  best_rank: number | null;

  /** Rank history over time */
  rank_history: Json | null;

  /** Internal links */
  internal_links: string[] | null;

  /** Backlinks count */
  backlinks_count: number | null;

  /** Schema.org markup */
  schema_markup: Json | null;

  /** Whether to auto-refresh content */
  auto_refresh: boolean | null;

  /** Model that generated content */
  last_generated_by: string | null;

  /** Prompt used for generation */
  generation_prompt: string | null;

  /** Row creation timestamp */
  created_at: string | null;

  /** Row last update timestamp */
  updated_at: string | null;
}

/**
 * Insert type for `seo_pages` table
 */
export interface SeoPageInsert {
  id?: string;
  slug: string;
  title: string;
  meta_description: string;
  h1: string;
  content: string;
  content_type?: string;
  target_keyword: string;
  secondary_keywords?: string[] | null;
  search_volume?: number | null;
  keyword_difficulty?: number | null;
  location?: string | null;
  region?: string | null;
  jurisdiction?: string | null;
  word_count?: number | null;
  readability_score?: number | null;
  ai_quality_score?: number | null;
  status?: string;
  published_at?: string | null;
  last_refreshed_at?: string | null;
  views?: number | null;
  unique_visitors?: number | null;
  avg_time_on_page?: number | null;
  bounce_rate?: number | null;
  conversions?: number | null;
  current_rank?: number | null;
  best_rank?: number | null;
  rank_history?: Json | null;
  internal_links?: string[] | null;
  backlinks_count?: number | null;
  schema_markup?: Json | null;
  auto_refresh?: boolean | null;
  last_generated_by?: string | null;
  generation_prompt?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Update type for `seo_pages` table
 */
export interface SeoPageUpdate {
  slug?: string;
  title?: string;
  meta_description?: string;
  h1?: string;
  content?: string;
  content_type?: string;
  target_keyword?: string;
  secondary_keywords?: string[] | null;
  search_volume?: number | null;
  keyword_difficulty?: number | null;
  location?: string | null;
  region?: string | null;
  jurisdiction?: string | null;
  word_count?: number | null;
  readability_score?: number | null;
  ai_quality_score?: number | null;
  status?: string;
  published_at?: string | null;
  last_refreshed_at?: string | null;
  views?: number | null;
  unique_visitors?: number | null;
  avg_time_on_page?: number | null;
  bounce_rate?: number | null;
  conversions?: number | null;
  current_rank?: number | null;
  best_rank?: number | null;
  rank_history?: Json | null;
  internal_links?: string[] | null;
  backlinks_count?: number | null;
  schema_markup?: Json | null;
  auto_refresh?: boolean | null;
  last_generated_by?: string | null;
  generation_prompt?: string | null;
  updated_at?: string | null;
}

// =============================================================================
// SEO_KEYWORDS TABLE (Migration 007)
// =============================================================================
// Source: 007_seo_automation.sql lines 103-135

/**
 * Database row for `seo_keywords` table (as returned by SELECT)
 */
export interface SeoKeywordRow {
  /** Primary key UUID */
  id: string;

  /** Keyword text (UNIQUE) */
  keyword: string;

  /** Monthly search volume */
  search_volume: number | null;

  /** Keyword difficulty (0-100) */
  difficulty: number | null;

  /** Cost per click */
  cpc: number | null;

  /** Search intent: 'informational', 'navigational', 'transactional' */
  intent: string | null;

  /** Category: 'eviction', 'tenancy', 'hmo' */
  category: string | null;

  /** Target jurisdiction */
  jurisdiction: string | null;

  /** Target location */
  location: string | null;

  /** SERP features present */
  serp_features: string[] | null;

  /** Top ranking domains */
  top_ranking_domains: string[] | null;

  /** Content gaps identified */
  content_gaps: string[] | null;

  /** Status: 'identified', 'targeted', 'ranked' */
  status: string;

  /** Priority (1-10) */
  priority: number | null;

  /** Assigned page ID */
  assigned_page_id: string | null;

  /** Current search rank */
  current_rank: number | null;

  /** Rank history over time */
  rank_history: Json | null;

  /** Row creation timestamp */
  created_at: string | null;

  /** Row last update timestamp */
  updated_at: string | null;
}

/**
 * Insert type for `seo_keywords` table
 */
export interface SeoKeywordInsert {
  id?: string;
  keyword: string;
  search_volume?: number | null;
  difficulty?: number | null;
  cpc?: number | null;
  intent?: string | null;
  category?: string | null;
  jurisdiction?: string | null;
  location?: string | null;
  serp_features?: string[] | null;
  top_ranking_domains?: string[] | null;
  content_gaps?: string[] | null;
  status?: string;
  priority?: number | null;
  assigned_page_id?: string | null;
  current_rank?: number | null;
  rank_history?: Json | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Update type for `seo_keywords` table
 */
export interface SeoKeywordUpdate {
  keyword?: string;
  search_volume?: number | null;
  difficulty?: number | null;
  cpc?: number | null;
  intent?: string | null;
  category?: string | null;
  jurisdiction?: string | null;
  location?: string | null;
  serp_features?: string[] | null;
  top_ranking_domains?: string[] | null;
  content_gaps?: string[] | null;
  status?: string;
  priority?: number | null;
  assigned_page_id?: string | null;
  current_rank?: number | null;
  rank_history?: Json | null;
  updated_at?: string | null;
}

// =============================================================================
// SEO_CONTENT_QUEUE TABLE (Migration 007)
// =============================================================================
// Source: 007_seo_automation.sql lines 159-193

/**
 * Database row for `seo_content_queue` table (as returned by SELECT)
 */
export interface SeoContentQueueRow {
  /** Primary key UUID */
  id: string;

  /** Content type: 'location_page', 'topic_page', 'guide', 'refresh' */
  content_type: string;

  /** Target keyword */
  target_keyword: string;

  /** Page slug */
  page_slug: string | null;

  /** Associated page ID */
  page_id: string | null;

  /** Target location */
  location: string | null;

  /** Target jurisdiction */
  jurisdiction: string | null;

  /** Target word count */
  word_count_target: number | null;

  /** AI model to use */
  ai_model: string | null;

  /** Generation prompt */
  generation_prompt: string | null;

  /** Status: 'pending', 'processing', 'completed', 'failed' */
  status: string;

  /** Priority (1-10) */
  priority: number | null;

  /** Scheduled execution time */
  scheduled_for: string | null;

  /** When processing started */
  started_at: string | null;

  /** When processing completed */
  completed_at: string | null;

  /** Processing time in seconds */
  processing_time: number | null;

  /** Generated content */
  generated_content: string | null;

  /** Quality score of generated content */
  quality_score: number | null;

  /** Error message if failed */
  error_message: string | null;

  /** Row creation timestamp */
  created_at: string | null;

  /** Row last update timestamp */
  updated_at: string | null;
}

/**
 * Insert type for `seo_content_queue` table
 */
export interface SeoContentQueueInsert {
  id?: string;
  content_type: string;
  target_keyword: string;
  page_slug?: string | null;
  page_id?: string | null;
  location?: string | null;
  jurisdiction?: string | null;
  word_count_target?: number | null;
  ai_model?: string | null;
  generation_prompt?: string | null;
  status?: string;
  priority?: number | null;
  scheduled_for?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  processing_time?: number | null;
  generated_content?: string | null;
  quality_score?: number | null;
  error_message?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Update type for `seo_content_queue` table
 */
export interface SeoContentQueueUpdate {
  content_type?: string;
  target_keyword?: string;
  page_slug?: string | null;
  page_id?: string | null;
  location?: string | null;
  jurisdiction?: string | null;
  word_count_target?: number | null;
  ai_model?: string | null;
  generation_prompt?: string | null;
  status?: string;
  priority?: number | null;
  scheduled_for?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  processing_time?: number | null;
  generated_content?: string | null;
  quality_score?: number | null;
  error_message?: string | null;
  updated_at?: string | null;
}

// =============================================================================
// SEO_AUTOMATION_LOG TABLE (Migration 007)
// =============================================================================
// Source: 007_seo_automation.sql lines 217-246

/**
 * Database row for `seo_automation_log` table (as returned by SELECT)
 */
export interface SeoAutomationLogRow {
  /** Primary key UUID */
  id: string;

  /** Task type */
  task_type: string;

  /** Task name */
  task_name: string;

  /** Status: 'success', 'failed', 'partial' */
  status: string;

  /** When task started */
  started_at: string;

  /** When task completed */
  completed_at: string | null;

  /** Duration in seconds */
  duration: number | null;

  /** Items processed count */
  items_processed: number | null;

  /** Successful items count */
  items_successful: number | null;

  /** Failed items count */
  items_failed: number | null;

  /** Summary text */
  summary: string | null;

  /** Error message if failed */
  error_message: string | null;

  /** Additional metadata */
  metadata: Json | null;

  /** Scheduled time */
  scheduled_time: string | null;

  /** Trigger source: 'cron', 'manual', 'api' */
  triggered_by: string | null;

  /** Row creation timestamp */
  created_at: string | null;
}

/**
 * Insert type for `seo_automation_log` table
 */
export interface SeoAutomationLogInsert {
  id?: string;
  task_type: string;
  task_name: string;
  status: string;
  started_at: string;
  completed_at?: string | null;
  duration?: number | null;
  items_processed?: number | null;
  items_successful?: number | null;
  items_failed?: number | null;
  summary?: string | null;
  error_message?: string | null;
  metadata?: Json | null;
  scheduled_time?: string | null;
  triggered_by?: string | null;
  created_at?: string | null;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Union type of all database row types
 */
export type DatabaseRow =
  | UserRow
  | CaseRow
  | CaseFactsRow
  | DocumentRow
  | ConversationRow
  | AiUsageRow
  | AiUsageLogRow
  | OrderRow
  | WebhookLogRow
  | HmoComplianceItemRow
  | HmoPropertyRow
  | HmoTenantRow
  | CouncilRow
  | EmailSubscriberRow
  | EmailEventRow
  | SeoPageRow
  | SeoKeywordRow
  | SeoContentQueueRow
  | SeoAutomationLogRow;

/**
 * Type guard for checking if a value is a CaseRow
 */
export function isCaseRow(row: unknown): row is CaseRow {
  return (
    typeof row === 'object' &&
    row !== null &&
    'case_type' in row &&
    'jurisdiction' in row
  );
}

/**
 * Type guard for checking if a value is a DocumentRow
 */
export function isDocumentRow(row: unknown): row is DocumentRow {
  return (
    typeof row === 'object' &&
    row !== null &&
    'document_type' in row &&
    'document_title' in row
  );
}
