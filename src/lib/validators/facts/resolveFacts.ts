/**
 * Fact Resolution System
 *
 * Merges facts from multiple sources:
 * 1. Extracted facts from LLM/regex (low confidence unless high score)
 * 2. Evidence-verified facts from uploaded documents
 * 3. User-confirmed facts from Q&A answers
 *
 * Provenance hierarchy (highest takes precedence):
 * - user_confirmed > evidence_verified > extracted > missing
 */

import type { FactValue, FactKey, FactProvenance } from '../rules/types';

/**
 * Confidence threshold for trusting extracted values without confirmation.
 * Values below this threshold should be treated as 'missing' and prompt Q&A.
 */
export const EXTRACTION_CONFIDENCE_THRESHOLD = 0.75;

/**
 * Source inputs for fact resolution
 */
export interface FactResolutionInput {
  /** Raw extracted fields from LLM/regex analysis */
  extracted?: Record<string, unknown>;
  /** Extraction confidence scores (0-1) per field */
  extractedConfidence?: Record<string, number>;
  /** Evidence categories uploaded (e.g., 'epc', 'gas_safety_certificate') */
  uploadedEvidence?: string[];
  /** User-confirmed answers from Q&A */
  userAnswers?: Record<string, unknown>;
  /** Case facts from database */
  caseFacts?: Record<string, unknown>;
}

/**
 * Resolve facts from multiple sources into a unified facts record.
 *
 * @param input - Sources of facts
 * @returns Record of fact keys to FactValue objects with provenance
 */
export function resolveFacts(
  input: FactResolutionInput
): Record<FactKey, FactValue | undefined> {
  const facts: Record<FactKey, FactValue | undefined> = {};

  const {
    extracted = {},
    extractedConfidence = {},
    uploadedEvidence = [],
    userAnswers = {},
    caseFacts = {},
  } = input;

  // Process all possible fact keys from all sources
  const allKeys = new Set<string>([
    ...Object.keys(extracted),
    ...Object.keys(userAnswers),
    ...Object.keys(caseFacts),
  ]);

  for (const key of allKeys) {
    // Check user answers first (highest priority)
    if (key in userAnswers && userAnswers[key] !== undefined && userAnswers[key] !== '') {
      facts[key] = {
        value: userAnswers[key],
        provenance: 'user_confirmed',
        confidence: 1.0,
        sourceLabel: 'User confirmed',
      };
      continue;
    }

    // Check case facts (second priority - may contain user_confirmed from previous sessions)
    if (key in caseFacts && caseFacts[key] !== undefined && caseFacts[key] !== '') {
      facts[key] = {
        value: caseFacts[key],
        provenance: 'user_confirmed', // Assume case facts are confirmed
        confidence: 1.0,
        sourceLabel: 'Previously confirmed',
      };
      continue;
    }

    // Check extracted facts
    if (key in extracted && extracted[key] !== undefined && extracted[key] !== null) {
      const confidence = extractedConfidence[key] ?? 0.5;
      const isHighConfidence = confidence >= EXTRACTION_CONFIDENCE_THRESHOLD;

      facts[key] = {
        value: extracted[key],
        provenance: isHighConfidence ? 'extracted' : 'extracted',
        confidence,
        sourceLabel: `Extracted (${Math.round(confidence * 100)}% confidence)`,
      };
      continue;
    }

    // Fact is missing
    facts[key] = {
      value: undefined,
      provenance: 'missing',
      sourceLabel: 'Not provided',
    };
  }

  // Apply evidence-verified provenance for specific document categories
  applyEvidenceVerification(facts, uploadedEvidence);

  return facts;
}

/**
 * Apply evidence_verified provenance for facts that can be confirmed
 * by specific uploaded documents.
 */
function applyEvidenceVerification(
  facts: Record<FactKey, FactValue | undefined>,
  uploadedEvidence: string[]
): void {
  const evidenceSet = new Set(uploadedEvidence.map((e) => e.toLowerCase()));

  // EPC uploaded -> epc_provided is verified
  if (evidenceSet.has('epc') || evidenceSet.has('energy_performance_certificate')) {
    if (facts['epc_provided']?.provenance === 'extracted') {
      facts['epc_provided'] = {
        value: true,
        provenance: 'evidence_verified',
        confidence: 1.0,
        sourceLabel: 'EPC document uploaded',
      };
    }
  }

  // Gas safety certificate uploaded
  if (evidenceSet.has('gas_safety_certificate') || evidenceSet.has('gas_safety')) {
    if (facts['gas_safety_current']?.provenance !== 'user_confirmed') {
      facts['gas_safety_current'] = {
        value: true,
        provenance: 'evidence_verified',
        confidence: 1.0,
        sourceLabel: 'Gas safety certificate uploaded',
      };
    }
  }

  // Deposit protection certificate uploaded
  if (evidenceSet.has('deposit_protection_certificate') || evidenceSet.has('deposit_certificate')) {
    if (facts['deposit_protected']?.provenance !== 'user_confirmed') {
      facts['deposit_protected'] = {
        value: true,
        provenance: 'evidence_verified',
        confidence: 1.0,
        sourceLabel: 'Deposit certificate uploaded',
      };
    }
  }

  // Prescribed information proof uploaded
  if (evidenceSet.has('prescribed_information_proof') || evidenceSet.has('prescribed_info')) {
    if (facts['prescribed_info_served']?.provenance !== 'user_confirmed') {
      facts['prescribed_info_served'] = {
        value: true,
        provenance: 'evidence_verified',
        confidence: 1.0,
        sourceLabel: 'Prescribed information proof uploaded',
      };
    }
  }

  // How to Rent proof uploaded
  if (evidenceSet.has('how_to_rent_proof') || evidenceSet.has('how_to_rent')) {
    if (facts['how_to_rent_provided']?.provenance !== 'user_confirmed') {
      facts['how_to_rent_provided'] = {
        value: true,
        provenance: 'evidence_verified',
        confidence: 1.0,
        sourceLabel: 'How to Rent proof uploaded',
      };
    }
  }

  // Licence uploaded
  if (evidenceSet.has('licence') || evidenceSet.has('property_licence')) {
    if (facts['licence_held']?.provenance !== 'user_confirmed') {
      facts['licence_held'] = {
        value: true,
        provenance: 'evidence_verified',
        confidence: 1.0,
        sourceLabel: 'Property licence uploaded',
      };
    }
  }
}

/**
 * Get missing facts that need user confirmation.
 *
 * Returns facts that are:
 * - Completely missing
 * - Extracted with low confidence
 */
export function getMissingFactsForConfirmation(
  facts: Record<FactKey, FactValue | undefined>,
  requiredFacts: FactKey[]
): FactKey[] {
  return requiredFacts.filter((key) => {
    const fact = facts[key];
    if (!fact) return true;
    if (fact.provenance === 'missing') return true;

    // Low confidence extracted facts need confirmation
    if (fact.provenance === 'extracted' && (fact.confidence ?? 0) < EXTRACTION_CONFIDENCE_THRESHOLD) {
      return true;
    }

    return false;
  });
}

/**
 * Get facts that were extracted but need user confirmation (for "confirm or edit" UI).
 */
export function getFactsNeedingConfirmation(
  facts: Record<FactKey, FactValue | undefined>,
  targetFacts: FactKey[]
): Array<{ key: FactKey; value: unknown; confidence: number }> {
  return targetFacts
    .filter((key) => {
      const fact = facts[key];
      if (!fact) return false;
      if (fact.provenance === 'extracted' && fact.value !== undefined) {
        return true;
      }
      return false;
    })
    .map((key) => {
      const fact = facts[key]!;
      return {
        key,
        value: fact.value,
        confidence: fact.confidence ?? 0,
      };
    });
}

/**
 * Merge new user answers into existing facts.
 */
export function mergeUserAnswers(
  existingFacts: Record<FactKey, FactValue | undefined>,
  newAnswers: Record<string, unknown>
): Record<FactKey, FactValue | undefined> {
  const merged = { ...existingFacts };

  for (const [key, value] of Object.entries(newAnswers)) {
    if (value !== undefined && value !== '') {
      merged[key] = {
        value,
        provenance: 'user_confirmed',
        confidence: 1.0,
        sourceLabel: 'User confirmed',
      };
    }
  }

  return merged;
}

/**
 * Convert facts record to simple key-value for legacy API compatibility.
 */
export function factsToSimpleRecord(
  facts: Record<FactKey, FactValue | undefined>
): Record<string, unknown> {
  const simple: Record<string, unknown> = {};

  for (const [key, fact] of Object.entries(facts)) {
    if (fact && fact.provenance !== 'missing') {
      simple[key] = fact.value;
    }
  }

  return simple;
}

/**
 * Build provenance metadata for report display.
 */
export function buildProvenanceMetadata(
  facts: Record<FactKey, FactValue | undefined>
): Array<{ factKey: string; value: unknown; provenance: FactProvenance; sourceLabel?: string }> {
  return Object.entries(facts)
    .filter(([, fact]) => fact && fact.provenance !== 'missing')
    .map(([key, fact]) => ({
      factKey: key,
      value: fact!.value,
      provenance: fact!.provenance,
      sourceLabel: fact!.sourceLabel,
    }));
}
