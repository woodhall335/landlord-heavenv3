/**
 * Jurisdiction Resolution - Single Source of Truth
 *
 * This module provides the ONLY valid way to determine jurisdiction for document generation.
 * It enforces strict jurisdiction resolution without silent fallbacks to England.
 *
 * PRIORITY ORDER (highest to lowest):
 * 1. caseData.jurisdiction (locked after purchase - MUST WIN)
 * 2. wizardFacts.__meta.jurisdiction (pre-purchase wizard tracking)
 * 3. caseFacts.property.country (property location from facts)
 * 4. queryParam (ONLY pre-purchase, never trusted post-purchase)
 *
 * If none is present: THROW an error (do NOT default to England)
 */

import type { WizardFacts, CaseFacts } from '@/lib/case-facts/schema';
import type { CanonicalJurisdiction } from '@/lib/jurisdiction/normalize';
import { normalizeJurisdiction } from '@/lib/jurisdiction/normalize';

// =============================================================================
// TYPES
// =============================================================================

export interface JurisdictionResolutionInput {
  /**
   * Case data from database (cases table)
   * Contains jurisdiction field that should be locked after purchase
   */
  caseData?: {
    jurisdiction?: string | null;
    property_location?: string | null;
  } | null;

  /**
   * Wizard facts from case_facts.facts (flat DB format)
   * Contains __meta.jurisdiction and property_country
   */
  wizardFacts?: WizardFacts | null;

  /**
   * Case facts (nested domain model)
   * Contains property.country
   */
  caseFacts?: CaseFacts | null;

  /**
   * Query parameter (ONLY trusted pre-purchase)
   */
  queryParam?: string | null;

  /**
   * Whether this is a post-purchase context
   * When true, queryParam is ignored and caseData.jurisdiction is required
   */
  isPurchased?: boolean;

  /**
   * Context for error messages
   */
  context?: string;
}

export interface JurisdictionResolutionResult {
  jurisdiction: CanonicalJurisdiction;
  source: 'caseData' | 'wizardMeta' | 'propertyCountry' | 'queryParam';
}

// =============================================================================
// ERRORS
// =============================================================================

export class JurisdictionResolutionError extends Error {
  public readonly code = 'JURISDICTION_RESOLUTION_FAILED';
  public readonly sources: string[];
  public readonly context: string;

  constructor(message: string, sources: string[], context: string) {
    super(message);
    this.name = 'JurisdictionResolutionError';
    this.sources = sources;
    this.context = context;
  }
}

// =============================================================================
// RESOLVER
// =============================================================================

/**
 * Resolve the effective jurisdiction for document generation.
 *
 * This is the SINGLE SOURCE OF TRUTH for jurisdiction resolution.
 * Use this function everywhere documents/labels are chosen:
 * - Wizard review page
 * - Wizard preview page
 * - Dashboard case downloads / document bundle generation
 * - Document generator (tenancy + checklist + any pack docs)
 * - API routes that return "documents in pack" lists
 *
 * @throws JurisdictionResolutionError if jurisdiction cannot be determined
 */
export function resolveEffectiveJurisdiction(
  input: JurisdictionResolutionInput
): JurisdictionResolutionResult {
  const {
    caseData,
    wizardFacts,
    caseFacts,
    queryParam,
    isPurchased = false,
    context = 'unknown',
  } = input;

  const sourcesChecked: string[] = [];

  // PRIORITY 1: caseData.jurisdiction (locked after purchase - MUST WIN)
  if (caseData?.jurisdiction) {
    sourcesChecked.push(`caseData.jurisdiction: ${caseData.jurisdiction}`);
    const normalized = normalizeJurisdiction(caseData.jurisdiction);
    if (normalized) {
      return { jurisdiction: normalized, source: 'caseData' };
    }
  }

  // PRIORITY 2: caseData.property_location (alternative case field)
  if (caseData?.property_location) {
    sourcesChecked.push(`caseData.property_location: ${caseData.property_location}`);
    const normalized = normalizeJurisdiction(caseData.property_location);
    if (normalized) {
      return { jurisdiction: normalized, source: 'caseData' };
    }
  }

  // PRIORITY 3: wizardFacts.__meta.jurisdiction (pre-purchase wizard tracking)
  if (wizardFacts?.__meta?.jurisdiction) {
    sourcesChecked.push(`wizardFacts.__meta.jurisdiction: ${wizardFacts.__meta.jurisdiction}`);
    const normalized = normalizeJurisdiction(wizardFacts.__meta.jurisdiction);
    if (normalized) {
      return { jurisdiction: normalized, source: 'wizardMeta' };
    }
  }

  // PRIORITY 4: caseFacts.property.country (property location from facts)
  if (caseFacts?.property?.country) {
    sourcesChecked.push(`caseFacts.property.country: ${caseFacts.property.country}`);
    const normalized = normalizeJurisdiction(caseFacts.property.country);
    if (normalized) {
      return { jurisdiction: normalized, source: 'propertyCountry' };
    }
  }

  // PRIORITY 5: wizardFacts flat field property_country
  const propertyCountryFlat = (wizardFacts as Record<string, any>)?.property_country;
  if (propertyCountryFlat) {
    sourcesChecked.push(`wizardFacts.property_country: ${propertyCountryFlat}`);
    const normalized = normalizeJurisdiction(propertyCountryFlat);
    if (normalized) {
      return { jurisdiction: normalized, source: 'propertyCountry' };
    }
  }

  // PRIORITY 6: queryParam (ONLY pre-purchase)
  if (!isPurchased && queryParam) {
    sourcesChecked.push(`queryParam: ${queryParam}`);
    const normalized = normalizeJurisdiction(queryParam);
    if (normalized) {
      return { jurisdiction: normalized, source: 'queryParam' };
    }
  }

  // NO FALLBACK - THROW ERROR
  const errorMessage =
    `[JURISDICTION] Unable to resolve jurisdiction for ${context}. ` +
    `Sources checked: ${sourcesChecked.length > 0 ? sourcesChecked.join(', ') : 'none'}. ` +
    `This is a critical error - do NOT default to England. ` +
    `Ensure jurisdiction is set on the case or in wizard facts.`;

  console.error(errorMessage);

  throw new JurisdictionResolutionError(
    errorMessage,
    sourcesChecked,
    context
  );
}

/**
 * Resolve jurisdiction with a fallback for migration scenarios.
 *
 * ONLY use this for migration/backfill operations where we need to handle
 * legacy cases that may not have jurisdiction set.
 *
 * For normal document generation, use resolveEffectiveJurisdiction() which throws.
 */
export function resolveJurisdictionWithFallback(
  input: JurisdictionResolutionInput,
  fallback: CanonicalJurisdiction
): JurisdictionResolutionResult {
  try {
    return resolveEffectiveJurisdiction(input);
  } catch (error) {
    if (error instanceof JurisdictionResolutionError) {
      console.warn(
        `[JURISDICTION] Using fallback "${fallback}" for migration. ` +
        `Context: ${input.context}. Sources checked: ${error.sources.join(', ')}`
      );
      return { jurisdiction: fallback, source: 'caseData' };
    }
    throw error;
  }
}

/**
 * Validate that jurisdiction is set and canonical.
 * Returns the canonical jurisdiction or null if invalid.
 *
 * Use this for validation without throwing.
 */
export function validateJurisdiction(
  value: string | null | undefined
): CanonicalJurisdiction | null {
  return normalizeJurisdiction(value);
}

/**
 * Require jurisdiction to be set. Throws if not.
 */
export function requireJurisdiction(
  value: string | null | undefined,
  context: string
): CanonicalJurisdiction {
  const normalized = normalizeJurisdiction(value);
  if (!normalized) {
    throw new JurisdictionResolutionError(
      `[JURISDICTION] Missing or invalid jurisdiction "${value}" in ${context}`,
      [`input: ${value}`],
      context
    );
  }
  return normalized;
}

/**
 * Lock jurisdiction on case data.
 * Call this at payment success to ensure jurisdiction is immutable.
 *
 * Returns the jurisdiction that should be persisted.
 */
export function lockJurisdictionForCase(
  input: JurisdictionResolutionInput
): CanonicalJurisdiction {
  const result = resolveEffectiveJurisdiction({
    ...input,
    isPurchased: false, // Allow all sources during locking
    context: input.context || 'lockJurisdictionForCase',
  });

  console.log(
    `[JURISDICTION] Locking jurisdiction "${result.jurisdiction}" from source "${result.source}" ` +
    `for context: ${input.context}`
  );

  return result.jurisdiction;
}
