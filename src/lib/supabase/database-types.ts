/**
 * Strongly-Typed Database Row Interfaces
 *
 * SOURCE OF TRUTH: docs/supabase_schema.MD
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
 * import type { CaseRow, CaseInsert } from '@/lib/supabase/database-types';
 *
 * const { data } = await supabase.from('cases').select('*').single();
 * const caseRow: CaseRow = data; // ✅ Typed!
 * ```
 *
 * NOTE: All timestamp columns are `string` (ISO 8601 format from Supabase)
 * NOTE: All jsonb columns use the `Json` type from types.ts
 */

import type { Json } from './types';

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
// HELPER TYPES
// =============================================================================

/**
 * Union type of all database row types
 */
export type DatabaseRow =
  | CaseRow
  | CaseFactsRow
  | DocumentRow
  | ConversationRow;

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
