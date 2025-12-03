/**
 * Law Profile Module
 *
 * Single source of truth for rule version strings and legal metadata.
 * When decision engine YAML changes for a legal update, bump the version here
 * and update YAML metadata accordingly.
 *
 * CRITICAL: This module tracks versions but NEVER modifies rules.
 * All rule changes must be manual Git commits with legal review.
 */

export interface LawProfile {
  jurisdiction: string;
  caseType: string;
  eviction_rules_version?: string;
  tenancy_rules_version?: string;
  last_reviewed?: string;
  notes?: string;
}

/**
 * Get the current law profile for a given jurisdiction and case type.
 * This returns version strings that match the current state of
 * decision_engine.yaml and related rule configs.
 *
 * @param jurisdiction - 'england-wales' | 'scotland' | 'northern-ireland'
 * @param caseType - 'eviction' | 'money_claim' | 'tenancy_agreement'
 * @returns LawProfile with version metadata
 */
export function getLawProfile(jurisdiction: string, caseType: string): LawProfile {
  // England & Wales - Eviction Rules
  if (jurisdiction === 'england-wales' && caseType === 'eviction') {
    return {
      jurisdiction,
      caseType,
      eviction_rules_version: 'EVICTION_RULES_V2025_1',
      last_reviewed: '2025-12-03',
      notes: 'Aligned with Master Blueprint v10.0 + Phase 2 audit. Section 21 rules reflect pre-abolition state.',
    };
  }

  // Scotland - Eviction Rules
  if (jurisdiction === 'scotland' && caseType === 'eviction') {
    return {
      jurisdiction,
      caseType,
      eviction_rules_version: 'EVICTION_RULES_V2025_1',
      last_reviewed: '2025-12-03',
      notes: 'Aligned with Master Blueprint v10.0 + Phase 2 audit. PRT rules with pre-action requirements.',
    };
  }

  // Northern Ireland - Eviction Rules (placeholder)
  if (jurisdiction === 'northern-ireland' && caseType === 'eviction') {
    return {
      jurisdiction,
      caseType,
      eviction_rules_version: 'EVICTION_RULES_V2025_1_DRAFT',
      last_reviewed: '2025-12-03',
      notes: 'NI eviction rules - implementation in progress.',
    };
  }

  // England & Wales - Tenancy Agreement Rules
  if (jurisdiction === 'england-wales' && caseType === 'tenancy_agreement') {
    return {
      jurisdiction,
      caseType,
      tenancy_rules_version: 'TENANCY_RULES_V2025_1',
      last_reviewed: '2025-12-03',
      notes: 'AST templates and compliance checks aligned with Phase 2 audit.',
    };
  }

  // Scotland - Tenancy Agreement Rules
  if (jurisdiction === 'scotland' && caseType === 'tenancy_agreement') {
    return {
      jurisdiction,
      caseType,
      tenancy_rules_version: 'TENANCY_RULES_V2025_1',
      last_reviewed: '2025-12-03',
      notes: 'PRT templates and model tenancy agreement aligned with Phase 2 audit.',
    };
  }

  // Money Claim Rules (jurisdiction-agnostic for now)
  if (caseType === 'money_claim') {
    return {
      jurisdiction,
      caseType,
      last_reviewed: '2025-12-03',
      notes: 'Money claim rules - basic implementation.',
    };
  }

  // Default fallback for unknown combinations
  return {
    jurisdiction,
    caseType,
    notes: 'Rule version not yet defined for this jurisdiction/case type combination.',
  };
}

/**
 * Version history and change log
 *
 * EVICTION_RULES_V2025_1:
 * - Initial versioned release
 * - Aligned with Master Blueprint v10.0
 * - Phase 2 audit fixes applied
 * - England & Wales: Section 21 compliance checks, Ground 8/10/11/14 logic
 * - Scotland: PRT Ground 1-4 with pre-action requirements
 *
 * Future versions should be documented here with:
 * - Version string
 * - Effective date
 * - Summary of changes
 * - Source legislation/guidance references
 */
