/**
 * Wizard Types - Extended for MQS
 *
 * Extends the base wizard types from tenancy-questions.ts to support:
 * - Ask Heaven suggestion prompts
 * - Document field mappings
 * - Additional input types (file_upload, textarea)
 */

import type { WizardQuestion as BaseWizardQuestion, WizardField as BaseWizardField } from './tenancy-questions';

// Re-export base WizardField unchanged
export type { BaseWizardField as WizardField };

// Extended WizardField with new input types
export interface ExtendedWizardField extends Omit<BaseWizardField, 'inputType'> {
  inputType: BaseWizardField['inputType'] | 'textarea' | 'file_upload';
}

// Extended WizardQuestion with MQS + Ask Heaven support
export interface ExtendedWizardQuestion extends Omit<BaseWizardQuestion, 'inputType' | 'fields'> {
  // Allow new input types
  inputType:
    | BaseWizardQuestion['inputType']
    | 'file_upload'
    | 'textarea';

  // Optional prompt for Ask Heaven AI enhancement
  suggestion_prompt?: string;

  // Optional mapping to document fields (for court forms, notices, etc.)
  maps_to?: string[];

  // Fields can now be ExtendedWizardField
  fields?: ExtendedWizardField[];
}

// Product types supported by MQS
export type ProductType = 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement';

// Jurisdiction types
export type Jurisdiction = 'england-wales' | 'scotland' | 'northern-ireland';

// Master Question Set structure
export interface MasterQuestionSet {
  id: string; // e.g. "notice_only_england_wales_v1"
  product: ProductType;
  jurisdiction: Jurisdiction;
  version: string; // e.g. "1.0.0"
  questions: ExtendedWizardQuestion[];
}

// Enhanced answer from Ask Heaven
export interface EnhancedAnswer {
  raw: string;
  suggested: string;
  missing_information: string[];
  evidence_suggestions: string[];
}

// Metadata stored in collected_facts
export interface WizardMeta {
  product?: ProductType | null;
  mqs_version?: string | null;
  question_set_id?: string | null;
}
