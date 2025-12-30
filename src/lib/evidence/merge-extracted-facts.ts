/**
 * Merge Extracted Facts Module
 *
 * Merges AI-extracted fields from documents into canonical case facts
 * with provenance tracking and confidence scoring.
 *
 * This module bridges the gap between raw AI extraction and canonical
 * fact keys used by validators.
 */

import type { CaseFacts, WizardFacts } from '@/lib/case-facts/schema';
import type { EvidenceAnalysisResult, ExtractionQualityMeta } from './analyze-evidence';

// Debug logging helper - controlled by DEBUG_EVIDENCE env var
const DEBUG = process.env.DEBUG_EVIDENCE === 'true';
function debugLog(label: string, data: any): void {
  if (DEBUG) {
    console.log(`[DEBUG_EVIDENCE][merge][${label}]`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
}

export interface ExtractionProvenance {
  evidence_id: string;
  method: 'pdf_text' | 'vision' | 'image' | 'unknown';
  model: string;
  extracted_at: string;
  original_key: string;
}

export interface ConfidenceEntry {
  value: any;
  confidence: number;
  provenance: ExtractionProvenance;
}

export interface MergeExtractedFactsInput {
  caseId: string;
  evidenceId: string;
  jurisdiction?: string | null;
  docType?: string | null;
  validatorKey?: string | null;
  analysisResult: EvidenceAnalysisResult;
}

export interface MergeExtractedFactsOutput {
  /** Facts to merge into case_facts (only high confidence) */
  mergedFactsPatch: Record<string, any>;
  /** Provenance records keyed by canonical fact key */
  provenance: Record<string, ExtractionProvenance>;
  /** Confidence map keyed by canonical fact key */
  confidenceMap: Record<string, number>;
  /** Fact keys with low confidence that need user confirmation */
  lowConfidenceKeys: string[];
  /** All extracted fields before mapping (for debugging) */
  rawExtracted: Record<string, any>;
  /** Extraction quality metadata for truthful validator messages */
  extractionQuality?: ExtractionQualityMeta;
}

/**
 * Confidence thresholds for merging
 */
const HIGH_CONFIDENCE_THRESHOLD = 0.65;
const LOW_CONFIDENCE_THRESHOLD = 0.40;

/**
 * Mapping from extraction field names to canonical fact keys.
 * Supports multiple source keys mapping to a single canonical key.
 *
 * IMPORTANT: Some validators expect specific field names (e.g., date_served vs service_date).
 * We maintain aliases to ensure compatibility.
 */
const EXTRACTION_TO_FACT_MAPPING: Array<{
  sources: string[];
  target: string;
  transform?: (value: any) => any;
  /** Optional: also output to these alias keys for validator compatibility */
  aliases?: string[];
}> = [
  // Basic tenant/landlord info
  {
    sources: ['tenant_full_name', 'tenant_name', 'tenant_names', 'tenant'],
    target: 'tenant_full_name',
    transform: normalizeNames,
    aliases: ['tenant_names', 'tenant_name'], // Validators may expect either
  },
  { sources: ['landlord_full_name', 'landlord_name', 'landlord'], target: 'landlord_full_name', aliases: ['landlord_name'] },

  // Property info
  { sources: ['property_address', 'address', 'property_address_line1', 'address_line1'], target: 'property_address_line1', aliases: ['property_address'] },

  // Tenancy details
  { sources: ['tenancy_type', 'agreement_type'], target: 'tenancy_type' },
  { sources: ['tenancy_start_date', 'start_date', 'commencement_date'], target: 'tenancy_start_date', transform: normalizeDate },
  { sources: ['tenancy_end_date', 'end_date', 'fixed_term_end_date'], target: 'tenancy_end_date', transform: normalizeDate },
  { sources: ['rent_amount', 'monthly_rent', 'rent'], target: 'rent_amount', transform: normalizeAmount },
  { sources: ['rent_frequency', 'rent_period', 'payment_frequency'], target: 'rent_frequency' },
  { sources: ['deposit_amount', 'deposit'], target: 'deposit_amount', transform: normalizeAmount },
  { sources: ['deposit_scheme', 'deposit_provider', 'deposit_scheme_name'], target: 'deposit_scheme' },

  // Notice dates - CRITICAL: output both date_served and service_date for validator compatibility
  {
    sources: ['notice_date', 'date_served', 'service_date', 'issue_date'],
    target: 'notice_date',
    transform: normalizeDate,
    aliases: ['date_served', 'service_date'], // S21 validators may check either
  },
  {
    sources: ['notice_expiry', 'expiry_date', 'notice_expiry_date'],
    target: 'notice_expiry_date',
    transform: normalizeDate,
    aliases: ['expiry_date'],
  },
  { sources: ['notice_period'], target: 'notice_period' },

  // Section 21 compliance flags
  { sources: ['deposit_protected'], target: 'deposit_protected', transform: normalizeBoolean },
  { sources: ['prescribed_info_served'], target: 'prescribed_info_served', transform: normalizeBoolean },
  { sources: ['gas_safety_mentioned', 'gas_safety_pre_move_in'], target: 'gas_safety_pre_move_in', transform: normalizeBoolean },
  { sources: ['epc_mentioned', 'epc_provided'], target: 'epc_provided', transform: normalizeBoolean },
  { sources: ['how_to_rent_mentioned', 'how_to_rent_provided'], target: 'how_to_rent_provided', transform: normalizeBoolean },
  { sources: ['form_6a_used'], target: 'form_6a_used', transform: normalizeBoolean },
  { sources: ['signature_present'], target: 'signature_present', transform: normalizeBoolean },

  // Section 8 fields
  { sources: ['grounds_cited', 'grounds_listed', 'mandatory_grounds', 'discretionary_grounds'], target: 'grounds_selected', transform: normalizeGrounds },
  { sources: ['rent_arrears_stated', 'current_arrears', 'arrears_amount'], target: 'current_arrears', transform: normalizeAmount },

  // Wales notice fields
  { sources: ['rhw_form_number'], target: 'rhw_form_number' },
  { sources: ['bilingual_text_present', 'bilingual_notice_provided'], target: 'bilingual_notice_provided', transform: normalizeBoolean },
  { sources: ['written_statement_referenced', 'written_statement_provided'], target: 'written_statement_provided', transform: normalizeBoolean },
  { sources: ['fitness_for_habitation_confirmed', 'fitness_for_habitation'], target: 'fitness_for_habitation', transform: normalizeBoolean },
  { sources: ['occupation_type'], target: 'occupation_type' },

  // Scotland notice fields
  { sources: ['ground_cited', 'scotland_ground'], target: 'scotland_ground' },
  { sources: ['ground_mandatory'], target: 'ground_mandatory', transform: normalizeBoolean },
  { sources: ['notice_to_leave_served'], target: 'notice_to_leave_served', transform: normalizeBoolean },

  // Tenancy agreement compliance
  { sources: ['prohibited_fees_present'], target: 'prohibited_fees_present', transform: normalizeBoolean },
  { sources: ['unfair_terms_present'], target: 'unfair_terms_present', transform: normalizeBoolean },
  { sources: ['missing_clauses'], target: 'missing_clauses', transform: normalizeBoolean },

  // Money claim fields
  { sources: ['claim_amount'], target: 'arrears_amount', transform: normalizeAmount },
  { sources: ['lba_sent', 'pre_action_steps'], target: 'pre_action_steps', transform: normalizeBoolean },
  { sources: ['lba_date'], target: 'lba_date', transform: normalizeDate },
  { sources: ['last_payment_date'], target: 'last_payment_date', transform: normalizeDate },
  { sources: ['payment_history'], target: 'payment_history' },
];

/**
 * Transform helpers
 */
function normalizeDate(value: any): string | null {
  if (!value) return null;
  if (typeof value === 'string') {
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    // Try to parse other formats
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  return null;
}

function normalizeAmount(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[£$,]/g, '').trim();
    const num = parseFloat(cleaned);
    if (!isNaN(num)) return num;
  }
  return null;
}

function normalizeBoolean(value: any): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (['true', 'yes', '1', 'y'].includes(lower)) return true;
    if (['false', 'no', '0', 'n'].includes(lower)) return false;
  }
  return null;
}

function normalizeNames(value: any): string | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(', ');
  }
  if (typeof value === 'string') {
    return value.trim() || null;
  }
  return null;
}

function normalizeGrounds(value: any): string[] | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }
  if (typeof value === 'string') {
    // Parse comma-separated or space-separated grounds
    return value.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
  }
  return null;
}

/**
 * Merge extracted fields from AI analysis into canonical facts.
 *
 * @param input - The extraction input with analysis result
 * @returns Merged facts patch, provenance, and low confidence keys
 */
export function mergeExtractedFacts(input: MergeExtractedFactsInput): MergeExtractedFactsOutput {
  const { caseId, evidenceId, analysisResult } = input;
  const extractedFields = analysisResult.extracted_fields || {};
  const baseConfidence = analysisResult.confidence ?? 0.5;
  const source = analysisResult.source ?? 'unknown';

  debugLog('merge_start', {
    caseId,
    evidenceId,
    extractedFieldsCount: Object.keys(extractedFields).length,
    baseConfidence,
    source,
    extractionQuality: analysisResult.extraction_quality,
  });

  const mergedFactsPatch: Record<string, any> = {};
  const provenance: Record<string, ExtractionProvenance> = {};
  const confidenceMap: Record<string, number> = {};
  const lowConfidenceKeys: string[] = [];

  const now = new Date().toISOString();

  for (const mapping of EXTRACTION_TO_FACT_MAPPING) {
    for (const sourceKey of mapping.sources) {
      let rawValue = extractedFields[sourceKey];

      // Skip if not present
      if (rawValue === undefined || rawValue === null) continue;

      // Apply transform if defined
      const value = mapping.transform ? mapping.transform(rawValue) : rawValue;

      // Skip if transform returned null or empty
      if (value === null || value === undefined) continue;
      if (typeof value === 'string' && value.trim() === '') continue;

      // Calculate effective confidence
      // Boost confidence for certain field types that are usually accurate
      let effectiveConfidence = baseConfidence;
      if (['date', 'amount', 'address'].some(t => mapping.target.includes(t))) {
        effectiveConfidence = Math.min(1, baseConfidence * 1.1);
      }

      // Store provenance
      const provenanceEntry: ExtractionProvenance = {
        evidence_id: evidenceId,
        method: source,
        model: 'gpt-4o-mini',
        extracted_at: now,
        original_key: sourceKey,
      };

      // Only merge high-confidence values
      if (effectiveConfidence >= HIGH_CONFIDENCE_THRESHOLD) {
        // Don't overwrite if already set with higher confidence
        if (!confidenceMap[mapping.target] || confidenceMap[mapping.target] < effectiveConfidence) {
          mergedFactsPatch[mapping.target] = value;
          provenance[mapping.target] = provenanceEntry;
          confidenceMap[mapping.target] = effectiveConfidence;

          // Also set aliases for validator compatibility
          if (mapping.aliases) {
            for (const alias of mapping.aliases) {
              if (!confidenceMap[alias] || confidenceMap[alias] < effectiveConfidence) {
                mergedFactsPatch[alias] = value;
                provenance[alias] = { ...provenanceEntry, original_key: `${sourceKey}→${alias}` };
                confidenceMap[alias] = effectiveConfidence;
              }
            }
          }
        }
      } else if (effectiveConfidence >= LOW_CONFIDENCE_THRESHOLD) {
        // Track as low confidence - needs user confirmation
        if (!lowConfidenceKeys.includes(mapping.target)) {
          lowConfidenceKeys.push(mapping.target);
        }
        confidenceMap[mapping.target] = effectiveConfidence;
        provenance[mapping.target] = provenanceEntry;
      }

      // Found a value for this target, skip other sources
      break;
    }
  }

  debugLog('merge_complete', {
    mergedFactsCount: Object.keys(mergedFactsPatch).length,
    lowConfidenceCount: lowConfidenceKeys.length,
    mergedKeys: Object.keys(mergedFactsPatch),
    lowConfidenceKeys,
  });

  return {
    mergedFactsPatch,
    provenance,
    confidenceMap,
    lowConfidenceKeys,
    rawExtracted: extractedFields,
    extractionQuality: analysisResult.extraction_quality,
  };
}

/**
 * Apply merged facts to existing case facts.
 * Only sets values that are not already present (setIfMissing pattern).
 *
 * @param currentFacts - Current case facts
 * @param mergeOutput - Output from mergeExtractedFacts
 * @returns Updated facts object
 */
export function applyMergedFacts(
  currentFacts: WizardFacts | CaseFacts,
  mergeOutput: MergeExtractedFactsOutput
): WizardFacts {
  const updated = { ...currentFacts } as WizardFacts;

  for (const [key, value] of Object.entries(mergeOutput.mergedFactsPatch)) {
    const existing = (updated as any)[key];
    // Only set if missing (null, undefined, or empty string)
    if (existing === null || existing === undefined || existing === '') {
      (updated as any)[key] = value;
    }
  }

  // Store extraction metadata for debugging/audit
  const existingExtraction = (updated as any).__extraction || {};
  (updated as any).__extraction = {
    ...existingExtraction,
    last_merged: new Date().toISOString(),
    provenance: {
      ...(existingExtraction.provenance || {}),
      ...mergeOutput.provenance,
    },
    confidence: {
      ...(existingExtraction.confidence || {}),
      ...mergeOutput.confidenceMap,
    },
    low_confidence_keys: [
      ...new Set([
        ...(existingExtraction.low_confidence_keys || []),
        ...mergeOutput.lowConfidenceKeys,
      ]),
    ],
    // Track extraction quality for truthful validator messages
    quality: mergeOutput.extractionQuality || existingExtraction.quality,
  };

  return updated;
}

/**
 * Generate next questions for low-confidence or missing facts.
 *
 * @param lowConfidenceKeys - Keys that need user confirmation
 * @param validatorKey - The validator type (for context-specific questions)
 * @returns Array of question objects compatible with validation next_questions type
 */
export function generateConfirmationQuestions(
  lowConfidenceKeys: string[],
  validatorKey?: string | null
): Array<{ id: string; factKey: string; question: string; type: string; helpText?: string }> {
  const QUESTION_TEMPLATES: Record<string, { question: string; type: string; helpText?: string }> = {
    deposit_protected: {
      question: 'Is the tenancy deposit protected with a government-approved scheme?',
      type: 'yes_no',
      helpText: 'Required for valid Section 21 notices in England.',
    },
    prescribed_info_served: {
      question: 'Was the prescribed information served to the tenant within 30 days of deposit?',
      type: 'yes_no',
      helpText: 'The deposit protection certificate and prescribed information must be provided.',
    },
    gas_safety_pre_move_in: {
      question: 'Was a valid Gas Safety Certificate provided before the tenant moved in?',
      type: 'yes_no',
    },
    epc_provided: {
      question: 'Was an Energy Performance Certificate (EPC) provided to the tenant?',
      type: 'yes_no',
    },
    how_to_rent_provided: {
      question: 'Was the "How to Rent" guide provided to the tenant?',
      type: 'yes_no',
      helpText: 'The current version must be provided at the start of the tenancy.',
    },
    tenancy_type: {
      question: 'What type of tenancy is this?',
      type: 'select',
      helpText: 'AST for England, PRT for Scotland, Occupation Contract for Wales.',
    },
    rent_amount: {
      question: 'What is the rent amount?',
      type: 'currency',
    },
    rent_frequency: {
      question: 'How often is rent paid?',
      type: 'select',
    },
    bilingual_notice_provided: {
      question: 'Is the notice provided in both English and Welsh?',
      type: 'yes_no',
      helpText: 'Wales notices must be bilingual under the Renting Homes (Wales) Act.',
    },
    scotland_ground: {
      question: 'Which ground for eviction are you relying on?',
      type: 'select',
    },
  };

  return lowConfidenceKeys
    .filter(key => QUESTION_TEMPLATES[key])
    .map(key => ({
      id: `confirm_${key}`,
      factKey: key,
      ...QUESTION_TEMPLATES[key],
    }));
}

/**
 * Merge multiple extraction outputs into a single facts patch.
 * Uses confidence-based rules to determine which value wins when there are conflicts.
 *
 * @param outputs - Array of MergeExtractedFactsOutput from multiple evidence files
 * @returns Combined merge output with best values
 */
export function mergeMultipleExtractions(
  outputs: MergeExtractedFactsOutput[]
): MergeExtractedFactsOutput {
  const combinedFacts: Record<string, any> = {};
  const combinedProvenance: Record<string, ExtractionProvenance> = {};
  const combinedConfidence: Record<string, number> = {};
  const allLowConfidenceKeys: Set<string> = new Set();
  const allRawExtracted: Record<string, any> = {};

  debugLog('multi_merge_start', { outputCount: outputs.length });

  for (const output of outputs) {
    // Collect all raw extracted for debugging
    Object.assign(allRawExtracted, output.rawExtracted);

    // Collect low confidence keys
    for (const key of output.lowConfidenceKeys) {
      allLowConfidenceKeys.add(key);
    }

    // Merge facts with confidence-based priority
    for (const [key, value] of Object.entries(output.mergedFactsPatch)) {
      const newConfidence = output.confidenceMap[key] ?? 0;
      const existingConfidence = combinedConfidence[key] ?? 0;

      // Skip null/undefined/empty values
      if (value === null || value === undefined) continue;
      if (typeof value === 'string' && value.trim() === '') continue;

      // Higher confidence wins
      if (newConfidence > existingConfidence) {
        combinedFacts[key] = value;
        combinedConfidence[key] = newConfidence;
        if (output.provenance[key]) {
          combinedProvenance[key] = output.provenance[key];
        }
        // Remove from low confidence if now high confidence
        if (newConfidence >= HIGH_CONFIDENCE_THRESHOLD) {
          allLowConfidenceKeys.delete(key);
        }
      } else if (newConfidence === existingConfidence && !combinedFacts[key]) {
        // Equal confidence but no existing value - use new value
        combinedFacts[key] = value;
        combinedConfidence[key] = newConfidence;
        if (output.provenance[key]) {
          combinedProvenance[key] = output.provenance[key];
        }
      }
    }
  }

  debugLog('multi_merge_complete', {
    combinedFactsCount: Object.keys(combinedFacts).length,
    lowConfidenceCount: allLowConfidenceKeys.size,
    keys: Object.keys(combinedFacts),
  });

  // Get the best extraction quality from all outputs
  const bestQuality = outputs.reduce((best, curr) => {
    if (!curr.extractionQuality) return best;
    if (!best) return curr.extractionQuality;
    // Prefer non-failed methods, then higher text length
    if (curr.extractionQuality.text_extraction_method !== 'failed' &&
        best.text_extraction_method === 'failed') {
      return curr.extractionQuality;
    }
    if ((curr.extractionQuality.text_length ?? 0) > (best.text_length ?? 0)) {
      return curr.extractionQuality;
    }
    return best;
  }, outputs[0]?.extractionQuality);

  return {
    mergedFactsPatch: combinedFacts,
    provenance: combinedProvenance,
    confidenceMap: combinedConfidence,
    lowConfidenceKeys: Array.from(allLowConfidenceKeys),
    rawExtracted: allRawExtracted,
    extractionQuality: bestQuality,
  };
}
